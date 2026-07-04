param(
  [string]$BackupFile = $env:BACKUP_FILE,
  [string]$TargetDatabaseName = $env:RESTORE_DRILL_DATABASE,
  [string]$DatabaseUser = $env:POSTGRES_USER,
  [string]$ComposeService = "postgres",
  [switch]$RunRestore,
  [switch]$KeepDrillDatabase,
  [string]$ConfirmRestoreDrill = $env:CONFIRM_RESTORE_DRILL
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$backupPattern = "^moneymate-[A-Za-z0-9_]+-(\d{8}-\d{6})\.dump$"
$confirmationToken = "RESTORE_LOCAL_BACKUP_DRILL"

function Resolve-Default {
  param(
    [string]$Value,
    [string]$Default
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $Default
  }

  return $Value
}

function Get-FullPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  return [System.IO.Path]::GetFullPath($Path)
}

function Test-IsSubPathOrSame {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Child,

    [Parameter(Mandatory = $true)]
    [string]$Parent
  )

  $trimChars = [char[]]@("\", "/")
  $childFull = (Get-FullPath $Child).TrimEnd($trimChars)
  $parentFull = (Get-FullPath $Parent).TrimEnd($trimChars)

  if ([string]::Equals($childFull, $parentFull, [StringComparison]::OrdinalIgnoreCase)) {
    return $true
  }

  $parentWithSeparator = "$parentFull$([System.IO.Path]::DirectorySeparatorChar)"
  return $childFull.StartsWith($parentWithSeparator, [StringComparison]::OrdinalIgnoreCase)
}

function Assert-SimpleIdentifier {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  if ($Value -notmatch "^[A-Za-z0-9_]+$") {
    throw "$Name must contain only letters, numbers, and underscores."
  }
}

function Assert-DrillDatabaseName {
  param(
    [Parameter(Mandatory = $true)]
    [string]$DatabaseName,

    [Parameter(Mandatory = $true)]
    [string]$ActiveDatabaseName
  )

  Assert-SimpleIdentifier "TargetDatabaseName" $DatabaseName

  $blockedNames = @("postgres", "template0", "template1", "moneymate", $ActiveDatabaseName)
  foreach ($blockedName in $blockedNames) {
    if (-not [string]::IsNullOrWhiteSpace($blockedName) -and [string]::Equals($DatabaseName, $blockedName, [StringComparison]::OrdinalIgnoreCase)) {
      throw "TargetDatabaseName '$DatabaseName' is not allowed for restore drills."
    }
  }

  if ($DatabaseName -notmatch "^moneymate_restore_drill_[A-Za-z0-9_]+$") {
    throw "TargetDatabaseName must start with 'moneymate_restore_drill_' to avoid active app databases."
  }
}

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,

    [string[]]$Arguments = @()
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FilePath $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Resolve-ContainerId {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Service
  )

  $containerOutput = & docker compose ps -q $Service
  if ($LASTEXITCODE -ne 0) {
    throw "docker compose ps -q $Service failed with exit code $LASTEXITCODE."
  }

  $containerId = ""
  if ($null -ne $containerOutput) {
    $containerId = [string]($containerOutput | Select-Object -First 1)
  }

  $containerId = $containerId.Trim()
  if ([string]::IsNullOrWhiteSpace($containerId)) {
    throw "Could not resolve Docker container for service '$Service'."
  }

  return $containerId
}

if ($env:RUN_RESTORE_DRILL -match "^(1|true|yes)$") {
  $RunRestore = $true
}

if ([string]::IsNullOrWhiteSpace($BackupFile)) {
  throw "BackupFile is required. Pass -BackupFile or set BACKUP_FILE."
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupRoot = Get-FullPath (Join-Path $root "backups")

if (-not (Test-Path -LiteralPath $BackupFile -PathType Leaf)) {
  throw "Backup file not found: $BackupFile"
}

$resolvedBackup = (Resolve-Path -LiteralPath $BackupFile).Path
$backupItem = Get-Item -LiteralPath $resolvedBackup
if (($backupItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
  throw "Refusing backup file reparse point: $resolvedBackup"
}

if (-not (Test-IsSubPathOrSame $resolvedBackup $backupRoot)) {
  throw "BackupFile must be inside the local backups folder: $backupRoot"
}

if ($backupItem.Name -notmatch $backupPattern) {
  throw "BackupFile name must match moneymate-<database>-YYYYMMDD-HHMMSS.dump"
}

$DatabaseUser = Resolve-Default $DatabaseUser "moneymate"
$activeDatabaseName = Resolve-Default $env:POSTGRES_DB "moneymate"
Assert-SimpleIdentifier "DatabaseUser" $DatabaseUser

if ([string]::IsNullOrWhiteSpace($TargetDatabaseName)) {
  $TargetDatabaseName = "moneymate_restore_drill_$((Get-Date).ToString("yyyyMMdd_HHmmss"))"
}

Assert-DrillDatabaseName -DatabaseName $TargetDatabaseName -ActiveDatabaseName $activeDatabaseName

Write-Host "MoneyMate restore drill"
Write-Host "Mode: $(if ($RunRestore) { "RESTORE DRILL" } else { "VALIDATION ONLY" })"
Write-Host "Backup file: $resolvedBackup"
Write-Host "Target drill database: $TargetDatabaseName"
Write-Host "Keep drill database: $(if ($KeepDrillDatabase) { "yes" } else { "no" })"

$pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
if ($null -ne $pgRestore) {
  Write-Host "Validating backup catalog with local pg_restore --list..."
  & $pgRestore.Source --list $resolvedBackup | Select-Object -First 5
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore --list failed with exit code $LASTEXITCODE."
  }
}
else {
  Write-Host "Local pg_restore is not available on PATH; skipping catalog validation."
}

if (-not $RunRestore) {
  Write-Host "Validation complete. No database was created or restored."
  Write-Host "To run a disposable local restore drill, re-run with -RunRestore -ConfirmRestoreDrill $confirmationToken."
  return
}

if ($ConfirmRestoreDrill -ne $confirmationToken) {
  throw "Restore drill aborted. Re-run with -RunRestore -ConfirmRestoreDrill $confirmationToken."
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker CLI is required for restore drill execution."
}

$containerFile = "/tmp/moneymate-restore-drill-$([System.Guid]::NewGuid().ToString("N")).dump"
$createdDatabase = $false

Push-Location $root
try {
  Write-Host "Starting PostgreSQL service if needed..."
  Invoke-Checked "docker" @("compose", "up", "-d", $ComposeService)

  $containerId = Resolve-ContainerId -Service $ComposeService

  Write-Host "Checking drill database does not already exist..."
  $existsOutput = & docker compose exec -T $ComposeService psql -U $DatabaseUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$TargetDatabaseName'"
  if ($LASTEXITCODE -ne 0) {
    throw "Database existence check failed with exit code $LASTEXITCODE."
  }

  $exists = ""
  if ($null -ne $existsOutput) {
    $exists = [string]($existsOutput | Select-Object -First 1)
  }
  $exists = $exists.Trim()
  if ($exists -eq "1") {
    throw "Target drill database '$TargetDatabaseName' already exists. Choose a new moneymate_restore_drill_* name."
  }

  Write-Host "Creating disposable drill database '$TargetDatabaseName'..."
  Invoke-Checked "docker" @("compose", "exec", "-T", $ComposeService, "createdb", "-U", $DatabaseUser, "-O", $DatabaseUser, $TargetDatabaseName)
  $createdDatabase = $true

  Write-Host "Copying backup into PostgreSQL container..."
  Invoke-Checked "docker" @("cp", $resolvedBackup, "${containerId}:$containerFile")

  Write-Host "Restoring backup into disposable drill database..."
  Invoke-Checked "docker" @("compose", "exec", "-T", $ComposeService, "pg_restore", "-U", $DatabaseUser, "-d", $TargetDatabaseName, "--no-owner", "--role=$DatabaseUser", "--verbose", $containerFile)

  Write-Host "Checking restored public table count..."
  $tableCountOutput = & docker compose exec -T $ComposeService psql -U $DatabaseUser -d $TargetDatabaseName -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'"
  if ($LASTEXITCODE -ne 0) {
    throw "Restored table count check failed with exit code $LASTEXITCODE."
  }

  $tableCount = ""
  if ($null -ne $tableCountOutput) {
    $tableCount = [string]($tableCountOutput | Select-Object -First 1)
  }
  $tableCount = $tableCount.Trim()
  Write-Host "Restore drill succeeded. Restored public tables: $tableCount"
}
finally {
  try {
    & docker compose exec -T $ComposeService sh -c "rm -f '$containerFile'" | Out-Null
  }
  catch {
    Write-Warning "Could not remove temporary drill backup file from container: $($_.Exception.Message)"
  }

  if ($createdDatabase -and -not $KeepDrillDatabase) {
    try {
      Write-Host "Dropping disposable drill database '$TargetDatabaseName'..."
      & docker compose exec -T $ComposeService dropdb -U $DatabaseUser --if-exists --force $TargetDatabaseName | Out-Null
      if ($LASTEXITCODE -ne 0) {
        throw "dropdb failed with exit code $LASTEXITCODE."
      }
    }
    catch {
      Write-Warning "Could not drop drill database '$TargetDatabaseName': $($_.Exception.Message)"
    }
  }

  Pop-Location
}
