// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route is an admin route
  if (pathname.startsWith('/admin')) {
    // Allow access to login page without authentication
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Create Supabase client for middleware
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Fallback: Check for demo/legacy admin cookie
    const adminToken = request.cookies.get('admin-token')?.value

    if (!user && adminToken !== 'valid-token') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // If using demo cookie (no real user), allow access
    if (!user && adminToken === 'valid-token') {
      return response
    }

    // At this point, user must exist (otherwise would have been caught above)
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // User is authenticated - allow access to admin routes
    // TODO: Add role-based access control when profiles table is set up
    return response
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/admin/:path*'],
}
