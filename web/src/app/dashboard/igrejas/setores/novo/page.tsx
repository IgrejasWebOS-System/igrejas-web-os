"use client"; // FUSÃO TÉCNICA: Transformado em Client Component para feedback visual

import { ArrowLeft, Map, Save, Loader2 } from "lucide-react";
import Link from "next/link";
// FUSÃO TÉCNICA: Importação absoluta blindada
import { createSectorAction } from "@/app/dashboard/igrejas/actions";
import { useFormStatus } from "react-dom";
import { use } from "react";

// Componente do Botão de Submit isolado para usar o hook useFormStatus
// Necessário para acessar o estado 'pending' do formulário pai
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
          Criar Setor
        </>
      )}
    </button>
  );
}

// INJEÇÃO FUNCIONAL: Preparando a página para receber parâmetros de URL
interface PageProps {
  searchParams: Promise<{ origem?: string }>;
}

export default function NewSectorPage({ searchParams }: PageProps) {
  // Desempacotando a Promise do Next.js 15
  const resolvedParams = use(searchParams);
  const origem = resolvedParams.origem || 'igrejas';

  // Lógica dinâmica do botão voltar
  const backLink = origem === 'configuracoes' ? '/dashboard/configuracoes' : '/dashboard/igrejas';

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Novo Setor</h1>
          <p className="text-neutral-400">Crie uma nova divisão administrativa.</p>
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
      {/* O action aponta para a Server Action importada */}
      <form action={createSectorAction} className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 md:p-8 space-y-6">
        
        {/* INJEÇÃO FUNCIONAL: Campo oculto para viajar até o servidor */}
        <input type="hidden" name="origem" value={origem} />

        {/* Nome do Setor */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
            <Map className="w-3 h-3 text-emerald-500" /> Identificação do Setor
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Ex: Setor 01 - Sede, Setor 02 - Norte..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
          <p className="text-[10px] text-neutral-500">
            * O nome deve ser único para facilitar a organização.
          </p>
        </div>

        {/* Botão Salvar com Feedback */}
        <div className="pt-4 border-t border-neutral-800">
          <SubmitButton />
        </div>

      </form>
    </div>
  );
}