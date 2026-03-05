# =========================================================================
# PROJETO: IGREJAS WEB OS | MOTOR DE AUDITORIA UNIFICADA
# LOCAL: E:\Projetos\igrejas-web-os (Volume: PROJETOS)
# =========================================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      IGREJAS WEB OS | AUDITORIA MESTRE DE INTEGRIDADE    " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "==========================================================" -ForegroundColor Cyan

$BasePath = "E:\Projetos\igrejas-web-os"
$WebPath = "$BasePath\web"
$SupabaseURL = "https://swczhmhyqygpdzxwpvfo.supabase.co"
$VercelURL = "https://vercel.com/igrejasweboss-projects/igrejas-web-os"
$GithubURL = "https://github.com/IgrejasWebOS-System/igrejas-web-os"

Set-Location -Path $BasePath

# -------------------------------------------------------------------------
# ETAPA 1: VALIDAÇÃO DE CHAVES E AMBIENTE (ENV)
# -------------------------------------------------------------------------
Write-Host "`n[1/3] Validando Chaves de Conexão (.env.local)..." -ForegroundColor Yellow
if (Test-Path "$WebPath\.env.local") {
    $envContent = Get-Content "$WebPath\.env.local"
    if ($envContent -match $SupabaseURL) {
        Write-Host "  [OK] Conexão com Supabase Oficial validada!" -ForegroundColor Green
    } else {
        Write-Host "  [ALERTA] A URL do Supabase oficial não foi detectada no arquivo." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [CRÍTICO] Arquivo .env.local ausente em /web! O sistema não subirá." -ForegroundColor Red
}

# -------------------------------------------------------------------------
# ETAPA 2: TYPE-CHECK E LINT (O Escudo de Integridade)
# -------------------------------------------------------------------------
Write-Host "`n[2/3] Executando varredura de código (TypeScript & Lint)..." -ForegroundColor Yellow
Set-Location -Path $WebPath

Write-Host "  -> Checando Tipagem (Type-Check)..." -ForegroundColor DarkGray
npm run type-check
$TypeCheckStatus = $LASTEXITCODE

Write-Host "  -> Checando Padronização (ESLint)..." -ForegroundColor DarkGray
npm run lint
$LintStatus = $LASTEXITCODE

Set-Location -Path $BasePath

if ($TypeCheckStatus -eq 0 -and $LintStatus -eq 0) {
    Write-Host "  [SUCCESS] Código limpo, tipagem íntegra e sem erros estruturais." -ForegroundColor Green
} else {
    Write-Host "  [FALHA] Foram encontrados erros de código. Sugere-se correção antes do backup." -ForegroundColor Red
}

# -------------------------------------------------------------------------
# ETAPA 3: MAPEAMENTO DE ÁRVORE (Ignorando Caches)
# -------------------------------------------------------------------------
Write-Host "`n[3/3] Gerando Estrutura Física do Projeto..." -ForegroundColor Yellow
$Exclude = @("node_modules", ".next", ".git", "package-lock.json", "public", ".vercel", "dist", ".DS_Store")

function Get-CleanTree {
    param ([string]$Path = ".", [string]$Indent = "")
    $Items = Get-ChildItem -Path $Path | Where-Object { $Exclude -notcontains $_.Name } | Sort-Object PSIsContainer -Descending
    foreach ($Item in $Items) {
        if ($Item.PSIsContainer) {
            Write-Host "$Indent+---$($Item.Name)/" -ForegroundColor Yellow
            Get-CleanTree -Path $Item.FullName -Indent "$Indent|   "
        } else {
            Write-Host "$Indent|---$($Item.Name)" -ForegroundColor Gray
        }
    }
}

Get-CleanTree -Path $BasePath
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Auditoria Concluída! Pronto para sincronização na Vercel " -ForegroundColor Cyan
Write-Host " $VercelURL " -ForegroundColor DarkGray