param([Parameter(Mandatory=$true)][string]$Stage)
$ErrorActionPreference = 'Stop'
$repoDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location -LiteralPath $repoDir
$logDir = Join-Path $repoDir '1in1.4b/docs/validation'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
function Run-Check([string]$Name, [scriptblock]$Command) {
  $result = & $Command 2>&1
  $code = $LASTEXITCODE
  $result | Set-Content -LiteralPath (Join-Path $logDir "$Stage-$Name.log") -Encoding utf8
  if ($code -ne 0) { $result | Write-Output; throw "$Stage / $Name failed ($code)" }
  Write-Output "$Stage / $Name PASS"
}
Run-Check 'tw-generate' { python share/tools/tw.py 1in1.4b }
Run-Check 'simplified' { node share/tools/simulate.js 1in1.4b 40 }
Run-Check 'jianghu' { node share/tools/simulate.js jianghuyimeng 40 }
try {
  $env:SIM_LANG = 'zh-TW'
  Run-Check 'traditional' { node share/tools/simulate.js 1in1.4b 10 }
} finally { Remove-Item Env:SIM_LANG -ErrorAction SilentlyContinue }
Run-Check 'rarity' { node 1in1.4b/tools/rarity.js 2500 }
# rarity 生成后再同步繁体和打包。
Run-Check 'tw-final' { python share/tools/tw.py 1in1.4b }
Run-Check 'build' { node tools/build.js }
