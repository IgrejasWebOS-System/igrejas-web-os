// seed_saopaulo.mjs
import { createClient } from '@supabase/supabase-js';
import { fakerPT_BR as faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// 1. Carrega as variáveis de ambiente explicitamente do arquivo .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO FATAL: Credenciais do Supabase não encontradas no .env.local");
  process.exit(1);
}

// Inicializa o cliente Supabase com a Service Role Key (Ignora RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 🛡️ REGRAS GEOGRÁFICAS ESTRITAS (SÃO PAULO/SP)
const SAO_PAULO_NEIGHBORHOODS = [
  'Sé', 'Mooca', 'Itaquera', 'Pinheiros', 'Lapa', 'Santana', 'Jabaquara', 
  'Santo Amaro', 'Vila Mariana', 'Tatuapé', 'Penha', 'Ipiranga', 'Butantã', 
  'Vila Prudente', 'Campo Limpo'
];
const CHURCH_PREFIXES = ['Congregação', 'Filial', 'Templo Central', 'Comunidade'];

// 🛡️ MATRIZ DE CARGOS ECLESIÁSTICOS
const ROLES_DEF = [
  { name: 'Pastor', hierarchy_level: 1, suggested_fee: 0 },
  { name: 'Presbítero', hierarchy_level: 2, suggested_fee: 0 },
  { name: 'Diácono', hierarchy_level: 3, suggested_fee: 0 },
  { name: 'Tesoureiro', hierarchy_level: 4, suggested_fee: 0 },
  { name: 'Secretário', hierarchy_level: 5, suggested_fee: 0 },
  { name: 'Membro', hierarchy_level: 6, suggested_fee: 0 }
];

function generateCPF() {
  return faker.string.numeric(11);
}

async function main() {
  console.log('🚀 Iniciando o protocolo de Seeding Cirúrgico (SÃO PAULO) no Supabase...');

  // --- PASSO 1: Sincronização de Cargos (ecclesiastical_roles) ---
  console.log('\n⚙️ Validando tabela de Cargos Eclesiásticos...');
  const roleMap = {}; 

  for (const role of ROLES_DEF) {
    let { data: existingRole, error: searchError } = await supabase
      .from('ecclesiastical_roles')
      .select('id, name')
      .eq('name', role.name)
      .single();

    if (!existingRole) {
      const { data: newRole, error: insertError } = await supabase
        .from('ecclesiastical_roles')
        .insert(role)
        .select('id, name')
        .single();
      
      if (insertError) throw new Error(`Erro ao criar cargo ${role.name}: ${insertError.message}`);
      existingRole = newRole;
      console.log(`  ➕ Cargo criado: ${existingRole.name}`);
    } else {
      console.log(`  ✔️ Cargo existente: ${existingRole.name}`);
    }
    roleMap[existingRole.name] = existingRole.id;
  }

  // --- PASSO 2: Varredura e Criação de Setores (São Paulo) ---
  console.log('\n⚙️ Lendo/Criando Setores do Banco de Dados para São Paulo...');
  const { data: existingSectors, error: secErr } = await supabase.from('sectors').select('id, name, region');
  if (secErr) throw new Error(`Erro ao ler setores: ${secErr.message}`);

  const targetChurches = []; // Array mestre que guardará todas as igrejas que receberão membros

  // Loop do Setor 1 ao 15
  for (let i = 1; i <= 15; i++) {
    const formattedNum = i < 10 ? `0${i}` : `${i}`;
    const possibleNames = [`Setor ${i}`, `Setor ${formattedNum}`, `SETOR ${i}`, `SETOR ${formattedNum}`];
    
    // Busca o setor pelo nome E que seja da região de São Paulo para não misturar com Piracicaba
    let sector = existingSectors.find(s => 
      (possibleNames.includes(s.name.trim()) || possibleNames.includes(s.name.toUpperCase().trim())) 
      && s.region === 'São Paulo'
    );

    if (!sector) {
      console.log(`\n⚠️ Setor ${formattedNum} (SP) não encontrado. Criando...`);
      const { data: newSec, error: insertSecErr } = await supabase
        .from('sectors')
        .insert({ name: `Setor ${formattedNum}`, region: 'São Paulo' })
        .select('id, name, region')
        .single();
      if (insertSecErr) throw new Error(`Erro ao criar Setor ${formattedNum}: ${insertSecErr.message}`);
      sector = newSec;
    } else {
      console.log(`\n✔️ Setor localizado: ${sector.name} (${sector.region})`);
    }

    // --- PASSO 3: Criação de 7 Igrejas para CADA setor de SP ---
    console.log(`  🏗️ Criando 7 igrejas para o ${sector.name} (São Paulo)...`);
    for (let c = 1; c <= 7; c++) {
      const neighborhood = faker.helpers.arrayElement(SAO_PAULO_NEIGHBORHOODS);
      const prefix = faker.helpers.arrayElement(CHURCH_PREFIXES);
      const churchName = `${prefix} ${neighborhood} SP`; // Identificador visual no log

      const { data: newChurch, error: churchError } = await supabase
        .from('churches')
        .insert({
          name: churchName,
          sector_id: sector.id,
          city: 'São Paulo',
          state: 'SP',
          neighborhood: neighborhood,
          address: faker.location.streetAddress(),
          zip_code: faker.location.zipCode('010##-###')
        })
        .select('id, name')
        .single();

      if (churchError) throw new Error(`Erro ao criar Igreja: ${churchError.message}`);
      targetChurches.push(newChurch); // Enfileira a nova igreja
      console.log(`    🏢 Criada: ${churchName}`);
    }
  }

  // --- PASSO 4: Injeção de Membros em TODAS as Igrejas de SP ---
  console.log(`\n⚙️ Iniciando injeção de membros para ${targetChurches.length} igrejas mapeadas em SP...`);
  let totalMembros = 0;

  for (const church of targetChurches) {
    const membersToInsert = [];
    
    for (const role of ROLES_DEF) {
      const currentRoleId = roleMap[role.name];

      for (let m = 0; m < 2; m++) {
        membersToInsert.push({
          church_id: church.id,
          role_id: currentRoleId,
          full_name: faker.person.fullName(),
          cpf: generateCPF(),
          email: faker.internet.email().toLowerCase(),
          city: 'São Paulo',
          state: 'SP'
        });
      }
    }

    const { error: membersError } = await supabase
      .from('members')
      .insert(membersToInsert);
    
    if (membersError) throw new Error(`Erro ao inserir membros na igreja ${church.name}: ${membersError.message}`);
    
    totalMembros += membersToInsert.length;
    console.log(`  👥 +12 Membros injetados na igreja: ${church.name}`);
  }

  console.log('\n✅ POVOAMENTO SÃO PAULO CONCLUÍDO COM PRECISÃO CIRÚRGICA!');
  console.log(`📊 TOTAL: ${targetChurches.length} Igrejas processadas | ${totalMembros} Membros injetados.`);
}

main().catch(console.error);