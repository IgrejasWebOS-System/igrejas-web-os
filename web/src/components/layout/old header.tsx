import { ShieldCheck, User } from "lucide-react";

// Mapeamento de Cores e Nomes das Patentes (RBAC Enterprise)
const ROLE_MAP: Record<string, { label: string; color: string; border: string; bg: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  CAMPO: { label: "Master Campo", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  SEDE: { label: "Sede Regional", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  SETOR_ADMIN: { label: "Admin Setor", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
  IGREJA_USER: { label: "Igreja Local", color: "text-neutral-300", border: "border-neutral-500/30", bg: "bg-neutral-800/50" },
  GUEST: { label: "Visitante", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
};

interface HeaderProps {
  email: string;
  role: string;
}

export function Header({ email, role }: HeaderProps) {
  // Se a patente não existir no mapa, cai no GUEST por segurança
  const roleData = ROLE_MAP[role] || ROLE_MAP.GUEST;

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between w-full transition-all">
      
      {/* Esquerda: Status do Sistema */}
      <div className="hidden md:flex items-center text-sm font-medium text-neutral-500">
        <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
        <span className="uppercase tracking-wider text-[10px] font-bold">Autenticação Enterprise Ativa</span>
      </div>

      {/* Direita: Identidade do Usuário */}
      <div className="flex items-center gap-4 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight">{email}</p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Usuário Conectado</p>
        </div>

        {/* A Mágica do RBAC Visual: Tag Colorida Dinâmica */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${roleData.bg} ${roleData.border} shadow-sm`}>
          <User className={`w-3.5 h-3.5 ${roleData.color}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${roleData.color}`}>
            {roleData.label}
          </span>
        </div>
      </div>
    </header>
  );
}