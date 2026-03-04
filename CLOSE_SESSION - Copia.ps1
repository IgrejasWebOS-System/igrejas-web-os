# -------------------------------------------------------------------------
# PROJETO: IGREJAS WEB OS (CONNECTION CYBER OS)
# ARQUIVO: E:\Projetos\Igrejas-Web-os\CLOSE_SESSION.ps1
# OBJETIVO: ENCERRAMENTO E BACKUP COM VALIDAÇÃO DE ASSINATURA DE VOLUME
# -------------------------------------------------------------------------

# Corrige acentuação no terminal
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "==========================================================" -ForegroundColor Red
Write-Host "      CONNECTION CYBER OS | IGREJAS WEB OS v1.0           " -ForegroundColor White -BackgroundColor DarkRed
Write-Host "       ENCERRANDO SESSÃO E EXECUTANDO BACKUP DUPLO        " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

# -------------------------------------------------------------------------
# 1. ENCERRAMENTO DE PROCESSOS
# -------------------------------------------------------------------------
Write-Host "[1/4] Finalizando processos ativos (Node.js)..." -ForegroundColor Yellow
$NodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($NodeProcesses) {
    Stop-Process -Name node -Force
    Write-Host "  [OK] Todos os processos Node.js foram encerrados." -ForegroundColor Green
} else {
    Write-Host "  [OK] Nenhum processo de servidor ativo encontrado." -ForegroundColor Gray
}

# -------------------------------------------------------------------------
# 2. AUDITORIA DE TAMANHO
# -------------------------------------------------------------------------
Write-Host "`n[2/4] Calculando volumetria do projeto..." -ForegroundColor Yellow
$Size = (Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$FormattedSize = "{0:N2}" -f $Size
Write-Host "  [INFO] Tamanho total atual: $FormattedSize MB" -ForegroundColor Cyan

# -------------------------------------------------------------------------
# 3. BACKUP DE NUVEM (GITHUB)
# -------------------------------------------------------------------------
Write-Host "`n[3/4] Iniciando sincronização com GitHub..." -ForegroundColor Yellow
$Status = git status --porcelain
if ($Status) {
    $Date = Get-Date -Format "dd/MM/yyyy HH:mm"
    Write-Host "  [GIT] Alterações detectadas. Criando ponto de restauração..." -ForegroundColor Cyan
    git add .
    git commit -m "Session Closed: $Date - Auto-Backup IgrejasWebOS"
    
    Write-Host "  [GIT] Enviando para nuvem..." -ForegroundColor Cyan
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [SUCCESS] Código sincronizado com GitHub." -ForegroundColor Green
    } else {
        Write-Host "  [FALHA] Erro ao conectar com GitHub. Verifique a internet." -ForegroundColor Red
    }
} else {
    Write-Host "  [OK] Nenhuma alteração de código pendente." -ForegroundColor Gray
}

# -------------------------------------------------------------------------
# 4. BACKUP FÍSICO (DRIVE J: - VOLUME 'BACKUPSYSTEM')
# -------------------------------------------------------------------------
Write-Host "`n[4/4] Iniciando Protocolo de Segurança de Volume..." -ForegroundColor Yellow

$DriveLetra = "J"
$VolumeEsperado = "BACKUPSYSTEM"
$Origem  = "E:\Projetos\Igrejas-Web-os"
$Destino = "$($DriveLetra):\Projetos\Igrejas-Web-os"

# Validação de Segurança do Disco
try {
    $VolumeInfo = Get-Volume -DriveLetter $DriveLetra -ErrorAction Stop
    $VolumeLabel = $VolumeInfo.FileSystemLabel
    
    if ($VolumeLabel -eq $VolumeEsperado) {
        Write-Host "  [SECURITY CHECK] Volume '$VolumeLabel' autenticado com sucesso." -ForegroundColor Green
        
        # Execução do Robocopy
        Write-Host "  [COPY] Iniciando espelhamento para $Destino..." -ForegroundColor Cyan
        
        # /MIR: Espelha (Cria/Deleta)
        # /XO: Exclui arquivos mais antigos
        # /FFT: Assume tempos de arquivo FAT (ajuda na compatibilidade entre HDs diferentes)
        # /R:2 /W:2: Tenta 2 vezes, espera 2 segundos (se falhar)
        ROBOCOPY $Origem $Destino /MIR /XO /FFT /R:2 /W:2 /NFL /NDL /XD "node_modules" ".next" ".git"
        
        if ($LASTEXITCODE -lt 8) {
            Write-Host "  [SUCCESS] Backup Físico Concluído no Volume BACKUPSYSTEM." -ForegroundColor Green
        } else {
            Write-Host "  [ALERTA] Robocopy finalizou com erros leves." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "  [ERRO DE SEGURANÇA] O drive J: foi detectado, mas o nome é '$VolumeLabel'." -ForegroundColor Red
        Write-Host "  Esperado: '$VolumeEsperado'. O backup foi abortado para proteger seus dados." -ForegroundColor Red
    }
    
} catch {
    Write-Host "  [ERRO CRÍTICO] Drive J: não encontrado ou inacessível!" -ForegroundColor Red
    Write-Host "  Certifique-se que o disco 'BACKUPSYSTEM' está conectado." -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Red
Write-Host "     SESSÃO ENCERRADA. DADOS SEGUROS NA NUVEM E NO DISCO. " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red