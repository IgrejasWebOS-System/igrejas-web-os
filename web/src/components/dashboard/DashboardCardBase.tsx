import { ReactNode } from "react";

interface DashboardCardBaseProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  theme?: "emerald" | "blue";
  children?: ReactNode;
  className?: string;
}

export default function DashboardCardBase({
  icon,
  title,
  subtitle,
  theme = "emerald",
  children,
  className = ""
}: DashboardCardBaseProps) {
  const isBlue = theme === "blue";
  const hoverBorder = isBlue ? "hover:border-blue-500/30" : "hover:border-emerald-500/30";
  const circleBg = isBlue ? "bg-blue-500/5 group-hover:bg-blue-500/10" : "bg-emerald-500/5 group-hover:bg-emerald-500/10";
  const iconColor = isBlue ? "text-blue-500" : "text-emerald-500";

  // REGRA APLICADA: 1ª Letra Maiúscula, restantes minúsculas
  const formatSubtitle = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div className={`bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group transition-colors flex flex-col h-full shadow-lg ${hoverBorder} ${className}`}>
      {/* Efeito Visual de Fundo */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors ${circleBg}`} />

      {/* CABEÇALHO PADRONIZADO (Regras de Tipografia Fixadas) */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={`p-4 bg-neutral-800 rounded-xl ${iconColor}`}>
          {icon}
        </div>
        <div>
          {/* REGRA APLICADA: text-base (16px) e CAIXA ALTA */}
          <h3 className="text-base font-bold text-white uppercase tracking-wider">{title}</h3>
          
          {/* REGRA APLICADA: text-xs (12px) e Primeira Maiúscula */}
          <p className="text-xs text-neutral-400 mt-0.5">{formatSubtitle(subtitle)}</p>
        </div>
      </div>

      {/* ÁREA DINÂMICA: Aqui entramos com botões, inputs ou números dependendo do Card */}
      <div className="mt-auto pt-2 flex flex-col justify-end relative z-10 flex-1">
        {children}
      </div>
    </div>
  );
}