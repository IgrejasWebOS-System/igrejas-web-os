[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host
Write-Host "==========================================================" -ForegroundColor Red
Write-Host "      ENCERRAMENTO E BACKUP HÍBRIDO (IGREJA WEB OS)       " -ForegroundColor White -BackgroundColor DarkRed
Write-Host "==========================================================" -ForegroundColor Red

# 1. FINALIZAÇÃO DOS PROCESSOS
Write-Host "[1/4] Encerrando processos do Node e liberando portas..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "  [OK] Processos encerrados." -ForegroundColor Green

# 2. BACKUP FÍSICO (ESPELHAMENTO DRIVE J)
$DestinoFisico = "J:\IgrejaWebOS_BK2026"
if ((Get-Volume -DriveLetter J -ErrorAction SilentlyContinue)) {
    Write-Host "`n[2/4] Espelhamento Físico de Alta Fidelidade (Drive J)..." -ForegroundColor Yellow
    if (-not (Test-Path $DestinoFisico)) { New-Item -ItemType Directory -Path $DestinoFisico -Force }
    # Executa Robocopy ignorando pastas pesadas/desnecessárias
    robocopy ".\web" "$DestinoFisico\web" /MIR /XO /FFT /R:2 /W:2 /NFL /NDL /XD "node_modules" ".next" ".git"
    Write-Host "  [OK] Backup Físico concluído." -ForegroundColor Green
} else {
    Write-Host "`n[2/4] [ALERTA] Drive J: não conectado. Ignorando backup físico." -ForegroundColor DarkYellow
}

# 3. BACKUP CLOUD (GITHUB)
Write-Host "`n[3/4] Iniciando sincronização com repositório GitHub..." -ForegroundColor Yellow
$Mensagem = Read-Host "Descreva o trabalho feito hoje (Commit)"
if ([string]::IsNullOrWhiteSpace($Mensagem)) { $Mensagem = "Auto-Backup: Sessão encerrada em $(Get-Date -Format 'dd/MM/yyyy HH:mm')" }

git add .
git commit -m "feat(igreja): $Mensagem"
git push origin main
Write-Host "  [OK] Código enviado para a nuvem." -ForegroundColor Green

# 4. INVENTÁRIO DO SISTEMA (PROJECT_STRUCTURE.md)
Write-Host "`n[4/4] Mapeando estrutura para PROJECT_STRUCTURE.md (Dossiê IA)..." -ForegroundColor Cyan
$rootPath = (Get-Location).Path # Captura dinamicamente a pasta atual onde o script está rodando
$output = "$rootPath\PROJECT_STRUCTURE.md"

# Cabecalho de identificacao do arquivo
"PROJETO: IGREJA WEB OS" | Out-File $output -Encoding utf8
"Atualizado em: $(Get-Date)" | Out-File $output -Append -Encoding utf8
"---" | Out-File $output -Append -Encoding utf8

# Geracao da Arvore Recursiva (Ignorando pastas pesadas e de build)
Get-ChildItem -Path $rootPath -Recurse | 
    Where-Object { $_.FullName -notmatch "node_modules|\\.next|\\.git|out|dist" } |
    ForEach-Object {
        $depth = ($_.FullName.Replace($rootPath, "").Split('\').Count - 1)
        $indent = ""
        for($i=0; $i -lt $depth; $i++) { $indent += "  " }
        
        $tipo = "FILE: "
        if ($_.PSIsContainer) { $tipo = "DIR: " }
        
        $linha = $indent + $tipo + $_.Name
        $linha | Out-File $output -Append -Encoding utf8
    }

Write-Host "  [OK] PROJECT_STRUCTURE.md atualizado com sucesso." -ForegroundColor Green

Write-Host "`n[OK] Sessão IgrejaWebOS protegida e auditada com sucesso. Pode desligar a máquina." -ForegroundColor Green