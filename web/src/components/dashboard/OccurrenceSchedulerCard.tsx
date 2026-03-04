"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, ArrowRight, Loader2, X, Search, CheckCircle2, AlertCircle, List, Printer } from "lucide-react";
import DashboardCardBase from "./DashboardCardBase";
import { getMemberByMatriculaWithTimelineAction } from "@/app/dashboard/membros/actions";
import { getOccurrenceTypesListAction, registerMemberOccurrenceAction, getOccurrencesByPeriodAction } from "@/app/dashboard/ocorrencias/actions";

export default function OccurrenceSchedulerCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado das Abas
  const [activeTab, setActiveTab] = useState<"CADASTRAR" | "LISTAGEM">("CADASTRAR");

  // ==========================================
  // ESTADOS DA ABA: CADASTRAR
  // ==========================================
  const [types, setTypes] = useState<any[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  const [date, setDate] = useState("");
  const [occurrenceTypeId, setOccurrenceTypeId] = useState("");
  const [matriculaInput, setMatriculaInput] = useState("");
  
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [isSearchingMember, setIsSearchingMember] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [happenedInChurch, setHappenedInChurch] = useState(true);
  const [observation, setObservation] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // ==========================================
  // ESTADOS DA ABA: LISTAGEM
  // ==========================================
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [occurrencesList, setOccurrencesList] = useState<any[]>([]);
  const [isSearchingList, setIsSearchingList] = useState(false);

  // Busca inicial dos tipos
  useEffect(() => {
    if (isModalOpen && types.length === 0) {
      setIsLoadingTypes(true);
      getOccurrenceTypesListAction().then((res) => {
        if (res.success) setTypes(res.data);
        setIsLoadingTypes(false);
      });
    }
  }, [isModalOpen]);

  // INJEÇÃO FUNCIONAL: O "Reset Handler" (Resolve o Efeito Memória)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    
    // Zera toda a memória do componente para o próximo acesso
    setActiveTab("CADASTRAR");
    setMatriculaInput("");
    setMemberProfile(null);
    setSearchError("");
    setDate("");
    setOccurrenceTypeId("");
    setHappenedInChurch(true);
    setObservation("");
    setStartDate("");
    setEndDate("");
    setOccurrencesList([]);
    setSuccessMessage(false);
  };

  // A Mágica do Auto-Preenchimento ao dar ENTER
  const handleMatriculaKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!matriculaInput.trim()) return;

      setIsSearchingMember(true);
      setSearchError("");
      setMemberProfile(null);

      const result = await getMemberByMatriculaWithTimelineAction(matriculaInput.trim());

      if (result.success && result.data?.profile) {
        setMemberProfile(result.data.profile);
      } else {
        setSearchError("Matrícula não encontrada.");
      }
      setIsSearchingMember(false);
    }
  };

  const handleSearchClick = async () => {
    if (!matriculaInput.trim()) return;
    setIsSearchingMember(true);
    setSearchError("");
    setMemberProfile(null);
    const result = await getMemberByMatriculaWithTimelineAction(matriculaInput.trim());
    if (result.success && result.data?.profile) {
      setMemberProfile(result.data.profile);
    } else {
      setSearchError("Matrícula não encontrada.");
    }
    setIsSearchingMember(false);
  };

  // Salvamento Final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberProfile || !date || !occurrenceTypeId) {
        setSearchError("Preencha a data, o tipo de ocorrência e pesquise uma matrícula válida.");
        return;
    }

    setIsSubmitting(true);
    setSearchError("");

    const res = await registerMemberOccurrenceAction({
      member_id: memberProfile.id,
      occurrence_type_id: occurrenceTypeId,
      occurrence_date: date,
      happened_in_current_church: happenedInChurch,
      observation: observation
    });

    if (res.success) {
      setSuccessMessage(true);
      setTimeout(() => {
        handleCloseModal(); // Reaproveitamos a função de reset após o sucesso
      }, 2000);
    } else {
      setSearchError(res.message || "Erro ao registrar ocorrência.");
    }
    setIsSubmitting(false);
  };

  // Busca da Listagem por Período
  const handleSearchList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    
    setIsSearchingList(true);
    const res = await getOccurrencesByPeriodAction(startDate, endDate);
    if (res.success) {
      setOccurrencesList(res.data);
    }
    setIsSearchingList(false);
  };

  const groupedTypes = types.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, any[]>);

  // Helper para formatar data BR de forma segura (evita bug de fuso horário na impressão)
  const formatBRDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <>
      <DashboardCardBase
        icon={<CalendarPlus className="w-7 h-7" />}
        title="AGENDAMENTO"
        subtitle="Lançamento de ocorrência"
        theme="blue"
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-blue-900/20 uppercase tracking-wider"
          title="Abrir formulário de ocorrência"
        >
          OCORRÊNCIAS <ArrowRight className="w-4 h-4" />
        </button>
      </DashboardCardBase>

      {/* O SUPER MODAL DE OCORRÊNCIA COM ABAS (Adicionadas diretivas print: para o Relatório) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 sm:p-6 transition-opacity print:bg-white print:p-0 print:items-start">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
            
            {/* Cabeçalho do Modal Fixo (Oculto na Impressão) */}
            <div className="flex flex-col border-b border-neutral-800 bg-neutral-950/50 flex-shrink-0 print:hidden">
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <CalendarPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Agendamento de Ocorrência</h2>
                    <p className="text-xs text-neutral-400 font-medium">Registro oficial para o Dossiê Histórico</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-800 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sistema de Abas */}
              <div className="flex px-6 gap-6">
                <button 
                  onClick={() => setActiveTab("CADASTRAR")}
                  className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "CADASTRAR" ? "border-blue-500 text-blue-500" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
                >
                  CADASTRAR
                </button>
                <button 
                  onClick={() => setActiveTab("LISTAGEM")}
                  className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${activeTab === "LISTAGEM" ? "border-blue-500 text-blue-500" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
                >
                  <List className="w-4 h-4" /> LISTAGEM
                </button>
              </div>
            </div>

            {/* Corpo Rolável do Modal (Visível na Impressão sem rolagem) */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar print:p-0 print:overflow-visible">
              
              {/* CABEÇALHO EXCLUSIVO DE IMPRESSÃO (Oculto na Tela) */}
              <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-black uppercase text-black">Relatório de Ocorrências</h1>
                <p className="text-sm font-bold text-black mt-1">Período Selecionado: {formatBRDate(startDate)} a {formatBRDate(endDate)}</p>
                <p className="text-xs text-black mt-1">Documento gerado pelo sistema Connection Cyber OS</p>
              </div>

              {/* ========================================== */}
              {/* ABA 1: CADASTRAR (Oculto na Impressão)     */}
              {/* ========================================== */}
              {activeTab === "CADASTRAR" && (
                <div className="print:hidden">
                  {successMessage ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                        <h3 className="text-2xl font-black text-white uppercase">Registrado com Sucesso!</h3>
                        <p className="text-neutral-400">A ocorrência foi anexada ao banco de dados.</p>
                     </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* LINHA 1: Data e Tipo de Ocorrência */}
                      <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Data da Ocorrência</label>
                          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]" />
                        </div>
                        <div className="col-span-12 md:col-span-8">
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Tipo de Ocorrência</label>
                          <select required value={occurrenceTypeId} onChange={(e) => setOccurrenceTypeId(e.target.value)} disabled={isLoadingTypes} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-medium uppercase disabled:opacity-50">
                            <option value="">Selecione o tipo de ocorrência...</option>
                            {Object.entries(groupedTypes).map(([category, items]) => (
                              <optgroup key={category} label={`--- ${category} ---`} className="text-neutral-500 font-bold bg-neutral-900">
                                {items.map(item => (
                                  <option key={item.id} value={item.id} className="text-white font-medium">{item.name}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* LINHA 2: Matrícula, Cargo e Nome do Membro */}
                      <div className="grid grid-cols-12 gap-5 items-end">
                        <div className="col-span-12 md:col-span-3 relative">
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Matrícula (Enter)</label>
                          <div className="relative">
                            <input type="text" placeholder="Ex: 52591" value={matriculaInput} onChange={(e) => setMatriculaInput(e.target.value)} onKeyDown={handleMatriculaKeyDown} className={`w-full bg-neutral-950 border rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none transition-all font-mono ${searchError ? 'border-red-500' : 'border-neutral-800 focus:border-blue-500'}`} />
                            <button type="button" onClick={handleSearchClick} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-blue-500 transition-colors">
                              {isSearchingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Cargo</label>
                          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-neutral-400 truncate">
                            {memberProfile?.role_name || "---"}
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Membro</label>
                          <div className={`w-full border rounded-xl py-3 px-4 text-sm font-bold truncate transition-colors ${memberProfile ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-600'}`}>
                            {memberProfile ? memberProfile.full_name : "Aguardando busca..."}
                          </div>
                        </div>
                      </div>

                      {/* LINHA 3: Igreja e Localidade */}
                      <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 md:col-span-6">
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Igreja</label>
                          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-neutral-400 truncate">
                            {memberProfile?.church_name || "---"}
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Localidade da Igreja</label>
                          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-neutral-400 truncate">
                            {memberProfile?.city || "---"}
                          </div>
                        </div>
                      </div>

                      {/* LINHA 4: Pergunta de Ocorrência na Igreja */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-800/50 border border-neutral-700/50 p-5 rounded-xl gap-4">
                        <span className="text-sm font-bold text-neutral-300">A ocorrência informada, ocorrerá na igreja selecionada acima?</span>
                        <div className="flex items-center gap-6 bg-neutral-900 p-2 px-4 rounded-lg border border-neutral-800">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-white group">
                            <input type="radio" checked={happenedInChurch} onChange={() => setHappenedInChurch(true)} className="w-4 h-4 accent-blue-500 cursor-pointer" /> 
                            <span className="group-hover:text-blue-400 transition-colors">Sim</span>
                          </label>
                          <div className="w-px h-4 bg-neutral-700"></div>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-white group">
                            <input type="radio" checked={!happenedInChurch} onChange={() => setHappenedInChurch(false)} className="w-4 h-4 accent-blue-500 cursor-pointer" /> 
                            <span className="group-hover:text-red-400 transition-colors">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* LINHA 5: Observações */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Observações Adicionais</label>
                        <textarea 
                          rows={3} 
                          value={observation}
                          onChange={(e) => setObservation(e.target.value)}
                          placeholder="Detalhes sobre a ocorrência..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                        ></textarea>
                      </div>

                      {/* RODAPÉ: Mensagem de Erro e Botão */}
                      <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-neutral-800">
                         <div className="w-full md:w-2/3">
                            {searchError && (
                              <span className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {searchError}
                              </span>
                            )}
                         </div>
                        <button 
                          type="submit" 
                          disabled={isSubmitting || !memberProfile || !occurrenceTypeId || !date}
                          className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/20 uppercase tracking-wider"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gravar Ocorrência"}
                        </button>
                      </div>

                    </form>
                  )}
                </div>
              )}

              {/* ========================================== */}
              {/* ABA 2: LISTAGEM E IMPRESSÃO                */}
              {/* ========================================== */}
              {activeTab === "LISTAGEM" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Filtro de Busca (Oculto na Impressão) */}
                  <form onSubmit={handleSearchList} className="bg-neutral-800/30 border border-neutral-800 p-5 rounded-xl flex flex-col md:flex-row items-end gap-4 print:hidden">
                    <div className="w-full md:flex-1">
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Data Inicial</label>
                      <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]" />
                    </div>
                    <div className="w-full md:flex-1">
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 ml-1">Data Final</label>
                      <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]" />
                    </div>
                    <div className="w-full md:w-32">
                      <button type="submit" disabled={isSearchingList || !startDate || !endDate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 uppercase shadow-md shadow-blue-900/20">
                        {isSearchingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                      </button>
                    </div>
                    
                    {/* Botão de Impressão (Só aparece se houver resultados) */}
                    {occurrencesList.length > 0 && (
                      <div className="w-full md:w-36">
                        <button 
                          type="button" 
                          onClick={() => window.print()} 
                          className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase"
                          title="Imprimir relatório em A4"
                        >
                          <Printer className="w-4 h-4" /> Imprimir
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Tabela de Resultados (Adaptada para ficar limpa na Impressão) */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden print:bg-white print:border-none print:shadow-none">
                    {occurrencesList.length === 0 ? (
                      <p className="text-neutral-500 text-sm p-8 text-center font-medium print:hidden">
                        {isSearchingList ? "Buscando ocorrências..." : "Nenhuma ocorrência encontrada neste período."}
                      </p>
                    ) : (
                      <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full text-sm text-left print:text-black">
                          <thead className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-900 border-b border-neutral-800 print:bg-white print:text-black print:border-b-2 print:border-black">
                            <tr>
                              <th className="px-5 py-3">Data</th>
                              <th className="px-5 py-3">Membro</th>
                              <th className="px-5 py-3">Ocorrência</th>
                              <th className="px-5 py-3">Categoria</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/50 print:divide-neutral-300">
                            {occurrencesList.map((occ) => (
                              <tr key={occ.id} className="hover:bg-neutral-800/50 transition-colors print:hover:bg-transparent">
                                <td className="px-5 py-3 text-neutral-300 font-mono text-xs print:text-black">
                                  {new Date(occ.occurrence_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                                </td>
                                <td className="px-5 py-3 text-white font-bold print:text-black">
                                  {occ.members?.full_name} <span className="text-neutral-500 font-normal text-xs ml-1 print:text-black">({occ.members?.matricula})</span>
                                </td>
                                <td className="px-5 py-3 text-blue-400 font-bold uppercase text-xs print:text-black">
                                  {occ.occurrence_types?.name}
                                </td>
                                <td className="px-5 py-3 text-neutral-400 text-xs uppercase print:text-black">
                                  {occ.occurrence_types?.category}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}