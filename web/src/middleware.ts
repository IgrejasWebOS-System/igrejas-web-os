import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Repassa a requisição para o motor de sessão do Supabase que acabamos de criar
  return await updateSession(request)
}

// Configuração do Interceptador (O Filtro de Borda)
export const config = {
  matcher: [
    /*
     * Faz o match com todas as rotas de requisição, EXCETO as seguintes:
     * - _next/static (arquivos estáticos do framework)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico, sitemap.xml, robots.txt (arquivos de metadados)
     * - Extensões de imagem conhecidas (.svg, .png, .jpg, etc)
     * Isso evita que o Supabase seja chamado à toa só para carregar uma logo.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}