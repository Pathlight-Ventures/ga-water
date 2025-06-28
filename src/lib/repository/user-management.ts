import { createClient } from '@/lib/supabase/client'

export type UserRole = 'researcher' | 'regulator' | 'consultant' | 'public' | 'admin'
export type UserStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended'

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
  private supabase = createClient()

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
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

// Export singleton instance
export const userManagementRepo = new UserManagementRepository() 