import { createClient } from '@/lib/supabase/client'

export interface ComplianceTrend {
  month_date: string
  total_systems: number
  compliant_systems: number
  non_compliant_systems: number
  compliance_rate: number
}

export interface AnalyticsFilters {
  monthsBack?: number
}

export class AnalyticsRepository {
  private supabase = createClient()

  /**
   * Get compliance trends over time
   */
  async getComplianceTrends(filters: AnalyticsFilters = {}): Promise<ComplianceTrend[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_compliance_trends', {
          p_months_back: filters.monthsBack || 12
        })

      if (error) {
        console.error('Error fetching compliance trends:', error)
        throw new Error(`Failed to fetch compliance trends: ${error.message}`)
      }

      return (data || []).map((trend: { month_date: string; total_systems: string; compliant_systems: string; non_compliant_systems: string; compliance_rate: string }) => ({
        month_date: trend.month_date,
        total_systems: Number(trend.total_systems) || 0,
        compliant_systems: Number(trend.compliant_systems) || 0,
        non_compliant_systems: Number(trend.non_compliant_systems) || 0,
        compliance_rate: Number(trend.compliance_rate) || 0
      }))
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get violation trends by category
   */
  async getViolationTrendsByCategory(monthsBack: number = 12): Promise<unknown[]> {
    try {
      const { data, error } = await this.supabase
        .from('violations_enforcement')
        .select(`
          violation_category_code,
          non_compl_per_begin_date,
          violation_status
        `)
        .gte('non_compl_per_begin_date', new Date(Date.now() - monthsBack * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('non_compl_per_begin_date', { ascending: false })

      if (error) {
        console.error('Error fetching violation trends:', error)
        throw new Error(`Failed to fetch violation trends: ${error.message}`)
      }

      // Group by category and month
      const trends = data?.reduce((acc: Record<string, Record<string, number>>, violation: { non_compl_per_begin_date?: string, violation_category_code?: string }) => {
        const month = violation.non_compl_per_begin_date?.substring(0, 7) // YYYY-MM
        if (!month) return acc
        const category = violation.violation_category_code || 'Unknown'
        
        if (!acc[month]) acc[month] = {}
        if (!acc[month][category]) acc[month][category] = 0
        
        acc[month][category]++
        return acc
      }, {}) || {}

      return Object.entries(trends).map(([month, categories]) => ({
        month,
        categories
      }))
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get geographic distribution of violations
   */
  async getGeographicViolationDistribution(): Promise<unknown[]> {
    try {
      const { data, error } = await this.supabase
        .from('violations_enforcement')
        .select(`
          pwsid,
          violation_status,
          is_health_based_ind
        `)
        .eq('violation_status', 'Unaddressed')

      if (error) {
        console.error('Error fetching geographic violation distribution:', error)
        throw new Error(`Failed to fetch geographic violation distribution: ${error.message}`)
      }

      // Get water system locations for violations
      const pwsids = [...new Set(data?.map((v: { pwsid: string }) => v.pwsid) || [])]
      
      if (pwsids.length === 0) return []

      const { data: waterSystems, error: wsError } = await this.supabase
        .from('public_water_systems')
        .select('pwsid, city_name, state_code, county_served')
        .in('pwsid', pwsids)

      if (wsError) {
        console.error('Error fetching water system locations:', wsError)
        throw new Error(`Failed to fetch water system locations: ${wsError.message}`)
      }

      // Combine violation data with location data
      const locationMap = new Map(waterSystems?.map((ws: { pwsid: string, city_name: string, state_code: string, county_served: string }) => [ws.pwsid, ws]) || [])
      
      return data?.map((violation: { pwsid: string, is_health_based_ind: string }) => ({
        pwsid: violation.pwsid,
        is_health_based: violation.is_health_based_ind === 'Y',
        city: locationMap.get(violation.pwsid)?.city_name,
        state: locationMap.get(violation.pwsid)?.state_code,
        county: locationMap.get(violation.pwsid)?.county_served
      })) || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get system performance metrics
   */
  async getSystemPerformanceMetrics(): Promise<unknown> {
    try {
      // Get water system stats
      const { data: wsStats, error: wsError } = await this.supabase
        .rpc('get_water_system_stats')

      if (wsError) {
        console.error('Error fetching water system stats:', wsError)
        throw new Error(`Failed to fetch water system stats: ${wsError.message}`)
      }

      // Get violation stats
      const { data: violStats, error: violError } = await this.supabase
        .rpc('get_violation_stats')

      if (violError) {
        console.error('Error fetching violation stats:', violError)
        throw new Error(`Failed to fetch violation stats: ${violError.message}`)
      }

      const waterSystemStats = wsStats?.[0] || {}
      const violationStats = violStats?.[0] || {}

      return {
        water_systems: {
          total: Number(waterSystemStats.total_systems) || 0,
          active: Number(waterSystemStats.active_systems) || 0,
          with_violations: Number(waterSystemStats.systems_with_violations) || 0,
          total_population: Number(waterSystemStats.total_population_served) || 0,
          avg_population: Number(waterSystemStats.avg_population_per_system) || 0
        },
        violations: {
          total: Number(violationStats.total_violations) || 0,
          active: Number(violationStats.active_violations) || 0,
          health_based: Number(violationStats.health_based_violations) || 0,
          avg_resolution_days: Number(violationStats.avg_resolution_days) || 0
        },
        compliance_rate: waterSystemStats.total_systems > 0 
          ? ((waterSystemStats.total_systems - waterSystemStats.systems_with_violations) / waterSystemStats.total_systems * 100).toFixed(2)
          : 0
      }
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get top violating systems
   */
  async getTopViolatingSystems(limit: number = 10): Promise<unknown[]> {
    try {
      const { data, error } = await this.supabase
        .from('violations_enforcement')
        .select(`
          pwsid,
          violation_status,
          is_health_based_ind
        `)
        .eq('violation_status', 'Unaddressed')

      if (error) {
        console.error('Error fetching violations for top systems:', error)
        throw new Error(`Failed to fetch violations for top systems: ${error.message}`)
      }

      // Count violations per system
      const violationCounts = data?.reduce((acc: Record<string, number>, violation: { pwsid: string }) => {
        acc[violation.pwsid] = (acc[violation.pwsid] || 0) + 1
        return acc
      }, {}) || {}

      // Get top systems by violation count
      const topPwsids = Object.entries(violationCounts)
        .sort(([,a]: [string, number], [,b]: [string, number]) => b - a)
        .slice(0, limit)
        .map(([pwsid]) => pwsid)

      if (topPwsids.length === 0) return []

      // Get water system details
      const { data: waterSystems, error: wsError } = await this.supabase
        .from('public_water_systems')
        .select('pwsid, pws_name, city_name, state_code, population_served_count')
        .in('pwsid', topPwsids)

      if (wsError) {
        console.error('Error fetching water system details:', wsError)
        throw new Error(`Failed to fetch water system details: ${wsError.message}`)
      }

      return waterSystems?.map((ws: { pwsid: string, pws_name: string, city_name: string, state_code: string, population_served_count: number }) => ({
        pwsid: ws.pwsid,
        name: ws.pws_name,
        city: ws.city_name,
        state: ws.state_code,
        population: ws.population_served_count,
        violation_count: violationCounts[ws.pwsid] || 0
      })) || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const analyticsRepo = new AnalyticsRepository() 