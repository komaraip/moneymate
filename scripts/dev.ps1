param(
  [switch]$Build,
  [switch]$Detached
)

$ErrorActionPreference = "Stop"

$argsList = @("compose", "up")

if ($Build) {
  $argsList += "--build"
}

if ($Detached) {
  $argsList += "-d"
}

Write-Host "Starting MoneyMate local services with Docker..."
& docker @argsList
