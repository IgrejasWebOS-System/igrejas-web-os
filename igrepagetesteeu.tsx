import { createClient } from "@/utils/supabase/server";
import { Building2, Users, Coins } from "lucide-react";

export const dynamic = "force-dynamic";

// Helper para abreviar cargos e agrupar
function getRoleAbbreviation(roleName: string | undefined): string {
  if (!roleName) return "Ge"; // Geral/Outros
  
  const name = roleName.toLowerCase();
  if (name.includes("pastor")) return "Pr";
  if (name.includes("evangelista")) return "Ev";
  if (name.includes("presbítero") || name.includes("presbitero")) return "Pb";
  if (name.includes("diácono") || name.includes("diacono")) return "Dco";
  if (name.includes("diaconisa")) return "Dca";
  if (name.includes("cooperador")) return "Co";
  if (name.includes("auxiliar")) return "Ax";
  
  return "Ge"; // Geral para todos os outros
}

export default async function SectorsAndChurchesPage() {
  const supabase = await createClient();

  // 1. Buscar Setores
  const { data: sectors } = await supabase
    .from("sectors")
    .select("id, name")
    .order("name");

  // 2. Buscar Igrejas
  const { data: churches } = await supabase
    .from("churches")
    .select("id, name, sector_id")
    .order("name");

  // 3. Buscar Membros COM o nome do Cargo
  const { data: members } = await supabase
    .from("members")
    .select(`
      id, 
      church_id, 
      ecclesiastical_roles (name)
    `);

  // 4. Processamento de BI (Business Intelligence)
  const sectorsWithData = sectors?.map((sector) => {
    const sectorChurches = churches?.filter((c) => c.sector_id === sector.id) || [];
    
    const churchesWithStats = sectorChurches.map((church) => {
      // Filtra membros desta igreja
      const churchMembers = members?.filter((m) => m.church_id === church.id) || [];
      const totalMembers = churchMembers.length;

      // Contagem por Sigla
      const roleCounts: Record<string, number> = {
        "Pr": 0, "Ev": 0, "Pb": 0, "Dco": 0, "Dca": 0, "Co": 0, "Ax": 0, "Ge": 0
      };

      churchMembers.forEach(member => {
        // @ts-ignore - Supabase join type check
        const roleName = member.ecclesiastical_roles?.name;
        const abbr = getRoleAbbreviation(roleName);
        if (roleCounts[abbr] !== undefined) {
          roleCounts[abbr]++;
        } else {
          roleCounts["Ge"]++;
        }
      });

      return {
        ...church,
        totalMembers,
        roleCounts,
        // Placeholders Financeiros (Futuro Módulo)
        financial: {
          receita: 0,
          despesa: 0,
          caixa: 0
        }
      };
    });

    // Totais do Setor
    const totalMembersInSector = churchesWithStats.reduce((acc, curr) => acc + curr.totalMembers, 0);

    return {
      ...sector,
      churches: churchesWithStats,
      stats: {
        totalChurches: churchesWithStats.length,
        totalMembers: totalMembersInSector,
      }
    };
  }) || [];

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Setores e Igrejas</h1>
        <p className="text-neutral-400">Visão hierárquica, financeira e membresia detalhada.</p>
      </div>

      <div className="grid gap-8">
        {sectorsWithData.map((sector) => (
          <div key={sector.id} className="bg-neutral-900/30 border border-neutral-800 rounded-xl overflow-hidden">
            
            {/* CABEÇALHO DO SETOR */}
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{sector.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-neutral-400 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> {sector.stats.totalChurches} Igrejas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {sector.stats.totalMembers} Membros Totais
                    </span>
                  </div>
                </div>
              </div>

              {/* KPI Financeiro Global do Setor (Placeholder) */}
              <div className="px-4 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50 text-right">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Arrecadação Global</p>
                <div className="flex items-center justify-end gap-2 text-emerald-500 font-medium">
                  <Coins className="w-4 h-4" />
                  R$ 0,00
                </div>
              </div>
            </div>

            {/* LISTA DE IGREJAS (LAYOUT EXPANDIDO) */}
            <div className="grid grid-cols-1 gap-4 p-6">
              {sector.churches.map((church) => {
                // Lógica de cor do Caixa (Azul/Vermelho)
                const isPositive = church.financial.caixa >= 0;
                const caixaColor = isPositive ? "text-blue-400" : "text-red-400";

                return (
                  <div key={church.id} className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-500/30 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-900/5 overflow-hidden">
                    
                    {/* LINHA SUPERIOR: Nome e Financeiro */}
                    <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Nome da Igreja */}
                      <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wide">
                        {church.name}
                      </h3>

                      {/* Bloco Financeiro (Direita) */}
                      <div className="flex gap-6 md:gap-8 text-right bg-neutral-950/50 px-4 py-2 rounded-lg border border-neutral-800/50">
                        <div>
                          <p className="text-[10px] font-bold text-blue-500 uppercase mb-0.5">Receita</p>
                          <p className="text-sm font-mono text-neutral-300">R$ {church.financial.receita.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-red-500 uppercase mb-0.5">Despesa</p>
                          <p className="text-sm font-mono text-neutral-300">R$ {church.financial.despesa.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div>
                          <p className={`text-[10px] font-bold uppercase mb-0.5 ${caixaColor}`}>Caixa</p>
                          <p className={`text-sm font-mono font-medium ${caixaColor}`}>R$ {church.financial.caixa.toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>
                    </div>

                    {/* DIVISOR */}
                    <div className="h-px w-full bg-neutral-800" />

                    {/* LINHA INFERIOR: Membros e Cargos */}
                    <div className="p-4 bg-neutral-800/20 flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Totalizador de Membros (Esquerda/Centro) */}
                      <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-neutral-800 pr-6">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Membros</span>
                        <span className="text-2xl font-bold text-white">{church.totalMembers}</span>
                      </div>

                      {/* Grid de Cargos (Direita/Distribuído) */}
                      <div className="flex-1 grid grid-cols-4 sm:grid-cols-8 gap-y-3 gap-x-2 text-center">
                        {/* Renderiza cada cargo */}
                        {Object.entries(church.roleCounts).map(([abbr, count]) => (
                          <div key={abbr} className="flex flex-col items-center">
                            <span className="text-[9px] text-neutral-500 uppercase font-bold">{abbr}</span>
                            <span className={`text-sm font-medium ${count > 0 ? 'text-white' : 'text-neutral-700'}`}>
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                );
              })}
              
              {/* Botão Nova Igreja (Sem onClick para evitar erro) */}
              <button 
                type="button"
                className="w-full border border-dashed border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/30 rounded-lg p-4 flex items-center justify-center gap-2 text-neutral-500 hover:text-white transition-all"
              >
                <div className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center">
                  <span className="text-lg leading-none">+</span>
                </div>
                <span className="text-sm font-medium">Cadastrar Nova Igreja neste Setor</span>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}