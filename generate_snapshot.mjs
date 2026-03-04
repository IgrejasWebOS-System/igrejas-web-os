// generate_snapshot.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// -----------------------------------------------------------------------------
// 1. DEFINIÇÕES DE CONTEXTO E DESCOBERTA DINÂMICA DE PROJETO
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const rootDir = process.cwd();
const projectName = path.basename(rootDir); // Ex: "Igrejas-Web-os" ou "MobileTechOS"

const now = new Date();
const timestamp = now.toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);

// -----------------------------------------------------------------------------
// 2. MOTOR DE DESCOBERTA DE VOLUMES (POWER-SHELL WMI INTEGRATION)
// -----------------------------------------------------------------------------
function getDriveLetterByLabel(label) {
    try {
        // Usa o PowerShell para buscar a letra do Drive pelo Nome do Volume de forma limpa
        const cmd = `powershell -NoProfile -Command "(Get-Volume -FileSystemLabel '${label}' -ErrorAction SilentlyContinue).DriveLetter"`;
        const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        
        if (output && output.length === 1) {
            return output + ':\\'; // Retorna ex: "J:\"
        }
        return null;
    } catch (e) {
        return null; // Volume não encontrado ou desconectado
    }
}

console.log(`\n🚀 INICIANDO EXTRATOR UNIVERSAL DE SNAPSHOTS | PROJETO: [${projectName.toUpperCase()}]`);

// Identifica o drive de Backup
const backupDrive = getDriveLetterByLabel('BACKUPSYSTEM');

// Define os caminhos dos Diretórios Alvo (Local e Global)
const localSnapshotDir = path.join(rootDir, `snapshot-${projectName.toLowerCase()}`);
let globalSnapshotDir = null;

if (backupDrive) {
    globalSnapshotDir = path.join(backupDrive, 'snapshot-global', projectName);
    console.log(`✔️ Volume BACKUPSYSTEM detectado em: ${backupDrive}`);
} else {
    console.log(`⚠️ AVISO: Volume BACKUPSYSTEM não detectado. O espelhamento global será ignorado nesta execução.`);
}

// -----------------------------------------------------------------------------
// 3. REGRAS DE SEGURANÇA E HIGIENE CIRÚRGICA (BLACKLIST)
// -----------------------------------------------------------------------------
const EXCLUDED_DIRS = new Set([
    'node_modules', '.next', '.git', 'dist', 'build', 'public', 
    '.vercel', '.expo', 'venv', '_database_dumps', 'chrome_cache'
]);
const EXCLUDED_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', 
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.pdf', 
    '.zip', '.exe', '.dll', '.pb', '.bin', '.pyc'
]);
const EXCLUDED_FILES = new Set(['package-lock.json', '.DS_Store', 'thumbs.db']);

const isEnvFile = (filename) => filename.startsWith('.env');

// Utilitários de Formatação
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(date) {
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// -----------------------------------------------------------------------------
// 4. MOTOR DE VARREDURA E PARTICIONAMENTO LÓGICO (CLUSTERING)
// -----------------------------------------------------------------------------
function walkSync(currentDirPath, fileList = []) {
    const files = fs.readdirSync(currentDirPath);

    files.forEach((name) => {
        const filePath = path.join(currentDirPath, name);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Ignora pastas da Blacklist e também ignora a própria pasta local de snapshots gerada
            if (!EXCLUDED_DIRS.has(name) && !name.startsWith('snapshot-')) {
                walkSync(filePath, fileList);
            }
        } else {
            const ext = path.extname(name).toLowerCase();
            if (
                !EXCLUDED_EXTENSIONS.has(ext) &&
                !EXCLUDED_FILES.has(name) &&
                !isEnvFile(name) &&
                name !== 'generate_snapshot.mjs' &&
                !name.startsWith('AUDIT_TREE_')
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

// -----------------------------------------------------------------------------
// 5. EXECUÇÃO, CRIAÇÃO DE DIRETÓRIOS E ESPELHAMENTO (MULTI-I/O)
// -----------------------------------------------------------------------------
function generatePartitionedSnapshots() {
    console.log('🔍 Iniciando varredura cirúrgica e agrupamento de arquivos...');
    const allFiles = walkSync(rootDir);
    
    // Objeto (Dicionário) que agrupará os arquivos pelas suas pastas raízes
    const partitionedFiles = {};

    allFiles.forEach(file => {
        // Extrai o caminho relativo (Ex: "web/src/page.tsx" ou "README.md")
        const relativePath = path.relative(rootDir, file.filePath).replace(/\\/g, '/');
        const pathSegments = relativePath.split('/');
        
        let partitionKey = 'raiz'; // Se não tiver '/' é porque está solto na raiz

        if (pathSegments.length > 1) {
            partitionKey = pathSegments[0]; // Pega a pasta pai de Nível 1 (Ex: 'web', 'docs', 'backend')
        }

        if (!partitionedFiles[partitionKey]) {
            partitionedFiles[partitionKey] = [];
        }
        
        // Adiciona a informação da rota relativa dentro do objeto do arquivo
        file.relativePath = relativePath;
        partitionedFiles[partitionKey].push(file);
    });

    // Cria o diretório local se não existir
    if (!fs.existsSync(localSnapshotDir)) {
        fs.mkdirSync(localSnapshotDir, { recursive: true });
    }

    // Cria o diretório global se o disco BACKUPSYSTEM estiver conectado
    if (globalSnapshotDir && !fs.existsSync(globalSnapshotDir)) {
        try {
            fs.mkdirSync(globalSnapshotDir, { recursive: true });
        } catch (err) {
            console.error(`❌ Erro ao criar pasta no BACKUPSYSTEM: ${err.message}`);
            globalSnapshotDir = null; // Cancela o espelhamento se falhar a criação
        }
    }

    console.log(`\n⚙️ Processando e gravando os arquivos particionados...`);
    let totalProcessedGroups = 0;

    // Loop por cada partição (Pasta) e geração do seu respectivo arquivo Markdown
    for (const [groupName, filesInGroup] of Object.entries(partitionedFiles)) {
        // Ordenação Alfabética interna do grupo
        filesInGroup.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

        const outputFileName = `snapshot_${groupName}_${timestamp}.md`;
        const localOutputPath = path.join(localSnapshotDir, outputFileName);

        let markdownContent = `# 🧭 CONTEXT SNAPSHOT: Módulo [${groupName.toUpperCase()}]\n`;
        markdownContent += `**Projeto:** ${projectName}\n`;
        markdownContent += `**Gerado em:** ${formatDate(now)}\n`;
        markdownContent += `**Total de Arquivos nesta Partição:** ${filesInGroup.length}\n\n`;
        markdownContent += `---\n\n`;

        filesInGroup.forEach((file) => {
            try {
                const content = fs.readFileSync(file.filePath, 'utf8');
                
                markdownContent += `================================================================================\n`;
                markdownContent += `📁 ARQUIVO: ${file.relativePath}\n`;
                markdownContent += `🛠️ EXTENSÃO: ${file.ext}\n`;
                markdownContent += `📏 TAMANHO: ${formatBytes(file.size)}\n`;
                markdownContent += `🕒 ÚLTIMA MODIFICAÇÃO: ${formatDate(file.mtime)}\n`;
                markdownContent += `================================================================================\n\n`;
                
                const mdLang = file.ext.replace('.', '') || 'text';
                markdownContent += `\`\`\`${mdLang}\n`;
                markdownContent += content;
                markdownContent += `\n\`\`\`\n\n`;
            } catch (err) {
                console.warn(`⚠️ Aviso: Não foi possível ler o arquivo ${file.relativePath} - ${err.message}`);
            }
        });

        // 1. Gravação Local (Unidade de Projeto)
        fs.writeFileSync(localOutputPath, markdownContent, 'utf8');
        
        // 2. Gravação Global (Espelhamento no BACKUPSYSTEM)
        if (globalSnapshotDir) {
            const globalOutputPath = path.join(globalSnapshotDir, outputFileName);
            try {
                fs.copyFileSync(localOutputPath, globalOutputPath);
            } catch (err) {
                console.error(`❌ Falha ao espelhar [${outputFileName}] para BACKUPSYSTEM: ${err.message}`);
            }
        }
        
        totalProcessedGroups++;
        console.log(`  ✔️ Partição gerada: [${groupName}] -> ${filesInGroup.length} arquivo(s) mapeado(s).`);
    }

    console.log(`\n✅ OPERAÇÃO CONCLUÍDA COM SUCESSO!`);
    console.log(`📁 Local de salvamento (Projeto): ${localSnapshotDir}`);
    if (globalSnapshotDir) {
        console.log(`📁 Espelhamento realizado em (Backup): ${globalSnapshotDir}`);
    }
}

// Dispara o motor principal
generatePartitionedSnapshots();