"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function definirLideranca(formData: FormData) {
  const churchId = formData.get("church_id") as string;
  const sectorId = formData.get("sector_id") as string;

  // Trava de segurança: impede o envio de formulário com campos vazios
  if (!churchId || !sectorId) {
    console.error("Tentativa de definição com dados incompletos.");
    return;
  }

  // Instancia a conexão com o banco de dados
  const supabase = await createClient();

  // Executa a mutação (UPDATE) na tabela churches
  // Injeta o status de Igreja-Mãe e o vínculo com o Setor selecionado
  const { error } = await supabase
    .from('churches')
    .update({
      is_mother_church: true,
      sector_id: sectorId
    })
    .eq('id', churchId);

  if (error) {
    console.error("Erro fatal ao definir Igreja-Mãe:", error.message);
    throw new Error("Falha ao definir a liderança. Verifique os logs.");
  }

  // Se o update for um sucesso, redireciona de volta para a listagem
  redirect("/dashboard/admin/setores-lideranca");
}