import { Building2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createCampo } from "./actions"; // Importação do nosso Motor Backend

export default function NovoCampoPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-10">
      
      {/* CABEÇALHO COM BOTÃO DE VOLTAR */}
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-5">
        <Link href="/dashboard/admin/campos" className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shadow-sm">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Novo Campo / Ministério</h1>
          <p className="text-sm text-neutral-400 font-medium">Cadastre uma nova instância superior no sistema.</p>
        </div>
      </div>

      {/* FORMULÁRIO DE INSERÇÃO VINCULADO À SERVER ACTION */}
      <form action={createCampo} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm space-y-6">
        
        {/* GRUPO DE INPUTS */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
              Nome Oficial do Campo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex: Assembleia de Deus Piracicaba Madureira"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-neutral-600"
            />
            <p className="text-xs text-neutral-500 font-medium">
              Este nome será a raiz da árvore hierárquica e englobará as Sedes, Setores e Igrejas Locais.
            </p>
          </div>
        </div>

        <hr className="border-neutral-800" />

        {/* CONTROLES DE AÇÃO */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/admin/campos" className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors">
            CANCELAR
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95"
          >
            <Save className="w-4 h-4" />
            SALVAR CAMPO
          </button>
        </div>

      </form>
    </div>
  );
}