param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,

  [Parameter(Mandatory = $true)]
  [string]$ConfirmRestore,

  [string]$DatabaseName = $env:POSTGRES_DB,
  [string]$DatabaseUser = $env:POSTGRES_USER,
  [string]$ComposeService = "postgres"
)

$ErrorActionPreference = "Stop"

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

function Assert-SimpleIdentifier {
  param(
    [string]$Name,
    [string]$Value
  )
  if ($Value -notmatch "^[A-Za-z0-9_]+$") {
    throw "$Name must contain only letters, numbers, and underscores."
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

if ($ConfirmRestore -ne "RESTORE_LOCAL_DATABASE") {
  throw "Restore aborted. Re-run with -ConfirmRestore RESTORE_LOCAL_DATABASE to overwrite local development data."
}

$DatabaseName = Resolve-Default $DatabaseName "moneymate"
$DatabaseUser = Resolve-Default $DatabaseUser "moneymate"
Assert-SimpleIdentifier "DatabaseName" $DatabaseName
Assert-SimpleIdentifier "DatabaseUser" $DatabaseUser

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker CLI is required for database restore."
}

$resolvedBackup = (Resolve-Path $BackupFile).Path
if (-not (Test-Path $resolvedBackup -PathType Leaf)) {
  throw "Backup file not found: $BackupFile"
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$containerFile = "/tmp/moneymate-restore-$([System.Guid]::NewGuid().ToString("N")).dump"

Push-Location $root
try {
  Write-Host "Starting PostgreSQL service if needed..."
  Invoke-Checked "docker" @("compose", "up", "-d", $ComposeService)

  $containerOutput = & docker compose ps -q $ComposeService
  if ($LASTEXITCODE -ne 0) {
    throw "docker compose ps -q $ComposeService failed with exit code $LASTEXITCODE."
  }
  $containerId = ""
  if ($null -ne $containerOutput) {
    $containerId = [string]($containerOutput | Select-Object -First 1)
  }
  $containerId = $containerId.Trim()
  if ([string]::IsNullOrWhiteSpace($containerId)) {
    throw "Could not resolve Docker container for service '$ComposeService'."
  }

  Write-Host "Ensuring local database '$DatabaseName' exists..."
  $existsOutput = & docker compose exec -T $ComposeService psql -U $DatabaseUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName'"
  if ($LASTEXITCODE -ne 0) {
    throw "Database existence check failed with exit code $LASTEXITCODE."
  }
  $exists = ""
  if ($null -ne $existsOutput) {
    $exists = [string]($existsOutput | Select-Object -First 1)
  }
  $exists = $exists.Trim()
  if ($exists -ne "1") {
    Invoke-Checked "docker" @("compose", "exec", "-T", $ComposeService, "createdb", "-U", $DatabaseUser, "-O", $DatabaseUser, $DatabaseName)
  }

  Write-Host "Copying backup into PostgreSQL container..."
  Invoke-Checked "docker" @("cp", $resolvedBackup, "${containerId}:$containerFile")

  Write-Host "Restoring '$resolvedBackup' into local database '$DatabaseName'. This can overwrite local development data."
  Invoke-Checked "docker" @("compose", "exec", "-T", $ComposeService, "pg_restore", "-U", $DatabaseUser, "-d", $DatabaseName, "--clean", "--if-exists", "--no-owner", "--role=$DatabaseUser", "--verbose", $containerFile)

  Write-Host "Restore complete."
}
finally {
  try {
    & docker compose exec -T $ComposeService sh -c "rm -f '$containerFile'" | Out-Null
  }
  catch {
    Write-Warning "Could not remove temporary restore file from container: $($_.Exception.Message)"
  }
  Pop-Location
}
