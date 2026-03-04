[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         IGREJA WEB OS | START ENGINE v1.0                " -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "==========================================================" -ForegroundColor Green

Write-Host "`n[1/3] Purgando caches e liberando a Porta 3000..." -ForegroundColor Yellow
if (Test-Path "web\.next") { Remove-Item -Path "web\.next" -Recurse -Force -ErrorAction SilentlyContinue }
$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }

Write-Host "`n[2/3] Verificando integridade das Variáveis de Ambiente..." -ForegroundColor Yellow
if (-not (Test-Path "web\.env.local")) {
    Write-Host "  [ERRO CRÍTICO] Arquivo .env.local não encontrado na pasta web!" -ForegroundColor Red
    Pause; Exit
}

Write-Host "`n[3/3] Disparando motor Next.js (Turbopack)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd web; npm run dev -- --turbo" -WindowStyle Normal

Write-Host "`n[OK] Sessão IgrejaWebOS iniciada com sucesso. Ambiente operacional." -ForegroundColor Green