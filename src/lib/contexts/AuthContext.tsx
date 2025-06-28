"use client"

import { createContext, useContext, useEffect, useState } from 'react'
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  const refreshSession = async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }
      setSession(newSession)
      setUser(newSession?.user ?? null)
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const refreshProfile = async () => {
    try {
      if (user) {
        const userProfile = await userManagementRepo.getCurrentUserProfile()
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
      setProfile(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email)
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Load user profile when user changes
  useEffect(() => {
    if (user) {
      refreshProfile()
    } else {
      setProfile(null)
    }
  }, [user])

  const value = {
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
    refreshProfile
  }

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