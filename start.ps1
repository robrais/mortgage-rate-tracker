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
        Write-Host '⚠️  IMPORTANT: Edit .env file with your DATABASE_URL if not using Docker Compose defaults!' -ForegroundColor Yellow
        Write-Host ''
    } else {
        Write-Host '❌ .env.example not found!' -ForegroundColor Red
        Write-Host ''
    }
}

# Check Docker and PostgreSQL
Write-Host ''
Write-Host 'Checking PostgreSQL (Docker Compose)...' -ForegroundColor Yellow
$dockerVersion = & docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host '⚠️  Docker not found in PATH' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'To run PostgreSQL locally, install Docker Desktop:' -ForegroundColor Yellow
    Write-Host '  https://www.docker.com/products/docker-desktop/' -ForegroundColor White
    Write-Host '  Then run: docker compose up -d' -ForegroundColor White
    Write-Host ''
} else {
    Write-Host ('✓ Docker found: ' + $dockerVersion) -ForegroundColor Green
    
    # Check if compose stack is running
    $pgContainer = & docker compose ps --status running --format json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $pgContainer) {
        Write-Host ''
        Write-Host 'Starting PostgreSQL via Docker Compose...' -ForegroundColor Yellow
        & docker compose up -d 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host '✓ PostgreSQL container started' -ForegroundColor Green
            Start-Sleep -Seconds 3
        } else {
            Write-Host '⚠️  Could not start Docker Compose. Is Docker Desktop running?' -ForegroundColor Yellow
        }
    } else {
        Write-Host '✓ PostgreSQL container already running' -ForegroundColor Green
    }
    Write-Host ''
    Write-Host 'To apply the database schema, run:' -ForegroundColor Cyan
    Write-Host '  docker compose exec postgres psql -U mortgage_user -d mortgage_tracker -f /docker-entrypoint-initdb.d/01-schema.sql' -ForegroundColor White
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
