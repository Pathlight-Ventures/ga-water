import { createClient, isDemoMode } from '@/lib/supabase/client'

export type UserRole = 'researcher' | 'regulator' | 'consultant' | 'public' | 'admin'
export type UserStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended'

// Mock data for demo mode
const mockUsers: UserProfile[] = [
  {
    id: '1',
    user_id: 'user-1',
    email: 'partner1@example.com',
    full_name: 'John Doe',
    organization: 'Atlanta Water Authority',
    role: 'regulator' as UserRole,
    status: 'approved',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'user-2',
    email: 'partner2@example.com',
    full_name: 'Jane Smith',
    organization: 'Savannah Water Works',
    role: 'consultant' as UserRole,
    status: 'approved',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'user-3',
    email: 'pending@example.com',
    full_name: 'Bob Johnson',
    organization: 'Macon Utilities',
    role: 'regulator' as UserRole,
    status: 'pending_approval',
    created_at: '2025-11-15T00:00:00Z',
    updated_at: '2025-11-15T00:00:00Z'
  }
]

const mockPendingApprovals: PendingApproval[] = [
  {
    id: '3',
    user_id: 'user-3',
    email: 'pending@example.com',
    full_name: 'Bob Johnson',
    organization: 'Macon Utilities',
    role: 'regulator' as UserRole,
    created_at: '2025-11-15T00:00:00Z'
  }
]

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  organization: string
  role: UserRole
  status: UserStatus
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface PendingApproval {
  id: string
  user_id: string
  email: string
  full_name: string
  organization: string
  role: UserRole
  created_at: string
}

export interface UserFilters {
  status?: UserStatus
  role?: UserRole
  limit?: number
  offset?: number
}

export class UserManagementRepository {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    // Initialize Supabase client lazily to avoid SSR issues
    this.supabase = createClient()
  }

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (isDemoMode) {
      // Return mock user profile if it exists
      const mockUser = mockUsers.find(u => u.user_id === userId || u.id === userId)
      if (mockUser) {
        return mockUser
      }
      // Return demo admin or partner profile based on common user IDs
      if (userId === 'demo-admin-id' || userId.includes('admin')) {
        return {
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
      }
      if (userId === 'demo-partner-id' || userId.includes('partner')) {
        return {
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
      }
      return null
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_user_profile', {
          p_user_id: userId
        })

      if (error) {
        console.error('Error fetching user profile:', error)
        throw new Error(`Failed to fetch user profile: ${error.message}`)
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    if (isDemoMode) {
      // In demo mode, check localStorage for fake auth
      if (typeof window !== 'undefined') {
        const storedFakeAuth = localStorage.getItem('demo_fake_auth')
        if (storedFakeAuth) {
          const fakeAuthData = JSON.parse(storedFakeAuth)
          if (fakeAuthData.userType === 'admin') {
            return {
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
          } else {
            return {
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
          }
        }
      }
      return null
    }

    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      return this.getUserProfile(user.id)
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Check if current user is admin
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile()
      return profile?.role === 'admin' && profile?.status === 'approved'
    } catch (error) {
      console.error('Repository error:', error)
      return false
    }
  }

  /**
   * Check if current user is approved
   */
  async isCurrentUserApproved(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile()
      return profile?.status === 'approved'
    } catch (error) {
      console.error('Repository error:', error)
      return false
    }
  }

  /**
   * Get pending approvals (admin only)
   */
  async getPendingApprovals(limit: number = 50, offset: number = 0): Promise<PendingApproval[]> {
    if (isDemoMode) {
      // Return mock pending approvals in demo mode
      return mockPendingApprovals.slice(offset, offset + limit)
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_pending_approvals', {
          p_limit: limit,
          p_offset: offset
        })

      if (error) {
        console.error('Error fetching pending approvals:', error)
        throw new Error(`Failed to fetch pending approvals: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters: UserFilters = {}): Promise<UserProfile[]> {
    if (isDemoMode) {
      // Return mock users in demo mode
      let users = [...mockUsers]
      
      // Apply filters
      if (filters.status) {
        users = users.filter(u => u.status === filters.status)
      }
      
      if (filters.role) {
        users = users.filter(u => u.role === filters.role)
      }
      
      const limit = filters.limit || 50
      const offset = filters.offset || 0
      return users.slice(offset, offset + limit)
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_all_users', {
          p_status: filters.status || null,
          p_role: filters.role || null,
          p_limit: filters.limit || 50,
          p_offset: filters.offset || 0
        })

      if (error) {
        console.error('Error fetching all users:', error)
        throw new Error(`Failed to fetch users: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Approve user (admin only)
   */
  async approveUser(userId: string, approvedBy: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('approve_user', {
          p_user_id: userId,
          p_approved_by: approvedBy
        })

      if (error) {
        console.error('Error approving user:', error)
        throw new Error(`Failed to approve user: ${error.message}`)
      }

      return data || false
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Reject user (admin only)
   */
  async rejectUser(userId: string, rejectedBy: string, rejectionReason: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('reject_user', {
          p_user_id: userId,
          p_rejected_by: rejectedBy,
          p_rejection_reason: rejectionReason
        })

      if (error) {
        console.error('Error rejecting user:', error)
        throw new Error(`Failed to reject user: ${error.message}`)
      }

      return data || false
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        throw new Error(`Failed to update user profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Create user profile (used during signup)
   */
  async createUserProfile(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        throw new Error(`Failed to create user profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    byRole: Record<UserRole, number>
  }> {
    try {
      const allUsers = await this.getAllUsers({ limit: 1000 })
      
      const stats = {
        total: allUsers.length,
        pending: allUsers.filter(u => u.status === 'pending_approval').length,
        approved: allUsers.filter(u => u.status === 'approved').length,
        rejected: allUsers.filter(u => u.status === 'rejected').length,
        byRole: {
          researcher: allUsers.filter(u => u.role === 'researcher').length,
          regulator: allUsers.filter(u => u.role === 'regulator').length,
          consultant: allUsers.filter(u => u.role === 'consultant').length,
          public: allUsers.filter(u => u.role === 'public').length,
          admin: allUsers.filter(u => u.role === 'admin').length
        }
      }

      return stats
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }
}

// Export singleton instance - created lazily to avoid SSR issues
let _userManagementRepoInstance: UserManagementRepository | null = null
export const getUserManagementRepo = (): UserManagementRepository => {
  if (!_userManagementRepoInstance) {
    _userManagementRepoInstance = new UserManagementRepository()
  }
  return _userManagementRepoInstance
}
export const userManagementRepo = new Proxy({} as UserManagementRepository, {
  get: (_target, prop: string | symbol) => {
    const repo = getUserManagementRepo()
    const value = (repo as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(repo) : value
  }
}) 