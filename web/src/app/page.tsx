import { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Acesso Seguro | IgrejasWeb OS",
  description: "Portal administrativo para gestão eclesiástica.",
};

export default function LoginPage() {
  return (
    // Fundo com gradiente sutil para dar profundidade ao "Preto Absoluto"
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-md space-y-8">
        {/* CABEÇALHO DA MARCA */}
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
        </div>

        {/* CONTAINER DO FORMULÁRIO (GLASSMORPHISM) */}
        {/* Aqui está o segredo do visual: Borda fina, fundo translúcido e sombra */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <LoginForm />
        </div>
        
        {/* RODAPÉ PADRÃO HOLDING (TRICOLOR) */}
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