// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route is an admin route
  if (pathname.startsWith('/admin')) {
    // Allow access to login page without authentication
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Get the admin token from cookies
    // const token = request.cookies.get('admin-token')?.value

    // If no token, redirect to login
    // if (!token) {
    //   return NextResponse.redirect(new URL('/admin/login', request.url))
    // }
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/admin/:path*'],
}
