# -------------------------------------------------------------------------
# PROJETO: IGREJAS WEB OS (CONNECTION CYBER OS)
# ARQUIVO: E:\Projetos\Igrejas-Web-os\START_SESSION.ps1
# OBJETIVO: ORQUESTRAÇÃO DE INICIALIZAÇÃO v1.1 (FIX: PID 0 Protection)
# -------------------------------------------------------------------------

# Corrige acentuação no terminal
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      CONNECTION CYBER OS | IGREJAS WEB OS v1.0           " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "            INICIANDO SESSÃO DE DESENVOLVIMENTO           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. VALIDAÇÃO DE ESTRUTURA
Write-Host "[1/4] Auditando estrutura de pastas (Next.js)..." -ForegroundColor Yellow
if (Test-Path "web") {
    Write-Host "  [OK] Diretório da aplicação 'web' localizado." -ForegroundColor Green
} else {
    Write-Host "  [CRÍTICO] Diretório 'web' não encontrado! Execute na raiz do projeto." -ForegroundColor Red
    Pause; Exit
}

# 2. LIMPEZA DE AMBIENTE (Cache do Next.js)
Write-Host "`n[2/4] Limpando caches de compilação (.next)..." -ForegroundColor Yellow
if (Test-Path "web\.next") { 
    Remove-Item -Path "web\.next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] Cache de build (.next) purgado." -ForegroundColor Green
} else {
    Write-Host "  [INFO] Nenhum cache anterior detectado." -ForegroundColor Gray
}

# 3. VERIFICAÇÃO DE PORTA (3000)
Write-Host "`n[3/4] Verificando integridade da porta 3000..." -ForegroundColor Yellow
$port = 3000
# Pega todas as conexões na porta 3000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    foreach ($conn in $connections) {
        $pidTarget = $conn.OwningProcess
        # AQUI ESTÁ A CORREÇÃO: Ignora PID 0 (Idle) e PID 4 (System)
        if ($pidTarget -gt 4) {
            Write-Host "  [ALERTA] Processo $pidTarget ocupando a porta. Tentando liberar..." -ForegroundColor Red
            try {
                Stop-Process -Id $pidTarget -Force -ErrorAction Stop
                Write-Host "  [OK] Processo $pidTarget encerrado." -ForegroundColor Green
            } catch {
                Write-Host "  [AVISO] Não foi possível encerrar o PID $pidTarget (Acesso Negado ou já fechado)." -ForegroundColor DarkGray
            }
        }
    }
} else {
    Write-Host "  [OK] Porta $port livre." -ForegroundColor Green
}

# 4. INICIALIZAÇÃO DO SERVIDOR
Write-Host "`n[4/4] Disparando motor Next.js..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd web; npm run dev" -WindowStyle Normal

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "     AMBIENTE PRONTO. PAINEL CARREGANDO EM LOCALHOST:3000 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan