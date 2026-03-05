import { createClient } from "@/utils/supabase/server";

export type AdminRole = 'MASTER' | 'CAMPO' | 'SEDE' | 'SETOR' | 'LOCAL' | 'GUEST';

export interface UserContext {
  userId: string;
  email: string;
  role: AdminRole;
  targetId: string | null;
}

/**
 * MOTOR DE INTERCEPTAÇÃO DE SESSÃO (MULTI-TENANT)
 * Esta função vai até o banco, identifica o usuário atual e busca a patente dele.
 * Usada para proteger rotas no servidor e injetar o contexto visual.
 */
export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();
  
  // 1. Pega o token de sessão atual
  const { data: { user } } = await supabase.auth.getUser();

  // Se não tem usuário logado, retorna nulo (Derruba a conexão)
  if (!user) return null;

  // 2. Busca o crachá (role) e o alvo (target_id) na matriz de governança
  const { data: roleData } = await supabase
    .from('admin_roles')
    .select('role, target_id')
    .eq('user_id', user.id)
    .single();

  // 3. Empacota a resposta estruturada para o Frontend usar
  return {
    userId: user.id,
    email: user.email || '',
    role: (roleData?.role as AdminRole) || 'GUEST',
    targetId: roleData?.target_id || null,
  };
}