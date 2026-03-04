"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addSettingAction(formData: FormData) {
  const supabase = await createClient();
  
  const table = formData.get("table") as string;
  const name = formData.get("name") as string;
  const state_uf = formData.get("state_uf") as string; // Específico para o DF

  if (!table || !name) {
    return { success: false, message: "Nome é obrigatório." };
  }

  let dataToInsert: any = { name: name.trim() };
  if (state_uf) {
      dataToInsert.state_uf = state_uf;
  }

  const { error } = await supabase.from(table).insert(dataToInsert);

  if (error) {
    console.error(`Erro ao inserir em ${table}:`, error);
    if (error.code === '23505') {
        return { success: false, message: "Este item já está cadastrado." };
    }
    return { success: false, message: "Erro de banco de dados." };
  }

  revalidatePath(`/dashboard/configuracoes`);
  return { success: true };
}

export async function deleteSettingAction(formData: FormData) {
  const supabase = await createClient();
  
  const table = formData.get("table") as string;
  const id = formData.get("id") as string;

  if (!table || !id) {
      return { success: false, message: "Dados incompletos para exclusão." };
  }

  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    console.error(`Erro ao deletar em ${table}:`, error);
    return { success: false, message: "Erro ao excluir. O item pode estar em uso." };
  }

  revalidatePath(`/dashboard/configuracoes`);
  return { success: true };
}