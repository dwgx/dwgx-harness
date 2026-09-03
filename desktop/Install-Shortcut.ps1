# Point "DeepSeek Harness.lnk" at DwGxHarness.exe (never powershell.exe).
$ErrorActionPreference = 'Stop'
$ExeCandidates = @(
  (Join-Path $PSScriptRoot 'bin\Release\net10.0-windows\DwGxHarness.exe'),
  (Join-Path $PSScriptRoot 'bin\Debug\net10.0-windows\DwGxHarness.exe')
)
$Exe = $ExeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $Exe) {
  throw "Build desktop first: dotnet build `"$PSScriptRoot\DwGxHarness.csproj`" -c Release"
}

$DshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { 'D:\Software\dsh' }
$PrefsPath = Join-Path $DshHome 'owner-ui.json'
$WhaleIcon = 'D:\Software\dsh-cli\icons\deepseek-whale-gold.ico'
if (Test-Path -LiteralPath $PrefsPath) {
  try {
    $prefs = Get-Content -LiteralPath $PrefsPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($prefs.whaleIconPath -and (Test-Path -LiteralPath $prefs.whaleIconPath)) {
      $WhaleIcon = [string]$prefs.whaleIconPath
    }
  } catch { }
}

$DesktopPaths = @(
  [Environment]::GetFolderPath('Desktop'),
  'C:\Users\dwgx1\Desktop',
  'C:\Users\dwgx1\OneDrive\Desktop'
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique

$Shell = New-Object -ComObject WScript.Shell
foreach ($Desktop in $DesktopPaths) {
  $path = Join-Path $Desktop 'DeepSeek Harness.lnk'
  $sc = $Shell.CreateShortcut($path)
  $sc.TargetPath = $Exe
  $sc.Arguments = ''
  $sc.WorkingDirectory = 'C:\Agent'
  $sc.WindowStyle = 1
  $sc.Description = 'dwgx-harness UI (WebView2). Does not start llama.'
  if (Test-Path -LiteralPath $WhaleIcon) {
    $sc.IconLocation = "$WhaleIcon,0"
  }
  $sc.Save()
  Write-Output $path
}
