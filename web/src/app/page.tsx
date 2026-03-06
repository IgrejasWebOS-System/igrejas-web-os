import { Metadata } from "next";
import { login } from "./actions";
import { Lock, Mail, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Acesso Seguro | IgrejasWeb OS",
  description: "Portal administrativo para gestão eclesiástica.",
};

// Injeção Funcional: Captura os parâmetros da URL para ler mensagens de erro do motor
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;

  return (
    // Fundo com gradiente sutil para dar profundidade ao "Preto Absoluto"
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* CABEÇALHO DA MARCA (Imutável) */}
        <div className="text-center">
          {/* Ícone da Aplicação com Glow Emerald */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-6 border border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-white">
            IgrejasWeb <span className="text-emerald-500">OS</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Entre com suas credenciais de acesso
          </p>
          <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mt-2">Enterprise Edition</p>
        </div>

        {/* CONTAINER DO FORMULÁRIO (GLASSMORPHISM MANTIDO + INJEÇÃO FUNCIONAL) */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          
          {/* Detalhe visual de borda integrado */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-900 via-emerald-500 to-neutral-900 opacity-50"></div>

          <h2 className="text-xs font-bold text-neutral-500 mb-6 uppercase tracking-widest text-center border-b border-neutral-800 pb-4">
            Acesso Restrito
          </h2>

          {/* MOTOR DE ALERTAS (Captura os erros de senha) */}
          {message && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {message}
            </div>
          )}

          <form action={login} className="space-y-5">
            {/* INPUT DE EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Correio Eletrónico</label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-neutral-600 group-focus-within:text-emerald-500 transition-colors absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@igrejasweb.os"
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-neutral-700"
                />
              </div>
            </div>

            {/* INPUT DE SENHA */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Palavra-passe</label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-neutral-600 group-focus-within:text-emerald-500 transition-colors absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all tracking-widest placeholder:text-neutral-700"
                />
              </div>
            </div>

            {/* CALL TO ACTION */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-widest text-[11px] mt-4"
            >
              Autenticar
            </button>
          </form>
        </div>
        
        {/* RODAPÉ PADRÃO HOLDING (TRICOLOR) - Imutável */}
        <div className="text-center space-y-4 pt-4">
          <div className="flex items-center justify-center gap-2 opacity-60">
            <div className="h-px w-8 bg-neutral-800"></div>
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">Security Access</span>
            <div className="h-px w-8 bg-neutral-800"></div>
          </div>
          
          <p className="text-xs text-neutral-500">
            Powered by <span className="font-semibold text-emerald-500">Connection</span><span className="font-semibold text-neutral-200">Cyber</span> <span className="font-semibold text-red-600">OS</span>
          </p>
        </div>
      </div>
    </div>
  );
}