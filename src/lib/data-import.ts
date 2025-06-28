import { createSupabaseClient } from '@/lib/supabase/client'

export interface ImportResult {
  success: boolean
  recordsProcessed: number
  recordsInserted: number
  recordsUpdated: number
  errors: string[]
}

export interface CSVRow {
  [key: string]: string | number | null
}

export class DataImporter {
  private supabase = createSupabaseClient()

  /**
   * Import water systems data from CSV
   */
  async importWaterSystems(csvData: CSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    }

    try {
      // Convert CSV data to JSON format expected by the bulk insert function
      const jsonData = csvData.map(row => ({
        submission_year_quarter: row.SUBMISSIONYEARQUARTER || null,
        pwsid: row.PWSID || null,
        pws_name: row.PWS_NAME || null,
        primacy_agency_code: row.PRIMACY_AGENCY_CODE || null,
        epa_region: row.EPA_REGION || null,
        season_begin_date: row.SEASON_BEGIN_DATE || null,
        season_end_date: row.SEASON_END_DATE || null,
        pws_activity_code: row.PWS_ACTIVITY_CODE || null,
        pws_deactivation_date: this.parseDate(row.PWS_DEACTIVATION_DATE),
        pws_type_code: row.PWS_TYPE_CODE || null,
        dbpr_schedule_cat_code: row.DBPR_SCHEDULE_CAT_CODE || null,
        cds_id: row.CDS_ID || null,
        gw_sw_code: row.GW_SW_CODE || null,
        lt2_schedule_cat_code: row.LT2_SCHEDULE_CAT_CODE || null,
        owner_type_code: row.OWNER_TYPE_CODE || null,
        population_served_count: this.parseNumber(row.POPULATION_SERVED_COUNT),
        pop_cat_2_code: row.POP_CAT_2_CODE || null,
        pop_cat_3_code: row.POP_CAT_3_CODE || null,
        pop_cat_4_code: row.POP_CAT_4_CODE || null,
        pop_cat_5_code: row.POP_CAT_5_CODE || null,
        pop_cat_11_code: row.POP_CAT_11_CODE || null,
        primacy_type: row.PRIMACY_TYPE || null,
        primary_source_code: row.PRIMARY_SOURCE_CODE || null,
        is_grant_eligible_ind: row.IS_GRANT_ELIGIBLE_IND || null,
        is_wholesaler_ind: row.IS_WHOLESALER_IND || null,
        is_school_or_daycare_ind: row.IS_SCHOOL_OR_DAYCARE_IND || null,
        service_connections_count: this.parseNumber(row.SERVICE_CONNECTIONS_COUNT),
        submission_status_code: row.SUBMISSION_STATUS_CODE || null,
        org_name: row.ORG_NAME || null,
        admin_name: row.ADMIN_NAME || null,
        email_addr: row.EMAIL_ADDR || null,
        phone_number: row.PHONE_NUMBER || null,
        phone_ext_number: row.PHONE_EXT_NUMBER || null,
        fax_number: row.FAX_NUMBER || null,
        alt_phone_number: row.ALT_PHONE_NUMBER || null,
        address_line1: row.ADDRESS_LINE1 || null,
        address_line2: row.ADDRESS_LINE2 || null,
        city_name: row.CITY_NAME || null,
        zip_code: row.ZIP_CODE || null,
        country_code: row.COUNTRY_CODE || null,
        first_reported_date: this.parseDate(row.FIRST_REPORTED_DATE),
        last_reported_date: this.parseDate(row.LAST_REPORTED_DATE),
        state_code: row.STATE_CODE || null,
        source_water_protection_code: row.SOURCE_WATER_PROTECTION_CODE || null,
        source_protection_begin_date: this.parseDate(row.SOURCE_PROTECTION_BEGIN_DATE),
        outstanding_performer: row.OUTSTANDING_PERFORMER || null,
        outstanding_perform_begin_date: this.parseDate(row.OUTSTANDING_PERFORM_BEGIN_DATE),
        reduced_rtcr_monitoring: row.REDUCED_RTCR_MONITORING || null,
        reduced_monitoring_begin_date: this.parseDate(row.REDUCED_MONITORING_BEGIN_DATE),
        reduced_monitoring_end_date: this.parseDate(row.REDUCED_MONITORING_END_DATE),
        seasonal_startup_system: row.SEASONAL_STARTUP_SYSTEM || null
      }))

      // Call the bulk insert function
      const { data, error } = await this.supabase
        .rpc('bulk_insert_water_systems', {
          p_data: jsonData
        })

      if (error) {
        result.errors.push(`Bulk insert error: ${error.message}`)
        return result
      }

      result.success = true
      result.recordsProcessed = csvData.length
      result.recordsInserted = data || 0

    } catch (error) {
      result.errors.push(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Import violations data from CSV
   */
  async importViolations(csvData: CSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    }

    try {
      // Process violations in batches to avoid memory issues
      const batchSize = 1000
      let totalInserted = 0

      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize)
        
        const violations = batch.map(row => ({
          submission_year_quarter: row.SUBMISSIONYEARQUARTER || null,
          pwsid: row.PWSID || null,
          violation_id: row.VIOLATION_ID || null,
          facility_id: row.FACILITY_ID || null,
          compl_per_begin_date: this.parseDate(row.COMPL_PER_BEGIN_DATE),
          compl_per_end_date: this.parseDate(row.COMPL_PER_END_DATE),
          non_compl_per_begin_date: this.parseDate(row.NON_COMPL_PER_BEGIN_DATE),
          non_compl_per_end_date: this.parseDate(row.NON_COMPL_PER_END_DATE),
          pws_deactivation_date: this.parseDate(row.PWS_DEACTIVATION_DATE),
          violation_code: row.VIOLATION_CODE || null,
          violation_category_code: row.VIOLATION_CATEGORY_CODE || null,
          is_health_based_ind: row.IS_HEALTH_BASED_IND || null,
          contaminant_code: row.CONTAMINANT_CODE || null,
          viol_measure: this.parseNumber(row.VIOL_MEASURE),
          unit_of_measure: row.UNIT_OF_MEASURE || null,
          federal_mcl: row.FEDERAL_MCL || null,
          state_mcl: this.parseNumber(row.STATE_MCL),
          is_major_viol_ind: row.IS_MAJOR_VIOL_IND || null,
          severity_ind_cnt: this.parseNumber(row.SEVERITY_IND_CNT),
          calculated_rtc_date: this.parseDate(row.CALCULATED_RTC_DATE),
          violation_status: row.VIOLATION_STATUS || null,
          public_notification_tier: this.parseNumber(row.PUBLIC_NOTIFICATION_TIER),
          calculated_pub_notif_tier: this.parseNumber(row.CALCULATED_PUB_NOTIF_TIER),
          viol_originator_code: row.VIOL_ORIGINATOR_CODE || null,
          sample_result_id: row.SAMPLE_RESULT_ID || null,
          corrective_action_id: row.CORRECTIVE_ACTION_ID || null,
          rule_code: row.RULE_CODE || null,
          rule_group_code: row.RULE_GROUP_CODE || null,
          rule_family_code: row.RULE_FAMILY_CODE || null,
          viol_first_reported_date: this.parseDate(row.VIOL_FIRST_REPORTED_DATE),
          viol_last_reported_date: this.parseDate(row.VIOL_LAST_REPORTED_DATE),
          enforcement_id: row.ENFORCEMENT_ID || null,
          enforcement_date: this.parseDate(row.ENFORCEMENT_DATE),
          enforcement_action_type_code: row.ENFORCEMENT_ACTION_TYPE_CODE || null,
          enf_action_category: row.ENF_ACTION_CATEGORY || null,
          enf_originator_code: row.ENF_ORIGINATOR_CODE || null,
          enf_first_reported_date: this.parseDate(row.ENF_FIRST_REPORTED_DATE),
          enf_last_reported_date: this.parseDate(row.ENF_LAST_REPORTED_DATE)
        }))

        // Insert batch using direct table insert
        const { error } = await this.supabase
          .from('violations_enforcement')
          .upsert(violations, {
            onConflict: 'submission_year_quarter,pwsid,violation_id'
          })

        if (error) {
          result.errors.push(`Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`)
        } else {
          totalInserted += batch.length
        }
      }

      result.success = result.errors.length === 0
      result.recordsProcessed = csvData.length
      result.recordsInserted = totalInserted

    } catch (error) {
      result.errors.push(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Import facilities data from CSV
   */
  async importFacilities(csvData: CSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    }

    try {
      const facilities = csvData.map(row => ({
        submission_year_quarter: row.SUBMISSIONYEARQUARTER || null,
        pwsid: row.PWSID || null,
        facility_id: row.FACILITY_ID || null,
        facility_name: row.FACILITY_NAME || null,
        state_facility_id: row.STATE_FACILITY_ID || null,
        facility_activity_code: row.FACILITY_ACTIVITY_CODE || null,
        facility_deactivation_date: this.parseDate(row.FACILITY_DEACTIVATION_DATE),
        facility_type_code: row.FACILITY_TYPE_CODE || null,
        submission_status_code: row.SUBMISSION_STATUS_CODE || null,
        is_source_ind: row.IS_SOURCE_IND || null,
        water_type_code: row.WATER_TYPE_CODE || null,
        availability_code: row.AVAILABILITY_CODE || null,
        seller_treatment_code: row.SELLER_TREATMENT_CODE || null,
        seller_pwsid: row.SELLER_PWSID || null,
        seller_pws_name: row.SELLER_PWS_NAME || null,
        filtration_status_code: row.FILTRATION_STATUS_CODE || null,
        is_source_treated_ind: row.IS_SOURCE_TREATED_IND || null,
        first_reported_date: this.parseDate(row.FIRST_REPORTED_DATE),
        last_reported_date: this.parseDate(row.LAST_REPORTED_DATE)
      }))

      const { error } = await this.supabase
        .from('facilities')
        .upsert(facilities, {
          onConflict: 'submission_year_quarter,pwsid,facility_id'
        })

      if (error) {
        result.errors.push(`Facilities import error: ${error.message}`)
        return result
      }

      result.success = true
      result.recordsProcessed = csvData.length
      result.recordsInserted = csvData.length

    } catch (error) {
      result.errors.push(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Import reference codes data from CSV
   */
  async importReferenceCodes(csvData: CSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    }

    try {
      const referenceCodes = csvData.map(row => ({
        value_type: row.VALUE_TYPE || null,
        value_code: row.VALUE_CODE || null,
        value_description: row.VALUE_DESCRIPTION || null
      }))

      const { error } = await this.supabase
        .from('reference_codes')
        .upsert(referenceCodes, {
          onConflict: 'value_type,value_code'
        })

      if (error) {
        result.errors.push(`Reference codes import error: ${error.message}`)
        return result
      }

      result.success = true
      result.recordsProcessed = csvData.length
      result.recordsInserted = csvData.length

    } catch (error) {
      result.errors.push(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(dateStr: string | number | null): string | null {
    if (!dateStr) return null
    
    const str = String(dateStr).trim()
    if (!str || str === '') return null

    // Handle various date formats
    try {
      // Try parsing as MM/DD/YYYY
      if (str.includes('/')) {
        const [month, day, year] = str.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      // Try parsing as YYYY-MM-DD
      if (str.includes('-')) {
        return str
      }

      // Try parsing as MM-DD-YYYY
      if (str.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [month, day, year] = str.split('-')
        return `${year}-${month}-${day}`
      }

      return null
    } catch {
      return null
    }
  }

  /**
   * Parse number string to number
   */
  private parseNumber(numStr: string | number | null): number | null {
    if (!numStr) return null
    
    const num = Number(numStr)
    return isNaN(num) ? null : num
  }

  /**
   * Validate CSV data structure
   */
  validateCSVStructure(csvData: CSVRow[], requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!csvData || csvData.length === 0) {
      errors.push('CSV data is empty')
      return { valid: false, errors }
    }

    const firstRow = csvData[0]
    const missingFields = requiredFields.filter(field => !(field in firstRow))

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const dataImporter = new DataImporter() 