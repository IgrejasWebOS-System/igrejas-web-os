const fs = require('fs');
const path = require('path');

// Diretório raiz de origem (onde o script está sendo executado)
const raizOrigem = process.cwd();

// Arquivos de saída
const promptCriacao = path.join(raizOrigem, 'prompt-criacao.txt');
const promptImplementacao = path.join(raizOrigem, 'prompt-implementacao.txt');

// Conteúdo do prompt de criação (executado na ORIGEM)
const conteudoCriacao = `
# PROMPT DE CRIAÇÃO — ORIGEM
# Projeto: Igrejas-Web-os
# Objetivo: Extrair o Design System seguindo o RFC‑0017

Execute as seguintes ações:

1. Criar a pasta:
   /src/design-system/

2. Criar subpastas:
   /src/design-system/tokens/
   /src/design-system/components/
   /src/design-system/layout/

3. Mover para dentro de design-system:
   - Tokens de design:
     • Cores
     • Tipografia
     • Espaçamentos
     • Radius
     • Sombras
   - Componentes reutilizáveis:
     • Botões
     • Inputs
     • Cards
     • Dropdowns
     • Badges
     • Toggles
   - Layouts reutilizáveis:
     • Containers
     • Headers
     • Sidebars
     • Footers

4. Remover dependências de regra de negócio:
   - Remover textos fixos do domínio
   - Remover hooks específicos
   - Remover lógica de negócio

5. Gerar um pacote exportável:
   - Criar index.ts exportando todos os tokens e componentes
   - Preparar estrutura para virar biblioteca (npm ou monorepo)

6. Gerar o arquivo final:
   /dist/design-system-export.zip
   contendo:
   - /tokens
   - /components
   - /layout
   - package.json base
   - README.md
   - instruções de instalação

Este pacote será importado no {CyberRaffleOS}.
`;

// Conteúdo do prompt de implementação (executado no DESTINO)
const conteudoImplementacao = `
# PROMPT DE IMPLEMENTAÇÃO — DESTINO
# Projeto: CyberRaffleOS
# Objetivo: Importar e aplicar o Design System extraído do Igrejas-Web-os

Execute as seguintes ações:

1. Copiar o arquivo:
   design-system-export.zip
   para a raiz do projeto {CyberRaffleOS}

2. Extrair o conteúdo em:
   /src/design-system/

3. Instalar dependências do Design System:
   npm install
   ou
   pnpm install
   ou
   yarn install

4. Configurar o tema global:
   - Importar ThemeProvider
   - Envolver a aplicação com o provider

5. Substituir componentes nativos pelos componentes do Design System:
   - <button> → <Button />
   - <input> → <Input />
   - <div class="card"> → <Card />

6. Ajustar tokens globais:
   - Cores
   - Tipografia
   - Espaçamentos
   - Radius
   - Sombras

7. Validar integração:
   - Testes visuais
   - Testes funcionais
   - Testes de responsividade

8. Confirmar conformidade com o RFC‑0017:
   - Governança
   - Modularização
   - SSOT
   - SemVer
   - Documentação viva

Após isso, o {CyberRaffleOS} estará oficialmente integrado ao Design System corporativo.
`;

// Criar arquivos
fs.writeFileSync(promptCriacao, conteudoCriacao.trim());
fs.writeFileSync(promptImplementacao, conteudoImplementacao.trim());

console.log('✔ Arquivos gerados com sucesso:');
console.log('- prompt-criacao.txt');
console.log('- prompt-implementacao.txt');
