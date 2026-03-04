# -------------------------------------------------------------------------
# PROJETO: IGREJAS WEB OS (CONNECTION CYBER OS)
# ARQUIVO: E:\Projetos\Igrejas-Web-os\CLOSE_SESSION.ps1
# OBJETIVO: ENCERRAMENTO E BACKUP FÍSICO (SEM GITHUB)
# -------------------------------------------------------------------------

# Corrige acentuação no terminal
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "==========================================================" -ForegroundColor Red
Write-Host "      CONNECTION CYBER OS | IGREJAS WEB OS v1.0           " -ForegroundColor White -BackgroundColor DarkRed
Write-Host "       ENCERRANDO SESSÃO E EXECUTANDO BACKUP FÍSICO       " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

# -------------------------------------------------------------------------
# 1. ENCERRAMENTO DE PROCESSOS
# -------------------------------------------------------------------------
Write-Host "[1/3] Finalizando processos ativos (Node.js)..." -ForegroundColor Yellow
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
Write-Host "`n[2/3] Calculando volumetria do projeto..." -ForegroundColor Yellow
$Size = (Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$FormattedSize = "{0:N2}" -f $Size
Write-Host "  [INFO] Tamanho total atual: $FormattedSize MB" -ForegroundColor Cyan

# -------------------------------------------------------------------------
# 3. BACKUP FÍSICO (DRIVE J: - VOLUME 'BACKUPSYSTEM')
# -------------------------------------------------------------------------
Write-Host "`n[3/3] Iniciando Protocolo de Segurança de Volume..." -ForegroundColor Yellow

$DriveLetra = "J"
$VolumeEsperado = "BACKUPSYSTEM"
$Origem  = "E:\Projetos\Igrejas-Web-os"
$Destino = "$($DriveLetra):\Projetos\Igrejas-Web-os"

# Validação de Segurança do Disco
try {
    # Tenta ler as informações do volume J
    $VolumeInfo = Get-Volume -DriveLetter $DriveLetra -ErrorAction Stop
    $VolumeLabel = $VolumeInfo.FileSystemLabel
    
    # Verifica se o rótulo do disco é EXATAMENTE 'BACKUPSYSTEM'
    if ($VolumeLabel -eq $VolumeEsperado) {
        Write-Host "  [SECURITY CHECK] Volume '$VolumeLabel' autenticado com sucesso." -ForegroundColor Green
        
        # Execução do Robocopy
        Write-Host "  [COPY] Iniciando espelhamento para $Destino..." -ForegroundColor Cyan
        
        # /MIR: Espelha a árvore (Cuidado: deleta no destino o que não existe na origem)
        # /XO: Exclui arquivos mais antigos (Backup Incremental)
        # /FFT: Assume tempos de arquivo FAT (Melhora compatibilidade)
        # /R:2 /W:2: Tenta 2 vezes, espera 2 segundos se falhar
        # /XD: Exclui pastas pesadas ou desnecessárias
        ROBOCOPY $Origem $Destino /MIR /XO /FFT /R:2 /W:2 /NFL /NDL /XD "node_modules" ".next" ".git"
        
        # Robocopy retorna códigos de 0 a 7 para sucesso
        if ($LASTEXITCODE -lt 8) {
            Write-Host "  [SUCCESS] Backup Físico Concluído no Volume BACKUPSYSTEM." -ForegroundColor Green
        } else {
            Write-Host "  [ALERTA] Robocopy finalizou com avisos (Código $LASTEXITCODE)." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "  [ERRO DE SEGURANÇA] O drive J: foi detectado, mas o nome é '$VolumeLabel'." -ForegroundColor Red
        Write-Host "  Esperado: '$VolumeEsperado'. O backup foi abortado para proteger o disco errado." -ForegroundColor Red
    }
    
} catch {
    Write-Host "  [ERRO CRÍTICO] Drive J: não encontrado ou inacessível!" -ForegroundColor Red
    Write-Host "  Certifique-se que o disco 'BACKUPSYSTEM' está conectado na porta USB." -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Red
Write-Host "     SESSÃO ENCERRADA. DADOS SEGUROS NO DISCO FÍSICO.     " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red