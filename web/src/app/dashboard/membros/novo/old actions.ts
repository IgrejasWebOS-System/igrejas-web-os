"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createMember(formData: FormData) {
  const supabase = await createClient();

  // 1. Segurança: Verifica se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  // 2. Captura dos Dados do Formulário
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role_id = formData.get("role_id") as string;
  const church_id = formData.get("church_id") as string; // O vínculo crucial
  const status = formData.get("status") as string;

  // 3. Validação Básica
  if (!full_name || !role_id || !church_id) {
    // Em produção, retornaríamos erro visual, mas o HTML 'required' já protege o básico
    throw new Error("Campos obrigatórios faltando.");
  }

  // 4. Gravação no Banco de Dados
  const { error } = await supabase.from("members").insert({
    full_name,
    email,
    phone,
    role_id,
    church_id,
    status,
    financial_status: "UP_TO_DATE", // Padrão inicial: Em dia (Verde)
    // created_at é automático
  });

  if (error) {
    console.error("Erro ao criar membro:", error);
    throw new Error("Erro ao salvar no banco de dados.");
  }

  // 5. Atualiza a Lista e Redireciona
  revalidatePath("/dashboard/membros"); // Limpa o cache da lista para mostrar o novo membro
  redirect("/dashboard/membros"); // Volta para a listagem
}