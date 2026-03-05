# =========================================================================
# PROJETO: IGREJAS WEB OS | MOTOR DE ENCERRAMENTO E BACKUP HÍBRIDO
# LOCAL DE ORIGEM: E:\Projetos\igrejas-web-os (Volume: PROJETOS)
# LOCAL DE DESTINO: J:\igrejas-web-os (Volume: BACKUPSYSTEM)
# =========================================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "==========================================================" -ForegroundColor Red
Write-Host "   IGREJAS WEB OS | ENCERRAMENTO E BACKUP DE ALTA SEGURANÇA " -ForegroundColor White -BackgroundColor DarkRed
Write-Host "==========================================================" -ForegroundColor Red

$Origem = "E:\Projetos\igrejas-web-os"
Set-Location -Path $Origem

# -------------------------------------------------------------------------
# ETAPA 1: DERRUBAR SERVIDOR NODE.JS
# -------------------------------------------------------------------------
Write-Host "`n[1/4] Finalizando processos ativos do servidor..." -ForegroundColor Yellow
$NodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($NodeProcesses) {
    Stop-Process -Name node -Force
    Write-Host "  [OK] Processos Node.js encerrados e portas liberadas." -ForegroundColor Green
} else {
    Write-Host "  [OK] Nenhum servidor rodando no momento." -ForegroundColor Gray
}

# -------------------------------------------------------------------------
# ETAPA 2: LIMPEZA DE CACHE RÁPIDA (Opcional para leveza)
# -------------------------------------------------------------------------
Write-Host "`n[2/4] Limpando caches temporários da Vercel/Next (.next)..." -ForegroundColor Yellow
if (Test-Path "$Origem\web\.next") {
    Remove-Item -Path "$Origem\web\.next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] Cache de compilação limpo." -ForegroundColor Green
}

# -------------------------------------------------------------------------
# ETAPA 3: SINCRONIZAÇÃO EM NUVEM (GITHUB)
# -------------------------------------------------------------------------
Write-Host "`n[3/4] Sincronizando com Nuvem (GitHub)..." -ForegroundColor Yellow
Write-Host "  Repositório: https://github.com/IgrejasWebOS-System/igrejas-web-os" -ForegroundColor DarkGray

$CommitMsg = Read-Host "Digite a mensagem do Commit (ou pressione Enter para automático)"
if ([string]::IsNullOrWhiteSpace($CommitMsg)) { 
    $CommitMsg = "Backup Automático: $(Get-Date -Format 'dd/MM/yyyy HH:mm')" 
}

git add .
git commit -m "$CommitMsg"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [SUCCESS] Código enviado e seguro na nuvem!" -ForegroundColor Green
} else {
    Write-Host "  [ALERTA] Git Push falhou ou não havia o que commitar." -ForegroundColor Yellow
}

# -------------------------------------------------------------------------
# ETAPA 4: ESPELHAMENTO MILITAR (ROBOCOPY PARA DRIVE J:)
# -------------------------------------------------------------------------
Write-Host "`n[4/4] Iniciando Espelhamento Físico de Alta Fidelidade..." -ForegroundColor Yellow

$Destino = "J:\igrejas-web-os"
$VolumeDriveJ = (Get-Volume -DriveLetter J -ErrorAction SilentlyContinue).FileSystemLabel

if ($VolumeDriveJ -eq "BACKUPSYSTEM") {
    Write-Host "  [OK] Assinatura de Volume validada: BACKUPSYSTEM (Drive J:)" -ForegroundColor Green
    
    # Robocopy ignora pastas pesadas que podem ser recriadas (node_modules, .git)
    ROBOCOPY $Origem $Destino /MIR /XO /FFT /R:2 /W:2 /NFL /NDL /XD "node_modules" ".next" ".git" ".vercel" "out" "dist"
    
    if ($LASTEXITCODE -lt 8) {
        Write-Host "  [SUCCESS] Backup Físico Concluído no Disco Externo!" -ForegroundColor Green
    } else {
        Write-Host "  [ALERTA] Robocopy reportou códigos de erro (Código $LASTEXITCODE)." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [ERRO CRÍTICO] O Drive J: não possui a assinatura 'BACKUPSYSTEM'!" -ForegroundColor Red
    Write-Host "  Proteção ativada: O espelhamento foi cancelado para evitar sobrescrever o disco errado." -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Red
Write-Host "  SESSÃO ENCERRADA. O SISTEMA ESTÁ SEGURO EM 2 AMBIENTES  " -ForegroundColor White