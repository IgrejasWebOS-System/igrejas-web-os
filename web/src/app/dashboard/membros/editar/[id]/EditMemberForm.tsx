"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Save, Loader2, Archive, Search, User, MapPin, Briefcase, Activity, Camera, Droplets, Church, Hash, AlertTriangle, History, Wand2 } from "lucide-react";
import Link from "next/link";
import { updateMemberAction, archiveMemberAction, getNextRegistrationNumberAction } from "@/app/dashboard/membros/actions";
import { useFormStatus } from "react-dom";
import MemberTimelineModal from "@/components/dashboard/MemberTimelineModal"; // INJEÇÃO DA FASE 7

const validaCPF = (cpf: string) => { cpf = cpf.replace(/\D/g, ''); return cpf.length === 11; }; 

function calculateTimeBaptized(dateString: string) {
    if (!dateString || dateString.length !== 10) return "---";
    const parts = dateString.split('/');
    if(parts.length !== 3) return "---";
    const baptismDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const now = new Date();
    if (isNaN(baptismDate.getTime())) return "---";
    let years = now.getFullYear() - baptismDate.getFullYear();
    let months = now.getMonth() - baptismDate.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < baptismDate.getDate())) { years--; months += 12; }
    return `${years} anos e ${months} meses`;
}

function formatIsoToDateBr(dateStr: string | null) {
    if (!dateStr) return "";
    if (dateStr.includes('/')) return dateStr;
    const justDate = dateStr.split('T')[0];
    const parts = justDate.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`; 
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACTIVE': return "text-[#28A745] border-[#28A745]/50 font-black"; 
        case 'OBSERVATION': return "text-[#FFD700] border-[#FFD700]/50 font-black"; 
        case 'INACTIVE': return "text-[#DC3545] border-[#DC3545]/50 font-black"; 
        case 'UNFIT': return "text-[#E9ECEF] border-[#E9ECEF]/50 font-black"; 
        default: return "text-white border-neutral-700";
    }
};

function SubmitButton({ formDisabled }: { formDisabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || formDisabled;
  
  return (
    <button type="submit" disabled={isDisabled} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
    </button>
  );
}

function ArchiveButton() {
    const { pending } = useFormStatus();
    return (
      <button formAction={async (formData) => { await archiveMemberAction(formData); }} disabled={pending} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 hover:border-red-500/50" onClick={(e) => { if (!confirm("Tem certeza que deseja arquivar este membro?")) e.preventDefault(); }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
        Arquivar
      </button>
    );
}

export default function EditMemberForm({ memberId }: { memberId: string }) {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  
  // INJEÇÃO FASE 7: Estado do Modal
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const [churches, setChurches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [professions, setProfessions] = useState<any[]>([]);
  const [schoolings, setSchoolings] = useState<any[]>([]);
  const [civilStatuses, setCivilStatuses] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    birth_date: "", phone: "", cpf: "", rg: "", rg_issuer: "", rg_state: "",
    nationality_state: "", nationality_city: "", ecclesiastical_status: "ACTIVE", photo_url: "",
    marriage_date: "", baptism_date: "", origin_church: "", church_id: "", role_id: "", registration_number: "",
    spouse_name: "", father_name: "", mother_name: "",
    gender: "", civil_status: "", profession: "", schooling: ""
  });

  const [timeBaptized, setTimeBaptized] = useState("---");
  const [addressData, setAddressData] = useState({ zip_code: "", address: "", number: "", neighborhood: "", city: "", state: "" });
  const [loadingCep, setLoadingCep] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [generatingMatricula, setGeneratingMatricula] = useState(false);
  const [cpfError, setCpfError] = useState("");
  const [matriculaError, setMatriculaError] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const [churchesRes, rolesRes, profRes, schoolRes, civilRes, genderRes] = await Promise.all([
        supabase.from("churches").select("id, name").order("name"),
        supabase.from("ecclesiastical_roles").select("id, name").order("name"),
        supabase.from("settings_professions").select("id, name").order("name"),
        supabase.from("settings_schooling").select("id, name").order("name"),
        supabase.from("settings_civil_status").select("id, name").order("name"),
        supabase.from("settings_gender").select("id, name").order("name")
      ]);

      if (churchesRes.data) setChurches(churchesRes.data);
      if (rolesRes.data) setRoles(rolesRes.data);
      if (profRes.data) setProfessions(profRes.data);
      if (schoolRes.data) setSchoolings(schoolRes.data);
      if (civilRes.data) setCivilStatuses(civilRes.data);
      if (genderRes.data) setGenders(genderRes.data);

      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
        .then(res => res.json())
        .then(data => {
            const hasDF = data.some((s:any) => s.sigla === 'DF');
            setStates(hasDF ? data : [...data, { id: 53, sigla: 'DF', nome: 'Distrito Federal' }]);
        });

      const { data: memberData } = await supabase.from("members").select("*").eq("id", memberId).single();

      if (memberData) {
          setMember(memberData);
          
          const formattedBaptism = formatIsoToDateBr(memberData.baptism_date);

          setFormData({
            ...memberData,
            birth_date: formatIsoToDateBr(memberData.birth_date),
            marriage_date: formatIsoToDateBr(memberData.marriage_date),
            baptism_date: formattedBaptism,
            phone: memberData.phone || "", cpf: memberData.cpf || "",
            rg: memberData.rg || "", rg_issuer: memberData.rg_issuer || "SSP", rg_state: memberData.rg_state || "SP",
            nationality_state: memberData.nationality_state || "SP", nationality_city: memberData.nationality_city || "",
            ecclesiastical_status: memberData.ecclesiastical_status || "ACTIVE", photo_url: memberData.photo_url || "",
            origin_church: memberData.origin_church || "", church_id: memberData.church_id || "", role_id: memberData.role_id || "",
            registration_number: memberData.registration_number || "",
            spouse_name: memberData.spouse_name || "", father_name: memberData.father_name || "", mother_name: memberData.mother_name || "",
            gender: memberData.gender || "",
            civil_status: memberData.civil_status || "",
            profession: memberData.profession || "",
            schooling: memberData.schooling || "",
          });

          setAddressData({
              zip_code: memberData.zip_code || "", address: memberData.address || "",
              number: memberData.number || "", neighborhood: memberData.neighborhood || "",
              city: memberData.city || "", state: memberData.state || ""
          });

          if(formattedBaptism) setTimeBaptized(calculateTimeBaptized(formattedBaptism));
          if(memberData.nationality_state) fetchCities(memberData.nationality_state); else fetchCities("SP");
      }
      setLoading(false);
    }
    fetchData();
  }, [memberId]);

  const fetchCities = async (uf: string) => {
    if (!uf) return;
    setCities([]); 
    
    if (uf === 'DF') {
        const supabase = createClient();
        try {
            const { data, error } = await supabase.from("settings_custom_regions").select("id, name").eq("state_uf", "DF").order("name");
            if (error) throw error;
            if (data && data.length > 0) {
                 setCities(data.map((d: any) => ({ id: d.id, nome: d.name })));
            } else {
                 setCities([{ id: 'fallback', nome: 'Brasília' }]);
            }
        } catch (e) {
            console.error("Erro ao buscar DF customizado", e);
            setCities([{ id: 'fallback', nome: 'Brasília' }]);
        }
    } else {
        try {
            const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
            const data = await res.json();
            setCities(data);
        } catch(e) {
            console.error("Erro IBGE", e);
        }
    }
  };

  const checkCpfExists = async (cpfToCheck: string) => {
      if (!cpfToCheck || cpfToCheck.length < 14) {
          setCpfError("");
          return;
      }
      const supabase = createClient();
      const { data } = await supabase.from("members").select("id").eq("cpf", cpfToCheck).neq("id", memberId).single();
      if (data) {
          setCpfError("Este CPF já pertence a outro membro.");
      } else {
          setCpfError("");
      }
  };

  const checkMatriculaExists = async (matToCheck: string) => {
      if (!matToCheck || matToCheck.trim() === "") {
          setMatriculaError("");
          return;
      }
      const supabase = createClient();
      const { data } = await supabase.from("members").select("id").eq("registration_number", matToCheck).neq("id", memberId).single();
      if (data) {
          setMatriculaError("Esta matrícula já pertence a outro membro.");
      } else {
          setMatriculaError("");
      }
  };

  const handleGenerateMatricula = async () => {
    setGeneratingMatricula(true);
    setMatriculaError("");
    
    const isActive = formData.ecclesiastical_status === 'ACTIVE';
    const result = await getNextRegistrationNumberAction(isActive);
    
    if (result.success && result.data) {
        setFormData(prev => ({ ...prev, registration_number: result.data }));
    } else {
        setMatriculaError("Falha ao consultar servidor.");
    }
    setGeneratingMatricula(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2 && v.length <= 4) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    else if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    setFormData(prev => ({ ...prev, [field]: v }));
    if (field === 'baptism_date') {
        if(v.length === 10) setTimeBaptized(calculateTimeBaptized(v)); else setTimeBaptized("---");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 10) v = v.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    else v = v.replace(/(\d*)/, "($1");
    setFormData(prev => ({ ...prev, phone: v }));
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData(prev => ({ ...prev, cpf: v }));
    if (cpfError) setCpfError(""); 
  };

  const handleRGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").toUpperCase();
    if (v.length > 1 && v.length <= 4) v = v.replace(/(\d{2})(\d{1,3})/, "$1.$2");
    else if (v.length > 4 && v.length <= 7) v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (v.length > 7) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
    setFormData(prev => ({ ...prev, rg: v }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${memberId}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('avatars').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
    } catch (error) { alert('Erro no upload'); } finally { setUploading(false); }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlurCep = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setAddressData(prev => ({ ...prev, zip_code: cep, address: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }));
            }
        } catch (error) { console.error("Erro CEP:", error); } 
        finally { setLoadingCep(false); }
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-neutral-500" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER COMPACTADO À DIREITA */}
      <div className="grid grid-cols-12 gap-6 pb-6 border-b border-neutral-800 items-center">
        
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <Link href="/dashboard/membros" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm w-fit"><ArrowLeft className="w-4 h-4" /> Voltar para Gestão</Link>
            <div><h1 className="text-lg font-bold text-white tracking-tight">{member.full_name}</h1><p className="text-sm text-neutral-400">Edição de Cadastro</p></div>
        </div>

        <div className="col-span-12 lg:col-span-5 lg:col-start-6 pl-0">
            <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6"><label className="text-[10px] uppercase text-white font-bold mb-1 block flex items-center gap-1"><Church className="w-3 h-3 text-emerald-500"/> Igreja Atual</label><select name="church_id" value={formData.church_id} onChange={(e) => setFormData({...formData, church_id: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white cursor-pointer focus:border-emerald-500 outline-none text-xs"><option value="">Selecione...</option>{churches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="col-span-6"><label className="text-[10px] uppercase text-white font-bold mb-1 block flex items-center gap-1"><Briefcase className="w-3 h-3 text-emerald-500"/> Cargo</label><select name="role_id" value={formData.role_id} onChange={(e) => setFormData({...formData, role_id: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white cursor-pointer focus:border-emerald-500 outline-none text-xs"><option value="">Selecione...</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                
                <div className="col-span-4">
                    <label className="text-[10px] uppercase text-white font-bold mb-1 block flex items-center gap-1"><Hash className="w-3 h-3 text-yellow-500"/> Matrícula</label>
                    <div className="relative flex items-center">
                        <input 
                            name="registration_number" 
                            type="text" 
                            placeholder="Auto ou digite..." 
                            value={formData.registration_number} 
                            onChange={(e) => {
                                setFormData({...formData, registration_number: e.target.value});
                                if (matriculaError) setMatriculaError("");
                            }}
                            onBlur={() => checkMatriculaExists(formData.registration_number)}
                            className={`w-full bg-neutral-900 border rounded-lg p-2 pr-8 text-yellow-500 font-mono text-center text-xs outline-none transition-colors ${matriculaError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-neutral-800 focus:border-yellow-500'}`} 
                        />
                        <button 
                            type="button" 
                            onClick={handleGenerateMatricula}
                            disabled={generatingMatricula}
                            title="Gerar próximo número livre"
                            className="absolute right-1 p-1 text-neutral-500 hover:text-yellow-500 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50"
                        >
                            {generatingMatricula ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        </button>
                    </div>
                    {matriculaError && <span className="text-red-500 text-[10px] font-bold mt-1 block leading-tight">{matriculaError}</span>}
                </div>
                
                <div className="col-span-4"><label className="text-[10px] uppercase text-white font-bold mb-1 block flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-500"/> Batismo</label><input name="baptism_date" type="text" placeholder="DD/MM/AAAA" value={formData.baptism_date} onChange={(e) => handleDateChange(e, 'baptism_date')} maxLength={10} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-center focus:border-cyan-500 outline-none text-xs" /></div>
                <div className="col-span-4"><label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">Tempo</label><div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-cyan-500 font-bold text-xs border-l-2 border-l-cyan-500/50 truncate">{timeBaptized}</div></div>
            </div>
        </div>

        <div className="col-span-12 lg:col-span-2 lg:col-start-11 flex justify-end pr-4">
            <div className="w-32 h-32 rounded-full bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center relative overflow-hidden group hover:border-emerald-500 transition-colors shadow-xl">
                {formData.photo_url ? (<img src={formData.photo_url} alt="Foto" className="w-full h-full object-cover" />) : (<div className="flex flex-col items-center gap-1 text-neutral-500 group-hover:text-emerald-500">{uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}<span className="text-[10px] font-bold uppercase">Foto</span></div>)}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
        </div>
      </div>

      {serverError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" /> 
              <span className="font-medium">{serverError}</span>
          </div>
      )}

      <form action={async (formDataFromReact) => { 
          setServerError("");
          if (cpfError || matriculaError) return; 
          
          if (!formDataFromReact.get("church_id")) formDataFromReact.append("church_id", formData.church_id);
          if (!formDataFromReact.get("role_id")) formDataFromReact.append("role_id", formData.role_id);
          if (!formDataFromReact.get("registration_number")) formDataFromReact.append("registration_number", formData.registration_number);
          if (!formDataFromReact.get("baptism_date")) formDataFromReact.append("baptism_date", formData.baptism_date);
          if (!formDataFromReact.get("photo_url")) formDataFromReact.append("photo_url", formData.photo_url);

          const result = await updateMemberAction(formDataFromReact); 
          if (result && result.success === false) {
              setServerError(result.message);
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
          }
      }} className="space-y-6">
        
        <input type="hidden" name="id" value={member.id} />
        <input type="hidden" name="photo_url" value={formData.photo_url} />
        <input type="hidden" name="baptism_date" value={formData.baptism_date} />
        <input type="hidden" name="church_id" value={formData.church_id} />
        <input type="hidden" name="role_id" value={formData.role_id} />
        <input type="hidden" name="registration_number" value={formData.registration_number} />

        <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2"><User className="w-4 h-4 text-emerald-500" /> Dados Pessoais</h2>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Nome do Membro</label><input name="full_name" type="text" required defaultValue={member.full_name} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" /></div>
                <div className="col-span-6 md:col-span-2"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Data Nasc.</label><input name="birth_date" type="text" value={formData.birth_date} onChange={(e) => handleDateChange(e, 'birth_date')} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white text-center" /></div>
                
                <div className="col-span-6 md:col-span-1"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Sexo</label>
                    <select name="gender" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white text-center">
                        <option value="">...</option>{genders.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                    </select>
                </div>
                
                <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Estado Civil</label>
                    <select name="civil_status" value={formData.civil_status} onChange={(e) => setFormData({...formData, civil_status: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white">
                        <option value="">Selecione...</option>{civilStatuses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                
                <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Profissão</label>
                    <select name="profession" value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white">
                        <option value="">Selecione...</option>{professions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">E-mail</label><input name="email" type="text" defaultValue={member.email} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" /></div>
                <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Telefone</label><input name="phone" type="text" value={formData.phone} onChange={handlePhoneChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" /></div>
                <div className="col-span-12 md:col-span-3">
                    <label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Naturalidade (UF / Cidade)</label>
                    <div className="flex gap-2">
                        <select name="nationality_state" value={formData.nationality_state} onChange={(e) => {
                            setFormData({...formData, nationality_state: e.target.value, nationality_city: ""});
                            fetchCities(e.target.value);
                        }} className="w-20 bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white text-xs"><option value="">UF</option>{states.map((s:any)=><option key={s.id} value={s.sigla}>{s.sigla}</option>)}</select>
                        <select name="nationality_city" value={formData.nationality_city} onChange={(e) => setFormData({...formData, nationality_city: e.target.value})} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white text-xs"><option value="">{formData.nationality_city || "Cidade"}</option>{cities.map((c:any)=><option key={c.id} value={c.nome}>{c.nome}</option>)}</select>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-3"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Escolaridade</label>
                    <select name="schooling" value={formData.schooling} onChange={(e) => setFormData({...formData, schooling: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white">
                        <option value="">Selecione...</option>{schoolings.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-2">
                    <label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">CPF</label>
                    <input 
                        name="cpf" 
                        type="text" 
                        value={formData.cpf} 
                        onChange={handleCPFChange} 
                        onBlur={() => checkCpfExists(formData.cpf)}
                        className={`w-full bg-neutral-900 border rounded-lg p-2.5 text-white transition-all outline-none ${cpfError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-neutral-800 focus:border-emerald-500'}`} 
                    />
                    {cpfError && <span className="text-red-500 text-[10px] font-bold mt-1 block">{cpfError}</span>}
                </div>
                
                <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">RG</label><input name="rg" type="text" value={formData.rg} onChange={handleRGChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" /></div>
                <div className="col-span-6 md:col-span-1"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Órgão</label><input name="rg_issuer" type="text" value={formData.rg_issuer} onChange={(e)=>setFormData({...formData, rg_issuer: e.target.value.toUpperCase()})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white uppercase" /></div>
                <div className="col-span-6 md:col-span-1"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">UF RG</label><input name="rg_state" type="text" value={formData.rg_state} onChange={(e)=>setFormData({...formData, rg_state: e.target.value.toUpperCase()})} maxLength={2} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white uppercase" /></div>
                <div className="col-span-12 md:col-span-6"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Igreja de Origem</label><input name="origin_church" type="text" placeholder="Nome da igreja anterior..." value={formData.origin_church} onChange={(e) => setFormData({...formData, origin_church: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mt-2">
                <div className="col-span-2"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Nome da Mãe</label><input name="mother_name" type="text" value={formData.mother_name} onChange={(e) => setFormData({...formData, mother_name: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" /></div>
                <div className="col-span-2"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Nome do Pai</label><input name="father_name" type="text" value={formData.father_name} onChange={(e) => setFormData({...formData, father_name: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" /></div>
                <div className="col-span-2"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Cônjuge</label><input name="spouse_name" type="text" value={formData.spouse_name} onChange={(e) => setFormData({...formData, spouse_name: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" /></div>
                <div className="col-span-1"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block flex items-center gap-1"><Activity className="w-3 h-3 text-pink-500"/> Casamento</label><input name="marriage_date" type="text" placeholder="DD/MM/AAAA" value={formData.marriage_date} onChange={(e) => handleDateChange(e, 'marriage_date')} maxLength={10} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white text-center focus:border-pink-500 outline-none" /></div>
            </div>
        </div>

        <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> Endereço Residencial</h2>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-2 relative group"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">CEP</label><input name="zip_code" type="text" value={addressData.zip_code} onChange={handleAddressChange} onBlur={handleBlurCep} maxLength={9} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 pl-8 text-white focus:border-emerald-500 outline-none" /><Search className={`absolute left-2.5 top-8 w-4 h-4 ${loadingCep ? "text-emerald-500 animate-pulse" : "text-neutral-600"}`} /></div>
                <div className="col-span-12 md:col-span-8"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Endereço</label><input name="address" type="text" value={addressData.address} onChange={handleAddressChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" /></div>
                <div className="col-span-12 md:col-span-2"><label className="text-[10px] uppercase text-white font-bold pl-1 mb-1 block">Número</label><input name="number" type="text" value={addressData.number} onChange={handleAddressChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="neighborhood" type="text" placeholder="Bairro" value={addressData.neighborhood} onChange={handleAddressChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" />
                <input name="city" type="text" placeholder="Cidade" value={addressData.city} onChange={handleAddressChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white" />
                <input name="state" type="text" placeholder="UF" value={addressData.state} onChange={handleAddressChange} maxLength={2} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white uppercase" />
            </div>
        </div>

        <div className="mt-2">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col xl:flex-row items-center gap-6 justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] text-white uppercase font-bold mb-1 block">Financeiro</label>
                        <select name="financial_status" defaultValue={member.financial_status || "PENDING"} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none cursor-pointer"><option value="UP_TO_DATE">🟢 Em Dia</option><option value="PENDING">🔴 Pendente</option></select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] text-white uppercase font-bold mb-1 block">Status</label>
                        <select name="ecclesiastical_status" value={formData.ecclesiastical_status} onChange={(e) => setFormData(prev => ({...prev, ecclesiastical_status: e.target.value}))} className={`w-full bg-neutral-950 border rounded-lg p-2.5 text-sm cursor-pointer font-bold ${getStatusColor(formData.ecclesiastical_status)}`}>
                            <option value="ACTIVE" className="text-[#28A745] font-bold">ATIVO</option>
                            <option value="OBSERVATION" className="text-[#FFD700] font-bold">OBSERVAÇÃO</option>
                            <option value="INACTIVE" className="text-[#DC3545] font-bold">INATIVO</option>
                            <option value="UNFIT" className="text-[#E9ECEF] font-bold">INAPTO</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
                    <ArchiveButton />
                    
                    {/* INJEÇÃO FASE 7: Botão agora abre o Modal */}
                    <button 
                        type="button" 
                        onClick={() => setIsTimelineOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition-colors border border-neutral-700"
                    >
                        <History className="w-4 h-4" /> Histórico
                    </button>
                    
                    <div className="h-8 w-px bg-neutral-800 mx-2 hidden sm:block"></div>
                    <SubmitButton formDisabled={!!cpfError || !!matriculaError} />
                </div>
            </div>
        </div>
      </form>

      {/* INJEÇÃO FASE 7: Renderização Condicional do Modal */}
      <MemberTimelineModal 
        isOpen={isTimelineOpen} 
        onClose={() => setIsTimelineOpen(false)} 
        memberId={member.id} 
        memberName={member.full_name} 
      />

    </div>
  );
}