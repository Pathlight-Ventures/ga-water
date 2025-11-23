import { createClient, isDemoMode } from '@/lib/supabase/client'

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

// Mock data for demo mode
const mockWaterSystemSearchResults: WaterSystemSearchResult[] = [
  {
    id: '1',
    pwsid: 'GA0000001',
    pws_name: 'Atlanta Water Plant #1',
    pws_type_code: 'CWS',
    pws_activity_code: 'A',
    population_served_count: 500000,
    city_name: 'Atlanta',
    state_code: 'GA',
    violation_count: 2,
    last_reported_date: '2025-11-01',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    pwsid: 'GA0000002',
    pws_name: 'Savannah Water System',
    pws_type_code: 'CWS',
    pws_activity_code: 'A',
    population_served_count: 150000,
    city_name: 'Savannah',
    state_code: 'GA',
    violation_count: 0,
    last_reported_date: '2025-11-01',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    pwsid: 'GA0000003',
    pws_name: 'Augusta Water Treatment Facility',
    pws_type_code: 'CWS',
    pws_activity_code: 'A',
    population_served_count: 200000,
    city_name: 'Augusta',
    state_code: 'GA',
    violation_count: 1,
    last_reported_date: '2025-11-01',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    pwsid: 'GA0000004',
    pws_name: 'Columbus Water Works',
    pws_type_code: 'CWS',
    pws_activity_code: 'A',
    population_served_count: 180000,
    city_name: 'Columbus',
    state_code: 'GA',
    violation_count: 0,
    last_reported_date: '2025-11-01',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    pwsid: 'GA0000005',
    pws_name: 'Athens-Clarke County Water System',
    pws_type_code: 'CWS',
    pws_activity_code: 'A',
    population_served_count: 120000,
    city_name: 'Athens',
    state_code: 'GA',
    violation_count: 0,
    last_reported_date: '2025-11-01',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    pwsid: 'GA0000006',
    pws_name: 'Macon Water Authority',
    pws_type_code: 'CWS',
    pws_activity_code: 'A',
    population_served_count: 160000,
    city_name: 'Macon',
    state_code: 'GA',
    violation_count: 1,
    last_reported_date: '2025-11-01',
    created_at: '2025-01-01T00:00:00Z'
  }
]

function filterMockSearchResults(results: WaterSystemSearchResult[], filters: SearchFilters): WaterSystemSearchResult[] {
  let filtered = [...results]

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(sys =>
      sys.pws_name?.toLowerCase().includes(searchLower) ||
      sys.pwsid.toLowerCase().includes(searchLower) ||
      sys.city_name?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.stateCode) {
    filtered = filtered.filter(sys => sys.state_code === filters.stateCode)
  }

  if (filters.pwsType) {
    filtered = filtered.filter(sys => sys.pws_type_code === filters.pwsType)
  }

  if (filters.activityStatus) {
    filtered = filtered.filter(sys => sys.pws_activity_code === filters.activityStatus)
  }

  if (filters.hasViolations !== undefined) {
    if (filters.hasViolations) {
      filtered = filtered.filter(sys => sys.violation_count > 0)
    } else {
      filtered = filtered.filter(sys => sys.violation_count === 0)
    }
  }

  const limit = filters.limit || 50
  const offset = filters.offset || 0
  return filtered.slice(offset, offset + limit)
}

export class WaterSystemsRepository {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    // Initialize Supabase client lazily to avoid SSR issues
    if (typeof window !== 'undefined' || isDemoMode) {
      this.supabase = createClient()
    } else {
      // During SSR, use a minimal mock
      this.supabase = createClient()
    }
  }

  /**
   * Get a water system by PWSID
   */
  async getByPwsid(pwsid: string): Promise<WaterSystem | null> {
    if (isDemoMode) {
      // Return mock data in demo mode
      const mockSystem = mockWaterSystemSearchResults.find(sys => sys.pwsid === pwsid)
      if (!mockSystem) return null
      return {
        id: mockSystem.id,
        submission_year_quarter: '2025-Q1',
        pwsid: mockSystem.pwsid,
        pws_name: mockSystem.pws_name,
        primacy_agency_code: 'GA',
        epa_region: '04',
        pws_activity_code: mockSystem.pws_activity_code,
        pws_type_code: mockSystem.pws_type_code,
        owner_type_code: 'M',
        population_served_count: mockSystem.population_served_count,
        primary_source_code: 'SW',
        service_connections_count: (mockSystem.population_served_count || 0) / 3,
        org_name: mockSystem.pws_name,
        admin_name: null,
        email_addr: null,
        phone_number: null,
        address_line1: null,
        city_name: mockSystem.city_name,
        state_code: mockSystem.state_code,
        zip_code: null,
        first_reported_date: '2025-01-01',
        last_reported_date: mockSystem.last_reported_date,
        created_at: mockSystem.created_at,
        updated_at: mockSystem.created_at
      }
    }

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
    if (isDemoMode) {
      // Return mock data in demo mode
      return filterMockSearchResults(mockWaterSystemSearchResults, filters)
    }

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
    if (isDemoMode) {
      // Return mock stats in demo mode
      const totalSystems = mockWaterSystemSearchResults.length
      const activeSystems = mockWaterSystemSearchResults.filter(sys => sys.pws_activity_code === 'A').length
      const systemsWithViolations = mockWaterSystemSearchResults.filter(sys => sys.violation_count > 0).length
      const totalPopulation = mockWaterSystemSearchResults.reduce((sum, sys) => sum + (sys.population_served_count || 0), 0)
      
      return {
        total_systems: totalSystems,
        active_systems: activeSystems,
        systems_with_violations: systemsWithViolations,
        total_population_served: totalPopulation,
        avg_population_per_system: totalPopulation / totalSystems,
        systems_by_type: [
          { type: 'CWS', count: totalSystems }
        ],
        systems_by_state: [
          { state: 'GA', count: totalSystems }
        ]
      }
    }

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

// Export singleton instance - created lazily to avoid SSR issues
let _waterSystemsRepoInstance: WaterSystemsRepository | null = null
export const getWaterSystemsRepo = (): WaterSystemsRepository => {
  if (!_waterSystemsRepoInstance) {
    _waterSystemsRepoInstance = new WaterSystemsRepository()
  }
  return _waterSystemsRepoInstance
}
export const waterSystemsRepo = new Proxy({} as WaterSystemsRepository, {
  get: (_target, prop: string | symbol) => {
    const repo = getWaterSystemsRepo()
    const value = (repo as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(repo) : value
  }
}) 