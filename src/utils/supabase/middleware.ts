import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    'https://ckbrqdehfhxjizuecstl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrYnJxZGVoZmh4aml6dWVjc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzU4MDgsImV4cCI6MjA5NzExMTgwOH0.vcupOQ6j2ShjtpphePQqI1E43dNFd8eQ3pj23aaOpWo',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // protection des routes /admin et /saas-admin
  if ((request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/saas-admin')) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // protection si déjà loggé
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = user.email === 'lare50@gmail.com' ? '/saas-admin' : '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
