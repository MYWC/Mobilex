$ErrorActionPreference = 'Stop'

Write-Host "== Mobilex 2.0 GitHub Pages setup ==" -ForegroundColor Cyan

$node = node -v
Write-Host "Node: $node"

$version = [version](node -p "process.versions.node")
if ($version -lt [version]'22.12.0') {
  throw "Mobilex 2.0 requires Node.js 22.12.0 or newer."
}

if (Test-Path .\node_modules) {
  Write-Host "Removing old node_modules..." -ForegroundColor Yellow
  Remove-Item -Recurse -Force .\node_modules
}

if (Test-Path .\package-lock.json) {
  Write-Host "Removing stale package-lock.json so it can be regenerated..." -ForegroundColor Yellow
  Remove-Item -Force .\package-lock.json
}

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install --no-audit --no-fund

Write-Host "Running GitHub Pages preflight..." -ForegroundColor Green
npm run pages:check

Write-Host "Running typecheck..." -ForegroundColor Green
npm run typecheck

Write-Host "Running lint..." -ForegroundColor Green
npm run lint

Write-Host "Running tests..." -ForegroundColor Green
npm run test

Write-Host "Building production bundle..." -ForegroundColor Green
$env:VITE_PUBLIC_APP_URL = 'https://mywc.github.io/Mobilex'
$env:VITE_APP_ENV = 'production'
$env:VITE_PAYMENT_MODE = 'disabled'
npm run build

Copy-Item .\dist\index.html .\dist\404.html -Force

Write-Host ""
Write-Host "Mobilex 2.0 is ready for GitHub Pages." -ForegroundColor Green
Write-Host "Local app: http://localhost:5173/Mobilex/"
Write-Host "Production: https://mywc.github.io/Mobilex/"
