import { supabase } from './supabase'
import { PublicWaterSystem, Violation, Facility, SiteVisit, LeadCopperSample, GeographicArea, ReferenceCode } from '@/types/database'

// Utility function to clean and transform CSV data
export function cleanString(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null
  return value.trim()
}

export function cleanNumber(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null
  const num = parseFloat(value.trim())
  return isNaN(num) ? null : num
}

export function cleanDate(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null
  // Handle various date formats from SDWIS
  const date = new Date(value.trim())
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
}

// Transform CSV row to PublicWaterSystem
export function transformPublicWaterSystem(row: any): Partial<PublicWaterSystem> {
  return {
    pwsid: cleanString(row.PWSID),
    pws_name: cleanString(row.PWS_NAME),
    pws_type_code: cleanString(row.PWS_TYPE_CODE) as any,
    pws_activity_code: cleanString(row.PWS_ACTIVITY_CODE) as any,
    population_served_count: cleanNumber(row.POPULATION_SERVED_COUNT),
    service_connections_count: cleanNumber(row.SERVICE_CONNECTIONS_COUNT),
    primary_source_code: cleanString(row.PRIMARY_SOURCE_CODE) as any,
    owner_type_code: cleanString(row.OWNER_TYPE_CODE) as any,
    state_code: cleanString(row.STATE_CODE),
    city_name: cleanString(row.CITY_NAME),
    zip_code: cleanString(row.ZIP_CODE),
    admin_name: cleanString(row.ADMIN_NAME),
    email_addr: cleanString(row.EMAIL_ADDR),
    phone_number: cleanString(row.PHONE_NUMBER)
  }
}

// Transform CSV row to Violation
export function transformViolation(row: any): Partial<Violation> {
  return {
    pwsid: cleanString(row.PWSID),
    violation_id: cleanString(row.VIOLATION_ID),
    violation_code: cleanString(row.VIOLATION_CODE),
    violation_category_code: cleanString(row.VIOLATION_CATEGORY_CODE) as any,
    is_health_based_ind: cleanString(row.IS_HEALTH_BASED_IND) as any,
    contaminant_code: cleanString(row.CONTAMINANT_CODE),
    viol_measure: cleanNumber(row.VIOL_MEASURE),
    unit_of_measure: cleanString(row.UNIT_OF_MEASURE),
    federal_mcl: cleanString(row.FEDERAL_MCL),
    state_mcl: cleanNumber(row.STATE_MCL),
    non_compl_per_begin_date: cleanDate(row.NON_COMPL_PER_BEGIN_DATE),
    non_compl_per_end_date: cleanDate(row.NON_COMPL_PER_END_DATE),
    violation_status: cleanString(row.VIOLATION_STATUS) as any,
    rule_code: cleanString(row.RULE_CODE),
    rule_family_code: cleanString(row.RULE_FAMILY_CODE)
  }
}

// Transform CSV row to Facility
export function transformFacility(row: any): Partial<Facility> {
  return {
    pwsid: cleanString(row.PWSID),
    facility_id: cleanString(row.FACILITY_ID),
    facility_name: cleanString(row.FACILITY_NAME),
    facility_type_code: cleanString(row.FACILITY_TYPE_CODE),
    facility_activity_code: cleanString(row.FACILITY_ACTIVITY_CODE) as any,
    is_source_ind: cleanString(row.IS_SOURCE_IND) as any,
    water_type_code: cleanString(row.WATER_TYPE_CODE) as any,
    availability_code: cleanString(row.AVAILABILITY_CODE) as any
  }
}

// Transform CSV row to SiteVisit
export function transformSiteVisit(row: any): Partial<SiteVisit> {
  return {
    pwsid: cleanString(row.PWSID),
    visit_id: cleanString(row.VISIT_ID),
    visit_date: cleanDate(row.VISIT_DATE),
    agency_type_code: cleanString(row.AGENCY_TYPE_CODE),
    visit_reason_code: cleanString(row.VISIT_REASON_CODE),
    management_ops_eval_code: cleanString(row.MANAGEMENT_OPS_EVAL_CODE) as any,
    source_water_eval_code: cleanString(row.SOURCE_WATER_EVAL_CODE) as any,
    compliance_eval_code: cleanString(row.COMPLIANCE_EVAL_CODE) as any,
    visit_comments: cleanString(row.VISIT_COMMENTS)
  }
}

// Transform CSV row to LeadCopperSample
export function transformLeadCopperSample(row: any): Partial<LeadCopperSample> {
  return {
    pwsid: cleanString(row.PWSID),
    sample_id: cleanString(row.SAMPLE_ID),
    sampling_start_date: cleanDate(row.SAMPLING_START_DATE),
    sampling_end_date: cleanDate(row.SAMPLING_END_DATE),
    contaminant_code: cleanString(row.CONTAMINANT_CODE),
    sample_measure: cleanNumber(row.SAMPLE_MEASURE),
    unit_of_measure: cleanString(row.UNIT_OF_MEASURE),
    result_sign_code: cleanString(row.RESULT_SIGN_CODE) as any
  }
}

// Transform CSV row to GeographicArea
export function transformGeographicArea(row: any): Partial<GeographicArea> {
  return {
    pwsid: cleanString(row.PWSID),
    area_type_code: cleanString(row.AREA_TYPE_CODE) as any,
    state_served: cleanString(row.STATE_SERVED),
    city_served: cleanString(row.CITY_SERVED),
    county_served: cleanString(row.COUNTY_SERVED),
    zip_code_served: cleanString(row.ZIP_CODE_SERVED)
  }
}

// Transform CSV row to ReferenceCode
export function transformReferenceCode(row: any): Partial<ReferenceCode> {
  return {
    value_type: cleanString(row.VALUE_TYPE),
    value_code: cleanString(row.VALUE_CODE),
    value_description: cleanString(row.VALUE_DESCRIPTION)
  }
}

// Import functions for each table
export async function importPublicWaterSystems(data: any[]) {
  const transformed = data.map(transformPublicWaterSystem).filter(row => row.pwsid)
  
  const { data: result, error } = await supabase
    .from('public_water_systems')
    .upsert(transformed, { onConflict: 'pwsid' })
  
  if (error) {
    console.error('Error importing public water systems:', error)
    throw error
  }
  
  return result
}

export async function importViolations(data: any[]) {
  const transformed = data.map(transformViolation).filter(row => row.pwsid && row.violation_id)
  
  const { data: result, error } = await supabase
    .from('violations')
    .upsert(transformed, { onConflict: 'id' })
  
  if (error) {
    console.error('Error importing violations:', error)
    throw error
  }
  
  return result
}

export async function importFacilities(data: any[]) {
  const transformed = data.map(transformFacility).filter(row => row.pwsid && row.facility_id)
  
  const { data: result, error } = await supabase
    .from('facilities')
    .upsert(transformed, { onConflict: 'pwsid,facility_id' })
  
  if (error) {
    console.error('Error importing facilities:', error)
    throw error
  }
  
  return result
}

export async function importSiteVisits(data: any[]) {
  const transformed = data.map(transformSiteVisit).filter(row => row.pwsid && row.visit_id)
  
  const { data: result, error } = await supabase
    .from('site_visits')
    .upsert(transformed, { onConflict: 'id' })
  
  if (error) {
    console.error('Error importing site visits:', error)
    throw error
  }
  
  return result
}

export async function importLeadCopperSamples(data: any[]) {
  const transformed = data.map(transformLeadCopperSample).filter(row => row.pwsid && row.sample_id)
  
  const { data: result, error } = await supabase
    .from('lead_copper_samples')
    .upsert(transformed, { onConflict: 'id' })
  
  if (error) {
    console.error('Error importing lead/copper samples:', error)
    throw error
  }
  
  return result
}

export async function importGeographicAreas(data: any[]) {
  const transformed = data.map(transformGeographicArea).filter(row => row.pwsid)
  
  const { data: result, error } = await supabase
    .from('geographic_areas')
    .upsert(transformed, { onConflict: 'id' })
  
  if (error) {
    console.error('Error importing geographic areas:', error)
    throw error
  }
  
  return result
}

export async function importReferenceCodes(data: any[]) {
  const transformed = data.map(transformReferenceCode).filter(row => row.value_type && row.value_code)
  
  const { data: result, error } = await supabase
    .from('reference_codes')
    .upsert(transformed, { onConflict: 'value_type,value_code' })
  
  if (error) {
    console.error('Error importing reference codes:', error)
    throw error
  }
  
  return result
}

// Batch import function
export async function importAllData(csvData: {
  publicWaterSystems: any[]
  violations: any[]
  facilities: any[]
  siteVisits: any[]
  leadCopperSamples: any[]
  geographicAreas: any[]
  referenceCodes: any[]
}) {
  console.log('Starting data import...')
  
  try {
    // Import in order to respect foreign key constraints
    console.log('Importing reference codes...')
    await importReferenceCodes(csvData.referenceCodes)
    
    console.log('Importing public water systems...')
    await importPublicWaterSystems(csvData.publicWaterSystems)
    
    console.log('Importing geographic areas...')
    await importGeographicAreas(csvData.geographicAreas)
    
    console.log('Importing facilities...')
    await importFacilities(csvData.facilities)
    
    console.log('Importing violations...')
    await importViolations(csvData.violations)
    
    console.log('Importing site visits...')
    await importSiteVisits(csvData.siteVisits)
    
    console.log('Importing lead/copper samples...')
    await importLeadCopperSamples(csvData.leadCopperSamples)
    
    console.log('Data import completed successfully!')
  } catch (error) {
    console.error('Error during data import:', error)
    throw error
  }
} 