import { createClient } from "@/utils/supabase/server";
import { Users, ArrowLeft, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { definirLideranca } from "./actions"; // Importa o motor backend

export default async function DefinirLiderancaPage() {
  const supabase = await createClient();

  // 1. Busca os Setores já cadastrados (já temos 15 setores do seu seed)
  const { data: setores } = await supabase
    .from('sectors')
    .select('id, name')
    .order('name');

  // 2. Busca apenas as Igrejas que AINDA NÃO SÃO Líderes
  const { data: igrejas } = await supabase
    .from('churches')
    .select('id, name')
    .eq('is_mother_church', false)
    .order('name');

  // Trava Visual: Se não houver Setor cadastrado, a tela avisa o usuário.
  const isPrerequisiteMet = setores && setores.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-10">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-5">
        <Link href="/dashboard/admin/setores-lideranca" className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shadow-sm">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Definir Líder de Setor</h1>
          <p className="text-sm text-neutral-400 font-medium">Nomeie uma congregação como administradora (Igreja-Mãe).</p>
        </div>
      </div>

      {!isPrerequisiteMet ? (
        // ALERTA DE PRÉ-REQUISITO
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
          <p className="text-amber-500 font-bold mb-2">⚠️ Pré-requisito Obrigatório</p>
          <p className="text-sm text-amber-500/80 mb-4">Para definir uma Liderança, você precisa primeiro ter <b>Setores</b> cadastrados no sistema.</p>
          <Link href="/dashboard/igrejas/setores/novo?origem=configuracoes" className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-colors">
            Cadastrar Setor Agora
          </Link>
        </div>
      ) : (
        // FORMULÁRIO DE DEFINIÇÃO
        <form action={definirLideranca} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm space-y-6">
          
          <div className="space-y-6">
            
            {/* SELEÇÃO DA IGREJA */}
            <div className="space-y-2">
              <label htmlFor="church_id" className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Selecione a Congregação <span className="text-red-500">*</span>
              </label>
              <select
                id="church_id"
                name="church_id"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="">-- Escolha uma Igreja --</option>
                {igrejas && igrejas.length > 0 ? (
                  igrejas.map((igreja) => (
                    <option key={igreja.id} value={igreja.id}>
                      {igreja.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhuma congregação disponível</option>
                )}
              </select>
              <p className="text-xs text-neutral-500 font-medium">Apenas igrejas sem função de liderança atual aparecem nesta lista.</p>
            </div>

            {/* SELEÇÃO DO SETOR */}
            <div className="space-y-2">
              <label htmlFor="sector_id" className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Qual Setor ela vai administrar? <span className="text-red-500">*</span>
              </label>
              <select
                id="sector_id"
                name="sector_id"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="">-- Escolha um Setor --</option>
                {setores?.map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 font-medium">A congregação passará a ser a Igreja-Mãe (Nível 3) deste Setor.</p>
            </div>

          </div>

          <hr className="border-neutral-800" />

          {/* CONTROLES DE AÇÃO */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard/admin/setores-lideranca" className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors">
              CANCELAR
            </Link>
            <button
              type="submit"
              disabled={!igrejas || igrejas.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              <ArrowUpCircle className="w-4 h-4" />
              CONFIRMAR LIDERANÇA
            </button>
          </div>

        </form>
      )}
    </div>
  );
}