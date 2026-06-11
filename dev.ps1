# Starts the Django API and the Vite dev server together in this terminal.
# Press Ctrl+C to stop both.

$root = $PSScriptRoot

$python = Join-Path $root 'backend\venv\Scripts\python.exe'
if (-not (Test-Path $python)) {
    Write-Host 'Backend venv not found. Run the backend setup from README.md first.' -ForegroundColor Red
    exit 1
}
if (-not (Test-Path (Join-Path $root 'frontend\node_modules'))) {
    Write-Host 'frontend\node_modules not found. Run "npm install" in frontend\ first.' -ForegroundColor Red
    exit 1
}

Write-Host '[dev] starting Django API on http://localhost:8000 ...' -ForegroundColor Green
$backend = Start-Process -FilePath $python `
    -ArgumentList 'manage.py', 'runserver', '8000' `
    -WorkingDirectory (Join-Path $root 'backend') `
    -PassThru -NoNewWindow

try {
    Write-Host '[dev] starting Vite on http://localhost:5173 ... (Ctrl+C stops both)' -ForegroundColor Green
    Set-Location (Join-Path $root 'frontend')
    npm run dev
}
finally {
    # runserver's autoreloader spawns a child process, so kill the whole tree
    if ($backend -and -not $backend.HasExited) {
        taskkill /PID $backend.Id /T /F 2>$null | Out-Null
    }
    Set-Location $root
    Write-Host '[dev] both servers stopped.' -ForegroundColor Green
}
