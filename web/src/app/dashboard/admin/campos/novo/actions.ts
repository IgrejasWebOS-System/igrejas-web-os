"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createCampo(formData: FormData) {
  const name = formData.get("name") as string;

  // Validação de segurança básica
  if (!name || name.trim() === "") {
    console.error("Tentativa de envio com nome vazio.");
    return; // Em um cenário avançado, retornaríamos um Toast de erro
  }

  // Instancia a conexão com o banco de dados
  const supabase = await createClient();

  // Executa a mutação (INSERT) na tabela ministries
  const { error } = await supabase
    .from('ministries')
    .insert([
      { name: name.trim() }
    ]);

  if (error) {
    console.error("Erro fatal ao inserir Ministério:", error.message);
    throw new Error("Falha ao criar o Campo. Verifique os logs.");
  }

  // Se o insert for um sucesso, redireciona o usuário de volta para a listagem
  redirect("/dashboard/admin/campos");
}