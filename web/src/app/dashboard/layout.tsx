import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Motor de Identificação (Lê o token no servidor antes de renderizar a tela)
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Se houver falha crítica de segurança, expulsa para o login
  if (error || !user) {
    redirect("/");
  }

  // 2. Extração de Dados do Cofre e Normalização (Corrige o erro do "Visitante")
  const email = user.email || "Usuário Desconhecido";
  const rawRole = user.user_metadata?.role || "GUEST"; 
  const role = String(rawRole).toUpperCase(); // Força para maiúsculas para não falhar

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* 3. Injeção de Inteligência na Sidebar */}
      <Sidebar userEmail={email} userRole={role} />
      
      {/* CONTEÚDO PRINCIPAL (100% do espaço devolvido para os formulários) */}
      <main className="md:pl-64 flex-1 min-h-screen transition-all duration-300 w-full">
        
        {/* Área de Renderização das Páginas */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}