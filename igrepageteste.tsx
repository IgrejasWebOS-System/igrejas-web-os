import { createClient } from "@/utils/supabase/server";
import { Plus, Search, Building2, Map, MoreHorizontal, MapPin } from "lucide-react";
import Link from "next/link";

export default async function ChurchesPage() {
  const supabase = await createClient();

  // 1. Busca Igrejas com o nome do Setor (JOIN)
  const { data: churches, error } = await supabase
    .from("churches")
    .select(`
      *,
      sectors (
        name
      )
    `)
    .order("name", { ascending: true });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Rede de Igrejas</h1>
          <p className="text-neutral-400">Gerencie as congregações e setores da sua organização.</p>
        </div>
        
        <div className="flex gap-2">
            {/* Botão Novo Setor (Secundário) */}
            <button 
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-neutral-700"
            >
              <Map className="w-4 h-4" />
              Novo Setor
            </button>

            {/* Botão Nova Igreja (Primário) */}
            <Link 
              href="/dashboard/igrejas/nova"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Plus className="w-4 h-4" />
              Nova Igreja
            </Link>
        </div>
      </div>

      {/* BARRA DE BUSCA E FILTROS */}
      <div className="flex items-center gap-4 bg-neutral-900/50 p-1 rounded-xl border border-neutral-800 w-full max-w-md">
        <div className="pl-3 text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nome ou setor..." 
          className="bg-transparent border-none text-sm text-neutral-200 placeholder-neutral-600 w-full focus:ring-0"
        />
      </div>

      {/* TABELA DE DADOS */}
      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4 font-medium text-neutral-400">Nome da Igreja</th>
              <th className="px-6 py-4 font-medium text-neutral-400">Setor Responsável</th>
              <th className="px-6 py-4 font-medium text-neutral-400">Localização</th>
              <th className="px-6 py-4 font-medium text-neutral-400 text-right">Ações</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-800">
            {churches?.map((church: any) => (
              <tr key={church.id} className="group hover:bg-neutral-800/30 transition-colors">
                
                {/* Coluna Nome */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-emerald-500 border border-neutral-700">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-200">{church.name}</div>
                      <div className="text-xs text-neutral-500">ID: {church.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>

                {/* Coluna Setor */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                    <Map className="w-3 h-3 text-neutral-500" />
                    {church.sectors?.name || "Sem Setor"}
                  </span>
                </td>

                {/* Coluna Localização (Simulada se não tiver no banco ainda) */}
                <td className="px-6 py-4 text-neutral-400">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {church.city || "Não informada"} - {church.state || "UF"}
                    </div>
                </td>

                {/* Coluna Ações */}
                <td className="px-6 py-4 text-right">
                  <button className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-2 hover:bg-neutral-800 rounded-md">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}

            {(!churches || churches.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center gap-3">
                    <Building2 className="w-10 h-10 text-neutral-700" />
                    <p>Nenhuma igreja cadastrada ainda.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}