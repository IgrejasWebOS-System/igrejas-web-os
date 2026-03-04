"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Ação para buscar todas as ocorrências cadastradas
export async function getOccurrenceTypesAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("occurrence_types")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar tipos de ocorrência:", error);
    return { success: false, data: [] };
  }
  return { success: true, data: data || [] };
}

// Ação para adicionar uma nova ocorrência
export async function addOccurrenceTypeAction(name: string, category: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("occurrence_types")
    .insert([{ name: name.toUpperCase().trim(), category }]);

  if (error) {
    console.error("Erro ao adicionar ocorrência:", error);
    return { success: false, message: error.message };
  }
  
  // Revalida o cache da página para atualizar a lista instantaneamente
  revalidatePath("/dashboard/configuracoes/ocorrencias");
  return { success: true };
}

// Ação para excluir uma ocorrência
export async function deleteOccurrenceTypeAction(id: string) {
  const supabase = await createClient();
  
  // Nota: Se a ocorrência já foi usada na ficha de um membro (tabela member_occurrences),
  // a restrição ON DELETE RESTRICT do banco de dados bloqueará a exclusão para manter a integridade.
  const { error } = await supabase
    .from("occurrence_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar ocorrência:", error);
    return { success: false, message: "Bloqueio de Segurança: Esta ocorrência já está sendo usada no dossiê de membros e não pode ser excluída." };
  }
  
  revalidatePath("/dashboard/configuracoes/ocorrencias");
  return { success: true };
}