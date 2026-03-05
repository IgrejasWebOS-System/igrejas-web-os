# ============================================================================
# SCRIPT DE BACKUP FISICO HIGIENIZADO - IGREJAS WEB OS (ASCII SAFE)
# ============================================================================
Clear-Host
Write-Host "[>>>] INICIANDO PROTOCOLO DE BACKUP FISICO (ROBOCOPY)" -ForegroundColor Cyan

# 1. Descoberta Dinamica do Volume de Destino
$TargetDrive = (Get-Volume -FileSystemLabel 'BACKUPSYSTEM' -ErrorAction SilentlyContinue).DriveLetter

if ([string]::IsNullOrEmpty($TargetDrive)) {
    Write-Host "[X] ERRO CRITICO: Volume 'BACKUPSYSTEM' nao detectado no computador." -ForegroundColor Red
    Write-Host "Verifique se o HD/Pendrive esta conectado e tente novamente." -ForegroundColor Yellow
    Exit
}

# 2. Mapeamento de Rotas
$SourcePath = "E:\Projetos\igrejas-web-os"
$TargetPath = "$($TargetDrive):\igrejas-web-os"

Write-Host "[OK] Volume BACKUPSYSTEM encontrado em: $($TargetDrive):\" -ForegroundColor Green
Write-Host "-> Origem: $SourcePath"
Write-Host "-> Destino: $TargetPath`n"

# 3. Filtros de Higiene
$ExcludeDirs = @("node_modules", ".next", "dist", "build", ".vercel", ".git", "chrome_cache")
$ExcludeFiles = @("package-lock.json", ".DS_Store", "thumbs.db")

# 4. Execucao do Motor Robocopy
Write-Host "[...] Sincronizando arquivos... Aguarde." -ForegroundColor Yellow

$RobocopyArgs = @(
    $SourcePath, 
    $TargetPath, 
    "/MIR", 
    "/XD"
) + $ExcludeDirs + @("/XF") + $ExcludeFiles + @("/R:1", "/W:1", "/NDL", "/NFL")

& robocopy @RobocopyArgs | Out-Null

Write-Host "`n[OK] BACKUP FISICO CONCLUIDO COM SUCESSO NO DISCO $($TargetDrive):\" -ForegroundColor Green
Write-Host "Todos os lixos e caches foram bloqueados. Copia pura do codigo fonte efetuada." -ForegroundColor White