# -------------------------------------------------------------------------
# PROJETO: IGREJAS WEB OS
# ARQUIVO: E:\Projetos\Igrejas-Web-os\AUDIT_TREE_IgrejasWebOS.ps1
# OBJETIVO: VISUALIZAÇÃO LIMPA (ASCII COMPATÍVEL - FOCO EM ENGENHARIA)
# -------------------------------------------------------------------------

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "                 IGREJAS WEB OS v1.0                      " -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "             MAPEAMENTO DE ESTRUTURA TÉCNICA              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Local: E:\Projetos\Igrejas-Web-os`n" -ForegroundColor Gray

# 🛡️ FILTRO DE HIGIENE (Arquivos e Pastas desnecessários/lixo)
$Exclude = @(
    "node_modules", 
    ".next", 
    ".git", 
    "package-lock.json", 
    "public", 
    ".vercel", 
    "dist",
    ".DS_Store",
    "thumbs.db",
    "out"
)

function Get-CleanTree {
    param (
        [string]$Path = ".",
        [string]$Indent = ""
    )
    
    # Obtém itens filtrados e ordenados (pastas primeiro)
    $Items = Get-ChildItem -Path $Path | 
             Where-Object { $Exclude -notcontains $_.Name } | 
             Sort-Object PSIsContainer -Descending
    
    foreach ($Item in $Items) {
        if ($Item.PSIsContainer) {
            # Renderiza Pasta com padrão ASCII seguro
            Write-Host "$Indent+---$($Item.Name)/" -ForegroundColor Yellow
            
            # Recorrência para subpastas
            Get-CleanTree -Path $Item.FullName -Indent "$Indent|   "
        } else {
            # Renderiza Arquivo com padrão ASCII seguro
            Write-Host "$Indent|---$($Item.Name)" -ForegroundColor Gray
        }
    }
}

# Execução do Mapeamento na Raiz do Projeto
Get-CleanTree -Path "E:\Projetos\Igrejas-Web-os"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " MAPEAMENTO CONCLUÍDO COM SUCESSO!                        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan