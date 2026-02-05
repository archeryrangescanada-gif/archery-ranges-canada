import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect /account routes
  if (req.nextUrl.pathname.startsWith('/account')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect /admin routes (basic check, role check should happen in layout/page)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
