"use client";

import { UserPlus, ArrowRight } from "lucide-react";
import DashboardCardBase from "./DashboardCardBase";
import Link from "next/link";

export default function MemberRegistrationCard() {
  return (
    <DashboardCardBase
      icon={<UserPlus className="w-7 h-7" />}
      title="CADASTRO MEMBROS"
      subtitle="inclusão de novo membro no sistema"
    >
      {/* INJEÇÃO FUNCIONAL: Rota corrigida para /novo e injeção do parâmetro ?origem=dashboard */}
      <Link 
        href="/dashboard/membros/novo?origem=dashboard" 
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-emerald-900/20 uppercase tracking-wider"
      >
        CADASTRAR <ArrowRight className="w-4 h-4" />
      </Link>
    </DashboardCardBase>
  );
}