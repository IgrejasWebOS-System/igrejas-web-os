"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Tenta autenticar no cofre do Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Se a senha ou email estiverem errados, devolve para a raiz com aviso
  if (error) {
    return redirect("/?message=Credenciais inválidas ou acesso negado");
  }

  // Se sucesso, limpa o cache de navegação e atira o utilizador para dentro do sistema
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

// ============================================================================
// MOTOR DE SAÍDA SEGURA (LOGOUT)
// ============================================================================
export async function logout() {
  const supabase = await createClient();
  
  // Destrói o Token JWT no servidor Supabase e limpa os cookies
  await supabase.auth.signOut();
  
  // Redireciona de volta para a Porta do Castelo (Tela de Login)
  redirect("/");
}