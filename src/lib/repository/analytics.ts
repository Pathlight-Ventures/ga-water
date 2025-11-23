import { createClient, isDemoMode } from '@/lib/supabase/client'

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
  private supabase: ReturnType<typeof createClient>

  constructor() {
    // Initialize Supabase client lazily to avoid SSR issues
    this.supabase = createClient()
  }

  /**
   * Get compliance trends over time
   */
  async getComplianceTrends(filters: AnalyticsFilters = {}): Promise<ComplianceTrend[]> {
    if (isDemoMode) {
      // Return mock compliance trends in demo mode
      const monthsBack = filters.monthsBack || 12
      const trends: ComplianceTrend[] = []
      const now = new Date()
      
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        trends.push({
          month_date: date.toISOString().substring(0, 7),
          total_systems: 106,
          compliant_systems: 98 + Math.floor(Math.random() * 3),
          non_compliant_systems: 8 - Math.floor(Math.random() * 3),
          compliance_rate: 92 + Math.random() * 3
        })
      }
      
      return trends
    }

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
    if (isDemoMode) {
      // Return mock violation trends in demo mode
      const now = new Date()
      const trends: Array<{ month: string; categories: Record<string, number> }> = []
      
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        trends.push({
          month: date.toISOString().substring(0, 7),
          categories: {
            'MCL': Math.floor(Math.random() * 5) + 1,
            'TT': Math.floor(Math.random() * 3),
            'MR': Math.floor(Math.random() * 2)
          }
        })
      }
      
      return trends
    }

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

      // Get water system details
      const { data: waterSystems, error: wsError } = await this.supabase
        .from('public_water_systems')
        .select('pwsid, city_name, state_code')
        .in('pwsid', pwsids)

      if (wsError) {
        console.error('Error fetching water system locations:', wsError)
        throw new Error(`Failed to fetch water system locations: ${wsError.message}`)
      }

      // Get geographic areas for county data
      const { data: geoAreas, error: geoError } = await this.supabase
        .from('geographic_areas')
        .select('pwsid, county_served')
        .in('pwsid', pwsids)
        .not('county_served', 'is', null)

      if (geoError) {
        console.error('Error fetching geographic areas:', geoError)
        // Continue without county data if there's an error
      }

      // Create maps for easy lookup
      const waterSystemMap = new Map(waterSystems?.map((ws: { pwsid: string, city_name: string, state_code: string }) => [ws.pwsid, ws]) || [])
      const countyMap = new Map(geoAreas?.map((ga: { pwsid: string, county_served: string }) => [ga.pwsid, ga.county_served]) || [])
      
      return data?.map((violation: { pwsid: string, is_health_based_ind: string }) => {
        const waterSystem = waterSystemMap.get(violation.pwsid)
        return {
          pwsid: violation.pwsid,
          is_health_based: violation.is_health_based_ind === 'Y',
          city: waterSystem?.city_name,
          state: waterSystem?.state_code,
          county: countyMap.get(violation.pwsid) || waterSystem?.city_name // Fallback to city name if no county
        }
      }) || []
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }

  /**
   * Get system performance metrics
   */
  async getSystemPerformanceMetrics(): Promise<unknown> {
    if (isDemoMode) {
      // Return mock metrics in demo mode
      return {
        water_systems: {
          total: 106,
          active: 106,
          with_violations: 8,
          total_population: 1310000,
          avg_population: 12358
        },
        violations: {
          total: 12,
          active: 5,
          health_based: 8,
          avg_resolution_days: 15
        },
        compliance_rate: '92.5'
      }
    }

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

  /**
   * Get county-based statistics
   */
  async getCountyStatistics(): Promise<unknown[]> {
    if (isDemoMode) {
      // Return mock county statistics in demo mode
      return [
        { county: 'Fulton', systems: 25, violations: 3, population: 500000 },
        { county: 'DeKalb', systems: 18, violations: 2, population: 400000 },
        { county: 'Cobb', systems: 15, violations: 1, population: 350000 },
        { county: 'Gwinnett', systems: 12, violations: 1, population: 300000 },
        { county: 'Chatham', systems: 8, violations: 0, population: 150000 },
        { county: 'Richmond', systems: 6, violations: 1, population: 200000 },
        { county: 'Muscogee', systems: 5, violations: 0, population: 180000 },
        { county: 'Clarke', systems: 4, violations: 0, population: 120000 },
        { county: 'Bibb', systems: 4, violations: 1, population: 160000 },
        { county: 'Houston', systems: 3, violations: 0, population: 90000 }
      ]
    }

    try {
      // Get all water systems with their geographic data
      const { data: waterSystems, error: wsError } = await this.supabase
        .from('public_water_systems')
        .select('pwsid, city_name, state_code, population_served_count')

      if (wsError) {
        console.error('Error fetching water systems:', wsError)
        throw new Error(`Failed to fetch water systems: ${wsError.message}`)
      }

      // Get geographic areas for county data
      const { data: geoAreas, error: geoError } = await this.supabase
        .from('geographic_areas')
        .select('pwsid, county_served')
        .not('county_served', 'is', null)

      if (geoError) {
        console.error('Error fetching geographic areas:', geoError)
        // Continue without county data if there's an error
      }

      // Get violations
      const { data: violations, error: violError } = await this.supabase
        .from('violations_enforcement')
        .select('pwsid, violation_status')
        .eq('violation_status', 'Unaddressed')

      if (violError) {
        console.error('Error fetching violations:', violError)
        throw new Error(`Failed to fetch violations: ${violError.message}`)
      }

      // Create maps for easy lookup
      const countyMap = new Map(geoAreas?.map((ga: { pwsid: string, county_served: string }) => [ga.pwsid, ga.county_served]) || [])
      
      // Count violations per system
      const violationCounts = violations?.reduce((acc: Record<string, number>, violation: { pwsid: string }) => {
        acc[violation.pwsid] = (acc[violation.pwsid] || 0) + 1
        return acc
      }, {}) || {}

      // Group by county
      const countyStats = new Map<string, { systems: Set<string>, violations: number, population: number }>()

      waterSystems?.forEach((ws) => {
        const county = countyMap.get(ws.pwsid) || ws.city_name || 'Unknown'
        if (!countyStats.has(county)) {
          countyStats.set(county, { systems: new Set(), violations: 0, population: 0 })
        }
        
        const stats = countyStats.get(county)!
        stats.systems.add(ws.pwsid)
        stats.violations += violationCounts[ws.pwsid] || 0
        stats.population += ws.population_served_count || 0
      })

      // Convert to array and sort by number of systems
      return Array.from(countyStats.entries())
        .map(([county, stats]) => ({
          county,
          systems: stats.systems.size,
          violations: stats.violations,
          population: stats.population
        }))
        .sort((a, b) => b.systems - a.systems)
        .slice(0, 20) // Top 20 counties
    } catch (error) {
      console.error('Repository error:', error)
      throw error
    }
  }
}

// Export singleton instance - created lazily to avoid SSR issues
let _analyticsRepoInstance: AnalyticsRepository | null = null
export const getAnalyticsRepo = (): AnalyticsRepository => {
  if (!_analyticsRepoInstance) {
    _analyticsRepoInstance = new AnalyticsRepository()
  }
  return _analyticsRepoInstance
}
export const analyticsRepo = new Proxy({} as AnalyticsRepository, {
  get: (_target, prop: string | symbol) => {
    const repo = getAnalyticsRepo()
    const value = (repo as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(repo) : value
  }
}) 