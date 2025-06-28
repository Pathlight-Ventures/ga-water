import { createSupabaseClient } from '@/lib/supabase/client'

export interface Violation {
  id: string
  violation_id: string
  violation_code: string | null
  violation_category_code: 'TT' | 'MRDL' | 'Other' | 'MCL' | 'MR' | 'MON' | 'RPT' | null
  is_health_based_ind: string | null
  contaminant_code: string | null
  viol_measure: number | null
  unit_of_measure: string | null
  federal_mcl: string | null
  violation_status: 'Resolved' | 'Archived' | 'Addressed' | 'Unaddressed' | null
  public_notification_tier: number | null
  compl_per_begin_date: string | null
  compl_per_end_date: string | null
  non_compl_per_begin_date: string | null
  non_compl_per_end_date: string | null
  calculated_rtc_date: string | null
  enforcement_id: string | null
  enforcement_date: string | null
  enforcement_action_type_code: string | null
  enf_action_category: 'Formal' | 'Informal' | 'Resolving' | null
  created_at: string
}

export interface ViolationStats {
  total_violations: number
  active_violations: number
  health_based_violations: number
  violations_by_category: Array<{ category: string; count: number }>
  violations_by_status: Array<{ status: string; count: number }>
  avg_resolution_days: number
}

export interface ViolationFilters {
  status?: string
  limit?: number
  offset?: number
}

export class ViolationsRepository {
  private supabase = createSupabaseClient()

  /**
   * Get violations for a water system
   */
  async getByPwsid(pwsid: string, filters: ViolationFilters = {}): Promise<Violation[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_violations_by_pwsid', {
          p_pwsid: pwsid,
          p_status: filters.status || null,
          p_limit: filters.limit || 50,
          p_offset: filters.offset || 0
        })

      if (error) {
        console.error('Error fetching violations:', error)
        throw new Error(`Failed to fetch violations: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get violation statistics
   */
  async getStats(): Promise<ViolationStats> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_violation_stats')

      if (error) {
        console.error('Error fetching violation stats:', error)
        throw new Error(`Failed to fetch violation stats: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return {
          total_violations: 0,
          active_violations: 0,
          health_based_violations: 0,
          violations_by_category: [],
          violations_by_status: [],
          avg_resolution_days: 0
        }
      }

      const stats = data[0]
      return {
        total_violations: Number(stats.total_violations) || 0,
        active_violations: Number(stats.active_violations) || 0,
        health_based_violations: Number(stats.health_based_violations) || 0,
        violations_by_category: stats.violations_by_category || [],
        violations_by_status: stats.violations_by_status || [],
        avg_resolution_days: Number(stats.avg_resolution_days) || 0
      }
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get active violations for a water system
   */
  async getActiveByPwsid(pwsid: string, limit: number = 50, offset: number = 0): Promise<Violation[]> {
    return this.getByPwsid(pwsid, {
      status: 'Unaddressed',
      limit,
      offset
    })
  }

  /**
   * Get resolved violations for a water system
   */
  async getResolvedByPwsid(pwsid: string, limit: number = 50, offset: number = 0): Promise<Violation[]> {
    return this.getByPwsid(pwsid, {
      status: 'Resolved',
      limit,
      offset
    })
  }

  /**
   * Get health-based violations for a water system
   */
  async getHealthBasedByPwsid(pwsid: string, limit: number = 50, offset: number = 0): Promise<Violation[]> {
    try {
      const { data, error } = await this.supabase
        .from('violations_enforcement')
        .select('*')
        .eq('pwsid', pwsid)
        .eq('is_health_based_ind', 'Y')
        .order('non_compl_per_begin_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching health-based violations:', error)
        throw new Error(`Failed to fetch health-based violations: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get violations by category for a water system
   */
  async getByCategory(pwsid: string, category: string, limit: number = 50, offset: number = 0): Promise<Violation[]> {
    try {
      const { data, error } = await this.supabase
        .from('violations_enforcement')
        .select('*')
        .eq('pwsid', pwsid)
        .eq('violation_category_code', category)
        .order('non_compl_per_begin_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching violations by category:', error)
        throw new Error(`Failed to fetch violations by category: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const violationsRepo = new ViolationsRepository() 