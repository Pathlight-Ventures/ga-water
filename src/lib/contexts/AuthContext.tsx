"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { userManagementRepo, type UserProfile, type UserRole } from '@/lib/repository/user-management'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  isApproved: boolean
  isAdmin: boolean
  userRole: UserRole | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  refreshProfile: () => Promise<void>
  setFakeAuth: (userType: 'partner' | 'admin') => void
  isFakeAuth: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo user objects
const demoPartnerUser = {
  id: 'demo-partner-id',
  email: 'demo@partner.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  email_change: null,
  phone: null,
  phone_confirmed_at: null,
  phone_change: null,
  phone_change_token: null,
  confirmed_at: new Date().toISOString(),
  email_change_token_current: null,
  email_change_confirm_status: 0,
  banned_until: null,
  is_anonymous: false
} as unknown as User

const demoAdminUser = {
  id: 'demo-admin-id',
  email: 'demo@admin.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  email_change: null,
  phone: null,
  phone_confirmed_at: null,
  phone_change: null,
  phone_change_token: null,
  confirmed_at: new Date().toISOString(),
  email_change_token_current: null,
  email_change_confirm_status: 0,
  banned_until: null,
  is_anonymous: false
} as unknown as User

const demoPartnerProfile: UserProfile = {
  id: 'demo-partner-profile-id',
  user_id: 'demo-partner-id',
  email: 'demo@partner.com',
  full_name: 'Demo Partner',
  organization: 'Demo Organization',
  role: 'regulator' as UserRole,
  status: 'approved',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const demoAdminProfile: UserProfile = {
  id: 'demo-admin-profile-id',
  user_id: 'demo-admin-id',
  email: 'demo@admin.com',
  full_name: 'Demo Admin',
  organization: 'Demo Organization',
  role: 'admin' as UserRole,
  status: 'approved',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Helper function to load fake auth from localStorage (client-side only)
function loadFakeAuthFromStorage() {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const storedFakeAuth = localStorage.getItem('demo_fake_auth')
    if (storedFakeAuth) {
      return JSON.parse(storedFakeAuth)
    }
  } catch (error) {
    console.error('Error loading fake auth from localStorage:', error)
  }
  return null
}

// Helper function to initialize auth state from localStorage
function initializeAuthState() {
  const fakeAuthData = loadFakeAuthFromStorage()
  if (fakeAuthData) {
    if (fakeAuthData.userType === 'admin') {
      return {
        user: demoAdminUser,
        profile: demoAdminProfile,
        session: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: demoAdminUser
        } as Session,
        isFakeAuth: true,
        loading: false
      }
    } else {
      return {
        user: demoPartnerUser,
        profile: demoPartnerProfile,
        session: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: demoPartnerUser
        } as Session,
        isFakeAuth: true,
        loading: false
      }
    }
  }
  return {
    user: null,
    profile: null,
    session: null,
    isFakeAuth: false,
    loading: true
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage synchronously (client-side only)
  // Cache the initial state to avoid calling initializeAuthState multiple times
  let cachedInitialState: ReturnType<typeof initializeAuthState> | null = null
  const getInitialState = () => {
    if (!cachedInitialState) {
      cachedInitialState = initializeAuthState()
    }
    return cachedInitialState
  }
  
  const [user, setUser] = useState<User | null>(() => getInitialState().user)
  const [session, setSession] = useState<Session | null>(() => getInitialState().session)
  const [profile, setProfile] = useState<UserProfile | null>(() => getInitialState().profile)
  const [loading, setLoading] = useState(() => getInitialState().loading)
  const [isFakeAuth, setIsFakeAuth] = useState(() => getInitialState().isFakeAuth)
  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createSupabaseClient(), [])

  // Only load real auth if not in fake auth mode (already initialized from localStorage)
  useEffect(() => {
    // If we already loaded fake auth from localStorage, skip real auth loading
    if (isFakeAuth) {
      return
    }
    
    // Only load real auth if not in fake auth mode
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    getInitialSession()
  }, [supabase, isFakeAuth])

  const setFakeAuth = useCallback((userType: 'partner' | 'admin') => {
    setIsFakeAuth(true)
    if (userType === 'admin') {
      setUser(demoAdminUser)
      setProfile(demoAdminProfile)
      setSession({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: demoAdminUser
      } as Session)
      localStorage.setItem('demo_fake_auth', JSON.stringify({ userType: 'admin' }))
    } else {
      setUser(demoPartnerUser)
      setProfile(demoPartnerProfile)
      setSession({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: demoPartnerUser
      } as Session)
      localStorage.setItem('demo_fake_auth', JSON.stringify({ userType: 'partner' }))
    }
    setLoading(false)
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error refreshing session:', error)
        // In demo mode, continue without session
        setSession(null)
        setUser(null)
        return
      }
      setSession(newSession)
      setUser(newSession?.user ?? null)
    } catch (error) {
      console.error('Error refreshing session:', error)
      // In demo mode, continue without session
      setSession(null)
      setUser(null)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    try {
      if (user) {
        const userProfile = await userManagementRepo.getCurrentUserProfile()
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
      // In demo mode, continue without profile
      setProfile(null)
    }
  }, [user])

  const signOut = useCallback(async () => {
    try {
      if (isFakeAuth) {
        // Clear fake auth
        localStorage.removeItem('demo_fake_auth')
        setIsFakeAuth(false)
      } else {
        await supabase.auth.signOut()
      }
      setUser(null)
      setSession(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [isFakeAuth, supabase])

  // Listen for auth changes (only if not in fake auth mode)
  useEffect(() => {
    if (isFakeAuth) {
      return // Don't set up real auth listener in fake auth mode
    }

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.email)
          setSession(newSession)
          setUser(newSession?.user ?? null)
          setLoading(false)
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error)
      // In demo mode, continue without auth listener
      setLoading(false)
      return () => {}
    }
  }, [supabase, isFakeAuth])

  // Load user profile when user changes (only if not in fake auth mode)
  useEffect(() => {
    if (isFakeAuth) {
      return // Profile already set in fake auth mode
    }
    if (user) {
      refreshProfile()
    } else {
      setProfile(null)
    }
  }, [user, isFakeAuth, refreshProfile])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isApproved: profile?.status === 'approved',
    isAdmin: profile?.role === 'admin' && profile?.status === 'approved',
    userRole: profile?.role || null,
    signOut,
    refreshSession,
    refreshProfile,
    setFakeAuth,
    isFakeAuth
  }), [user, session, profile, loading, isFakeAuth, signOut, refreshSession, refreshProfile, setFakeAuth])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 