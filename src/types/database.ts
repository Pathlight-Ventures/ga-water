// Updated Database schema types based on actual SDWIS CSV structure

export interface PublicWaterSystem {
  id: string
  submission_year_quarter: string
  pwsid: string
  pws_name: string | null
  primacy_agency_code: string | null
  epa_region: string | null
  season_begin_date: string | null
  season_end_date: string | null
  pws_activity_code: 'A' | 'I' | 'N' | 'M' | 'P' | null
  pws_deactivation_date: string | null
  pws_type_code: 'CWS' | 'TNCWS' | 'NTNCWS' | null
  dbpr_schedule_cat_code: string | null
  cds_id: string | null
  gw_sw_code: string | null
  lt2_schedule_cat_code: string | null
  owner_type_code: 'F' | 'L' | 'M' | 'N' | 'P' | 'S' | null
  population_served_count: number | null
  pop_cat_2_code: string | null
  pop_cat_3_code: string | null
  pop_cat_4_code: string | null
  pop_cat_5_code: string | null
  pop_cat_11_code: string | null
  primacy_type: string | null
  primary_source_code: 'GW' | 'GWP' | 'SW' | 'SWP' | 'GU' | 'GUP' | null
  is_grant_eligible_ind: string | null
  is_wholesaler_ind: string | null
  is_school_or_daycare_ind: string | null
  service_connections_count: number | null
  submission_status_code: 'Y' | 'U' | 'R' | null
  org_name: string | null
  admin_name: string | null
  email_addr: string | null
  phone_number: string | null
  phone_ext_number: string | null
  fax_number: string | null
  alt_phone_number: string | null
  address_line1: string | null
  address_line2: string | null
  city_name: string | null
  zip_code: string | null
  country_code: string | null
  first_reported_date: string | null
  last_reported_date: string | null
  state_code: string
  source_water_protection_code: string | null
  source_protection_begin_date: string | null
  outstanding_performer: string | null
  outstanding_perform_begin_date: string | null
  reduced_rtcr_monitoring: string | null
  reduced_monitoring_begin_date: string | null
  reduced_monitoring_end_date: string | null
  seasonal_startup_system: string | null
  created_at: string
  updated_at: string
}

export interface ViolationEnforcement {
  id: string
  submission_year_quarter: string
  pwsid: string
  violation_id: string
  facility_id: string | null
  compl_per_begin_date: string | null
  compl_per_end_date: string | null
  non_compl_per_begin_date: string | null
  non_compl_per_end_date: string | null
  pws_deactivation_date: string | null
  violation_code: string | null
  violation_category_code: 'TT' | 'MRDL' | 'Other' | 'MCL' | 'MR' | 'MON' | 'RPT' | null
  is_health_based_ind: string | null
  contaminant_code: string | null
  viol_measure: number | null
  unit_of_measure: string | null
  federal_mcl: string | null
  state_mcl: number | null
  is_major_viol_ind: string | null
  severity_ind_cnt: number | null
  calculated_rtc_date: string | null
  violation_status: 'Resolved' | 'Archived' | 'Addressed' | 'Unaddressed' | null
  public_notification_tier: number | null
  calculated_pub_notif_tier: number | null
  viol_originator_code: string | null
  sample_result_id: string | null
  corrective_action_id: string | null
  rule_code: string | null
  rule_group_code: string | null
  rule_family_code: string | null
  viol_first_reported_date: string | null
  viol_last_reported_date: string | null
  enforcement_id: string | null
  enforcement_date: string | null
  enforcement_action_type_code: string | null
  enf_action_category: 'Formal' | 'Informal' | 'Resolving' | null
  enf_originator_code: string | null
  enf_first_reported_date: string | null
  enf_last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface Facility {
  id: string
  submission_year_quarter: string
  pwsid: string
  facility_id: string
  facility_name: string | null
  state_facility_id: string | null
  facility_activity_code: 'A' | 'I' | 'N' | 'M' | 'P' | null
  facility_deactivation_date: string | null
  facility_type_code: 'CC' | 'CH' | 'CS' | 'CW' | 'DS' | 'IG' | 'IN' | 'NN' | 'NP' | 'OT' | 'PC' | 'PF' | 'RC' | 'RS' | 'SI' | 'SP' | 'SS' | 'ST' | 'TM' | 'TP' | 'WH' | 'WL' | null
  submission_status_code: 'Y' | 'U' | 'R' | null
  is_source_ind: string | null
  water_type_code: 'GW' | 'SW' | 'GU' | null
  availability_code: 'E' | 'I' | 'P' | 'O' | 'S' | 'U' | null
  seller_treatment_code: string | null
  seller_pwsid: string | null
  seller_pws_name: string | null
  filtration_status_code: string | null
  is_source_treated_ind: string | null
  first_reported_date: string | null
  last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface SiteVisit {
  id: string
  submission_year_quarter: string
  pwsid: string
  visit_id: string
  visit_date: string | null
  agency_type_code: string | null
  visit_reason_code: string | null
  management_ops_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  source_water_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  security_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  pumps_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  other_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  compliance_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  data_verification_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  treatment_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  finished_water_stor_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  distribution_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  financial_eval_code: 'M' | 'N' | 'R' | 'S' | 'X' | 'Z' | 'D' | null
  visit_comments: string | null
  first_reported_date: string | null
  last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface LeadCopperSample {
  id: string
  submission_year_quarter: string
  pwsid: string
  sample_id: string
  sampling_end_date: string | null
  sampling_start_date: string | null
  reconciliation_id: string | null
  sample_first_reported_date: string | null
  sample_last_reported_date: string | null
  sar_id: number
  contaminant_code: string | null
  result_sign_code: 'L' | 'E' | null
  sample_measure: number | null
  unit_of_measure: string | null
  sar_first_reported_date: string | null
  sar_last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface GeographicArea {
  id: string
  submission_year_quarter: string
  pwsid: string
  geo_id: string
  area_type_code: 'TR' | 'CN' | 'ZC' | 'CT' | 'IR' | null
  tribal_code: string | null
  state_served: string | null
  ansi_entity_code: string | null
  zip_code_served: string | null
  city_served: string | null
  county_served: string | null
  last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface ServiceArea {
  id: string
  submission_year_quarter: string
  pwsid: string
  service_area_type_code: string | null
  is_primary_service_area_code: string | null
  first_reported_date: string | null
  last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface EventMilestone {
  id: string
  submission_year_quarter: string
  pwsid: string
  event_schedule_id: string
  event_end_date: string | null
  event_actual_date: string | null
  event_comments_text: string | null
  event_milestone_code: string | null
  event_reason_code: string | null
  first_reported_date: string | null
  last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface PublicNoticeViolation {
  id: string
  submission_year_quarter: string
  pwsid: string
  pn_violation_id: string
  related_violation_id: string | null
  non_compl_per_begin_date: string | null
  non_compl_per_end_date: string | null
  violation_code: string | null
  contamination_code: string | null
  first_reported_date: string | null
  last_reported_date: string | null
  created_at: string
  updated_at: string
}

export interface ReferenceCode {
  id: string
  value_type: string
  value_code: string
  value_description: string | null
  created_at: string
  updated_at: string
}

export interface AnsiArea {
  id: string
  ansi_state_code: string
  ansi_entity_code: string
  ansi_name: string | null
  state_code: string | null
  created_at: string
  updated_at: string
}

// Database enums for better type safety
export enum PwsType {
  COMMUNITY = 'CWS',
  TRANSIENT_NON_COMMUNITY = 'TNCWS',
  NON_TRANSIENT_NON_COMMUNITY = 'NTNCWS'
}

export enum PwsActivity {
  ACTIVE = 'A',
  INACTIVE = 'I',
  NON_PUBLIC = 'N',
  MERGED = 'M',
  FUTURE = 'P'
}

export enum ViolationCategory {
  TREATMENT_TECHNIQUE = 'TT',
  MAX_RESIDUAL_DISINFECTANT_LEVEL = 'MRDL',
  OTHER = 'Other',
  MAX_CONTAMINANT_LEVEL = 'MCL',
  MONITORING_REPORTING = 'MR',
  MONITORING = 'MON',
  REPORTING = 'RPT'
}

export enum ViolationStatus {
  RESOLVED = 'Resolved',
  ARCHIVED = 'Archived',
  ADDRESSED = 'Addressed',
  UNADDRESSED = 'Unaddressed'
}

export enum EvaluationCode {
  MINOR = 'M',
  NONE = 'N',
  RECOMMENDATIONS = 'R',
  SIGNIFICANT = 'S',
  NOT_EVALUATED = 'X',
  NOT_APPLICABLE = 'Z',
  SANITARY_DEFECT = 'D'
}

export enum FacilityType {
  CONSECUTIVE_CONNECTION = 'CC',
  COMMON_HEADERS = 'CH',
  CISTERN = 'CS',
  CLEAR_WELL = 'CW',
  DISTRIBUTION_SYSTEM = 'DS',
  INFILTRATION_GALLERY = 'IG',
  INTAKE = 'IN',
  NON_PIPED_NON_PURCHASED = 'NN',
  NON_PIPED = 'NP',
  OTHER = 'OT',
  PRESSURE_CONTROL = 'PC',
  PUMP_FACILITY = 'PF',
  ROOF_CATCHMENT = 'RC',
  RESERVOIR = 'RS',
  SURFACE_IMPOUNDMENT = 'SI',
  SPRING = 'SP',
  SAMPLING_STATION = 'SS',
  STORAGE = 'ST',
  TRANSMISSION_MAIN = 'TM',
  TREATMENT_PLANT = 'TP',
  WELLHEAD = 'WH',
  WELL = 'WL'
}

export enum SubmissionStatus {
  ACCEPTED = 'Y',
  UNREPORTED = 'U',
  REJECTED = 'R'
}

export enum EnforcementCategory {
  FORMAL = 'Formal',
  INFORMAL = 'Informal',
  RESOLVING = 'Resolving'
} 