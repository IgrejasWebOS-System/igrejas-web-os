import { createClient } from "@/utils/supabase/server";
import { Building2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CamposPage() {
  // Inicializa o cliente do Supabase no lado do Servidor
  const supabase = await createClient();
  
  // Busca os campos cadastrados no banco de dados (se houver)
  const { data: ministries, error } = await supabase
    .from('ministries')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      
      {/* CABEÇALHO COM BOTÃO DE VOLTAR */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-500 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Campos / Ministérios</h1>
            <p className="text-sm text-neutral-400 font-medium">Gestão de instâncias superiores do sistema.</p>
          </div>
        </div>
        
        <Link href="/dashboard/admin/campos/novo" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg">
          <Plus className="w-4 h-4" />
          NOVO CAMPO
        </Link>
      </div>

      {/* LISTAGEM DE CAMPOS (Data Table) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        {ministries && ministries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="bg-neutral-950/50 text-neutral-300 font-semibold uppercase text-xs border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Nome do Campo</th>
                  <th className="px-6 py-4">ID de Registro</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {ministries.map((ministry) => (
                  <tr key={ministry.id} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-200">{ministry.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">{ministry.id}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/admin/campos/${ministry.id}`} className="text-emerald-500 hover:text-emerald-400 font-medium text-xs uppercase">
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
              <Building2 className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-200 mb-1 tracking-tight">Nenhum Campo Cadastrado</h3>
            <p className="text-neutral-400 text-sm max-w-sm">
              O sistema ainda não possui instâncias superiores (Ministérios) cadastradas. Clique no botão acima para registrar o primeiro Campo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}