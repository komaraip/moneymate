param(
  [string]$BackupDir = "backups",
  [int]$OlderThanDays = 30,
  [int]$LargestCount = 5,
  [switch]$IncludeMetadataDetails
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$timestampFormat = "yyyyMMdd-HHmmss"
$dumpPattern = "^moneymate-([A-Za-z0-9_]+)-(\d{8}-\d{6})\.dump$"
$metadataPattern = "^moneymate-([A-Za-z0-9_]+)-(\d{8}-\d{6})\.metadata\.md$"

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

function Format-BackupBytes {
  param(
    [Parameter(Mandatory = $true)]
    [long]$Bytes
  )

  if ($Bytes -ge 1GB) {
    return "{0:N2} GB" -f ($Bytes / 1GB)
  }

  if ($Bytes -ge 1MB) {
    return "{0:N2} MB" -f ($Bytes / 1MB)
  }

  if ($Bytes -ge 1KB) {
    return "{0:N2} KB" -f ($Bytes / 1KB)
  }

  return "$Bytes bytes"
}

function Get-TimestampFromMatch {
  param(
    [Parameter(Mandatory = $true)]
    [System.Text.RegularExpressions.Match]$Match
  )

  return [DateTime]::ParseExact(
    $Match.Groups[2].Value,
    $timestampFormat,
    [System.Globalization.CultureInfo]::InvariantCulture
  )
}

if ($OlderThanDays -lt 0) {
  throw "OlderThanDays must be zero or greater."
}

if ($LargestCount -lt 1) {
  throw "LargestCount must be at least 1."
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupRoot = Get-FullPath (Join-Path $root "backups")

if ([System.IO.Path]::IsPathRooted($BackupDir)) {
  $targetPath = Get-FullPath $BackupDir
}
else {
  $targetPath = Get-FullPath (Join-Path $root $BackupDir)
}

if (-not (Test-IsSubPathOrSame $targetPath $backupRoot)) {
  throw "BackupDir must be inside the local backups folder: $backupRoot"
}

Write-Host "MoneyMate backup status"
Write-Host "Mode: READ ONLY"
Write-Host "Target: $targetPath"
Write-Host "Older-than threshold: $OlderThanDays days"
Write-Host "Largest files shown: $LargestCount"

if (-not (Test-Path -LiteralPath $targetPath -PathType Container)) {
  Write-Host "Backup directory does not exist. No backup files were inspected."
  return
}

$now = Get-Date
$files = @(Get-ChildItem -LiteralPath $targetPath -File)
$metadataNames = @{}
$metadataRecords = @()

foreach ($file in $files) {
  $match = [regex]::Match($file.Name, $metadataPattern)
  if (-not $match.Success) {
    continue
  }

  $timestamp = Get-TimestampFromMatch -Match $match
  $metadataNames[$file.Name] = $true
  $metadataRecords += [pscustomobject]@{
    Name = $file.Name
    Database = $match.Groups[1].Value
    Timestamp = $timestamp
    MatchingDumpName = ($file.Name -replace "\.metadata\.md$", ".dump")
    SizeBytes = $file.Length
    Path = $file.FullName
  }
}

$dumpRecords = @()
foreach ($file in $files) {
  $match = [regex]::Match($file.Name, $dumpPattern)
  if (-not $match.Success) {
    continue
  }

  $timestamp = Get-TimestampFromMatch -Match $match
  $metadataName = ($file.Name -replace "\.dump$", ".metadata.md")
  $ageDays = [math]::Floor(($now - $timestamp).TotalDays)
  $dumpRecords += [pscustomobject]@{
    Name = $file.Name
    Database = $match.Groups[1].Value
    Timestamp = $timestamp
    AgeDays = $ageDays
    SizeBytes = $file.Length
    Size = Format-BackupBytes $file.Length
    MetadataName = $metadataName
    HasMetadata = $metadataNames.ContainsKey($metadataName)
    Path = $file.FullName
  }
}

$dumpNameSet = @{}
foreach ($record in $dumpRecords) {
  $dumpNameSet[$record.Name] = $true
}

$orphanMetadata = @($metadataRecords | Where-Object { -not $dumpNameSet.ContainsKey($_.MatchingDumpName) } | Sort-Object -Property Timestamp, Name)
$missingMetadata = @($dumpRecords | Where-Object { -not $_.HasMetadata } | Sort-Object -Property Timestamp, Name)
$olderBackups = @($dumpRecords | Where-Object { $_.AgeDays -gt $OlderThanDays } | Sort-Object -Property Timestamp, Name)
$largestBackups = @($dumpRecords | Sort-Object -Property @{ Expression = "SizeBytes"; Descending = $true }, @{ Expression = "Name"; Ascending = $true } | Select-Object -First $LargestCount)
$dumpsWithMetadata = @($dumpRecords | Where-Object { $_.HasMetadata })
$totalSizeBytes = [long](($dumpRecords | Measure-Object -Property SizeBytes -Sum).Sum)

Write-Host ""
Write-Host "Summary"
Write-Host "Matched backup dumps: $($dumpRecords.Count)"
Write-Host "Total dump size: $(Format-BackupBytes $totalSizeBytes)"

if ($dumpRecords.Count -eq 0) {
  Write-Host "Newest backup: n/a"
  Write-Host "Oldest backup: n/a"
}
else {
  $newest = $dumpRecords | Sort-Object -Property Timestamp -Descending | Select-Object -First 1
  $oldest = $dumpRecords | Sort-Object -Property Timestamp | Select-Object -First 1
  Write-Host "Newest backup: $($newest.Timestamp.ToString("yyyy-MM-dd HH:mm:ss")) - $($newest.Name)"
  Write-Host "Oldest backup: $($oldest.Timestamp.ToString("yyyy-MM-dd HH:mm:ss")) - $($oldest.Name)"
}

Write-Host "Dumps with metadata: $($dumpsWithMetadata.Count)"
Write-Host "Dumps missing metadata: $($missingMetadata.Count)"
Write-Host "Metadata files without dumps: $($orphanMetadata.Count)"
Write-Host "Backups older than $OlderThanDays days: $($olderBackups.Count)"

if ($olderBackups.Count -gt 0) {
  Write-Host ""
  Write-Host "Older backups"
  $olderBackups |
    Select-Object Name, Timestamp, AgeDays, Size, HasMetadata |
    Format-Table -AutoSize
}

if ($largestBackups.Count -gt 0) {
  Write-Host ""
  Write-Host "Largest backups"
  $largestBackups |
    Select-Object Name, Timestamp, AgeDays, Size, HasMetadata |
    Format-Table -AutoSize
}

if ($IncludeMetadataDetails) {
  Write-Host ""
  Write-Host "Metadata details"

  if ($missingMetadata.Count -eq 0) {
    Write-Host "No matched dumps are missing metadata."
  }
  else {
    Write-Host "Dumps missing metadata:"
    $missingMetadata |
      Select-Object Name, Timestamp, AgeDays, Size |
      Format-Table -AutoSize
  }

  if ($orphanMetadata.Count -eq 0) {
    Write-Host "No metadata files are missing matching dumps."
  }
  else {
    Write-Host "Metadata files without matching dumps:"
    $orphanMetadata |
      Select-Object Name, Timestamp, MatchingDumpName |
      Format-Table -AutoSize
  }
}
