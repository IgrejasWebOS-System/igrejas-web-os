import { ShieldAlert, Building2, Map, Users, Key, Plus } from "lucide-react";
import DashboardCardBase from "@/components/dashboard/DashboardCardBase";
import Link from "next/link";

export default function AdminAcessosPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-5">
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-500 shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Administração Global e Acessos</h1>
          <p className="text-sm text-neutral-400 font-medium">Gestão de Campos, Sedes Regionais, Matriz de Setores e Permissões de Usuários (RBAC).</p>
        </div>
      </div>

      {/* GRID DE CARDS USANDO O MOLDE OFICIAL (4 COLUNAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        
        {/* 1. GESTÃO DE CAMPOS / MINISTÉRIOS */}
        <DashboardCardBase
          icon={<Building2 className="w-7 h-7" />}
          title="CAMPOS / MINISTÉRIOS"
          subtitle="crie e gerencie os campos principais"
        >
          <Link href="/dashboard/admin/campos" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            GERENCIAR CAMPOS <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 2. DEFINIÇÃO DE SEDES */}
        <DashboardCardBase
          icon={<Map className="w-7 h-7" />}
          title="SEDES REGIONAIS"
          subtitle="eleve igrejas ao status de sede"
        >
          <Link href="/dashboard/admin/sedes" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            GERENCIAR SEDES <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 3. IGREJAS MÃE DE SETOR */}
        <DashboardCardBase
          icon={<Users className="w-7 h-7" />}
          title="LÍDERES DE SETOR"
          subtitle="defina a igreja mãe de cada setor"
        >
          <Link href="/dashboard/admin/setores-lideranca" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            DEFINIR LIDERANÇA <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 4. SENHAS E ACESSOS DE USUÁRIOS */}
        <DashboardCardBase
          icon={<Key className="w-7 h-7 text-emerald-500" />}
          title="MATRIZ DE USUÁRIOS"
          subtitle="gere senhas e distribua acessos"
        >
          <Link href="/dashboard/admin/usuarios" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            GERAR ACESSOS <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

      </div>
    </div>
  );
}