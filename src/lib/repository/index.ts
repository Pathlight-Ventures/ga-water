// Repository layer for data access with authentication
// This layer provides a clean API for accessing SDWIS data through stored procedures

import { supabase } from '@/lib/supabase/client'
import { waterSystemsRepo } from './water-systems'
import { violationsRepo } from './violations'
import { analyticsRepo } from './analytics'

// Export individual repositories
export { waterSystemsRepo, violationsRepo, analyticsRepo }

// Main repository class that combines all repositories
export class Repository {
  // Water Systems
  static async getWaterSystemByPwsid(pwsid: string) {
    return waterSystemsRepo.getByPwsid(pwsid)
  }

  static async searchWaterSystems(params: {
    searchTerm?: string
    stateCode?: string
    pwsType?: string
    activityStatus?: string
    hasViolations?: boolean
    limit?: number
    offset?: number
  }) {
    return waterSystemsRepo.search(params)
  }

  static async getWaterSystemStats() {
    return waterSystemsRepo.getStats()
  }

  // Violations
  static async getViolationsByPwsid(pwsid: string, params?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    return violationsRepo.getByPwsid(pwsid, params)
  }

  static async getViolationStats() {
    return violationsRepo.getStats()
  }

  // Analytics
  static async getComplianceTrends(monthsBack: number = 12) {
    return analyticsRepo.getComplianceTrends({ monthsBack })
  }

  // Facilities
  static async getFacilitiesByPwsid(pwsid: string) {
    const { data, error } = await supabase
      .rpc('get_facilities_by_pwsid', { p_pwsid: pwsid })
    
    if (error) throw error
    return data
  }

  // Site Visits
  static async getSiteVisitsByPwsid(pwsid: string, params?: {
    limit?: number
    offset?: number
  }) {
    const { data, error } = await supabase
      .rpc('get_site_visits_by_pwsid', { 
        p_pwsid: pwsid,
        p_limit: params?.limit || 50,
        p_offset: params?.offset || 0
      })
    
    if (error) throw error
    return data
  }

  // Lead and Copper Samples
  static async getLeadCopperSamplesByPwsid(pwsid: string, params?: {
    limit?: number
    offset?: number
  }) {
    const { data, error } = await supabase
      .rpc('get_lead_copper_samples_by_pwsid', { 
        p_pwsid: pwsid,
        p_limit: params?.limit || 50,
        p_offset: params?.offset || 0
      })
    
    if (error) throw error
    return data
  }

  // Geographic Areas
  static async getGeographicAreasByPwsid(pwsid: string) {
    const { data, error } = await supabase
      .rpc('get_geographic_areas_by_pwsid', { p_pwsid: pwsid })
    
    if (error) throw error
    return data
  }

  // Reference Codes
  static async getReferenceCodes(valueType: string) {
    const { data, error } = await supabase
      .rpc('get_reference_codes', { p_value_type: valueType })
    
    if (error) throw error
    return data
  }

  // User Management (Admin only)
  static async getUserProfile(userId?: string) {
    const { data, error } = await supabase
      .rpc('get_user_profile', { p_user_id: userId })
    
    if (error) throw error
    return data?.[0] || null
  }

  static async updateUserProfile(profileData: {
    email: string
    full_name?: string
    organization?: string
    role?: string
    pwsid?: string
    phone?: string
    address?: string
  }) {
    const { data, error } = await supabase
      .rpc('upsert_user_profile', profileData)
    
    if (error) throw error
    return data
  }
}

// Export the main repository class
export default Repository 