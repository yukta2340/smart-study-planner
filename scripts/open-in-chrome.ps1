# Waits for a local dev server on common ports and opens Chrome when available
$ports = @(12345, 12346, 12347, 12348, 3000, 5173)
$maxWaitSec = 60
$start = Get-Date

Write-Host "Waiting for frontend to become available on ports: $($ports -join ', ')"
while (((Get-Date) - $start).TotalSeconds -lt $maxWaitSec) {
    foreach ($p in $ports) {
        try {
            $url = "http://localhost:$p/"
            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) {
                Write-Host "Frontend reachable at $url - opening Chrome"
                Start-Process chrome $url
                exit 0
            }
        } catch {
            # not available yet
        }
    }
    Start-Sleep -Seconds 1
}

Write-Host "Timed out waiting for frontend. You can open the app manually." -ForegroundColor Yellow
exit 1
