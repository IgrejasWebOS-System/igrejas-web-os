"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- INJEÇÃO FUNCIONAL: PARSER DE DATAS (BR -> ISO) ---
// Converte "15/02/2026" para "2026-02-15" (Padrão Banco de Dados)
function parseDateBrToIso(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.length !== 10) return null;
  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) return null;
  return `${year}-${month}-${day}`;
}

// --- AÇÃO 1: CRIAR NOVO MEMBRO (COM FOTO, VALIDAÇÃO E RETORNO INTELIGENTE) ---
export async function createMemberAction(formData: FormData) {
  const supabase = await createClient();

  // INJEÇÃO FUNCIONAL: Leitura do Rastro de Navegação (Stateful Routing)
  const origem = formData.get("origem") as string;

  // 1. Identificação e Pessoais
  const full_name = formData.get("full_name") as string;
  const birth_date = formData.get("birth_date") as string;
  const gender = formData.get("gender") as string;
  const civil_status = formData.get("civil_status") as string;
  const profession = formData.get("profession") as string;
  const photo_url = formData.get("photo_url") as string; 
  
  // 2. Contato e Origem
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const nationality_city = formData.get("nationality_city") as string;
  const nationality_state = formData.get("nationality_state") as string;
  const schooling = formData.get("schooling") as string;
  const origin_church = formData.get("origin_church") as string; 

  // 3. Documentação
  const cpf = formData.get("cpf") as string;
  const rg = formData.get("rg") as string;
  const rg_issuer = formData.get("rg_issuer") as string;
  const rg_state = formData.get("rg_state") as string;

  // 4. Eclesiástico
  const role_id = formData.get("role_id") as string;
  const church_id = formData.get("church_id") as string;
  const ecclesiastical_status = formData.get("ecclesiastical_status") as string || "ACTIVE";
  const baptism_date = formData.get("baptism_date") as string; 
  
  // 5. Familiares
  const spouse_name = formData.get("spouse_name") as string;
  const father_name = formData.get("father_name") as string;
  const mother_name = formData.get("mother_name") as string;
  const marriage_date = formData.get("marriage_date") as string; 

  // 6. Endereço
  const zip_code = formData.get("zip_code") as string;
  const address = formData.get("address") as string;
  const number = formData.get("number") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;

  // 7. Financeiro
  const financial_status = formData.get("financial_status") as string || "PENDING";

  if (!full_name) {
    return { success: false, message: "Nome é obrigatório." };
  }

  // --- TRAVA 1: VALIDAÇÃO DE CPF DUPLICADO ---
  if (cpf && cpf.trim() !== "") {
    const { data: cpfExists } = await supabase.from("members").select("id").eq("cpf", cpf).single();
    if (cpfExists) {
      return { success: false, message: "Operação abortada: Este CPF já está cadastrado no sistema." };
    }
  }

  // --- LÓGICA DE MATRÍCULA (MANUAL VS AUTO) E TRAVA DE DUPLICIDADE ---
  let finalRegistrationNumber = formData.get("registration_number") as string;
  const isActive = ecclesiastical_status === 'ACTIVE';

  if (!finalRegistrationNumber || finalRegistrationNumber.trim() === "") {
    // Se veio vazio, chama o Gerador Automático
    const { data: novaMatricula, error: rpcError } = await supabase.rpc('get_next_matricula', { is_active: isActive });
    if (rpcError) {
      console.error("Erro ao gerar matrícula:", rpcError);
      return { success: false, message: "Falha ao gerar matrícula automática." };
    }
    finalRegistrationNumber = novaMatricula;
  } else {
    // Se digitou manual, verifica se a matrícula já existe no banco
    const { data: matExists } = await supabase.from("members").select("id").eq("registration_number", finalRegistrationNumber).single();
    if (matExists) {
      return { success: false, message: `Operação abortada: A Matrícula ${finalRegistrationNumber} já está em uso.` };
    }
  }

  const { error } = await supabase.from("members").insert({
    full_name,
    birth_date: parseDateBrToIso(birth_date),
    gender,
    civil_status,
    profession,
    photo_url, 
    email,
    phone,
    nationality_city,
    nationality_state,
    schooling,
    cpf,
    rg,
    rg_issuer,
    rg_state,
    role_id: role_id || null, 
    church_id: church_id || null,
    ecclesiastical_status,
    registration_number: finalRegistrationNumber, 
    spouse_name,
    father_name,
    mother_name,
    marriage_date: parseDateBrToIso(marriage_date),
    baptism_date: parseDateBrToIso(baptism_date),
    origin_church,
    zip_code,
    address,
    number,
    neighborhood,
    city,
    state,
    financial_status,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Erro ao criar membro:", error);
    if (error.code === '23505') { 
        return { success: false, message: "Erro: Matrícula ou CPF já existem no banco de dados." };
    }
    return { success: false, message: "Erro de banco de dados ao cadastrar membro." };
  }

  revalidatePath("/dashboard/membros");
  
  // INJEÇÃO FUNCIONAL: A Curva de Redirecionamento (Retorno Inteligente)
  if (origem === 'dashboard') {
    redirect("/dashboard");
  } else {
    redirect("/dashboard/membros");
  }
}

// --- AÇÃO 2: ATUALIZAR MEMBRO (COM FOTO E VALIDAÇÃO) ---
export async function updateMemberAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  
  if (!id) return { success: false, message: "ID obrigatório." };

  const full_name = formData.get("full_name") as string;
  const birth_date = formData.get("birth_date") as string;
  const gender = formData.get("gender") as string;
  const civil_status = formData.get("civil_status") as string;
  const profession = formData.get("profession") as string;
  const photo_url = formData.get("photo_url") as string; 
  
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const nationality_city = formData.get("nationality_city") as string;
  const nationality_state = formData.get("nationality_state") as string;
  const schooling = formData.get("schooling") as string;
  const origin_church = formData.get("origin_church") as string; 

  const cpf = formData.get("cpf") as string;
  const rg = formData.get("rg") as string;
  const rg_issuer = formData.get("rg_issuer") as string;
  const rg_state = formData.get("rg_state") as string;
  
  const role_id = formData.get("role_id") as string;
  const church_id = formData.get("church_id") as string;
  const ecclesiastical_status = formData.get("ecclesiastical_status") as string;
  const baptism_date = formData.get("baptism_date") as string; 
  
  const spouse_name = formData.get("spouse_name") as string;
  const father_name = formData.get("father_name") as string;
  const mother_name = formData.get("mother_name") as string;
  const marriage_date = formData.get("marriage_date") as string; 
  
  const zip_code = formData.get("zip_code") as string;
  const address = formData.get("address") as string;
  const number = formData.get("number") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const financial_status = formData.get("financial_status") as string;

  if (cpf && cpf.trim() !== "") {
    const { data: cpfExists } = await supabase.from("members").select("id").eq("cpf", cpf).neq("id", id).single();
    if (cpfExists) {
      return { success: false, message: "Operação abortada: Este CPF já pertence a outro membro." };
    }
  }

  let matriculaAtual = formData.get("registration_number") as string;

  if (!matriculaAtual || matriculaAtual.trim() === "") {
      const { data: novaMatricula } = await supabase.rpc('get_next_matricula', { is_active: ecclesiastical_status === 'ACTIVE' });
      if (novaMatricula) matriculaAtual = novaMatricula;
  } else if (matriculaAtual.startsWith('-') && ecclesiastical_status === 'ACTIVE') {
      const { data: matriculaDefinitiva } = await supabase.rpc('get_next_matricula', { is_active: true });
      if (matriculaDefinitiva) matriculaAtual = matriculaDefinitiva;
  } else {
      const { data: matExists } = await supabase.from("members").select("id").eq("registration_number", matriculaAtual).neq("id", id).single();
      if (matExists) {
          return { success: false, message: `Operação abortada: A Matrícula ${matriculaAtual} já está em uso por outro membro.` };
      }
  }

  const { error } = await supabase
    .from("members")
    .update({
      full_name,
      birth_date: parseDateBrToIso(birth_date),
      gender,
      civil_status,
      profession,
      photo_url,
      email,
      phone,
      nationality_city,
      nationality_state,
      schooling,
      cpf,
      rg,
      rg_issuer,
      rg_state,
      role_id: role_id || null,
      church_id: church_id || null,
      ecclesiastical_status,
      registration_number: matriculaAtual, 
      spouse_name,
      father_name,
      mother_name,
      marriage_date: parseDateBrToIso(marriage_date),
      baptism_date: parseDateBrToIso(baptism_date),
      origin_church,
      zip_code,
      address,
      number,
      neighborhood,
      city,
      state,
      financial_status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar:", error);
    if (error.code === '23505') { 
        return { success: false, message: "Erro: Matrícula ou CPF já existem no banco de dados." };
    }
    return { success: false, message: "Erro de banco de dados ao atualizar dados." };
  }

  revalidatePath("/dashboard/membros");
  redirect("/dashboard/membros");
}

// --- AÇÃO 3: ARQUIVAR MEMBRO ---
export async function archiveMemberAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) return { success: false, message: "ID obrigatório." };

  const { error } = await supabase
    .from("members")
    .update({
      status: 'ARCHIVED',
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao arquivar:", error);
    return { success: false, message: "Erro ao arquivar membro." };
  }

  revalidatePath("/dashboard/membros");
  redirect("/dashboard/membros");
}

// --- AÇÃO 4: RESTAURAR MEMBRO ---
export async function restoreMemberAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
  
    if (!id) return { success: false, message: "ID obrigatório." };
  
    const { error } = await supabase
      .from("members")
      .update({
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  
    if (error) {
      console.error("Erro ao restaurar:", error);
      return { success: false, message: "Erro ao restaurar membro." };
    }
  
    revalidatePath("/dashboard/membros");
    redirect("/dashboard/membros");
}

// --- AÇÃO 5: CONSULTAR PRÓXIMA MATRÍCULA (UX MAGIC BUTTON) ---
export async function getNextRegistrationNumberAction(isActive: boolean) {
  const supabase = await createClient();
  
  const { data: nextMatricula, error } = await supabase.rpc('get_next_matricula', { is_active: isActive });
  
  if (error) {
    console.error("Erro ao buscar próxima matrícula:", error);
    return { success: false, message: "Erro ao gerar número.", data: null };
  }
  
  return { success: true, data: nextMatricula };
}

// --- AÇÃO 6 (ATUALIZADA FASE 7): LER FICHA E TIMELINE PELO ID (Motor do Modal) ---
export async function getMemberTimelineAction(memberId: string) {
  const supabase = await createClient();
  
  // 1. Busca a Ficha Completa do Membro
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select(`
      *,
      churches ( name ),
      ecclesiastical_roles ( name )
    `)
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    console.error("Erro ao buscar perfil:", memberError);
    return { success: false, data: null };
  }

  // 2. Busca a Linha do Tempo (Dossiê)
  const { data: timeline, error: timelineError } = await supabase
    .from("member_timeline")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false }); 
    
  if (timelineError) {
    console.error("Erro ao buscar timeline:", timelineError);
    return { success: false, data: null };
  }
  
  // 3. Devolve o Pacote Master unificado para o Modal
  return { 
    success: true, 
    data: {
      profile: {
        ...member,
        church_name: (member.churches as any)?.name || "Nenhuma Igreja",
        role_name: (member.ecclesiastical_roles as any)?.name || "Nenhum Cargo"
      },
      timeline: timeline || []
    } 
  };
}

// --- AÇÃO 7 (NOVA E EVOLUÍDA): BUSCAR PACOTE DOSSIÊ + FICHA CADASTRAL (Vetor 2) ---
export async function getMemberByMatriculaWithTimelineAction(matricula: string) {
  const supabase = await createClient();

  if (!matricula || matricula.trim() === "") {
    return { success: false, message: "Digite uma matrícula válida." };
  }

  // 1. Busca TODOS OS DADOS do membro (*) e cruza com igrejas e cargos (Joins)
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select(`
      *,
      churches ( name ),
      ecclesiastical_roles ( name )
    `)
    .eq("registration_number", matricula)
    .single();

  if (memberError || !member) {
    return { success: false, message: "Matrícula não encontrada no sistema." };
  }

  // 2. Com o ID do membro em mãos, busca a linha do tempo (Dossiê)
  const { data: timeline, error: timelineError } = await supabase
    .from("member_timeline")
    .select("*")
    .eq("member_id", member.id)
    .order("created_at", { ascending: false });

  if (timelineError) {
    console.error("Erro ao buscar timeline do pacote:", timelineError);
    return { success: false, message: "Erro ao carregar o histórico." };
  }

  // 3. Monta o Objeto Completo de Retorno (Ficha Completa Enriquecida + Timeline)
  return { 
    success: true, 
    data: {
      profile: {
        ...member, // Injeta TODAS as colunas do membro (CPF, Endereço, etc.)
        church_name: (member.churches as any)?.name || "Nenhuma Igreja",
        role_name: (member.ecclesiastical_roles as any)?.name || "Nenhum Cargo"
      },
      timeline: timeline || []
    }
  };
}