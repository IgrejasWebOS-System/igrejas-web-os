"use client";

import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Building2, MapPin, Save, Loader2, Trash2, Archive, AlertTriangle } from "lucide-react";
import Link from "next/link";
// FUSÃO TÉCNICA: Importação combinada das ações (Update + Archive)
import { updateChurchAction, archiveChurchAction } from "@/app/dashboard/igrejas/actions"; 
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Botão Salvar (Azul) - Mantido do Original
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white p-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Atualizando...
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Salvar Alterações
        </>
      )}
    </button>
  );
}

// FUSÃO TÉCNICA: Botão Arquivar (Vermelho) - Injetado
function ArchiveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 hover:border-red-500/50"
      onClick={(e) => {
        if (!confirm("Tem certeza? Esta igreja será movida para o Arquivo Morto e não aparecerá mais na lista.")) {
          e.preventDefault();
        }
      }}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
      Arquivar Igreja
    </button>
  );
}

export default function EditChurchPage() {
  const params = useParams();
  const churchId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<any[]>([]);
  const [church, setChurch] = useState<any>(null);

  // Busca Dados Iniciais (Mantido igual)
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // 1. Busca Setores
      const { data: sectorsData } = await supabase
        .from("sectors")
        .select("id, name")
        .eq("status", "ACTIVE")
        .order("name");
      
      if (sectorsData) setSectors(sectorsData);

      // 2. Busca Dados da Igreja Atual
      const { data: churchData, error } = await supabase
        .from("churches")
        .select("*")
        .eq("id", churchId)
        .single();

      if (error) {
        console.error("Erro ao buscar igreja:", error);
      } else {
        setChurch(churchData);
      }

      setLoading(false);
    }
    fetchData();
  }, [churchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-neutral-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Carregando dados da igreja...</span>
      </div>
    );
  }

  if (!church) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-400 gap-4">
        <Building2 className="w-12 h-12 opacity-20" />
        <p>Igreja não encontrada ou removida.</p>
        <Link href="/dashboard/igrejas" className="text-emerald-500 hover:underline">Voltar para lista</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Editar Igreja</h1>
          <p className="text-neutral-400">Atualize os dados ou arquive o registro.</p>
        </div>
        <Link
          href="/dashboard/igrejas"
          className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* FORMULÁRIO DE EDIÇÃO (Estrutura Visual Imutável do Arquivo A) */}
      <form action={updateChurchAction} className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 md:p-8 space-y-6">
        
        {/* CAMPO OCULTO: ID DA IGREJA */}
        <input type="hidden" name="id" value={church.id} />

        {/* SEÇÃO 1: IDENTIFICAÇÃO */}
        <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">Identificação</h2>
            
            <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                <Building2 className="w-3 h-3 text-blue-500" /> Nome da Congregação
            </label>
            <input
                name="name"
                type="text"
                required
                defaultValue={church.name}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            </div>

            <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                <MapPin className="w-3 h-3 text-blue-500" /> Setor Responsável
            </label>
            <div className="relative">
                <select
                name="sector_id"
                required
                defaultValue={church.sector_id}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                >
                {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                    {sector.name}
                    </option>
                ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            </div>
        </div>

        {/* SEÇÃO 2: LOCALIZAÇÃO */}
        <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">Localização</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-blue-500" /> CEP
                    </label>
                    <input
                        name="zip_code"
                        type="text"
                        defaultValue={church.zip_code || ""}
                        maxLength={9}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Bairro</label>
                    <input
                        name="neighborhood"
                        type="text"
                        defaultValue={church.neighborhood || ""}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Cidade</label>
                    <input
                        name="city"
                        type="text"
                        defaultValue={church.city || ""}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">UF</label>
                    <input
                        name="state"
                        type="text"
                        maxLength={2}
                        defaultValue={church.state || ""}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all uppercase"
                    />
                </div>
            </div>
        </div>

        {/* Botão Salvar */}
        <div className="pt-4 border-t border-neutral-800">
          <SubmitButton />
        </div>

      </form>

      {/* FUSÃO TÉCNICA: ZONA DE PERIGO (Injetado) */}
      <div className="border border-red-900/30 bg-red-950/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-red-500 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Zona de Perigo
          </h3>
          <p className="text-xs text-red-400/60 mt-1">
            Arquivar remove esta igreja das listas ativas, mas mantém o histórico.
          </p>
        </div>
        
        {/* Formulário independente para evitar conflito de submit */}
        <form action={archiveChurchAction}>
          <input type="hidden" name="id" value={church.id} />
          <ArchiveButton />
        </form>
      </div>

    </div>
  );
}