# Mortgage Rate Tracker - Startup Script

Write-Host '================================' -ForegroundColor Cyan
Write-Host 'Mortgage Rate Tracker - Startup' -ForegroundColor Cyan
Write-Host '================================' -ForegroundColor Cyan
Write-Host ''

# Check if Node.js is installed
Write-Host 'Checking prerequisites...' -ForegroundColor Yellow
$nodeVersion = & node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host '❌ Node.js is not installed!' -ForegroundColor Red
    Write-Host ''
    Write-Host 'Please install Node.js from: https://nodejs.org/' -ForegroundColor Yellow
    Write-Host 'Recommended: Download and install the LTS version' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'After installing Node.js:' -ForegroundColor Cyan
    Write-Host '1. Close and reopen PowerShell' -ForegroundColor White
    Write-Host '2. Run this script again: .\start.ps1' -ForegroundColor White
    Write-Host ''
    exit 1
}

Write-Host ('✓ Node.js installed: ' + $nodeVersion) -ForegroundColor Green

# Check if npm dependencies are installed
if (-not (Test-Path 'backend\node_modules')) {
    Write-Host ''
    Write-Host 'Installing dependencies...' -ForegroundColor Yellow
    Push-Location backend
    npm install
    $installExitCode = $LASTEXITCODE
    Pop-Location
    
    if ($installExitCode -ne 0) {
        Write-Host '❌ Failed to install dependencies' -ForegroundColor Red
        exit 1
    }
    Write-Host '✓ Dependencies installed' -ForegroundColor Green
} else {
    Write-Host '✓ Dependencies already installed' -ForegroundColor Green
}

# Check if .env file exists
if (-not (Test-Path '.env')) {
    Write-Host ''
    Write-Host '⚠️  .env file not found' -ForegroundColor Yellow
    Write-Host 'Creating .env from example...' -ForegroundColor Yellow
    if (Test-Path '.env.example') {
        Copy-Item .env.example .env
        Write-Host '✓ .env file created' -ForegroundColor Green
        Write-Host ''
        Write-Host '⚠️  IMPORTANT: Edit .env file with your MySQL credentials!' -ForegroundColor Yellow
        Write-Host ''
    } else {
        Write-Host '❌ .env.example not found!' -ForegroundColor Red
        Write-Host ''
    }
}

# Check MySQL connection
Write-Host ''
Write-Host 'Checking MySQL connection...' -ForegroundColor Yellow
$mysqlVersion = & mysql --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host '⚠️  MySQL client not found in PATH' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Please ensure MySQL is installed and running:' -ForegroundColor Yellow
    Write-Host '1. Download MySQL: https://dev.mysql.com/downloads/mysql/' -ForegroundColor White
    Write-Host '2. Run the database schema: mysql -u root -p < database\schema.sql' -ForegroundColor White
    Write-Host ''
} else {
    Write-Host ('✓ MySQL client found: ' + $mysqlVersion) -ForegroundColor Green
    Write-Host ''
    Write-Host 'To setup the database, run:' -ForegroundColor Cyan
    Write-Host '  mysql -u root -p < database\schema.sql' -ForegroundColor White
    Write-Host ''
}

# Start the server
Write-Host '================================' -ForegroundColor Cyan
Write-Host 'Starting server...' -ForegroundColor Green
Write-Host '================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Server will be available at: http://localhost:3000' -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
Write-Host ''

Push-Location backend
node server.js
$serverExitCode = $LASTEXITCODE
Pop-Location

exit $serverExitCode
