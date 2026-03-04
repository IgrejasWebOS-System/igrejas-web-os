import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Users, DollarSign, Building } from "lucide-react";
import DashboardCardBase from "@/components/dashboard/DashboardCardBase";
import MemberRegistrationCard from "@/components/dashboard/MemberRegistrationCard";
import QuickTimelineSearch from "@/components/dashboard/QuickTimelineSearch";
import OccurrenceSchedulerCard from "@/components/dashboard/OccurrenceSchedulerCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* CABEÇALHO DA PÁGINA */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Visão Geral
        </h1>
        <p className="text-neutral-400 text-base mt-1">
          Bem-vindo de volta, <span className="text-emerald-500 font-medium">{user.email}</span>
        </p>
      </div>

      {/* GRID DE CARDS: TRAVA DE ARQUITETURA (lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        
        {/* POSIÇÃO 1: CADASTRO DE MEMBROS (O NOVO CARD) */}
        <MemberRegistrationCard />

        {/* POSIÇÃO 2: HISTÓRICO MEMBRO */}
        <QuickTimelineSearch />

        {/* POSIÇÃO 3: AGENDAMENTO DE OCORRÊNCIA */}
        <OccurrenceSchedulerCard />
        
        {/* POSIÇÃO 4: KPI RECEITA (Usando o Molde Base) */}
        <DashboardCardBase
          icon={<DollarSign className="w-7 h-7" />}
          title="RECEITA MENSAL"
          subtitle="Total arrecadado no mês"
        >
           <h3 className="text-3xl font-black text-white mt-1 mb-2">R$ 0,00</h3>
        </DashboardCardBase>

        {/* POSIÇÃO 5: KPI MEMBROS (Cairá para a 2ª linha) */}
        <DashboardCardBase
          icon={<Users className="w-7 h-7" />}
          title="MEMBROS ATIVOS"
          subtitle="Total de membros no rol"
        >
           <h3 className="text-3xl font-black text-white mt-1 mb-2">0</h3>
        </DashboardCardBase>

        {/* POSIÇÃO 6: KPI IGREJAS (2ª linha) */}
        <DashboardCardBase
          icon={<Building className="w-7 h-7" />}
          title="IGREJAS NO SETOR"
          subtitle="Congregações sob gestão"
        >
           <h3 className="text-3xl font-black text-white mt-1 mb-2">7</h3>
        </DashboardCardBase>

      </div>
    </div>
  );
}