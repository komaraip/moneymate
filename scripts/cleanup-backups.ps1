param(
  [string]$BackupDir = "backups",
  [int]$KeepNewest = 10,
  [int]$OlderThanDays = 30,
  [switch]$IncludeOrphanMetadata,
  [switch]$Apply,
  [string]$ConfirmCleanup = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$timestampFormat = "yyyyMMdd-HHmmss"
$dumpPattern = "^moneymate-[A-Za-z0-9_]+-(\d{8}-\d{6})\.dump$"
$metadataPattern = "^moneymate-[A-Za-z0-9_]+-(\d{8}-\d{6})\.metadata\.md$"
$confirmationToken = "DELETE_LOCAL_BACKUPS"

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

function Get-TimestampFromName {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Pattern
  )

  $match = [regex]::Match($Name, $Pattern)
  if (-not $match.Success) {
    return $null
  }

  return [DateTime]::ParseExact(
    $match.Groups[1].Value,
    $timestampFormat,
    [System.Globalization.CultureInfo]::InvariantCulture
  )
}

function Add-DeleteItem {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Items,

    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true)]
    [string]$Kind,

    [Parameter(Mandatory = $true)]
    [DateTime]$Timestamp,

    [Parameter(Mandatory = $true)]
    [string]$Reason,

    [Parameter(Mandatory = $true)]
    [string]$BackupRoot
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    return
  }

  $item = Get-Item -LiteralPath $Path
  if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw "Refusing to delete reparse point: $Path"
  }

  $fullPath = (Resolve-Path -LiteralPath $Path).Path
  if (-not (Test-IsSubPathOrSame $fullPath $BackupRoot)) {
    throw "Refusing to delete file outside backups folder: $fullPath"
  }

  if (-not $Items.ContainsKey($fullPath)) {
    $Items[$fullPath] = [pscustomobject]@{
      Kind = $Kind
      Name = [System.IO.Path]::GetFileName($fullPath)
      Timestamp = $Timestamp
      Reason = $Reason
      SizeBytes = $item.Length
      Path = $fullPath
    }
  }
}

if ($KeepNewest -lt 1) {
  throw "KeepNewest must be at least 1 so cleanup cannot delete every matched backup."
}

if ($OlderThanDays -lt 1) {
  throw "OlderThanDays must be at least 1."
}

if ($Apply -and $ConfirmCleanup -ne $confirmationToken) {
  throw "Cleanup aborted. Re-run with -Apply -ConfirmCleanup $confirmationToken to delete selected local backup files."
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupRoot = Join-Path $root "backups"
if (-not (Test-Path -LiteralPath $backupRoot -PathType Container)) {
  New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
}
$resolvedBackupRoot = (Resolve-Path -LiteralPath $backupRoot).Path

if ([System.IO.Path]::IsPathRooted($BackupDir)) {
  $targetPath = $BackupDir
}
else {
  $targetPath = Join-Path $root $BackupDir
}

if (-not (Test-Path -LiteralPath $targetPath -PathType Container)) {
  throw "BackupDir does not exist: $BackupDir"
}

$resolvedTarget = (Resolve-Path -LiteralPath $targetPath).Path
if (-not (Test-IsSubPathOrSame $resolvedTarget $resolvedBackupRoot)) {
  throw "BackupDir must be inside the local backups folder: $resolvedBackupRoot"
}

$cutoff = (Get-Date).AddDays(-$OlderThanDays)
$files = @(Get-ChildItem -LiteralPath $resolvedTarget -File)
$dumpRecords = @()

foreach ($file in $files) {
  $timestamp = Get-TimestampFromName -Name $file.Name -Pattern $dumpPattern
  if ($null -ne $timestamp) {
    $dumpRecords += [pscustomobject]@{
      File = $file
      Timestamp = $timestamp
      MetadataName = ($file.Name -replace "\.dump$", ".metadata.md")
    }
  }
}

$sortedDumps = @($dumpRecords | Sort-Object -Property @{ Expression = "Timestamp"; Descending = $true }, @{ Expression = { $_.File.Name }; Ascending = $true })
$protectedDumpPaths = @{}
foreach ($record in @($sortedDumps | Select-Object -First $KeepNewest)) {
  $protectedDumpPaths[$record.File.FullName] = $true
}

$deleteItems = @{}
foreach ($record in $sortedDumps) {
  $isProtected = $protectedDumpPaths.ContainsKey($record.File.FullName)
  if ((-not $isProtected) -and $record.Timestamp -lt $cutoff) {
    $reason = "older than $OlderThanDays days and outside newest $KeepNewest backups"
    Add-DeleteItem -Items $deleteItems -Path $record.File.FullName -Kind "dump" -Timestamp $record.Timestamp -Reason $reason -BackupRoot $resolvedBackupRoot

    $metadataPath = Join-Path $resolvedTarget $record.MetadataName
    Add-DeleteItem -Items $deleteItems -Path $metadataPath -Kind "metadata" -Timestamp $record.Timestamp -Reason "matching deleted dump" -BackupRoot $resolvedBackupRoot
  }
}

if ($IncludeOrphanMetadata) {
  foreach ($file in $files) {
    $timestamp = Get-TimestampFromName -Name $file.Name -Pattern $metadataPattern
    if ($null -eq $timestamp) {
      continue
    }

    $matchingDumpName = $file.Name -replace "\.metadata\.md$", ".dump"
    $matchingDumpPath = Join-Path $resolvedTarget $matchingDumpName
    if ((-not (Test-Path -LiteralPath $matchingDumpPath -PathType Leaf)) -and $timestamp -lt $cutoff) {
      Add-DeleteItem -Items $deleteItems -Path $file.FullName -Kind "orphan_metadata" -Timestamp $timestamp -Reason "orphan metadata older than $OlderThanDays days" -BackupRoot $resolvedBackupRoot
    }
  }
}

$selectedItems = @($deleteItems.Values | Sort-Object -Property Timestamp, Name)

Write-Host "MoneyMate backup cleanup"
Write-Host "Mode: $(if ($Apply) { "DELETE" } else { "DRY RUN" })"
Write-Host "Target: $resolvedTarget"
Write-Host "Matched backup dumps: $($dumpRecords.Count)"
Write-Host "Retention: keep newest $KeepNewest dumps; delete older-than-$OlderThanDays-day dumps outside that kept set."
Write-Host "Orphan metadata cleanup: $(if ($IncludeOrphanMetadata) { "enabled" } else { "disabled" })"

if ($selectedItems.Count -eq 0) {
  Write-Host "No files selected for cleanup."
  if (-not $Apply) {
    Write-Host "Dry run complete. No files were deleted."
  }
  return
}

Write-Host "Files selected for cleanup:"
$selectedItems |
  Select-Object Kind, Name, Timestamp, Reason, SizeBytes |
  Format-Table -AutoSize

if (-not $Apply) {
  Write-Host "Dry run complete. No files were deleted."
  Write-Host "To delete these files, re-run with -Apply -ConfirmCleanup $confirmationToken."
  return
}

foreach ($item in $selectedItems) {
  if (-not (Test-Path -LiteralPath $item.Path -PathType Leaf)) {
    continue
  }

  if (-not (Test-IsSubPathOrSame $item.Path $resolvedBackupRoot)) {
    throw "Refusing to delete file outside backups folder: $($item.Path)"
  }

  Remove-Item -LiteralPath $item.Path -Force
  Write-Host "Deleted: $($item.Path)"
}

Write-Host "Backup cleanup complete."
