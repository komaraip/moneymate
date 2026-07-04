param(
  [string]$OutputDir = "backups",
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

$DatabaseName = Resolve-Default $DatabaseName "moneymate"
$DatabaseUser = Resolve-Default $DatabaseUser "moneymate"
Assert-SimpleIdentifier "DatabaseName" $DatabaseName
Assert-SimpleIdentifier "DatabaseUser" $DatabaseUser

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker CLI is required for database backup."
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupDir = Join-Path $root $OutputDir
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeName = "moneymate-$DatabaseName-$timestamp"
$backupPath = Join-Path $backupDir "$safeName.dump"
$metadataPath = Join-Path $backupDir "$safeName.metadata.md"
$containerFile = "/tmp/$safeName.dump"

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

  Write-Host "Creating PostgreSQL custom-format backup for database '$DatabaseName'..."
  Invoke-Checked "docker" @("compose", "exec", "-T", $ComposeService, "sh", "-c", "rm -f '$containerFile' && pg_dump -U '$DatabaseUser' -d '$DatabaseName' --format=custom --blobs --no-owner --file='$containerFile'")

  Write-Host "Copying backup to $backupPath"
  Invoke-Checked "docker" @("cp", "${containerId}:$containerFile", $backupPath)
  Invoke-Checked "docker" @("compose", "exec", "-T", $ComposeService, "sh", "-c", "rm -f '$containerFile'")

  $generatedAt = (Get-Date).ToString("o")
  $environment = Resolve-Default $env:APP_ENV "development"
  $metadata = @"
# MoneyMate Database Backup Metadata

- generated_at: $generatedAt
- environment: $environment
- database_name: $DatabaseName
- compose_service: $ComposeService
- backup_file: $([System.IO.Path]::GetFileName($backupPath))
- format: PostgreSQL custom format via pg_dump

Restore command:

````powershell
.\scripts\restore-db.ps1 -BackupFile "$backupPath" -ConfirmRestore RESTORE_LOCAL_DATABASE
````

This metadata intentionally excludes passwords, tokens, cookies, and production secrets.
"@
  Set-Content -Path $metadataPath -Value $metadata -Encoding UTF8

  Write-Host "Backup created:"
  Write-Host $backupPath
  Write-Host "Metadata created:"
  Write-Host $metadataPath
}
finally {
  Pop-Location
}
