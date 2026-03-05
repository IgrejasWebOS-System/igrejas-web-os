"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDepartment(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;

  if (!name) return;

  const { error } = await supabase
    .from("departments")
    .insert({ name: name.toUpperCase() });

  if (error) {
    console.error("Erro ao criar departamento:", error);
  }

  // Atualiza a página automaticamente após a inserção
  revalidatePath("/dashboard/configuracoes/departamentos");
}

export async function deleteDepartment(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) return;

  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar departamento:", error);
  }

  // Atualiza a página automaticamente após a exclusão
  revalidatePath("/dashboard/configuracoes/departamentos");
}