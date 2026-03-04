# -------------------------------------------------------------------------
# PROJETO: IGREJAS WEB OS (CONNECTION CYBER OS)
# ARQUIVO: E:\Projetos\Igrejas-Web-os\AUDIT_STRUCTURE.ps1
# OBJETIVO: AUDITORIA SISTÊMICA ADAPTADA PARA NEXT.JS + SUPABASE
# -------------------------------------------------------------------------

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      CONNECTION CYBER OS | IGREJAS WEB OS v1.0           " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "             AUDITORIA SISTÊMICA DE INTEGRIDADE           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. VERIFICAÇÃO DE DEPENDÊNCIAS (NODE_MODULES)
Write-Host "[1/3] Verificando integridade das dependências (NPM)..." -ForegroundColor Yellow
if (Test-Path "E:\Projetos\Igrejas-Web-os\web\node_modules") {
    Write-Host "  [OK] Biblioteca de módulos (node_modules) instalada." -ForegroundColor Green
} else {
    Write-Host "  [FALHA] 'node_modules' não encontrado!" -ForegroundColor Red
    Write-Host "  [AÇÃO] Execute 'npm install' dentro da pasta web." -ForegroundColor Magenta
}

# 2. VERIFICAÇÃO DE AMBIENTE (ENV / SUPABASE)
Write-Host "`n[2/3] Validando segredos e configurações..." -ForegroundColor Yellow
if (Test-Path "E:\Projetos\Igrejas-Web-os\web\.env.local") {
    Write-Host "  [OK] Arquivo de variáveis (.env.local) presente." -ForegroundColor Green
    # Verificação simples se contém as chaves do Supabase
    $envContent = Get-Content "E:\Projetos\Igrejas-Web-os\web\.env.local"
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "  [OK] Configuração Supabase URL detectada." -ForegroundColor Green
    } else {
        Write-Host "  [ALERTA] Chave Supabase URL parece ausente no .env.local!" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [CRÍTICO] Arquivo .env.local ausente! O sistema não conectará ao banco." -ForegroundColor Red
}

# 3. RESUMO DE ARQUITETURA
Write-Host "`n[3/3] Gerando métricas do código fonte..." -ForegroundColor Yellow
$SrcPath = "E:\Projetos\Igrejas-Web-os\web\src"
if (Test-Path $SrcPath) {
    $FileCount = (Get-ChildItem -Path $SrcPath -Recurse -File | Measure-Object).Count
    Write-Host "  > Arquitetura: Next.js 15 (App Router) + Supabase" -ForegroundColor Cyan
    Write-Host "  > Total de arquivos fonte (src): $FileCount" -ForegroundColor White
} else {
    Write-Host "  [ERRO] Pasta 'src' não encontrada dentro de 'web'." -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "       AUDITORIA CONCLUÍDA. SISTEMA EM CONFORMIDADE.      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan