"use server";

import { createClient } from "@/utils/supabase/server";

// 1. Busca as categorias ativas para preencher a caixa de seleção do formulário
export async function getOccurrenceTypesListAction() {
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

// 2. Registra o fato no banco de dados e ESPELHA no Dossiê (DUAL WRITE)
export async function registerMemberOccurrenceAction(payload: {
  member_id: string;
  occurrence_type_id: string;
  occurrence_date: string;
  happened_in_current_church: boolean;
  observation: string;
}) {
  const supabase = await createClient();
  
  // =========================================================================
  // FASE 1: GRAVAÇÃO OFICIAL (Estatística)
  // =========================================================================
  const { error: occurrenceError } = await supabase
    .from("member_occurrences")
    .insert([{
      member_id: payload.member_id,
      occurrence_type_id: payload.occurrence_type_id,
      occurrence_date: payload.occurrence_date,
      happened_in_current_church: payload.happened_in_current_church,
      observation: payload.observation
    }]);

  if (occurrenceError) {
    console.error("Erro ao registrar ocorrência:", occurrenceError);
    return { success: false, message: occurrenceError.message };
  }

  // =========================================================================
  // FASE 2: MOTOR DE TRADUÇÃO E ESCUDO (Dual Write na Timeline)
  // =========================================================================
  
  // Passo A: Descobrir o nome do tipo de ocorrência escolhido pelo usuário
  const { data: typeData } = await supabase
    .from("occurrence_types")
    .select("name")
    .eq("id", payload.occurrence_type_id)
    .single();

  const typeName = typeData ? typeData.name : "Ocorrência Eclesiástica";

  // Passo B: Formatar a Data do Fato (De YYYY-MM-DD para DD/MM/YYYY)
  const parts = payload.occurrence_date.split('-');
  const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : payload.occurrence_date;

  // Passo C: Montar a Descrição Rica que aparecerá no Dossiê
  let timelineDesc = `Registro Oficial: ${typeName} | Data do Fato: ${formattedDate}.`;
  if (payload.observation) {
    timelineDesc += ` Observações: ${payload.observation}`;
  }

  // Passo D: Injetar no Histórico do Membro
  const { error: timelineError } = await supabase
    .from("member_timeline")
    .insert([{
      member_id: payload.member_id,
      event_type: "ALTERACAO_STATUS", // Aciona o Ícone de Escudo Amarelo (ShieldAlert)
      description: timelineDesc
    }]);

  if (timelineError) {
    console.error("Erro ao espelhar ocorrência na timeline:", timelineError);
    // Nota de Arquitetura: Não bloqueamos o 'success: true' aqui pois o dado oficial já foi salvo com sucesso na Fase 1.
  }
  
  return { success: true };
}

// 3. Busca as ocorrências cadastradas em um período (Para a aba LISTAGEM)
export async function getOccurrencesByPeriodAction(startDate: string, endDate: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("member_occurrences")
    .select(`
      id,
      occurrence_date,
      happened_in_current_church,
      observation,
      created_at,
      occurrence_types (name, category),
      members (full_name, matricula)
    `)
    .gte("occurrence_date", startDate)
    .lte("occurrence_date", endDate)
    .order("occurrence_date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar listagem de ocorrências:", error);
    return { success: false, data: [] };
  }
  return { success: true, data: data || [] };
}