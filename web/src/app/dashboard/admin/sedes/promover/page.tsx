import { createClient } from "@/utils/supabase/server";
import { Map, ArrowLeft, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { promoverSede } from "./actions"; // Importa o motor backend

export default async function PromoverSedePage() {
  const supabase = await createClient();

  // 1. Busca os Campos (Ministérios) já cadastrados para o vínculo
  const { data: campos } = await supabase
    .from('ministries')
    .select('id, name')
    .order('name');

  // 2. Busca apenas as Igrejas que AINDA NÃO SÃO sedes para a promoção
  const { data: igrejas } = await supabase
    .from('churches')
    .select('id, name')
    .eq('is_headquarters', false)
    .order('name');

  // Trava Visual: Se não houver campo cadastrado, a tela avisa o usuário.
  const isPrerequisiteMet = campos && campos.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-10">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-5">
        <Link href="/dashboard/admin/sedes" className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shadow-sm">
          <Map className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Promover Igreja a Sede</h1>
          <p className="text-sm text-neutral-400 font-medium">Eleve uma congregação existente ao status de Sede Regional.</p>
        </div>
      </div>

      {!isPrerequisiteMet ? (
        // ALERTA DE PRÉ-REQUISITO (Bloqueia o formulário se não existir Campo)
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
          <p className="text-amber-500 font-bold mb-2">⚠️ Pré-requisito Obrigatório</p>
          <p className="text-sm text-amber-500/80 mb-4">Para promover uma igreja a Sede, você precisa primeiro ter criado pelo menos um <b>Campo / Ministério</b>.</p>
          <Link href="/dashboard/admin/campos/novo" className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-colors">
            Cadastrar Campo Agora
          </Link>
        </div>
      ) : (
        // FORMULÁRIO DE PROMOÇÃO
        <form action={promoverSede} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm space-y-6">
          
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
              <p className="text-xs text-neutral-500 font-medium">Apenas igrejas que ainda não são Sedes aparecem nesta lista.</p>
            </div>

            {/* SELEÇÃO DO CAMPO */}
            <div className="space-y-2">
              <label htmlFor="ministry_id" className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Vincular a qual Campo/Ministério? <span className="text-red-500">*</span>
              </label>
              <select
                id="ministry_id"
                name="ministry_id"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="">-- Escolha um Campo --</option>
                {campos?.map((campo) => (
                  <option key={campo.id} value={campo.id}>
                    {campo.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 font-medium">Esta Sede responderá administrativamente a este Campo.</p>
            </div>

          </div>

          <hr className="border-neutral-800" />

          {/* CONTROLES DE AÇÃO */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard/admin/sedes" className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors">
              CANCELAR
            </Link>
            <button
              type="submit"
              disabled={!igrejas || igrejas.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              <ArrowUpCircle className="w-4 h-4" />
              EFETIVAR PROMOÇÃO
            </button>
          </div>

        </form>
      )}
    </div>
  );
}