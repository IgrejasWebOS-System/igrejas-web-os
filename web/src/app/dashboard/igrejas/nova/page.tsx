"use client";

import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Building2, MapPin, Save, Loader2 } from "lucide-react";
import Link from "next/link";
// FUSÃO TÉCNICA: Importação absoluta blindada
import { createChurchAction } from "@/app/dashboard/igrejas/actions";
import { useFormStatus } from "react-dom";
import { useEffect, useState, use } from "react";

// Botão de Submit Isolado
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white p-3 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Cadastrar Igreja
        </>
      )}
    </button>
  );
}

// INJEÇÃO FUNCIONAL: Preparando a página para receber parâmetros de URL
interface PageProps {
  searchParams: Promise<{ origem?: string }>;
}

export default function NewChurchPage({ searchParams }: PageProps) {
  // Desempacotando a Promise do Next.js 15
  const resolvedParams = use(searchParams);
  const origem = resolvedParams.origem || 'igrejas';

  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca setores ao carregar a página
  useEffect(() => {
    async function fetchSectors() {
      const supabase = createClient();
      const { data } = await supabase
        .from("sectors")
        .select("id, name")
        .eq("status", "ACTIVE")
        .order("name");
      
      if (data) setSectors(data);
      setLoading(false);
    }
    fetchSectors();
  }, []);

  // Lógica dinâmica do botão voltar
  const backLink = origem === 'configuracoes' ? '/dashboard/configuracoes' : '/dashboard/igrejas';

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nova Igreja</h1>
          <p className="text-neutral-400">Cadastre uma nova congregação no sistema.</p>
        </div>
        <Link
          href={backLink}
          className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* FORMULÁRIO */}
      <form action={createChurchAction} className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 md:p-8 space-y-6">
        
        {/* INJEÇÃO FUNCIONAL: Campo oculto para viajar até o servidor */}
        <input type="hidden" name="origem" value={origem} />

        {/* SEÇÃO 1: IDENTIFICAÇÃO */}
        <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">Identificação</h2>
            
            {/* Nome da Igreja */}
            <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                <Building2 className="w-3 h-3 text-emerald-500" /> Nome da Congregação
            </label>
            <input
                name="name"
                type="text"
                required
                placeholder="Ex: AD Central, Congregação Vale da Bênção..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            />
            </div>

            {/* Setor Responsável */}
            <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                <MapPin className="w-3 h-3 text-emerald-500" /> Setor Responsável
            </label>
            <div className="relative">
                <select
                name="sector_id"
                required
                defaultValue=""
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white appearance-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                >
                <option value="" disabled>
                    {loading ? "Carregando setores..." : "Selecione um Setor..."}
                </option>
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

        {/* SEÇÃO 2: LOCALIZAÇÃO (Novos Campos Injetados) */}
        <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">Localização</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CEP */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-emerald-500" /> CEP
                    </label>
                    <input
                        name="zip_code"
                        type="text"
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                {/* Bairro */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Bairro</label>
                    <input
                        name="neighborhood"
                        type="text"
                        placeholder="Ex: Centro, Jd. Primavera"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Cidade (Ocupa 2/3) */}
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Cidade</label>
                    <input
                        name="city"
                        type="text"
                        placeholder="Ex: Piracicaba"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                
                {/* Estado (Ocupa 1/3) */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">UF</label>
                    <input
                        name="state"
                        type="text"
                        maxLength={2}
                        placeholder="SP"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all uppercase"
                    />
                </div>
            </div>
        </div>

        {/* Botão Salvar */}
        <div className="pt-4 border-t border-neutral-800">
          <SubmitButton />
        </div>

      </form>
    </div>
  );
}