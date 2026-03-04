"use client";

import { Building2, Users, Map, Plus, Search, FilterX, Archive, Edit2, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Interfaces mantidas para tipagem estrita
interface ProcessedSector {
  id: string;
  name: string;
  churches: any[];
  stats: {
    totalChurches: number;
    totalMembers: number;
  };
}

export default function ChurchesView() {
  // --- ESTADOS ---
  const [sectors, setSectors] = useState<ProcessedSector[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [sectorFilter, setSectorFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  
  // Controle de Modo (False = Ativos, True = Arquivo Morto)
  const [showArchived, setShowArchived] = useState(false);

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      // Define o status alvo baseado no botão (ACTIVE ou ARCHIVED)
      const targetStatus = showArchived ? 'ARCHIVED' : 'ACTIVE';

      // 1. Busca Setores
      let sectorsQuery = supabase.from("sectors").select("id, name, status").order("name");
      
      if (!showArchived) {
         sectorsQuery = sectorsQuery.eq("status", "ACTIVE");
      }

      const { data: sectorsData } = await sectorsQuery;

      // 2. Busca Igrejas baseada no Status Escolhido
      const { data: churchesData } = await supabase
        .from("churches")
        .select("*")
        .eq("status", targetStatus)
        .order("name");

      // Processamento e Agrupamento dos Dados
      if (sectorsData && churchesData) {
        const processed: ProcessedSector[] = sectorsData.map((sector) => {
          const sectorChurches = churchesData.filter((c) => c.sector_id === sector.id);
          
          return {
            id: sector.id,
            name: sector.name,
            churches: sectorChurches.map(c => ({
                ...c,
                financial: c.financial || { receita: 0, despesa: 0, caixa: 0 },
                roleCounts: c.roleCounts || {},
                totalMembers: c.totalMembers || 0
            })),
            stats: {
              totalChurches: sectorChurches.length,
              totalMembers: sectorChurches.reduce((acc, c) => acc + (c.totalMembers || 0), 0),
            },
          };
        });

        // Se estiver no modo Arquivo Morto, filtramos setores vazios
        const finalSectors = showArchived 
            ? processed.filter(s => s.churches.length > 0)
            : processed;

        setSectors(finalSectors);
      }
      setLoading(false);
    }

    fetchData();
  }, [showArchived]);

  // Lógica de Filtragem Visual
  const filteredSectors = sectors.filter((sector) => {
    const matchesSector = sectorFilter ? sector.id === sectorFilter : true;
    const matchesSearch = searchFilter 
      ? sector.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
        sector.churches.some((c: any) => c.name.toLowerCase().includes(searchFilter.toLowerCase()))
      : true;
    return matchesSector && matchesSearch;
  });

  // Tema Dinâmico (Vermelho se Arquivo Morto está ATIVO na tela)
  const themeAccent = showArchived ? "red" : "emerald";
  const themeBorder = showArchived ? "border-red-900/50" : "border-neutral-800";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. CABEÇALHO UNIFICADO */}
      <div className={`bg-neutral-900/50 border ${themeBorder} p-4 rounded-xl flex flex-col xl:flex-row items-center justify-between gap-4 transition-all duration-500`}>
        
        <div className="shrink-0 text-center xl:text-left">
          <h1 className={`text-xl font-bold ${showArchived ? "text-red-500" : "text-white"} tracking-tight transition-colors`}>
            {showArchived ? "Arquivo Morto (Inativos)" : "Global Igrejas e Setores"}
          </h1>
          <p className="text-xs text-neutral-400">
            {showArchived ? "Histórico de registros desativados." : "Gestão hierárquica e filtros."}
          </p>
        </div>

        <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-3 max-w-2xl">
            <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input 
                    type="text" 
                    placeholder={showArchived ? "Buscar no histórico..." : "Buscar Igreja ou Setor..."}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-${themeAccent}-500 focus:ring-1 focus:ring-${themeAccent}-500 outline-none transition-all h-10`}
                />
            </div>

            <div className="relative w-full md:w-48">
                <select 
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-3 pr-8 py-2 text-sm text-white appearance-none focus:border-${themeAccent}-500 focus:ring-1 focus:ring-${themeAccent}-500 outline-none transition-all cursor-pointer h-10`}
                >
                    <option value="">Todos os Setores</option>
                    {sectors.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-neutral-500">
                    <FilterX className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
            {/* BOTÃO ARQUIVO MORTO - AGORA SEMPRE VERMELHO (Conforme Solicitado) */}
            <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all border h-10 whitespace-nowrap
                    bg-red-950/10 text-red-500 border-red-900/30 hover:bg-red-900/30 hover:text-red-400 hover:border-red-900/50
                    ${showArchived ? "shadow-[0_0_15px_rgba(220,38,38,0.2)]" : ""} 
                `}
                title={showArchived ? "Voltar para Visão Operacional" : "Ver Arquivo Morto"}
            >
                {showArchived ? <RefreshCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                {showArchived ? "Voltar para Ativos" : "Arquivo Morto"}
            </button>

            {/* Botões de Ação (Só aparecem se NÃO estiver no arquivo morto) */}
            {!showArchived && (
                <>
                    <Link 
                    href="/dashboard/igrejas/setores/novo"
                    className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors border border-neutral-700 h-10 whitespace-nowrap"
                    >
                    <Map className="w-3.5 h-3.5" />
                    Novo Setor
                    </Link>

                    <Link 
                    href="/dashboard/igrejas/nova"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-emerald-900/20 h-10 whitespace-nowrap"
                    >
                    <Plus className="w-3.5 h-3.5" />
                    Nova Igreja
                    </Link>
                </>
            )}
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className={`w-8 h-8 animate-spin text-${themeAccent}-500`} />
        </div>
      ) : (
        /* 2. GRID DE SETORES */
        <div className="grid gap-8">
            {filteredSectors.map((sector) => {
                
                // LÓGICA DE BI
                const sectorFinancials = sector.churches.reduce((acc, church) => ({
                    receita: acc.receita + (church.financial?.receita || 0),
                    despesa: acc.despesa + (church.financial?.despesa || 0),
                    caixa: acc.caixa + (church.financial?.caixa || 0),
                }), { receita: 0, despesa: 0, caixa: 0 });

                const sectorRoleCounts = sector.churches.reduce((acc, church) => {
                    Object.entries(church.roleCounts || {}).forEach(([role, count]) => {
                        acc[role] = (acc[role as string] || 0) + (count as number);
                    });
                    return acc;
                }, {} as Record<string, number>);

                const roleOrder = ["Pr", "Ev", "Pb", "Dco", "Dca", "Co", "Ax", "Ge"];
                const isSectorPositive = sectorFinancials.caixa >= 0;
                const sectorCaixaColor = isSectorPositive ? "text-blue-400" : "text-red-400";

                return (
                    <div key={sector.id} className={`bg-neutral-900/30 border ${themeBorder} rounded-xl overflow-hidden animate-in zoom-in-95 duration-300`}>
                        
                        {/* HEADER DO SETOR */}
                        <div className={`p-4 border-b border-neutral-800 ${showArchived ? 'bg-red-950/10' : 'bg-neutral-900/50'} flex flex-col xl:flex-row items-center justify-between gap-6`}>
                            
                            {/* Identificação */}
                            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left min-w-[200px]">
                                <div className={`h-10 w-10 rounded-lg ${showArchived ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'} flex items-center justify-center shrink-0`}>
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className={`text-base font-semibold uppercase ${showArchived ? 'text-red-200' : 'text-white'}`}>{sector.name}</h2>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-neutral-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-3 h-3" /> {sector.stats.totalChurches} {showArchived ? 'Arquivadas' : 'Igrejas'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {sector.stats.totalMembers} Membros
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* BI (Escondido se Arquivo Morto) */}
                            {!showArchived && (
                                <div className="flex-1 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-thin scrollbar-thumb-neutral-700">
                                    <div className="flex justify-center xl:justify-end gap-3 min-w-max px-2">
                                        {roleOrder.map((abbr) => (
                                            <div key={abbr} className="flex flex-col items-center px-3 py-1.5 rounded bg-neutral-900/50 border border-neutral-800/50 min-w-[48px]">
                                                <span className="text-xs text-blue-500 uppercase font-bold">{abbr}</span>
                                                <span className={`text-sm font-bold ${sectorRoleCounts[abbr] > 0 ? 'text-white' : 'text-neutral-600'}`}>
                                                    {sectorRoleCounts[abbr] || 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!showArchived && (
                                <div className="flex gap-6 text-right bg-neutral-950/80 px-5 py-2.5 rounded-lg border border-neutral-800 shrink-0 shadow-lg shadow-black/20">
                                    <div>
                                        <p className="text-xs font-bold text-blue-500 uppercase">Receita</p>
                                        <p className="text-base font-mono text-neutral-300">R$ {sectorFinancials.receita.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-bold text-red-500 uppercase">Despesa</p>
                                        <p className="text-base font-mono text-neutral-300">R$ {sectorFinancials.despesa.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase ${sectorCaixaColor}`}>Caixa</p>
                                        <p className={`text-base font-mono font-medium ${sectorCaixaColor}`}>R$ {sectorFinancials.caixa.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LISTA DE IGREJAS */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
                            {sector.churches.map((church: any) => {
                                const isPositive = church.financial.caixa >= 0;
                                const caixaColor = isPositive ? "text-blue-400" : "text-red-400";

                                return (
                                    <Link 
                                        key={church.id} 
                                        href={`/dashboard/igrejas/editar/${church.id}`}
                                        className={`block group bg-neutral-900 border ${themeBorder} rounded-lg transition-all hover:shadow-lg hover:shadow-${themeAccent}-900/5 overflow-hidden`}
                                    >
                                        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex-1 w-full md:w-auto text-center md:text-left">
                                                <h3 className={`text-base font-bold ${showArchived ? 'text-neutral-400' : 'text-white group-hover:text-emerald-400'} transition-colors uppercase tracking-wide truncate`}>
                                                    {church.name}
                                                </h3>
                                                {showArchived && <span className="text-[10px] text-red-500 border border-red-900/30 px-2 py-0.5 rounded uppercase">Arquivada</span>}
                                            </div>

                                            {!showArchived && (
                                                <>
                                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/50 border border-neutral-800">
                                                        <Users className="w-4 h-4 text-white" />
                                                        <span className="text-sm font-bold text-white">{church.totalMembers} MEMBROS</span>
                                                    </div>

                                                    <div className="flex gap-4 text-right bg-neutral-950/50 px-3 py-1.5 rounded-lg border border-neutral-800/50">
                                                        <div>
                                                            <p className="text-xs font-bold text-blue-500 uppercase">Receita</p>
                                                            <p className="text-sm font-mono text-neutral-300">R$ {church.financial.receita.toFixed(2).replace('.', ',')}</p>
                                                        </div>
                                                        <div className="hidden sm:block">
                                                            <p className="text-xs font-bold text-red-500 uppercase">Despesa</p>
                                                            <p className="text-sm font-mono text-neutral-300">R$ {church.financial.despesa.toFixed(2).replace('.', ',')}</p>
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs font-bold uppercase ${caixaColor}`}>Caixa</p>
                                                            <p className={`text-sm font-mono font-medium ${caixaColor}`}>R$ {church.financial.caixa.toFixed(2).replace('.', ',')}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {!showArchived && (
                                            <>
                                                <div className="h-px w-full bg-neutral-800" />
                                                <div className="p-3 bg-neutral-800/20">
                                                    <div className="grid grid-cols-8 gap-1 text-center">
                                                        {roleOrder.map((abbr) => (
                                                            <div key={abbr} className="flex flex-col items-center p-1 rounded hover:bg-neutral-800/50 transition-colors">
                                                                <span className="text-xs text-blue-500 uppercase font-bold tracking-wider">{abbr}</span>
                                                                <span className={`text-xs font-bold ${Number(church.roleCounts[abbr]) > 0 ? 'text-white' : 'text-neutral-500'}`}>
                                                                    {Number(church.roleCounts[abbr]) || 0}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                            
                            {!showArchived && (
                                <Link
                                    href={`/dashboard/igrejas/nova?setor=${sector.id}`}
                                    className="border border-dashed border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/30 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-white transition-all min-h-[120px]"
                                >
                                    <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-500">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wide">Cadastrar Igreja Aqui</span>
                                </Link>
                            )}
                        </div>
                    </div>
                );
            })}

            {filteredSectors.length === 0 && (
                <div className="text-center py-12 text-neutral-500 bg-neutral-900/30 rounded-xl border border-neutral-800">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{showArchived ? "O Arquivo Morto está vazio." : "Nenhum setor ou igreja encontrado com os filtros atuais."}</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}