# IGREJA WEB OS | BLUEPRINT MASTER v1.0
**Status:** Em Desenvolvimento Ativo
**Arquiteto Chefe:** Joaquim Mario
**Engine:** Next.js 15 + Supabase

## 1. VISÃO E IDENTIDADE
O **IgrejaWebOS** é um CRM Eclesiástico de alta densidade.
* **Core Value:** Gestão inteligente, rápida e centralizada de membros, congregações e finanças.
* **Identidade Visual:** "Dark Clean" (Foco em legibilidade).
    * Fundo: `bg-neutral-950` / `bg-neutral-900`
    * Destaques: `emerald-500` (Ações), `cyan-500` (Batismo), `pink-500` (Família), `yellow-500` (Matrícula).
* **Tipografia:** Clean/Sans-serif para leitura, Monoespaçada (`font-mono`) para códigos e matrículas.

## 2. ARQUITETURA TÉCNICA (STACK)
* **Frontend:** Next.js 15 (App Router) + Tailwind CSS + Lucide React.
* **Backend:** Supabase (PostgreSQL) com RLS.
* **Diretório Raiz:** `/web`

## 3. REGRAS DE OURO (GOVERNANÇA)
1. **Regra do Caminho:** Todo código fonte reside em `/web/src`.
2. **Regra de Cores (Status):**
   * ATIVO: `text-[#28A745]` (CAIXA ALTA)
   * OBSERVAÇÃO: `text-[#FFD700]` (CAIXA ALTA)
   * INATIVO: `text-[#DC3545]` (CAIXA ALTA)
   * INAPTO: `text-[#E9ECEF]` (CAIXA ALTA)
3. **Regra de Layout:** Formulários densos devem usar Grid System (`grid-cols-12` ou customizados como `grid-cols-7` para forçar simetria).
4. **Regra de Matrícula:** Todo membro recebe uma `registration_number`. (Código negativo provisório se inativo, definitivo se ativo).
5. **Regra de Backup:** Executar `CLOSE_IgrejaWebOS.ps1` ao fim de toda jornada.

## 4. ESTRUTURA DE DADOS PRINCIPAL
* **members:** `id`, `full_name`, `church_id`, `role_id`, `baptism_date`, `marriage_date`, `registration_number`, `ecclesiastical_status`.
* **churches:** `id`, `name`.
* **ecclesiastical_roles:** `id`, `name`.