<#
.SYNOPSIS
    Kill any process listening on a TCP port.
.EXAMPLE
    .\stop-port.ps1 -Port 8080
#>
param(
    [Parameter(Mandatory, HelpMessage = "TCP port to free")]
    [ValidateRange(1, 65535)]
    [int]$Port
)

$conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $conn) {
    Write-Host "No process listening on port $Port — nothing to do."
    exit 0
}

$pid = ($conn | Select-Object -First 1).OwningProcess
$proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
$name = if ($proc) { $proc.ProcessName } else { "unknown" }

Write-Host "Killing PID $pid ($name) listening on :$Port ..."
Stop-Process -Id $pid -Force
Write-Host "Done. Port $Port is now free."
