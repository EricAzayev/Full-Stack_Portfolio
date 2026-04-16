# Portfolio Dashboard - Quick Setup and Start Script
Write-Host "🎯 Full-Stack Portfolio Dashboard Setup" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion found`n" -ForegroundColor Green

# Install dashboard dependencies
Write-Host "📦 Installing dashboard dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dashboard dependencies" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Dashboard dependencies installed`n" -ForegroundColor Green

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
if (!(Test-Path "server\node_modules")) {
    Push-Location server
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}
Write-Host "✅ Server dependencies installed`n" -ForegroundColor Green

# Start the dashboard  
Write-Host "🚀 Starting Portfolio Dashboard..." -ForegroundColor Cyan
Write-Host "Dashboard UI: http://localhost:5173" -ForegroundColor Green
Write-Host "Dashboard API: http://localhost:3000`n" -ForegroundColor Green

Write-Host "Press Ctrl+C to stop all services`n" -ForegroundColor Yellow

npm start
