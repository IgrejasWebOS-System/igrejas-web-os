[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host
Write-Host ">>> CHECK DE INTEGRIDADE PRÉ-BACKUP (IGREJA WEB OS) <<<" -ForegroundColor Cyan

Set-Location -Path "web"
Write-Host "`n[1/2] Executando Type-Check rigoroso (TypeScript)..." -ForegroundColor Yellow
npm run type-check

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [SUCCESS] Tipagem de dados íntegra." -ForegroundColor Green
    Write-Host "`n[2/2] Executando Next Lint (Regras de Código)..." -ForegroundColor Yellow
    npm run lint
} else {
    Write-Host "  [FALHA] Erros de tipo detectados! Corrija antes de commitar." -ForegroundColor Red
}
Set-Location -Path ".."