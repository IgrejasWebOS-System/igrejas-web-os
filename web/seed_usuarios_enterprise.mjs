// ============================================================================
// IGREJAS WEB OS | MOTOR DE POVOAMENTO ENTERPRISE (SEED)
// Criação Massiva de Usuários e Hierarquias via Admin API
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// 1. Carrega as chaves do cofre (.env.local)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY não encontrada no .env.local.");
  console.error("A Service Key é obrigatória para criar usuários bypassando as regras de segurança.");
  process.exit(1);
}

// 2. Cria o cliente Supabase com poderes de Super Admin (Ignora RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_PASSWORD = '@@748596Jmsc##';

// 3. Montagem da Matriz de Usuários (A Hierarquia Enterprise)
const usersToCreate = [
  // SUPER ADMIN (Holding)
  { email: 'admin@igreja.org', role: 'SUPER_ADMIN', name: 'Super Admin Master' },
  
  // CAMPO PIRACICABA (Corrigido typo de 'piracicapa' para 'piracicaba')
  { email: 'campo@piracicaba.com', role: 'CAMPO', name: 'Master Campo Piracicaba' },
  { email: 'sede@piracicaba.com', role: 'SEDE', name: 'Master Sede Piracicaba' },
  
  // CAMPO SÃO PAULO
  { email: 'campo@saopaulo.com', role: 'CAMPO', name: 'Master Campo São Paulo' },
  { email: 'sede@saopaulo.com', role: 'SEDE', name: 'Master Sede São Paulo' }
];

// Geração dinâmica dos 15 Setores para ambos os campos
for (let i = 1; i <= 15; i++) {
  const num = i.toString().padStart(2, '0');
  
  // Setores Piracicaba (.pira.com)
  usersToCreate.push({ email: `admin@setor${num}.pira.com`, role: 'SETOR_ADMIN', name: `Admin Setor ${num} Pira` });
  usersToCreate.push({ email: `usuario@setor${num}.pira.com`, role: 'IGREJA_USER', name: `Usuário Setor ${num} Pira` });
  
  // Setores São Paulo (.sp.com)
  usersToCreate.push({ email: `admin@setor${num}.sp.com`, role: 'SETOR_ADMIN', name: `Admin Setor ${num} SP` });
  usersToCreate.push({ email: `usuario@setor${num}.sp.com`, role: 'IGREJA_USER', name: `Usuário Setor ${num} SP` });
}

// 4. Motor de Injeção
async function runSeed() {
  console.log(`\n🚀 Iniciando Injeção de ${usersToCreate.length} Usuários no Supabase...`);
  console.log(`🔑 Senha Padrão para todos: ${DEFAULT_PASSWORD}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of usersToCreate) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true, // Pula o envio de e-mail de confirmação
      user_metadata: {
        role: user.role,
        full_name: user.name
      }
    });

    if (error) {
      // Se o erro for de usuário já existente, ignoramos e avisamos
      if (error.message.includes('already registered')) {
        console.log(`  [ALERTA] ${user.email} já existe no banco.`);
      } else {
        console.error(`  [ERRO] Falha ao criar ${user.email}:`, error.message);
        errorCount++;
      }
    } else {
      console.log(`  [OK] Criado: ${user.email} (Nível: ${user.role})`);
      successCount++;
    }
  }

  console.log(`\n✅ RELATÓRIO FINAL:`);
  console.log(`   Sucessos: ${successCount}`);
  console.log(`   Erros: ${errorCount}`);
  console.log(`\nO Povoamento foi concluído. A arquitetura Enterprise está pronta para testes.`);
}

runSeed();