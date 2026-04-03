# Launcher Script for Portfolio Dashboard
# This runs both the child_process manager backend and the Vite frontend simultaneously.

Write-Host "Initialzing the Codepath Full-Stack Portfolio Dashboard" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\dashboard"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

npm start
