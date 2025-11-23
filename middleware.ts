import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip auth checks in demo mode (no Supabase configured)
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (isDemoMode) {
    // In demo mode, allow all routes
    return res
  }
  
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  let session = null
  try {
    const {
      data: { session: sessionData },
    } = await supabase.auth.getSession()
    session = sessionData
  } catch (error) {
    // If Supabase fails, continue without session (demo mode)
    console.warn('Supabase session check failed, continuing in demo mode:', error)
  }

  // Define route categories
  // Public routes - always accessible without authentication
  const publicRoutes = ['/', '/map', '/compliance', '/reports']
  // Protected routes - require authentication
  const protectedRoutes = ['/settings', '/documents', '/notifications', '/forms', '/data-exchange']
  // Admin routes - require admin role
  const adminRoutes = ['/admin']
  // Auth routes - login, signup, etc.
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/pending-approval', '/auth/account-rejected', '/auth/account-suspended']
  
  const pathname = req.nextUrl.pathname
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Allow public routes without authentication
  if (isPublicRoute) {
    return res
  }

  // If accessing protected or admin routes without authentication, redirect to login
  if ((isProtectedRoute || isAdminRoute) && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing auth routes while already authenticated, redirect to settings
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/settings', req.url))
  }

  // Check user approval status and permissions for authenticated users
  if (session && (isProtectedRoute || isAdminRoute)) {
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