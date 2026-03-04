import { Settings, Church, Map, Briefcase, GraduationCap, Heart, Users, MapPin, UserSquare2, Plus, ShieldAlert } from "lucide-react";
import DashboardCardBase from "@/components/dashboard/DashboardCardBase";
import Link from "next/link";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* CABEÇALHO DA PÁGINA - INTOCÁVEL */}
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-5">
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-500 shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">System Settings</h1>
          <p className="text-sm text-neutral-400 font-medium">Gerencie as tabelas auxiliares e os dados mestres da plataforma.</p>
        </div>
      </div>

      {/* GRID DE CARDS USANDO O MOLDE OFICIAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        
        {/* 1. IGREJAS */}
        <DashboardCardBase
          icon={<Church className="w-7 h-7" />}
          title="IGREJAS"
          subtitle="gerencie congregações e sub-congregações"
        >
          <Link href="/dashboard/igrejas/nova?origem=configuracoes" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 2. SETORES */}
        <DashboardCardBase
          icon={<Map className="w-7 h-7" />}
          title="SETORES"
          subtitle="organização geográfica e pastoral"
        >
          <Link href="/dashboard/igrejas/setores/novo?origem=configuracoes" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 3. CARGOS */}
        <DashboardCardBase
          icon={<Briefcase className="w-7 h-7" />}
          title="CARGOS"
          subtitle="funções eclesiásticas e administrativas"
        >
          <Link href="/dashboard/configuracoes/cargos" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 4. PROFISSÕES */}
        <DashboardCardBase
          icon={<UserSquare2 className="w-7 h-7" />}
          title="PROFISSÕES"
          subtitle="cadastro de ocupações profissionais"
        >
          <Link href="/dashboard/configuracoes/profissoes" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 5. ESCOLARIDADES */}
        <DashboardCardBase
          icon={<GraduationCap className="w-7 h-7" />}
          title="ESCOLARIDADES"
          subtitle="níveis de formação acadêmica"
        >
          <Link href="/dashboard/configuracoes/escolaridade" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 6. ESTADO CIVIL */}
        <DashboardCardBase
          icon={<Heart className="w-7 h-7" />}
          title="ESTADO CÍVIL"
          subtitle="situação conjugal dos membros"
        >
          <Link href="/dashboard/configuracoes/estado-civil" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 7. GÊNERO */}
        <DashboardCardBase
          icon={<Users className="w-7 h-7" />}
          title="GÊNERO"
          subtitle="classificação oficial do sistema"
        >
          <Link href="/dashboard/configuracoes/genero" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 8. REGIÕES DF */}
        <DashboardCardBase
          icon={<MapPin className="w-7 h-7" />}
          title="REGIÕES DF"
          subtitle="mapeamento de regiões e cidades"
        >
          <Link href="/dashboard/configuracoes/regioes-df" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

        {/* 9. INJEÇÃO FUNCIONAL: ADMINISTRAÇÃO ACESSOS */}
        <DashboardCardBase
          icon={<ShieldAlert className="w-7 h-7 text-emerald-500" />}
          title="ADMINISTRAÇÃO ACESSOS"
          subtitle="gestão de permissões, campos e sedes"
        >
          <Link href="/dashboard/admin" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
            ACESSAR PAINEL <Plus className="w-4 h-4 text-emerald-500" />
          </Link>
        </DashboardCardBase>

      </div>
    </div>
  );
}