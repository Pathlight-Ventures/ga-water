import { createClient } from '@/lib/supabase/client'

export interface WaterSystem {
  id: string
  submission_year_quarter: string
  pwsid: string
  pws_name: string | null
  primacy_agency_code: string | null
  epa_region: string | null
  pws_activity_code: 'A' | 'I' | 'N' | 'M' | 'P' | null
  pws_type_code: 'CWS' | 'TNCWS' | 'NTNCWS' | null
  owner_type_code: 'F' | 'L' | 'M' | 'N' | 'P' | 'S' | null
  population_served_count: number | null
  primary_source_code: 'GW' | 'GWP' | 'SW' | 'SWP' | 'GU' | 'GUP' | null
  service_connections_count: number | null
  org_name: string | null
  admin_name: string | null
  email_addr: string | null
  phone_number: string | null
  address_line1: string | null
  city_name: string | null
  state_code: string | null
  zip_code: string | null
  first_reported_date: string | null
  last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface WaterSystemSearchResult {
  id: string
  pwsid: string
  pws_name: string | null
  pws_type_code: 'CWS' | 'TNCWS' | 'NTNCWS' | null
  pws_activity_code: 'A' | 'I' | 'N' | 'M' | 'P' | null
  population_served_count: number | null
  city_name: string | null
  state_code: string | null
  violation_count: number
  last_reported_date: string | null
  created_at: string
}

export interface WaterSystemStats {
  total_systems: number
  active_systems: number
  systems_with_violations: number
  total_population_served: number
  avg_population_per_system: number
  systems_by_type: Array<{ type: string; count: number }>
  systems_by_state: Array<{ state: string; count: number }>
}

export interface SearchFilters {
  searchTerm?: string
  stateCode?: string
  pwsType?: string
  activityStatus?: string
  hasViolations?: boolean
  limit?: number
  offset?: number
}

export class WaterSystemsRepository {
  private supabase = createClient()

  /**
   * Get a water system by PWSID
   */
  async getByPwsid(pwsid: string): Promise<WaterSystem | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_water_system_by_pwsid', { p_pwsid: pwsid })

      if (error) {
        console.error('Error fetching water system:', error)
        throw new Error(`Failed to fetch water system: ${error.message}`)
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Search water systems with filters
   */
  async search(filters: SearchFilters = {}): Promise<WaterSystemSearchResult[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('search_water_systems', {
          p_search_term: filters.searchTerm || null,
          p_state_code: filters.stateCode || null,
          p_pws_type: filters.pwsType || null,
          p_activity_status: filters.activityStatus || null,
          p_has_violations: filters.hasViolations || null,
          p_limit: filters.limit || 50,
          p_offset: filters.offset || 0
        })

      if (error) {
        console.error('Error searching water systems:', error)
        throw new Error(`Failed to search water systems: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get water system statistics
   */
  async getStats(): Promise<WaterSystemStats> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_water_system_stats')

      if (error) {
        console.error('Error fetching water system stats:', error)
        throw new Error(`Failed to fetch water system stats: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return {
          total_systems: 0,
          active_systems: 0,
          systems_with_violations: 0,
          total_population_served: 0,
          avg_population_per_system: 0,
          systems_by_type: [],
          systems_by_state: []
        }
      }

      const stats = data[0]
      return {
        total_systems: Number(stats.total_systems) || 0,
        active_systems: Number(stats.active_systems) || 0,
        systems_with_violations: Number(stats.systems_with_violations) || 0,
        total_population_served: Number(stats.total_population_served) || 0,
        avg_population_per_system: Number(stats.avg_population_per_system) || 0,
        systems_by_type: stats.systems_by_type || [],
        systems_by_state: stats.systems_by_state || []
      }
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get water systems by state
   */
  async getByState(stateCode: string, limit: number = 50, offset: number = 0): Promise<WaterSystemSearchResult[]> {
    return this.search({
      stateCode,
      limit,
      offset
    })
  }

  /**
   * Get water systems with violations
   */
  async getWithViolations(limit: number = 50, offset: number = 0): Promise<WaterSystemSearchResult[]> {
    return this.search({
      hasViolations: true,
      limit,
      offset
    })
  }

  /**
   * Get water systems by type
   */
  async getByType(pwsType: string, limit: number = 50, offset: number = 0): Promise<WaterSystemSearchResult[]> {
    return this.search({
      pwsType,
      limit,
      offset
    })
  }

  /**
   * Get active water systems
   */
  async getActive(limit: number = 50, offset: number = 0): Promise<WaterSystemSearchResult[]> {
    return this.search({
      activityStatus: 'A',
      limit,
      offset
    })
  }
}

// Export singleton instance
export const waterSystemsRepo = new WaterSystemsRepository() 