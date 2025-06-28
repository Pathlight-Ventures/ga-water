"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, auth } from './supabase/client'

// User profile type
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  organization?: string
  role: 'public' | 'operator' | 'laboratory' | 'epd_staff' | 'epa_staff' | 'admin'
  pwsid?: string
  phone?: string
  address?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

// Authentication context type
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: unknown }>
  signOut: () => Promise<{ error: unknown }>
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: unknown }>
  hasPermission: (permission: string) => boolean
  hasRole: (role: UserProfile['role']) => boolean
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Wrap fetchProfile in useCallback
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile', { p_user_id: userId })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setProfile(data[0])
      } else {
        // Create default profile for new users
        const { data: newProfile, error: createError } = await supabase
          .rpc('upsert_user_profile', {
            p_email: user?.email || '',
            p_full_name: user?.user_metadata?.full_name,
            p_role: 'public'
          })
        
        if (createError) throw createError
        
        if (newProfile) {
          const { data: profileData } = await supabase
            .rpc('get_user_profile', { p_user_id: userId })
          
          if (profileData && profileData.length > 0) {
            setProfile(profileData[0])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }, [user])

  // Initialize authentication
  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ session }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setSession(session as Session | null)
        setUser((session as Session | null)?.user ?? null)
        
        if ((session as Session | null)?.user) {
          await fetchProfile((session as Session).user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password)
    return { error }
  }

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { error } = await auth.signUp(email, password, metadata)
    return { error }
  }

  // Sign out function
  const signOut = async () => {
    const { error } = await auth.signOut()
    return { error }
  }

  // Update profile function
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .rpc('upsert_user_profile', {
          p_email: profileData.email || profile?.email || '',
          p_full_name: profileData.full_name,
          p_organization: profileData.organization,
          p_role: profileData.role,
          p_pwsid: profileData.pwsid,
          p_phone: profileData.phone,
          p_address: profileData.address
        })
      
      if (error) throw error
      
      // Refresh profile
      if (user) {
        await fetchProfile(user.id)
      }
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!profile) return false
    
    // Define permission mappings for each role
    const rolePermissions: Record<string, string[]> = {
      public: ['read_public_data'],
      operator: ['read_public_data', 'read_operator_data', 'write_operator_data', 'export_data', 'view_analytics'],
      laboratory: ['read_public_data', 'read_lab_data', 'write_lab_data', 'export_data', 'view_analytics'],
      epd_staff: ['read_public_data', 'read_operator_data', 'read_lab_data', 'read_epd_data', 'write_epd_data', 'export_data', 'import_data', 'view_analytics'],
      epa_staff: ['read_public_data', 'read_operator_data', 'read_lab_data', 'read_epd_data', 'read_epa_data', 'write_epa_data', 'export_data', 'view_analytics'],
      admin: ['read_public_data', 'read_operator_data', 'read_lab_data', 'read_epd_data', 'read_epa_data', 'write_operator_data', 'write_lab_data', 'write_epd_data', 'write_epa_data', 'export_data', 'import_data', 'manage_users', 'view_analytics', 'manage_system']
    }
    
    const userPermissions = rolePermissions[profile.role] || []
    return userPermissions.includes(permission)
  }

  // Check if user has specific role
  const hasRole = (role: UserProfile['role']): boolean => {
    return profile?.role === role
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Permission-based component wrapper
export function RequirePermission({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission } = useAuth()
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Role-based component wrapper
export function RequireRole({ 
  role, 
  children, 
  fallback = null 
}: { 
  role: UserProfile['role']
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasRole } = useAuth()
  
  if (!hasRole(role)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
} 