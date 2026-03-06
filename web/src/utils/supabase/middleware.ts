import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Inicia a resposta padrão do Next.js
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Cria o cliente Supabase configurado para interceptar cookies no Edge
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies na requisição
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Atualiza os cookies na resposta enviada ao navegador
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Atualiza ativamente a sessão do usuário (Renova Tokens JWT)
  // IMPORTANTE: Isso deve ser chamado em TODAS as rotas protegidas
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. REGRAS DE ROTEAMENTO BRUTO (O Fosso do Castelo)
  const pathname = request.nextUrl.pathname;
  
  // 1. Se tentar acessar o /dashboard sem estar logado, expulsa para a raiz (/)
  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/' // Alterado para a sua página de login real
    return NextResponse.redirect(url)
  }

  // 2. Se já estiver logado e tentar acessar a raiz (/), entra direto no /dashboard
  if (pathname === '/' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}