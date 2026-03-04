"use client";

import { useEffect, useState } from "react";
import { X, Clock, Loader2, ArrowRight, ShieldAlert, CheckCircle2, UserPlus, BookOpen, Printer, FileText, User, MapPin, Phone, Hash, ChevronDown, Briefcase, Droplets, Church, Activity } from "lucide-react";
import { getMemberTimelineAction } from "@/app/dashboard/membros/actions";

interface MemberTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

type PrintMode = 'FICHA' | 'DOSSIE' | 'AMBOS' | null;

// Função de Cálculo Espelhada
function calculateTimeBaptized(dateString: string | null) {
    if (!dateString) return "---";
    let formattedDate = dateString;
    if (dateString.includes('-')) {
        const parts = dateString.split('T')[0].split('-');
        if(parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const parts = formattedDate.split('/');
    if(parts.length !== 3) return "---";
    const baptismDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const now = new Date();
    if (isNaN(baptismDate.getTime())) return "---";
    let years = now.getFullYear() - baptismDate.getFullYear();
    let months = now.getMonth() - baptismDate.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < baptismDate.getDate())) { years--; months += 12; }
    return `${years} a e ${months} m`;
}

export default function MemberTimelineModal({ isOpen, onClose, memberId, memberName }: MemberTimelineModalProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FICHA' | 'DOSSIE'>('FICHA');
  
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>(null);

  useEffect(() => {
    if (isOpen && memberId) {
      setLoading(true);
      setActiveTab('FICHA');
      setPrintMenuOpen(false);
      getMemberTimelineAction(memberId).then((res) => {
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setEvents(res.data.timeline);
        }
        setLoading(false);
      });
    }
  }, [isOpen, memberId]);

  if (!isOpen) return null;

  const isPrinting = printMode !== null;

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'CRIACAO': return { icon: <UserPlus className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case 'MUDANCA_CARGO': return { icon: <ArrowRight className="w-4 h-4 text-blue-500" />, bg: "bg-blue-500/10", border: "border-blue-500/20" };
      case 'TRANSFERENCIA': return { icon: <ArrowRight className="w-4 h-4 text-purple-500" />, bg: "bg-purple-500/10", border: "border-purple-500/20" };
      case 'ALTERACAO_STATUS': return { icon: <ShieldAlert className="w-4 h-4 text-yellow-500" />, bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
      case 'FORMACAO': return { icon: <BookOpen className="w-4 h-4 text-pink-500" />, bg: "bg-pink-500/10", border: "border-pink-500/20" };
      default: return { icon: <CheckCircle2 className="w-4 h-4 text-neutral-400" />, bg: "bg-neutral-800", border: "border-neutral-700" };
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "---";
    if (isoString.includes('/')) return isoString; 
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "---";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACTIVE': return "text-[#28A745]"; 
        case 'OBSERVATION': return "text-[#FFD700]"; 
        case 'INACTIVE': return "text-[#DC3545]"; 
        case 'UNFIT': return "text-[#E9ECEF]"; 
        default: return "text-white";
    }
  };

  const handlePrint = (mode: PrintMode) => {
    setPrintMode(mode);
    setPrintMenuOpen(false);
    
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(null), 100);
    }, 300); 
  };

  return (
    <>
      {/* ========================================================================
        CAMADA 1: MOTOR DE IMPRESSÃO (TABELA CLÁSSICA OFICIAL)
        Este bloco de código só existe para a impressora. Ele é ignorado pela tela.
        Garante alinhamento perfeito no formato Papel A4.
        ========================================================================
      */}
      <style>{`
        @media screen {
          #print-document { display: none !important; }
        }
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body * { visibility: hidden; }
          html, body { background: white !important; height: auto !important; overflow: visible !important; }
          
          #print-document, #print-document * { visibility: visible; color: black !important; font-family: Arial, sans-serif !important; }
          #print-document {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white !important; z-index: 999999;
          }
          
          .official-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .official-table th, .official-table td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          .official-label { font-size: 10px; font-weight: bold; color: #555 !important; display: block; text-transform: uppercase; margin-bottom: 2px; }
          .official-value { font-size: 13px; font-weight: normal; }
          
          .page-break { page-break-before: always; }
          .screen-only { display: none !important; }
        }
      `}</style>

      {/* DOCUMENTO DE IMPRESSÃO (Invisível na tela) */}
      <div id="print-document">
        
        {/* PÁGINA 1: FICHA CADASTRAL */}
        {(printMode === 'FICHA' || printMode === 'AMBOS') && profile && (
          <div>
            {/* Cabeçalho do Documento */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Ficha Cadastral de Membro</h1>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Relatório Oficial de Registro Eclesiástico</p>
            </div>

            {/* Tabela Master - Seção 1: Identificação e Eclesiástico */}
            <table className="official-table">
              <tbody>
                <tr>
                  <td colSpan={3} style={{ verticalAlign: 'top' }}>
                    <span className="official-label">Nome Completo</span>
                    <strong style={{ fontSize: '16px', textTransform: 'uppercase' }}>{profile.full_name}</strong>
                  </td>
                  <td rowSpan={4} style={{ width: '130px', textAlign: 'center', verticalAlign: 'middle', padding: '4px' }}>
                    {profile.photo_url ? (
                        <img src={profile.photo_url} alt="Foto" style={{ width: '115px', height: '150px', objectFit: 'cover', border: '1px solid #000' }} />
                    ) : (
                        <div style={{ width: '115px', height: '150px', border: '1px dashed #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>FOTO 3X4</div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><span className="official-label">Matrícula</span><span className="official-value"><strong>{profile.registration_number}</strong></span></td>
                  <td><span className="official-label">Cargo Eclesiástico</span><span className="official-value">{profile.role_name}</span></td>
                  <td><span className="official-label">Situação Financeira</span><span className="official-value">{profile.financial_status === 'UP_TO_DATE' ? 'Em Dia' : 'Pendente'}</span></td>
                </tr>
                <tr>
                  <td colSpan={2}><span className="official-label">Congregação Atual Atribuída</span><span className="official-value"><strong>{profile.church_name}</strong></span></td>
                  <td><span className="official-label">Status do Membro</span><span className="official-value">{profile.ecclesiastical_status}</span></td>
                </tr>
                <tr>
                  <td colSpan={2}><span className="official-label">Igreja de Origem (Anterior)</span><span className="official-value">{profile.origin_church || "---"}</span></td>
                  <td><span className="official-label">Data de Batismo / Tempo</span><span className="official-value">{formatDate(profile.baptism_date)} ({calculateTimeBaptized(profile.baptism_date)})</span></td>
                </tr>
              </tbody>
            </table>

            {/* Tabela Master - Seção 2: Pessoais e Familiares */}
            <div style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', border: '1px solid black', borderBottom: 'none', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>Dados Pessoais e Familiares</div>
            <table className="official-table">
              <tbody>
                <tr>
                  <td><span className="official-label">CPF</span><span className="official-value">{profile.cpf || "---"}</span></td>
                  <td><span className="official-label">RG / Órgão Expedidor / UF</span><span className="official-value">{profile.rg ? `${profile.rg} - ${profile.rg_issuer}/${profile.rg_state}` : "---"}</span></td>
                  <td><span className="official-label">Data Nasc.</span><span className="official-value">{formatDate(profile.birth_date)}</span></td>
                  <td><span className="official-label">Sexo</span><span className="official-value">{profile.gender || "---"}</span></td>
                </tr>
                <tr>
                  <td><span className="official-label">Estado Civil</span><span className="official-value">{profile.civil_status || "---"}</span></td>
                  <td><span className="official-label">Naturalidade (Cidade/UF)</span><span className="official-value">{profile.nationality_city ? `${profile.nationality_city}/${profile.nationality_state}` : "---"}</span></td>
                  <td colSpan={2}><span className="official-label">Escolaridade</span><span className="official-value">{profile.schooling || "---"}</span></td>
                </tr>
                <tr>
                  <td colSpan={2}><span className="official-label">Profissão</span><span className="official-value">{profile.profession || "---"}</span></td>
                  <td colSpan={2}><span className="official-label">Cônjuge</span><span className="official-value">{profile.spouse_name || "---"}</span></td>
                </tr>
                <tr>
                  <td colSpan={2}><span className="official-label">Nome do Pai</span><span className="official-value">{profile.father_name || "---"}</span></td>
                  <td colSpan={2}><span className="official-label">Nome da Mãe</span><span className="official-value">{profile.mother_name || "---"}</span></td>
                </tr>
              </tbody>
            </table>

            {/* Tabela Master - Seção 3: Contato e Endereço */}
            <div style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', border: '1px solid black', borderBottom: 'none', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>Endereço e Contato</div>
            <table className="official-table">
              <tbody>
                <tr>
                  <td><span className="official-label">Telefone / WhatsApp</span><span className="official-value">{profile.phone || "---"}</span></td>
                  <td colSpan={3}><span className="official-label">E-mail</span><span className="official-value">{profile.email || "---"}</span></td>
                </tr>
                <tr>
                  <td><span className="official-label">CEP</span><span className="official-value">{profile.zip_code || "---"}</span></td>
                  <td colSpan={2}><span className="official-label">Logradouro / Endereço</span><span className="official-value">{profile.address || "---"}</span></td>
                  <td><span className="official-label">Número</span><span className="official-value">{profile.number || "---"}</span></td>
                </tr>
                <tr>
                  <td colSpan={2}><span className="official-label">Bairro</span><span className="official-value">{profile.neighborhood || "---"}</span></td>
                  <td><span className="official-label">Cidade</span><span className="official-value">{profile.city || "---"}</span></td>
                  <td><span className="official-label">UF</span><span className="official-value">{profile.state || "---"}</span></td>
                </tr>
              </tbody>
            </table>

            {/* Rodapé Oficial de Assinaturas */}
            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
              <div style={{ textAlign: 'center', width: '40%' }}>
                <div style={{ borderBottom: '1px solid black', height: '30px', marginBottom: '5px' }}></div>
                <span style={{ fontSize: '12px' }}>Assinatura do Membro</span>
              </div>
              <div style={{ textAlign: 'center', width: '40%' }}>
                <div style={{ borderBottom: '1px solid black', height: '30px', marginBottom: '5px' }}></div>
                <span style={{ fontSize: '12px' }}>Secretaria / Diretoria</span>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA 2: O DOSSIÊ HISTÓRICO EM FORMATO DE TABELA (Se solicitado) */}
        {(printMode === 'DOSSIE' || printMode === 'AMBOS') && profile && (
          <div className={printMode === 'AMBOS' ? 'page-break' : ''}>
             <div style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Histórico Eclesiástico (Dossiê)</h1>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Membro: <strong>{profile.full_name}</strong> | Matrícula: <strong>{profile.registration_number}</strong></p>
            </div>

            <table className="official-table" style={{ marginTop: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ width: '15%' }}>Data/Hora</th>
                  <th style={{ width: '20%' }}>Tipo de Evento</th>
                  <th style={{ width: '65%' }}>Descrição da Ocorrência</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>Nenhum evento registrado no histórico deste membro.</td></tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id}>
                      <td style={{ fontSize: '12px' }}>{formatDateTime(event.created_at)}</td>
                      <td style={{ fontSize: '12px', fontWeight: 'bold' }}>{event.event_type}</td>
                      <td style={{ fontSize: '13px' }}>{event.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* --- FIM DA CAMADA DE IMPRESSÃO --- */}


      {/* ========================================================================
        CAMADA 2: A TELA DO SISTEMA (O SUPER MODAL ORIGINAL VALIDADO)
        Esta é a interface maravilhosa que você já aprovou. Ela se oculta 
        automaticamente quando a impressão é chamada.
        ========================================================================
      */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 sm:p-6 transition-opacity screen-only`} 
        onClick={onClose}
      >
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="w-full max-w-[1400px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-[1000] flex flex-col animate-in zoom-in-95 duration-200 h-full max-h-[95vh] overflow-hidden"
        >
          
          {/* CABEÇALHO UNIFICADO */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/50 rounded-t-2xl gap-4 xl:gap-0">
            
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Relatório Eclesiástico <span className="text-neutral-500 font-normal hidden md:inline">- Documento Oficial de Consulta</span>
                </h2>

                <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                    <button 
                        onClick={() => setActiveTab('FICHA')}
                        className={`px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'FICHA' ? 'bg-neutral-800 text-emerald-500 shadow-sm border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        <User className="w-4 h-4" /> Ficha Cadastral
                    </button>
                    <button 
                        onClick={() => setActiveTab('DOSSIE')}
                        className={`px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'DOSSIE' ? 'bg-neutral-800 text-emerald-500 shadow-sm border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        <Clock className="w-4 h-4" /> Histórico
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-3 relative self-end xl:self-auto">
              
              <div className="relative">
                <button onClick={() => setPrintMenuOpen(!printMenuOpen)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-500 rounded-lg transition-colors text-sm font-bold shadow-lg">
                  <Printer className="w-4 h-4" /> Exportar PDF <ChevronDown className="w-4 h-4 opacity-70" />
                </button>

                {printMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => handlePrint('FICHA')} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-500" /> Ficha Membro
                    </button>
                    <button onClick={() => handlePrint('DOSSIE')} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors flex items-center gap-2 border-t border-neutral-700/50">
                      <Clock className="w-4 h-4 text-cyan-500" /> Histórico Membro
                    </button>
                    <button onClick={() => handlePrint('AMBOS')} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors flex items-center gap-2 border-t border-neutral-700/50 bg-emerald-500/10 hover:bg-emerald-500/20">
                      <FileText className="w-4 h-4 text-emerald-500" /> Histórico Completo
                    </button>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-neutral-800 mx-1"></div>
              <button onClick={onClose} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-800 rounded-lg transition-colors bg-neutral-900 border border-neutral-800" title="Fechar Janela">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CORPO DE DADOS SCROLLÁVEL DA TELA */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-neutral-950/30 rounded-b-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-500">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-sm font-medium">Extraindo dados e consolidando Ficha...</p>
              </div>
            ) : (
              <>
                {/* ABA 1: A FICHA CADASTRAL DA TELA */}
                <div className={`${activeTab === 'FICHA' ? 'block' : 'hidden'}`}>
                  
                  <div className="grid grid-cols-12 gap-6 pb-6 border-b border-neutral-800 items-center mb-6">
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-white tracking-tight">{profile?.full_name}</h1>
                        <p className="text-sm text-neutral-400 font-medium mt-1">Visualização de Cadastro</p>
                        
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800">
                                <span className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Situação Financeira</span>
                                <div className="text-xs font-bold text-white">
                                    {profile?.financial_status === 'UP_TO_DATE' ? "🟢 Em Dia" : "🔴 Pendente"}
                                </div>
                            </div>
                            <div className="bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800">
                                <span className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Status Eclesiástico</span>
                                <div className={`text-xs font-bold ${getStatusColor(profile?.ecclesiastical_status)}`}>
                                    {profile?.ecclesiastical_status === 'ACTIVE' ? 'ATIVO' : profile?.ecclesiastical_status === 'OBSERVATION' ? 'OBSERVAÇÃO' : profile?.ecclesiastical_status === 'INACTIVE' ? 'INATIVO' : 'INAPTO'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 pl-0 mt-4 lg:mt-0">
                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-6"><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block flex items-center gap-1"><Church className="w-3 h-3 text-emerald-500"/> Igreja Atual</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white text-xs truncate">{profile?.church_name}</div></div>
                            <div className="col-span-6"><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block flex items-center gap-1"><Briefcase className="w-3 h-3 text-emerald-500"/> Cargo</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white text-xs truncate">{profile?.role_name}</div></div>
                            
                            <div className="col-span-4"><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block flex items-center gap-1"><Hash className="w-3 h-3 text-yellow-500"/> Matrícula</label><div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-yellow-500 font-mono text-center text-xs truncate">{profile?.registration_number}</div></div>
                            <div className="col-span-4"><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-500"/> Batismo</label><div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-center text-xs truncate">{formatDate(profile?.baptism_date)}</div></div>
                            <div className="col-span-4"><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Tempo</label><div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-cyan-500 font-bold text-xs border-l-2 border-l-cyan-500/50 truncate">{calculateTimeBaptized(profile?.baptism_date)}</div></div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-2 flex justify-end pr-4">
                        <div className="w-32 h-32 rounded-full bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center relative overflow-hidden shadow-xl">
                            {profile?.photo_url ? (<img src={profile.photo_url} alt="Foto" className="w-full h-full object-cover" />) : (<div className="flex flex-col items-center gap-1 text-neutral-500"><User className="w-8 h-8" /><span className="text-[10px] font-bold uppercase">Sem Foto</span></div>)}
                        </div>
                    </div>
                  </div>

                  {/* FORMULÁRIO ESPELHADO DA TELA */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-4"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Nome Completo</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.full_name}</div></div>
                        <div className="col-span-6 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Data Nasc.</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white text-center">{formatDate(profile?.birth_date)}</div></div>
                        <div className="col-span-6 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Sexo</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white text-center">{profile?.gender || "---"}</div></div>
                        <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Estado Civil</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white">{profile?.civil_status || "---"}</div></div>
                        <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Profissão</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.profession || "---"}</div></div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-4"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">E-mail</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.email || "---"}</div></div>
                        <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Telefone</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white">{profile?.phone || "---"}</div></div>
                        <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Naturalidade</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.nationality_city ? `${profile.nationality_city} / ${profile.nationality_state}` : "---"}</div></div>
                        <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Escolaridade</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.schooling || "---"}</div></div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">CPF</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white">{profile?.cpf || "---"}</div></div>
                        <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">RG</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white">{profile?.rg || "---"}</div></div>
                        <div className="col-span-6 md:col-span-1"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Órgão</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white uppercase text-center">{profile?.rg_issuer || "---"}</div></div>
                        <div className="col-span-6 md:col-span-1"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">UF</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white uppercase text-center">{profile?.rg_state || "--"}</div></div>
                        <div className="col-span-12 md:col-span-4"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Igreja de Origem</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.origin_church || "---"}</div></div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Nome da Mãe</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.mother_name || "---"}</div></div>
                        <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Nome do Pai</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.father_name || "---"}</div></div>
                        <div className="col-span-12 md:col-span-4"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Cônjuge</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.spouse_name || "---"}</div></div>
                        <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Casamento</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white text-center">{formatDate(profile?.marriage_date)}</div></div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">CEP</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white">{profile?.zip_code || "---"}</div></div>
                        <div className="col-span-12 md:col-span-8"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Endereço Completo</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.address || "---"}</div></div>
                        <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Número</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white">{profile?.number || "---"}</div></div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-5"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Bairro</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.neighborhood || "---"}</div></div>
                        <div className="col-span-12 md:col-span-5"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">Cidade</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white truncate">{profile?.city || "---"}</div></div>
                        <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-neutral-400 font-bold pl-1 mb-1 block">UF</label><div className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white uppercase text-center">{profile?.state || "--"}</div></div>
                    </div>
                  </div>
                </div>

                {/* ABA 2: O DOSSIÊ DA TELA */}
                <div className={`${activeTab === 'DOSSIE' ? 'block' : 'hidden'}`}>
                  {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2 text-neutral-500 text-center">
                      <Clock className="w-10 h-10 opacity-20" />
                      <p className="text-sm font-medium">Nenhum evento registrado no histórico.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-neutral-800 ml-4 space-y-10 py-2">
                      {events.map((event) => {
                        const style = getEventStyle(event.event_type);
                        return (
                          <div key={event.id} className="relative pl-8">
                            <div className={`absolute -left-5 top-0 w-10 h-10 rounded-full border-4 border-neutral-900 flex items-center justify-center shadow-lg ${style.bg} ${style.border}`}>
                              {style.icon}
                            </div>
                            <div className="flex flex-col gap-2 pt-1">
                              <span className="text-xs font-black text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                                {formatDateTime(event.created_at)}
                                <span className={`px-2 py-0.5 rounded text-[9px] ${style.bg} ${style.border} border`}>{event.event_type}</span>
                              </span>
                              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-md">
                                <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}