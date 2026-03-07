"use client";

import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Building2, MapPin, Save, Loader2, List, User, Phone, Hash } from "lucide-react";
import Link from "next/link";
import { createChurchAction } from "@/app/dashboard/igrejas/actions";
import { useFormStatus } from "react-dom";
import { useEffect, useState, use } from "react";

// Botão de Submit Refatorado
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-emerald-900/20"
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

// Utilitário de Máscara de Telefone Enterprise (+55) (Auto-Limpante)
const maskPhoneEnterprise = (value: string) => {
  if (!value) return "";
  let v = value.replace(/\D/g, ""); 
  
  // Impede duplicação do 55 caso o usuário tente digitar
  if (v.startsWith("55")) v = v.slice(2);
  if (v.length > 11) v = v.slice(0, 11);
  
  if (v.length === 0) return "";
  if (v.length <= 2) return `+55 (${v}`;
  if (v.length <= 6) return `+55 (${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `+55 (${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `+55 (${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
};

interface PageProps {
  searchParams: Promise<{ origem?: string }>;
}

export default function NewChurchPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams);
  const origem = resolvedParams.origem || 'igrejas';

  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados Liderança (Para permitir preenchimento automático)
  const [pastorMatricula, setPastorMatricula] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [pastorPhone, setPastorPhone] = useState("");
  const [churchPhone, setChurchPhone] = useState("");

  // Estados do ViaCEP + Novos Campos de Banco
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

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

  // Motor de Autocomplete do ViaCEP
  const buscarCep = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, '');
    setCep(cepLimpo);
    
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress(data.logradouro);
          setNeighborhood(data.bairro);
          setCity(data.localidade);
          setState(data.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  // 🔥 INJEÇÃO FUNCIONAL: Motor de Busca Dupla de Membros (Matrícula ou Nome)
  const buscarPastor = async (tipo: 'matricula' | 'nome', valor: string) => {
    if (!valor || valor.trim() === "") return;
    
    const supabase = createClient();
    let query = supabase.from('members').select('matricula, full_name, phone');

    if (tipo === 'matricula') {
      query = query.eq('matricula', valor);
    } else {
      // Busca por nome (insensível a maiúsculas/minúsculas)
      query = query.ilike('full_name', `%${valor}%`);
    }

    // Pega o primeiro resultado correspondente
    const { data, error } = await query.limit(1).maybeSingle();

    if (data && !error) {
      // Preenche os campos automaticamente
      if (tipo === 'matricula') setPastorName(data.full_name || "");
      if (tipo === 'nome') setPastorMatricula(data.matricula || "");
      if (data.phone) setPastorPhone(maskPhoneEnterprise(data.phone));
      
      // Salto Tático: Achou? Pula direto para o telefone para confirmar
      document.getElementsByName('pastor_phone')[0]?.focus();
    } else {
      // Não achou? Pula para o próximo campo vazio naturalmente
      if (tipo === 'matricula') document.getElementsByName('pastor_name')[0]?.focus();
      if (tipo === 'nome') document.getElementsByName('pastor_phone')[0]?.focus();
    }
  };

  // Intercetor Inteligente de Teclado (Enter = Tab + Gatilhos de Busca)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
        e.preventDefault(); // Mata o evento nativo de Salvar a Igreja

        // 1. Gatilho de Busca por Matrícula
        if (target.name === 'pastor_matricula') {
          buscarPastor('matricula', target.value);
          return;
        }

        // 2. Gatilho de Busca por Nome
        if (target.name === 'pastor_name') {
          buscarPastor('nome', target.value);
          return;
        }

        // 3. Gatilho do CEP
        if (target.name === 'cep') {
          document.getElementsByName('address_number')[0]?.focus();
          return;
        }

        // Motor Genérico (Pulo normal para as outras caixas)
        const form = e.currentTarget;
        const focusableElements = Array.from(form.querySelectorAll('input, select, button')).filter(
          (el) => !el.hasAttribute('disabled') && el.getAttribute('type') !== 'hidden'
        );
        
        const index = focusableElements.indexOf(target);
        if (index > -1 && index < focusableElements.length - 1) {
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const backLink = origem === 'configuracoes' ? '/dashboard/configuracoes' : '/dashboard/igrejas';

  return (
    <form 
      action={createChurchAction} 
      onKeyDown={handleKeyDown} 
      className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8"
    >
      <input type="hidden" name="origem" value={origem} />

      {/* CABEÇALHO COM BOTÕES DE AÇÃO INLINE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nova Igreja</h1>
          <p className="text-neutral-400">Cadastre uma nova congregação no sistema.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Link
            href="/dashboard/igrejas"
            className="flex items-center gap-2 p-2 px-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white text-emerald-500 transition-colors text-xs font-bold uppercase whitespace-nowrap"
          >
            <List className="w-4 h-4" /> Listagem
          </Link>
          
          <SubmitButton />

          <Link
            href={backLink}
            className="flex items-center justify-center gap-2 p-2 px-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors text-xs font-bold uppercase whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      {/* BLOCO DE DADOS DA IGREJA */}
      <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 md:p-8 space-y-6">
        
        {/* SEÇÃO 1: IDENTIFICAÇÃO */}
        <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">Identificação</h2>
            
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

        {/* SEÇÃO 2: LIDERANÇA E CONTATO */}
        <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">Liderança e Contato</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* MATRÍCULA */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                        <Hash className="w-3 h-3 text-emerald-500" /> Matrícula
                    </label>
                    <input
                        name="pastor_matricula"
                        type="text"
                        value={pastorMatricula}
                        onChange={(e) => setPastorMatricula(e.target.value)}
                        placeholder="Ex: 12345"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                {/* PASTOR */}
                <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                        <User className="w-3 h-3 text-emerald-500" /> Pastor / Dirigente
                    </label>
                    <input
                        name="pastor_name"
                        type="text"
                        value={pastorName}
                        onChange={(e) => setPastorName(e.target.value)}
                        placeholder="Nome (Aperte Enter para buscar)"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                {/* TEL. DIRIGENTE */}
                <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                        <Phone className="w-3 h-3 text-emerald-500" /> Tel. Dirigente
                    </label>
                    <input
                        name="pastor_phone"
                        type="text"
                        value={pastorPhone}
                        onChange={(e) => setPastorPhone(maskPhoneEnterprise(e.target.value))}
                        maxLength={19}
                        placeholder="+55 (00) 00000-0000"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                {/* TEL. IGREJA */}
                <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                        <Phone className="w-3 h-3 text-emerald-500" /> Tel. Igreja
                    </label>
                    <input
                        name="church_phone"
                        type="text"
                        value={churchPhone}
                        onChange={(e) => setChurchPhone(maskPhoneEnterprise(e.target.value))}
                        maxLength={19}
                        placeholder="+55 (00) 0000-0000"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>
        </div>

        {/* SEÇÃO 3: LOCALIZAÇÃO */}
        <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">Localização</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-emerald-500" /> CEP
                    </label>
                    <input
                        name="cep"
                        type="text"
                        value={cep}
                        onChange={(e) => buscarCep(e.target.value)}
                        maxLength={9}
                        placeholder="00000-000"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-7 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Endereço (Logradouro)</label>
                    <input
                        name="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Número</label>
                    <input
                        name="address_number"
                        type="text"
                        placeholder="Ex: 123"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Complemento</label>
                    <input
                        name="address_complement"
                        type="text"
                        placeholder="Bloco, Sala..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Bairro</label>
                    <input
                        name="neighborhood"
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Ex: Centro"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                
                <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Cidade</label>
                    <input
                        name="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: Piracicaba"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">UF</label>
                    <input
                        name="state"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        maxLength={2}
                        placeholder="SP"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all uppercase"
                    />
                </div>
            </div>
        </div>
      </div>
    </form>
  );
}