"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2, Trash2, Network, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { addSettingAction, deleteSettingAction } from "../actions";

export default function DepartamentosConfigPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // INJEÇÃO FUNCIONAL: Estado para armazenar o crachá do usuário (RLS Visual)
  const [userRole, setUserRole] = useState("GUEST");

  const TABLE_NAME = "departments";

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const supabase = createClient();

    // 1. Busca a patente do usuário ativo (RLS Visual)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single();
      if (roleData) setUserRole(roleData.role);
    }

    // 2. Busca os dados da tabela
    const { data } = await supabase.from(TABLE_NAME).select("*").order("name");
    if (data) setItems(data);
    
    setLoading(false);
  }

  // REGRA DE OURO DA GOVERNANÇA: Apenas a alta cúpula pode modificar
  const canManage = ['MASTER', 'CAMPO', 'SEDE'].includes(userRole);

  async function handleAdd(formData: FormData) {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    setError("");
    formData.append("table", TABLE_NAME);
    
    const result = await addSettingAction(formData);
    
    // Fallback para tipagem estrita
    if (result && !result.success) {
        setError(result.message || "Ocorreu um erro ao processar a solicitação.");
    } else {
        setNewName("");
        await fetchItems();
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Atenção: Tem certeza que deseja excluir este departamento do sistema?")) return;
    const formData = new FormData();
    formData.append("table", TABLE_NAME);
    formData.append("id", id);
    await deleteSettingAction(formData);
    await fetchItems();
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* NAVEGAÇÃO SUPERIOR */}
      <div className="mb-2">
        <Link href="/dashboard/configuracoes" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-emerald-500 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Voltar para Configurações
        </Link>
      </div>

      {/* PAINEL DE ERRO */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* NOVO LAYOUT: CABEÇALHO + FORMULÁRIO NA MESMA LINHA (TOP BAR INLINE) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* ESQUERDA: Ícone e Título */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-emerald-500 shadow-sm">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              DEPARTAMENTOS
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${canManage ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                Acesso: {userRole}
              </span>
            </h1>
          </div>
        </div>

        {/* DIREITA: Input e Botão Cadastrar (Protegido por RLS) */}
        {canManage ? (
            <form action={handleAdd} className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Ex: CIBEPI, JOVENS, EBD..." 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    className="w-full sm:w-80 bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium uppercase placeholder:normal-case placeholder:text-neutral-700"
                    required
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newName.trim()} 
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 uppercase"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "CADASTRAR"}
                </button>
            </form>
        ) : (
            <div className="flex items-center justify-center gap-3 bg-red-950/20 border border-red-900/50 rounded-xl py-3 px-6 w-full lg:w-auto">
                <Lock className="w-5 h-5 text-red-500" />
                <span className="text-sm font-bold text-red-400 uppercase tracking-wide">Acesso Restrito: Somente Leitura</span>
            </div>
        )}
      </div>

      {/* TABELA DE LISTAGEM */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        {loading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">Sincronizando Banco...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800">
                      <tr>
                          <th className="px-6 py-4 tracking-wider">Descrição do Registro</th>
                          <th className="px-6 py-4 text-right tracking-wider">Ação</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                      {items.length === 0 ? (
                          <tr><td colSpan={2} className="px-6 py-10 text-center text-neutral-500 font-medium">Nenhum registro encontrado.</td></tr>
                      ) : (
                          items.map((item) => (
                              <tr key={item.id} className="hover:bg-neutral-800/80 transition-colors group">
                                  <td className="px-6 py-4 font-bold text-neutral-200 uppercase tracking-wide">
                                      {item.name}
                                  </td>
                                  <td className="px-6 py-4 text-right w-20">
                                      {/* INJEÇÃO FUNCIONAL: Botão de excluir escondido para não administradores */}
                                      {canManage ? (
                                        <button 
                                          onClick={() => handleDelete(item.id)} 
                                          className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-800 rounded-lg transition-colors inline-flex items-center justify-center"
                                          title="Excluir Registro"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                      ) : (
                                        <span className="text-neutral-600"><Lock className="w-4 h-4 inline" /></span>
                                      )}
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
}