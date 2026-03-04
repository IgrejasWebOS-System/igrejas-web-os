"use client";

import { User, Search, MapPin, Loader2, Archive, RefreshCcw, MoreHorizontal, Plus, CheckCircle2, AlertCircle, History, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// --- INJEÇÕES DA FASE 7 ---
import MemberTimelineModal from "@/components/dashboard/MemberTimelineModal";
import { getMemberByMatriculaWithTimelineAction } from "@/app/dashboard/membros/actions";

export default function MembersView() {
  // --- ESTADOS EXISTENTES ---
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // --- NOVOS ESTADOS (FASE 7: PONTE DE RESOLUÇÃO DO DOSSIÊ) ---
  const [isPromptOpen, setIsPromptOpen] = useState(false); // Controla o Mini-Modal de pedir Matrícula
  const [isTimelineOpen, setIsTimelineOpen] = useState(false); // Controla o Dossiê Grande
  
  const [matriculaInput, setMatriculaInput] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearchingTimeline, setIsSearchingTimeline] = useState(false);
  
  // Guardam os dados do membro encontrado para passar para o Dossiê
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedMemberName, setSelectedMemberName] = useState("");

  // --- BUSCA DE DADOS DA TABELA ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const targetStatus = viewMode === 'ACTIVE' ? 'ACTIVE' : 'ARCHIVED';
      
      const { data: membersData } = await supabase
        .from("members")
        .select(`
            *,
            churches ( name ),
            ecclesiastical_roles ( name ) 
        `)
        .eq("status", targetStatus) 
        .order("full_name", { ascending: true });

      if (membersData) setMembers(membersData);
      setLoading(false);
    }
    fetchData();
  }, [viewMode]);

  // --- LÓGICA DE BUSCA DO DOSSIÊ (FASE 7) ---
  const handleSearchTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matriculaInput.trim()) return;

    setIsSearchingTimeline(true);
    setSearchError("");

    // Chama a Ação 7 que criamos no backend
    const result = await getMemberByMatriculaWithTimelineAction(matriculaInput.trim());

    if (!result.success) {
      setSearchError(result.message || "Matrícula não encontrada.");
    } else if (result.data && result.data.profile) {
      // Sucesso! Esconde o prompt, salva os dados e abre o Dossiê principal
      setSelectedMemberId(result.data.profile.id);
      setSelectedMemberName(result.data.profile.name);
      
      setIsPromptOpen(false);
      setMatriculaInput(""); // Limpa para a próxima vez
      setIsTimelineOpen(true);
    }
    
    setIsSearchingTimeline(false);
  };


  // --- FILTRAGEM DE TEXTO DA TABELA ---
  const filteredMembers = members.filter((member) => {
    const memberName = member.full_name || "";
    return search ? memberName.toLowerCase().includes(search.toLowerCase()) : true;
  });

  // --- RENDERIZAÇÃO ---
  if (loading) {
    return (
        <div className="flex justify-center py-20">
            <Loader2 className={`w-8 h-8 animate-spin ${viewMode === 'ACTIVE' ? "text-emerald-500" : "text-red-500"}`} />
        </div>
    );
  }

  const themeBorder = viewMode === 'ACTIVE' ? "border-neutral-800" : "border-red-900/50";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* 1. COMPACT HEADER */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-neutral-900/50 p-4 rounded-xl border ${themeBorder}`}>
        
        {/* Título */}
        <div className="min-w-fit">
          <h1 className={`text-2xl font-bold ${viewMode === 'ACTIVE' ? "text-white" : "text-red-500"} tracking-tight`}>
            {viewMode === 'ACTIVE' ? "Gestão de Membros" : "Arquivo Morto (Membros)"}
          </h1>
          <p className="text-neutral-400">
            {viewMode === 'ACTIVE' ? "Gerencie os membros ativos da congregação." : "Histórico de membros excluídos/inativos."}
          </p>
        </div>

        {/* Busca Embutida da Tabela */}
        <div className="flex-1 max-w-sm relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder={viewMode === 'ACTIVE' ? "Buscar membro ativo..." : "Buscar no arquivo morto..."} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-neutral-950 border ${themeBorder} rounded-lg py-2.5 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:border-emerald-500 outline-none transition-colors`}
          />
        </div>
        
        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
            
            {/* BOTÃO HISTÓRICO GLOBAL (Atualizado Fase 7) */}
            <button
                type="button"
                onClick={() => {
                  setSearchError("");
                  setMatriculaInput("");
                  setIsPromptOpen(true);
                }}
                className="hidden sm:flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors"
            >
                <History className="w-3.5 h-3.5" />
                Histórico
            </button>

            {/* Toggle Arquivo Morto */}
            <button
                onClick={() => setViewMode(viewMode === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all border
                    bg-red-950/10 text-red-500 border-red-900/30 hover:bg-red-900/30 hover:text-red-400 hover:border-red-900/50
                    ${viewMode === 'ARCHIVED' ? "shadow-[0_0_15px_rgba(220,38,38,0.2)] bg-red-900/20" : ""} 
                `}
            >
                {viewMode === 'ARCHIVED' ? <RefreshCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                {viewMode === 'ARCHIVED' ? "Voltar para Ativos" : "Arquivo Morto"}
            </button>

            {/* Botão Novo Membro */}
            {viewMode === 'ACTIVE' && (
                <Link 
                href="/dashboard/membros/novo"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20 whitespace-nowrap"
                >
                <Plus className="w-4 h-4" />
                Novo Membro
                </Link>
            )}
        </div>
      </div>

      {/* 2. TABELA DE DADOS (IMUTÁVEL) */}
      <div className={`border ${themeBorder} rounded-xl overflow-hidden bg-neutral-900/30 transition-colors`}>
        <table className="w-full text-left text-sm">
          <thead className={`bg-neutral-900 border-b ${themeBorder}`}>
            <tr>
              <th className="px-6 py-4 font-medium text-neutral-400">Nome Completo</th>
              <th className="px-6 py-4 font-medium text-neutral-400">Função</th>
              <th className="px-6 py-4 font-medium text-neutral-400">Situação</th>
              <th className="px-6 py-4 font-medium text-neutral-400">Contato</th>
              <th className="px-6 py-4 font-medium text-neutral-400 text-right">Ações</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-800">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="group hover:bg-neutral-800/30 transition-colors">
                
                <td className="px-6 py-4">
                  <Link href={`/dashboard/membros/editar/${member.id}`} className="block w-full">
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-700 group-hover:border-emerald-500/50 group-hover:text-emerald-500 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`font-medium ${viewMode === 'ACTIVE' ? 'text-neutral-200 group-hover:text-emerald-400' : 'text-neutral-400 group-hover:text-red-400'} transition-colors`}>
                          {member.full_name}
                        </div>
                        <div className="text-xs text-neutral-500">{member.email || "Sem e-mail"}</div>
                      </div>
                    </div>
                  </Link>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-neutral-800 text-neutral-400 border-neutral-700">
                    {member.ecclesiastical_roles?.name || "Sem Cargo"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {member.financial_status === 'UP_TO_DATE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Em Dia
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Pendente
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-neutral-400">
                  {member.phone || "-"}
                </td>

                <td className="px-6 py-4 text-right">
                  <Link href={`/dashboard/membros/editar/${member.id}`}>
                    <button className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-2 hover:bg-neutral-800 rounded-md">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}

            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                  {viewMode === 'ACTIVE' 
                    ? "Nenhum membro ativo encontrado." 
                    : "O Arquivo Morto está vazio."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* ========================================================= */}
      {/* INJEÇÕES FASE 7: PONTE DE RESOLUÇÃO (MINI-MODAL E DOSSIÊ) */}
      {/* ========================================================= */}

      {/* MINI-MODAL (PROMPT DE MATRÍCULA) */}
      {isPromptOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" />
                Buscar Histórico
              </h3>
              <button onClick={() => setIsPromptOpen(false)} className="text-neutral-500 hover:text-white transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSearchTimeline} className="p-4 space-y-4">
              <div>
                <label className="text-xs uppercase text-neutral-400 font-bold mb-1.5 block">
                  Matrícula do Membro
                </label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ex: 52591" 
                  value={matriculaInput}
                  onChange={(e) => {
                    setMatriculaInput(e.target.value);
                    if(searchError) setSearchError("");
                  }}
                  className={`w-full bg-neutral-950 border rounded-lg p-2.5 text-white focus:outline-none transition-colors ${searchError ? 'border-red-500 focus:border-red-500' : 'border-neutral-800 focus:border-emerald-500'}`}
                />
                {searchError && (
                  <span className="text-red-500 text-[10px] font-bold mt-1.5 block flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {searchError}
                  </span>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPromptOpen(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSearchingTimeline || !matriculaInput.trim()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {isSearchingTimeline ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar Dossiê"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOSSIÊ GRANDE (SLIDE-OVER) */}
      <MemberTimelineModal 
        isOpen={isTimelineOpen} 
        onClose={() => setIsTimelineOpen(false)} 
        memberId={selectedMemberId} 
        memberName={selectedMemberName} 
      />

    </div>
  );
}