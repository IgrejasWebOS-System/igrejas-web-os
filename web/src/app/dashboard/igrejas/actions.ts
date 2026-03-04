"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- AÇÃO 1: CRIAR NOVA IGREJA ---
export async function createChurchAction(formData: FormData) {
  const supabase = await createClient();

  // INJEÇÃO FUNCIONAL: Lendo a origem do Roteamento com Estado
  const origem = formData.get("origem") as string;

  // 1. Captura os dados
  const name = formData.get("name") as string;
  const sector_id = formData.get("sector_id") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const zip_code = formData.get("zip_code") as string;

  // 2. Validação
  if (!name || !sector_id) {
    return { success: false, message: "Nome e Setor são obrigatórios." };
  }

  // 3. Insert
  const { error } = await supabase
    .from("churches")
    .insert({
      name,
      sector_id,
      city: city || null,
      state: state || null,
      neighborhood: neighborhood || null,
      zip_code: zip_code || null,
      status: 'ACTIVE', 
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Erro ao criar igreja:", error);
    return { success: false, message: "Erro ao cadastrar igreja." };
  }

  revalidatePath("/dashboard/igrejas");
  
  // INJEÇÃO FUNCIONAL: Bifurcação dinâmica
  if (origem === 'configuracoes') {
      redirect("/dashboard/configuracoes");
  } else {
      redirect("/dashboard/igrejas");
  }
}

// --- AÇÃO 2: ATUALIZAR IGREJA (NOVA ROTINA) ---
export async function updateChurchAction(formData: FormData) {
  const supabase = await createClient();

  // 1. Captura o ID (Vital para update)
  const id = formData.get("id") as string;
  
  // 2. Captura os dados atualizáveis
  const name = formData.get("name") as string;
  const sector_id = formData.get("sector_id") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const zip_code = formData.get("zip_code") as string;

  if (!id || !name || !sector_id) {
    return { success: false, message: "ID, Nome e Setor são obrigatórios." };
  }

  // 3. Update no Banco
  const { error } = await supabase
    .from("churches")
    .update({
      name,
      sector_id,
      city: city || null,
      state: state || null,
      neighborhood: neighborhood || null,
      zip_code: zip_code || null,
      updated_at: new Date().toISOString(), // Boa prática: marcar quando mudou
    })
    .eq("id", id); // Onde o ID for igual ao ID do form

  if (error) {
    console.error("Erro ao atualizar igreja:", error);
    return { success: false, message: "Erro ao atualizar dados." };
  }

  revalidatePath("/dashboard/igrejas");
  redirect("/dashboard/igrejas");
}

// --- AÇÃO 3: CRIAR NOVO SETOR ---
export async function createSectorAction(formData: FormData) {
  const supabase = await createClient();

  // INJEÇÃO FUNCIONAL: Lendo a origem do Roteamento com Estado (Para Setores)
  const origem = formData.get("origem") as string;
  const name = formData.get("name") as string;

  if (!name) {
    return { success: false, message: "Nome do setor é obrigatório." };
  }

  const { error } = await supabase
    .from("sectors")
    .insert({
      name,
      status: 'ACTIVE', 
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Erro ao criar setor:", error);
    return { success: false, message: "Erro ao criar setor." };
  }

  revalidatePath("/dashboard/igrejas");
  
  // INJEÇÃO FUNCIONAL: Bifurcação dinâmica para setores
  if (origem === 'configuracoes') {
      redirect("/dashboard/configuracoes");
  } else {
      redirect("/dashboard/igrejas");
  }
}

// --- AÇÃO 4: ARQUIVAR IGREJA (SOFT DELETE) ---
export async function archiveChurchAction(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, message: "ID é obrigatório para arquivamento." };
  }

  // Soft Delete: Muda status para 'ARCHIVED' e registra data
  const { error } = await supabase
    .from("churches")
    .update({
      status: 'ARCHIVED',
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao arquivar igreja:", error);
    return { success: false, message: "Erro ao arquivar igreja." };
  }

  // Revalida para sumir da lista imediatamente
  revalidatePath("/dashboard/igrejas");
  redirect("/dashboard/igrejas");
}