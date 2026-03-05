import { createClient } from "@/utils/supabase/server";
import { Users, Plus, ArrowLeft, Church } from "lucide-react";
import Link from "next/link";

export default async function SetoresLiderancaPage() {
  // Inicializa o cliente do Supabase no lado do Servidor
  const supabase = await createClient();
  
  // Busca as igrejas Líderes. 
  // CORREÇÃO: Uso de Disambiguation (!churches_sector_id_fkey) para evitar conflito com a Sede.
  const { data: lideres, error } = await supabase
    .from('churches')
    .select(`
      id, 
      name, 
      sector_id,
      sector_info:sectors!churches_sector_id_fkey ( name )
    `)
    .eq('is_mother_church', true)
    .order('name');

  if (error) {
    console.error("Erro ao buscar Líderes de Setor:", error.message);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      
      {/* CABEÇALHO COM BOTÃO DE VOLTAR */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-500 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Líderes de Setor</h1>
            <p className="text-sm text-neutral-400 font-medium">Gestão das Igrejas-Mãe responsáveis pela administração dos Setores.</p>
          </div>
        </div>
        
        {/* BOTÃO PARA ABRIR O FORMULÁRIO DE DEFINIÇÃO */}
        <Link href="/dashboard/admin/setores-lideranca/definir" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg">
          <Plus className="w-4 h-4" />
          DEFINIR LÍDER DE SETOR
        </Link>
      </div>

      {/* LISTAGEM DE LÍDERES (Data Table) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        {lideres && lideres.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="bg-neutral-950/50 text-neutral-300 font-semibold uppercase text-xs border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Igreja-Mãe (Administradora)</th>
                  <th className="px-6 py-4">Setor Sob Comando</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {lideres.map((lider) => (
                  <tr key={lider.id} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-200 flex items-center gap-2">
                        <Church className="w-4 h-4 text-emerald-500/70" />
                        {lider.name}
                    </td>
                    <td className="px-6 py-4">
                        {/* Acesso ao objeto aninhado usando o alias seguro */}
                        {lider.sector_info ? (
                          <span className="bg-neutral-800 px-2 py-1 rounded text-xs font-bold text-neutral-300">
                            {/* @ts-ignore */}
                            {lider.sector_info.name}
                          </span>
                        ) : (
                          <span className="text-neutral-500 italic text-xs">Setor não identificado</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/admin/setores-lideranca/${lider.id}`} className="text-emerald-500 hover:text-emerald-400 font-medium text-xs uppercase">
                        Gerenciar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ESTADO VAZIO (Empty State) */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-neutral-800/50 border border-neutral-700 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-200 mb-1 tracking-tight">Nenhuma Liderança Definida</h3>
            <p className="text-neutral-400 text-sm max-w-sm">
              Nenhuma igreja foi designada como administradora de Setor (Igreja-Mãe) até o momento. Clique no botão acima para definir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}