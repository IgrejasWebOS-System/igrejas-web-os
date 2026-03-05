"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function promoverSede(formData: FormData) {
  const churchId = formData.get("church_id") as string;
  const ministryId = formData.get("ministry_id") as string;

  // Trava de segurança: impede o envio de formulário com campos vazios
  if (!churchId || !ministryId) {
    console.error("Tentativa de promoção com dados incompletos.");
    return;
  }

  // Instancia a conexão com o banco de dados
  const supabase = await createClient();

  // Executa a mutação (UPDATE) na tabela churches
  // Injeta o status de Sede e o vínculo com o Campo selecionado
  const { error } = await supabase
    .from('churches')
    .update({
      is_headquarters: true,
      ministry_id: ministryId
    })
    .eq('id', churchId);

  if (error) {
    console.error("Erro fatal ao promover Igreja a Sede:", error.message);
    throw new Error("Falha ao promover a igreja. Verifique os logs.");
  }

  // Se o update for um sucesso, redireciona de volta para a listagem de Sedes
  redirect("/dashboard/admin/sedes");
}