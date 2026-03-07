"use client";

import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Building2, MapPin, Save, Loader2, Archive, AlertTriangle, List, User, Phone, Hash } from "lucide-react";
import Link from "next/link";
import { updateChurchAction, archiveChurchAction } from "@/app/dashboard/igrejas/actions"; 
import { useFormStatus } from "react-dom";
import { useEffect, useState, use } from "react";

// Botão Salvar (Azul) - Padrão Inline
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-900/20"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Atualizando...
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Salvar Alterações
        </>
      )}
    </button>
  );
}

// Botão Arquivar (Vermelho)
function ArchiveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 hover:border-red-500/50"
      onClick={(e) => {
        if (!confirm("Tem certeza? Esta igreja será movida para o Arquivo Morto e não aparecerá mais na lista.")) {
          e.preventDefault();
        }
      }}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
      Arquivar Igreja
    </button>
  );
}

// Utilitário de Máscara de Telefone Enterprise (+55)
const maskPhoneEnterprise = (value: string) => {
  if (!value) return "";
  let v = value.replace(/\D/g, ""); 
  
  if (v.startsWith("55")) v = v.slice(2);
  if (v.length > 11) v = v.slice(0, 11);
  
  if (v.length === 0) return "";
  if (v.length <= 2) return `+55 (${v}`;
  if (v.length <= 6) return `+55 (${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `+55 (${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `+55 (${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditChurchPage({ params }: PageProps) {
  // Desempacotando a Promise do params (Padrão Next 15)
  const resolvedParams = use(params);
  const churchId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<any[]>([]);
  const [church, setChurch] = useState<any>(null);

  // Estados Liderança
  const [pastorMatricula, setPastorMatricula] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [pastorPhone, setPastorPhone] = useState("");
  const [churchPhone, setChurchPhone] = useState("");

  // Estados Localização
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Busca Dados Iniciais
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: sectorsData } = await supabase
        .from("sectors")
        .select("id, name")
        .eq("status", "ACTIVE")
        .order("name");
      
      if (sectorsData) setSectors(sectorsData);

      const { data: churchData, error } = await supabase
        .from("churches")
        .select("*")
        .eq("id", churchId)
        .single();

      if (error) {
        console.error("Erro ao buscar igreja:", error);
      } else if (churchData) {
        setChurch(churchData);
        
        // Povoamento dos estados para edição (Se vierem nulos, fica vazio)
        setPastorMatricula(churchData.pastor_matricula || "");
        setPastorName(churchData.pastor_name || "");
        setPastorPhone(maskPhoneEnterprise(churchData.pastor_phone));
        setChurchPhone(maskPhoneEnterprise(churchData.church_phone));
        
        setCep(churchData.zip_code || "");
        setAddress(churchData.address || "");
        setAddressNumber(churchData.address_number || "");
        setAddressComplement(churchData.address_complement || "");
        setNeighborhood(churchData.neighborhood || "");
        setCity(churchData.city || "");
        setState(churchData.state || "");
      }

      setLoading(false);
    }
    fetchData();
  }, [churchId]);

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

  // Motor de Busca Dupla de Membros
  const buscarPastor = async (tipo: 'matricula' | 'nome', valor: string) => {
    if (!valor || valor.trim() === "") return;
    
    const supabase = createClient();
    let query = supabase.from('members').select('matricula, full_name, phone');

    if (tipo === 'matricula') {
      query = query.eq('matricula', valor);
    } else {
      query = query.ilike('full_name', `%${valor}%`);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (data && !error) {
      if (tipo === 'matricula') setPastorName(data.full_name || "");
      if (tipo === 'nome') setPastorMatricula(data.matricula || "");
      if (data.phone) setPastorPhone(maskPhoneEnterprise(data.phone));
      document.getElementsByName('pastor_phone')[0]?.focus();
    } else {
      if (tipo === 'matricula') document.getElementsByName('pastor_name')[0]?.focus();
      if (tipo === 'nome') document.getElementsByName('pastor_phone')[0]?.focus();
    }
  };

  // Intercetor Inteligente de Teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
        e.preventDefault(); 

        if (target.name === 'pastor_matricula') {
          buscarPastor('matricula', target.value);
          return;
        }
        if (target.name === 'pastor_name') {
          buscarPastor('nome', target.value);
          return;
        }
        if (target.name === 'cep') {
          document.getElementsByName('address_number')[0]?.focus();
          return;
        }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-neutral-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Carregando dados da igreja...</span>
      </div>
    );
  }

  if (!church) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-400 gap-4">
        <Building2 className="w-12 h-12 opacity-20" />
        <p>Igreja não encontrada ou removida.</p>
        <Link href="/dashboard/igrejas" className="text-emerald-500 hover:underline">Voltar para lista</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      
      {/* FORMULÁRIO PRINCIPAL */}
      <form action={updateChurchAction} onKeyDown={handleKeyDown}>
        <input type="hidden" name="id" value={church.id} />

        {/* CABEÇALHO COM BOTÕES INLINE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Editar Igreja</h1>
            <p className="text-neutral-400">Atualize os dados ou arquive o registro.</p>
          </div>
          
          {/* Ordem Exata: Listagem -> Atualizar -> Voltar */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Link
              href="/dashboard/igrejas"
              className="flex items-center gap-2 p-2 px-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white text-blue-500 transition-colors text-xs font-bold uppercase whitespace-nowrap"
            >
              <List className="w-4 h-4" /> Listagem
            </Link>
            
            <SubmitButton />

            <Link
              href="/dashboard/igrejas"
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
                    <Building2 className="w-3 h-3 text-blue-500" /> Nome da Congregação
                </label>
                <input
                    name="name"
                    type="text"
                    required
                    defaultValue={church.name}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-blue-500" /> Setor Responsável
                </label>
                <div className="relative">
                    <select
                    name="sector_id"
                    required
                    defaultValue={church.sector_id}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
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
                  <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                          <Hash className="w-3 h-3 text-blue-500" /> Matrícula
                      </label>
                      <input
                          name="pastor_matricula"
                          type="text"
                          value={pastorMatricula}
                          onChange={(e) => setPastorMatricula(e.target.value)}
                          placeholder="Ex: 12345"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                  </div>
                  <div className="md:col-span-4 space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                          <User className="w-3 h-3 text-blue-500" /> Pastor / Dirigente
                      </label>
                      <input
                          name="pastor_name"
                          type="text"
                          value={pastorName}
                          onChange={(e) => setPastorName(e.target.value)}
                          placeholder="Nome (Aperte Enter para buscar)"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                          <Phone className="w-3 h-3 text-blue-500" /> Tel. Dirigente
                      </label>
                      <input
                          name="pastor_phone"
                          type="text"
                          value={pastorPhone}
                          onChange={(e) => setPastorPhone(maskPhoneEnterprise(e.target.value))}
                          maxLength={19}
                          placeholder="+55 (00) 00000-0000"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase flex items-center gap-2">
                          <Phone className="w-3 h-3 text-blue-500" /> Tel. Igreja
                      </label>
                      <input
                          name="church_phone"
                          type="text"
                          value={churchPhone}
                          onChange={(e) => setChurchPhone(maskPhoneEnterprise(e.target.value))}
                          maxLength={19}
                          placeholder="+55 (00) 0000-0000"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                          <MapPin className="w-3 h-3 text-blue-500" /> CEP
                      </label>
                      <input
                          name="cep"
                          type="text"
                          value={cep}
                          onChange={(e) => buscarCep(e.target.value)}
                          maxLength={9}
                          placeholder="00000-000"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase">Número</label>
                      <input
                          name="address_number"
                          type="text"
                          value={addressNumber}
                          onChange={(e) => setAddressNumber(e.target.value)}
                          placeholder="Ex: 123"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3 space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase">Complemento</label>
                      <input
                          name="address_complement"
                          type="text"
                          value={addressComplement}
                          onChange={(e) => setAddressComplement(e.target.value)}
                          placeholder="Bloco, Sala..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all uppercase"
                      />
                  </div>
              </div>
          </div>
        </div>
      </form>

      {/* ZONA DE PERIGO (MANTIDA INDEPENDENTE) */}
      <div className="border border-red-900/30 bg-red-950/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div>
          <h3 className="text-red-500 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Zona de Perigo
          </h3>
          <p className="text-xs text-red-400/60 mt-1">
            Arquivar remove esta igreja das listas ativas, mas mantém o histórico.
          </p>
        </div>
        
        <form action={archiveChurchAction}>
          <input type="hidden" name="id" value={church.id} />
          <ArchiveButton />
        </form>
      </div>

    </div>
  );
} 