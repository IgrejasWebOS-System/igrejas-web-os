import { Settings, Church, Map, Briefcase, GraduationCap, Heart, Users, MapPin, UserSquare2, Plus, ShieldAlert, Network, Lock } from "lucide-react";
import DashboardCardBase from "@/components/dashboard/DashboardCardBase";
import Link from "next/link";
// INJEÇÃO FUNCIONAL: Importação do Guarda de Trânsito
import { getUserContext } from "@/utils/auth-context";

// INJEÇÃO FUNCIONAL: Transformação em função assíncrona para leitura de sessão
export default async function ConfiguracoesPage() {
  // 1. CHAMA O GUARDA DE TRÂNSITO NO SERVIDOR
  const userContext = await getUserContext();
  const role = userContext?.role || 'GUEST';

  // 2. REGRA DE OURO DA GOVERNANÇA (Assimetria de Segurança)
  // Apenas a alta cúpula pode modificar tabelas estruturais. 
  const canManageSettings = ['MASTER', 'CAMPO', 'SEDE'].includes(role);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* CABEÇALHO DA PÁGINA - INTOCÁVEL */}
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-5">
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-500 shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            System Settings
            {/* INJEÇÃO FUNCIONAL: Etiqueta de Acesso */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${canManageSettings ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              Acesso: {role}
            </span>
          </h1>
          <p className="text-sm text-neutral-400 font-medium">Gerencie as tabelas auxiliares e os dados mestres da plataforma.</p>
        </div>
      </div>

      {/* INJEÇÃO FUNCIONAL: AVISO DE RESTRIÇÃO PARA USUÁRIOS LOCAIS */}
      {!canManageSettings && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-400 uppercase">Modo de Leitura Ativado</h3>
            <p className="text-xs text-red-300/70 mt-1">
              Sua patente atual ({role}) não permite alterar as configurações globais do sistema. As alterações nas tabelas mestres são restritas à Administração do Campo e Sede.
            </p>
          </div>
        </div>
      )}

      {/* GRID DE CARDS USANDO O MOLDE OFICIAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        
        {/* 1. IGREJAS */}
        <DashboardCardBase
          icon={<Church className="w-7 h-7" />}
          title="IGREJAS"
          subtitle="gerencie congregações e sub-congregações"
        >
          {canManageSettings ? (
            <Link href="/dashboard/igrejas/nova?origem=configuracoes" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
            <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 2. SETORES */}
        <DashboardCardBase
          icon={<Map className="w-7 h-7" />}
          title="SETORES"
          subtitle="organização geográfica e pastoral"
        >
          {canManageSettings ? (
            <Link href="/dashboard/igrejas/setores/novo?origem=configuracoes" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
            <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 3. CARGOS */}
        <DashboardCardBase
          icon={<Briefcase className="w-7 h-7" />}
          title="CARGOS"
          subtitle="funções eclesiásticas e administrativas"
        >
          {canManageSettings ? (
            <Link href="/dashboard/configuracoes/cargos" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
             <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 4. PROFISSÕES */}
        <DashboardCardBase
          icon={<UserSquare2 className="w-7 h-7" />}
          title="PROFISSÕES"
          subtitle="cadastro de ocupações profissionais"
        >
          {canManageSettings ? (
            <Link href="/dashboard/configuracoes/profissoes" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
             <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 5. ESCOLARIDADES */}
        <DashboardCardBase
          icon={<GraduationCap className="w-7 h-7" />}
          title="ESCOLARIDADES"
          subtitle="níveis de formação acadêmica"
        >
          {canManageSettings ? (
            <Link href="/dashboard/configuracoes/escolaridade" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
             <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 6. ESTADO CIVIL */}
        <DashboardCardBase
          icon={<Heart className="w-7 h-7" />}
          title="ESTADO CÍVIL"
          subtitle="situação conjugal dos membros"
        >
          {canManageSettings ? (
            <Link href="/dashboard/configuracoes/estado-civil" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
             <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 7. GÊNERO */}
        <DashboardCardBase
          icon={<Users className="w-7 h-7" />}
          title="GÊNERO"
          subtitle="classificação oficial do sistema"
        >
          {canManageSettings ? (
            <Link href="/dashboard/configuracoes/genero" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
             <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 8. REGIÕES DF */}
        <DashboardCardBase
          icon={<MapPin className="w-7 h-7" />}
          title="REGIÕES DF"
          subtitle="mapeamento de regiões e cidades"
        >
          {canManageSettings ? (
            <Link href="/dashboard/configuracoes/regioes-df" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
             <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 9. INJEÇÃO FUNCIONAL: DEPARTAMENTOS */}
        <DashboardCardBase
          icon={<Network className="w-7 h-7" />}
          title="DEPARTAMENTOS"
          subtitle="cibepi, ebd, jovens, mocidade..."
        >
          {canManageSettings ? (
            <Link href="/dashboard/configuracoes/departamentos" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              CADASTRAR <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
             <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

        {/* 10. INJEÇÃO FUNCIONAL: ADMINISTRAÇÃO ACESSOS */}
        <DashboardCardBase
          icon={<ShieldAlert className="w-7 h-7 text-emerald-500" />}
          title="ADMINISTRAÇÃO ACESSOS"
          subtitle="gestão de permissões, campos e sedes"
        >
          {canManageSettings ? (
            <Link href="/dashboard/admin" className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-3 rounded-xl transition-colors flex items-center justify-between px-5 text-xs font-bold shadow-md uppercase">
              ACESSAR PAINEL <Plus className="w-4 h-4 text-emerald-500" />
            </Link>
          ) : (
            <div className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-600 p-3 rounded-xl flex items-center justify-between px-5 text-xs font-bold uppercase cursor-not-allowed">
              RESTRITO <Lock className="w-4 h-4" />
            </div>
          )}
        </DashboardCardBase>

      </div>
    </div>
  );
}