"use client";

import { useState } from "react";
import { ArrowRight, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // FUSÃO TÉCNICA: Lógica de Autenticação Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Credenciais inválidas ou usuário não encontrado.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* FUSÃO TÉCNICA: Bloco de Erro (Recurso Solicitado) */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      {/* INPUT EMAIL */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">
          E-mail Corporativo
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors duration-300" />
          </div>
          <input
            name="email" /* Injeção Técnica: Necessário para o FormData */
            id="email"
            type="email"
            required
            className="block w-full pl-10 pr-3 py-3 rounded-xl border border-neutral-800 bg-neutral-950/50 text-neutral-100 placeholder-neutral-600 
            focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-neutral-900/80 focus:outline-none 
            transition-all duration-300 sm:text-sm shadow-inner appearance-none"
            placeholder="admin@igreja.org"
          />
        </div>
      </div>

      {/* INPUT SENHA */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">
          Senha de Acesso
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors duration-300" />
          </div>
          <input
            name="password" /* Injeção Técnica: Necessário para o FormData */
            id="password"
            type="password"
            required
            className="block w-full pl-10 pr-3 py-3 rounded-xl border border-neutral-800 bg-neutral-950/50 text-neutral-100 placeholder-neutral-600 
            focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-neutral-900/80 focus:outline-none 
            transition-all duration-300 sm:text-sm shadow-inner appearance-none"
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* BOTÃO DE AÇÃO */}
      <button
        type="submit"
        disabled={isLoading}
        className="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-900/20 
        text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-emerald-500 
        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validando Credenciais... {/* Mantido texto original visualmente mais rico */}
          </>
        ) : (
          <>
            Acessar Painel
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* LINK DE AJUDA */}
      <div className="text-center mt-4">
        <a href="#" className="text-xs text-neutral-500 hover:text-emerald-500 transition-colors">
          Esqueceu sua senha?
        </a>
      </div>
    </form>
  );
}