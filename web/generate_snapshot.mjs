// generate_snapshot.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurações de Diretório
const __filename = fileURLToPath(import.meta.url);
const rootDir = process.cwd();

// Geração de Timestamp Local (pt-BR) para o nome do arquivo
const now = new Date();
const timestamp = now.toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
const outputFile = path.join(rootDir, `ERP_SNAPSHOT_${timestamp}.md`);

// 🛡️ REGRAS DE SEGURANÇA E HIGIENE CIRÚRGICA (BLACKLIST)
const EXCLUDED_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'public']);
const EXCLUDED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.pdf', '.zip']);
const EXCLUDED_FILES = new Set(['package-lock.json', '.DS_Store']);

// Função para checar se o arquivo é um .env (Proteção de Credenciais)
const isEnvFile = (filename) => filename.startsWith('.env');

// Utilitário: Formatar Tamanho do Arquivo
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Utilitário: Formatar Data no Padrão Local
function formatDate(date) {
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// Motor de Varredura Recursiva (AST Traversal)
function walkSync(currentDirPath, fileList = []) {
    const files = fs.readdirSync(currentDirPath);

    files.forEach((name) => {
        const filePath = path.join(currentDirPath, name);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.has(name)) {
                walkSync(filePath, fileList);
            }
        } else {
            const ext = path.extname(name).toLowerCase();
            if (
                !EXCLUDED_EXTENSIONS.has(ext) &&
                !EXCLUDED_FILES.has(name) &&
                !isEnvFile(name) &&
                name !== 'generate_snapshot.mjs' // Ignora a si mesmo
            ) {
                fileList.push({
                    filePath,
                    name,
                    ext: ext || '(Sem extensão)',
                    size: stat.size,
                    mtime: stat.mtime
                });
            }
        }
    });
    return fileList;
}

// Execução e Montagem do Documento
function generateSnapshot() {
    console.log('🔍 Iniciando varredura cirúrgica do repositório...');
    const allFiles = walkSync(rootDir);
    
    // Ordenação Alfabética das Rotas para manter a consistência do documento
    allFiles.sort((a, b) => a.filePath.localeCompare(b.filePath));

    let markdownContent = `# 🧭 ERP CONTEXT SNAPSHOT\n`;
    markdownContent += `**Gerado em:** ${formatDate(now)}\n`;
    markdownContent += `**Total de Arquivos Lidos:** ${allFiles.length}\n\n`;
    markdownContent += `---\n\n`;

    let processedCount = 0;

    allFiles.forEach((file) => {
        const relativePath = path.relative(rootDir, file.filePath).replace(/\\/g, '/');
        
        try {
            const content = fs.readFileSync(file.filePath, 'utf8');
            
            // Injeção do Cabeçalho Técnico
            markdownContent += `================================================================================\n`;
            markdownContent += `📁 ARQUIVO: ${relativePath}\n`;
            markdownContent += `🛠️ EXTENSÃO: ${file.ext}\n`;
            markdownContent += `📏 TAMANHO: ${formatBytes(file.size)}\n`;
            markdownContent += `🕒 ÚLTIMA MODIFICAÇÃO: ${formatDate(file.mtime)}\n`;
            markdownContent += `================================================================================\n\n`;
            
            // Injeção do Código-Fonte encapsulado em Markdown
            const mdLang = file.ext.replace('.', '') || 'text';
            markdownContent += `\`\`\`${mdLang}\n`;
            markdownContent += content;
            markdownContent += `\n\`\`\`\n\n`;
            
            processedCount++;
        } catch (err) {
            console.warn(`⚠️ Aviso: Não foi possível ler o arquivo ${relativePath} - ${err.message}`);
        }
    });

    fs.writeFileSync(outputFile, markdownContent, 'utf8');
    console.log(`✅ Extração concluída com sucesso! Snapshot gerado: ${path.basename(outputFile)}`);
    console.log(`📊 Total de arquivos processados: ${processedCount}`);
}

generateSnapshot();