# IGREJAS WEB OS | BLUEPRINT MASTER v2.0 (ENTERPRISE EDITION)
**Status:** Em Desenvolvimento Ativo (Fase 3: Segurança Edge)
**Arquiteto Chefe:** Joaquim Mario
**Engine Base:** Next.js 15 (App Router) + Supabase (PostgreSQL)

## 1. VISÃO E IDENTIDADE
O **Igrejas Web OS** é um ERP Eclesiástico de alta densidade e o núcleo do Ecossistema Integrado (integrando com AutoZapManager, Saúde Ciclo da Vida e ConnectionCyberOS).
* **Core Value:** Gestão Multi-Campus inteligente, engajamento omnichannel, governança e centralização de dados.
* **Identidade Visual:** "Dark Clean" (Foco absoluto em legibilidade).
    * Fundo Geral: `bg-neutral-950` / `bg-neutral-900`
    * Destaques de Ação (Primary): `emerald-600` / `emerald-500`
    * Configurações Globais: `purple-600` / `purple-500`
    * Alertas/Destrutivos: `red-500`
* **Padrão de UI Validado:** Top Bar "Inline" (Ícone + Título à esquerda, Input + Botão à direita na mesma linha).

## 2. ARQUITETURA TÉCNICA E SEGURANÇA (STACK)
* **Frontend:** Next.js 15 (React 19) + Tailwind CSS + Lucide React.
* **Backend:** Supabase com Proteção RLS (Row Level Security) Inflexível.
* **Segurança de Borda (Edge):** `middleware.ts` para renovação de sessão, proteção de rotas e Single Sign-On (SSO) futuro.
* **Autorização Visual:** Renderização condicional baseada na Patente (Role) do utilizador (`MASTER`, `CAMPO`, `SEDE`, `LOCAL`, `GUEST`).

## 3. REGRAS DE OURO (GOVERNANÇA TÉCNICA)
1. **Desenvolvimento a Partir do Extremo Zero:** Em caso de falha crítica num componente, ele é reconstruído de raiz. Não são permitidos "remendos" que comprometam a tipagem (TypeScript).
2. **Injeção Funcional Isolada:** Novas lógicas e Server Actions nunca devem quebrar ou alterar a estrutura visual Tailwind já validada.
3. **Consistência Visual Estrita:** Ecrãs irmãos (ex: Departamentos, Escolaridade, Estado Civil) devem partilhar a mesma anatomia de código e layout.
4. **Regra de Cores (Status de Dados):**
   * ATIVO: `text-[#28A745]`
   * OBSERVAÇÃO: `text-[#FFD700]`
   * INATIVO: `text-[#DC3545]`

## 4. MAPA DE MÓDULOS (CAMADAS DE MATURIDADE ENTERPRISE)

### FASE 1: Fundação & Segurança (Concluído / Em Andamento)
- [x] Criação de Tabelas Auxiliares e Configurações Base.
- [x] Implementação do Padrão Visual "Dark Clean".
- [x] Motor Multi-Campus (Tabelas de Sedes, Campos, Setores, Igrejas).
- [x] RLS no Supabase (Proteção de Banco de Dados).
- [ ] Middleware Edge & Rotas de Login (Em execução atual).

### FASE 2: Core Eclesiástico (Próximo)
- [ ] Gestão Avançada de Membros (Perfil Completo, Histórico).
- [ ] Jornada do Membro (Visitante → Frequentador → Membro → Líder).
- [ ] Estrutura de Células/Grupos Familiares.

### FASE 3: Financeiro & Património
- [ ] Contabilidade por Fundos (Fund Accounting: Dízimos, Ofertas, Missões).
- [ ] Gestão de Património (Imóveis, Inventário, Manutenção).
- [ ] Relatórios Contabilísticos (Balanço, DRE).

### FASE 4: Engajamento & Ministério Infantil
- [ ] Ministério Infantil com Segurança (Check-in/Check-out, Etiquetas, Alergias).
- [ ] Gestão de Voluntários e Escalas de Serviço.
- [ ] Gestão de Eventos, Calendário e Inscrições.

### FASE 5: Governança, Compliance & Comunicação
- [ ] Atas, Estatutos e Votações (Controlo de Mandatos).
- [ ] Trilha de Auditoria (Audit Trail) e Adequação LGPD.
- [ ] Comunicação Omnichannel (Email/WhatsApp via Integração AutoZapManager).

### FASE 6: Inteligência & Ecossistema
- [ ] Dashboards Executivos (Analytics e KPIs em Tempo Real).
- [ ] API REST / Webhooks para Integrações (Totvs, Asaas, etc.).
- [ ] Integração Plena com Apps Mobile (Saúde Ciclo da Vida).