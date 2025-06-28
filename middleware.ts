import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes that require authentication
  const protectedRoutes = ['/settings', '/admin']
  const authRoutes = ['/auth/login', '/auth/signup']
  const publicRoutes = ['/', '/analytics', '/map', '/search']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route
  )

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing auth routes while already authenticated, redirect to settings
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/settings', req.url))
  }

  // Check user approval status for authenticated users
  if (session && (isProtectedRoute || isPublicRoute)) {
    try {
      // Get user profile to check approval status
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('status, role')
        .eq('user_id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile in middleware:', error)
        // If profile doesn't exist, redirect to pending approval
        if (error.code === 'PGRST116') {
          return NextResponse.redirect(new URL('/auth/pending-approval', req.url))
        }
      } else if (profileData) {
        const { status, role } = profileData

        // If user is not approved, redirect to pending approval page
        if (status === 'pending_approval') {
          return NextResponse.redirect(new URL('/auth/pending-approval', req.url))
        }

        // If user is rejected, redirect to rejected page
        if (status === 'rejected') {
          return NextResponse.redirect(new URL('/auth/account-rejected', req.url))
        }

        // If user is suspended, redirect to suspended page
        if (status === 'suspended') {
          return NextResponse.redirect(new URL('/auth/account-suspended', req.url))
        }

        // Check admin access for admin routes
        if (req.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
          return NextResponse.redirect(new URL('/settings', req.url))
        }
      }
    } catch (error) {
      console.error('Error in middleware approval check:', error)
      // On error, allow the request to continue
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 