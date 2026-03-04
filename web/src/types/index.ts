export interface Member {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCIPLINE'; // Atualizado para maiúsculas conforme V3
  
  // INJEÇÃO FUNCIONAL: Campo para controle Verde/Vermelho (Em Dia/Pendente)
  financial_status: 'UP_TO_DATE' | 'PENDING';
  
  created_at: string;
  
  // FUSÃO TÉCNICA: Agora o cargo vem de uma relação
  ecclesiastical_roles: {
    name: string;
  } | null;
}