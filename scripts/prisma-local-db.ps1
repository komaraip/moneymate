param(
  [ValidateSet("start", "status", "sync-env", "reset")]
  [string]$Action = "start",
  [string]$Name = "moneymate"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$dataRoot = Join-Path $env:LOCALAPPDATA "prisma-dev-nodejs\Data"
$instanceDir = Join-Path $dataRoot $Name
$durableStreamsDir = Join-Path (Join-Path $dataRoot "durable-streams") $Name
$serverJsonPath = Join-Path $instanceDir "server.json"
$postmasterPidPath = Join-Path $instanceDir ".pglite\postmaster.pid"
$envPath = Join-Path $projectRoot ".env"

function Write-Step([string]$Message) {
  Write-Host "[prisma-local-db] $Message"
}

function Assert-Command([string]$CommandName) {
  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    throw "Missing required command '$CommandName'. Install Node.js 20+ and make sure it is available on PATH."
  }
}

function Get-NodeMajorVersion() {
  $version = (& node -p "process.versions.node").Trim()

  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($version)) {
    throw "Unable to determine the installed Node.js version."
  }

  return [int]($version.Split(".")[0])
}

function Assert-NodeVersion() {
  Assert-Command "node"
  Assert-Command "npm"

  $nodeMajorVersion = Get-NodeMajorVersion

  if ($nodeMajorVersion -lt 20) {
    throw "Prisma local Postgres requires Node.js 20 or newer. Detected Node.js $nodeMajorVersion.x."
  }
}

function Get-OptionalProcess([int]$Id) {
  if ($Id -le 0) {
    return $null
  }

  return Get-Process -Id $Id -ErrorAction SilentlyContinue
}

function Get-ServerMetadata() {
  if (-not (Test-Path -LiteralPath $serverJsonPath)) {
    return $null
  }

  return Get-Content $serverJsonPath -Raw | ConvertFrom-Json
}

function Test-PortBusy([int]$Port) {
  $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
  return $null -ne $connection
}

function Get-ConnectionString([int]$Port) {
  return "postgres://postgres:postgres@localhost:$Port/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"
}

function ConvertTo-Base64Url([string]$Text) {
  return [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Text)).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

function ConvertFrom-Base64Url([string]$Text) {
  $padded = $Text.Replace("-", "+").Replace("_", "/")

  while ($padded.Length % 4 -ne 0) {
    $padded += "="
  }

  return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($padded))
}

function Get-ExistingApiPayload([string]$DatabaseUrl) {
  if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    return $null
  }

  if (-not $DatabaseUrl.StartsWith("prisma+postgres://")) {
    return $null
  }

  $parts = $DatabaseUrl -split "api_key=", 2

  if ($parts.Length -ne 2) {
    return $null
  }

  $payloadJson = ConvertFrom-Base64Url $parts[1]
  return $payloadJson | ConvertFrom-Json
}

function Set-Or-AppendEnvLine([System.Collections.Generic.List[string]]$Lines, [string]$Key, [string]$Value) {
  $replacement = "$Key=`"$Value`""
  $pattern = "^\s*$([regex]::Escape($Key))="

  for ($index = 0; $index -lt $Lines.Count; $index++) {
    if ($Lines[$index] -match $pattern) {
      $Lines[$index] = $replacement
      return
    }
  }

  $Lines.Add($replacement)
}

function Get-EnvLines() {
  $lines = New-Object "System.Collections.Generic.List[string]"
  $envExamplePath = Join-Path $projectRoot ".env.example"

  if (Test-Path -LiteralPath $envPath) {
    foreach ($line in Get-Content $envPath) {
      $lines.Add($line)
    }
  } elseif (Test-Path -LiteralPath $envExamplePath) {
    foreach ($line in Get-Content $envExamplePath) {
      $lines.Add($line)
    }
  }

  return $lines
}

function Get-EnvValue([string]$Key) {
  if (-not (Test-Path -LiteralPath $envPath)) {
    return $null
  }

  foreach ($line in Get-Content $envPath) {
    if ($line -match "^\s*$([regex]::Escape($Key))=(.*)$") {
      return $Matches[1].Trim().Trim('"')
    }
  }

  return $null
}

function Sync-EnvConnectionStrings() {
  $server = Get-ServerMetadata

  if ($null -eq $server) {
    throw "No Prisma local database metadata was found for '$Name'. Run 'npm run db:local:start' first."
  }

  $databaseUrl = Get-ConnectionString ([int]$server.databasePort)
  $shadowDatabaseUrl = Get-ConnectionString ([int]$server.shadowDatabasePort)
  $existingPayload = Get-ExistingApiPayload (Get-EnvValue "DATABASE_URL")

  if ($null -eq $existingPayload) {
    $existingPayload = [ordered]@{
      name = $Name
    }
  }

  $payload = [ordered]@{
    databaseUrl = $databaseUrl
    name = if ($existingPayload.name) { $existingPayload.name } else { $Name }
    shadowDatabaseUrl = $shadowDatabaseUrl
  }

  $payloadJson = $payload | ConvertTo-Json -Compress
  $apiKey = ConvertTo-Base64Url $payloadJson
  $proxyUrl = "prisma+postgres://localhost:$($server.port)/?api_key=$apiKey"
  $lines = Get-EnvLines

  Set-Or-AppendEnvLine $lines "DATABASE_URL" $proxyUrl
  Set-Or-AppendEnvLine $lines "DIRECT_URL" $databaseUrl

  Set-Content -LiteralPath $envPath -Value $lines -Encoding UTF8

  Write-Step "Synced .env to local Prisma ports $($server.port)/$($server.databasePort)/$($server.shadowDatabasePort)."
}

function Clear-StalePostmasterLock() {
  $server = Get-ServerMetadata

  if ($null -eq $server -or -not (Test-Path -LiteralPath $postmasterPidPath)) {
    return
  }

  $ownerProcess = Get-OptionalProcess ([int]$server.pid)
  $busyPorts = @($server.port, $server.databasePort, $server.shadowDatabasePort) |
    Where-Object { $_ -ne $null } |
    Where-Object { Test-PortBusy ([int]$_) }

  if ($null -eq $ownerProcess -and $busyPorts.Count -eq 0) {
    Remove-Item -LiteralPath $postmasterPidPath -Force
    Write-Step "Removed a stale .pglite postmaster lock file."
  }
}

function Invoke-Prisma([string[]]$Arguments) {
  Write-Step ("Running: prisma " + ($Arguments -join " "))

  & npm exec -- prisma @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Prisma command failed: prisma $($Arguments -join ' ')"
  }
}

function Start-Instance() {
  Assert-NodeVersion
  Clear-StalePostmasterLock

  if (Test-Path -LiteralPath $serverJsonPath) {
    Invoke-Prisma @("dev", "start", "--debug", $Name)
  } else {
    Invoke-Prisma @("dev", "--name", $Name, "--detach")
  }

  Sync-EnvConnectionStrings
  Write-Step "Local Prisma database is ready."
}

function Reset-Instance() {
  Assert-NodeVersion

  $server = Get-ServerMetadata
  if ($null -ne $server) {
    $runningProcess = Get-OptionalProcess ([int]$server.pid)

    if ($null -ne $runningProcess) {
      Write-Step "Stopping stale Prisma dev process $($server.pid)."
      Stop-Process -Id $server.pid -Force
    }
  }

  if (Test-Path -LiteralPath $instanceDir) {
    Write-Step "Removing cached Prisma local database files for '$Name'."
    Remove-Item -LiteralPath $instanceDir -Recurse -Force
  }

  if (Test-Path -LiteralPath $durableStreamsDir) {
    Remove-Item -LiteralPath $durableStreamsDir -Recurse -Force
  }

  Invoke-Prisma @("dev", "--name", $Name, "--detach")
  Sync-EnvConnectionStrings

  Write-Step "Local Prisma database was recreated. Run 'npm run prisma:push' before starting the app."
}

function Show-Status() {
  $server = Get-ServerMetadata

  if ($null -eq $server) {
    Write-Step "No local Prisma database metadata exists for '$Name'."
    return
  }

  $savedProcess = Get-OptionalProcess ([int]$server.pid)
  $savedDatabaseUrl = Get-EnvValue "DATABASE_URL"
  $savedPayload = Get-ExistingApiPayload $savedDatabaseUrl

  Write-Step "name=$($server.name) proxyPort=$($server.port) databasePort=$($server.databasePort) shadowDatabasePort=$($server.shadowDatabasePort)"
  Write-Step "savedPid=$($server.pid) running=$([bool]($null -ne $savedProcess))"
  Write-Step "postmasterLockPresent=$([bool](Test-Path -LiteralPath $postmasterPidPath))"

  if ($null -ne $savedPayload) {
    $shadowFromEnv = $savedPayload.shadowDatabaseUrl

    if ($shadowFromEnv -notmatch ":$($server.shadowDatabasePort)/") {
      Write-Step "warning=.env shadowDatabaseUrl does not match server.json. Run 'npm run db:local:sync-env'."
    }
  }
}

switch ($Action) {
  "start" {
    Start-Instance
  }
  "status" {
    Show-Status
  }
  "sync-env" {
    Sync-EnvConnectionStrings
  }
  "reset" {
    Reset-Instance
  }
  default {
    throw "Unsupported action '$Action'."
  }
}
