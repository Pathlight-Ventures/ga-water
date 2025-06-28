-- Updated Supabase Schema for SDWIS Data
-- Based on actual CSV structure from Georgia Q1 2025 data

-- Create custom types for better data integrity
CREATE TYPE pws_type_enum AS ENUM ('CWS', 'TNCWS', 'NTNCWS');
CREATE TYPE pws_activity_enum AS ENUM ('A', 'I', 'N', 'M', 'P');
CREATE TYPE violation_category_enum AS ENUM ('TT', 'MRDL', 'Other', 'MCL', 'MR', 'MON', 'RPT');
CREATE TYPE violation_status_enum AS ENUM ('Resolved', 'Archived', 'Addressed', 'Unaddressed');
CREATE TYPE evaluation_code_enum AS ENUM ('M', 'N', 'R', 'S', 'X', 'Z', 'D');
CREATE TYPE primary_source_enum AS ENUM ('GW', 'GWP', 'SW', 'SWP', 'GU', 'GUP');
CREATE TYPE owner_type_enum AS ENUM ('F', 'L', 'M', 'N', 'P', 'S');
CREATE TYPE water_type_enum AS ENUM ('GW', 'SW', 'GU');
CREATE TYPE availability_enum AS ENUM ('E', 'I', 'P', 'O', 'S', 'U');
CREATE TYPE area_type_enum AS ENUM ('TR', 'CN', 'ZC', 'CT', 'IR');
CREATE TYPE result_sign_enum AS ENUM ('L', 'E');
CREATE TYPE facility_type_enum AS ENUM ('CC', 'CH', 'CS', 'CW', 'DS', 'IG', 'IN', 'NN', 'NP', 'OT', 'PC', 'PF', 'RC', 'RS', 'SI', 'SP', 'SS', 'ST', 'TM', 'TP', 'WH', 'WL');
CREATE TYPE submission_status_enum AS ENUM ('Y', 'U', 'R');
CREATE TYPE enforcement_category_enum AS ENUM ('Formal', 'Informal', 'Resolving');

-- =====================================================
-- AUTHENTICATION AND ROLE-BASED ACCESS CONTROL
-- =====================================================

-- User roles enum
CREATE TYPE user_role_enum AS ENUM (
    'public',           -- General public access (read-only)
    'operator',         -- Water system operators
    'laboratory',       -- Laboratory staff
    'epd_staff',        -- EPD staff
    'epa_staff',        -- EPA staff
    'admin'             -- System administrators
);

-- User permissions enum
CREATE TYPE permission_enum AS ENUM (
    'read_public_data',     -- Read public water system data
    'read_operator_data',   -- Read operator-specific data
    'read_lab_data',        -- Read laboratory data
    'read_epd_data',        -- Read EPD internal data
    'read_epa_data',        -- Read EPA data
    'write_operator_data',  -- Write operator data
    'write_lab_data',       -- Write laboratory data
    'write_epd_data',       -- Write EPD data
    'write_epa_data',       -- Write EPA data
    'export_data',          -- Export data
    'import_data',          -- Import data
    'manage_users',         -- Manage user accounts
    'view_analytics',       -- View analytics
    'manage_system'         -- System administration
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization VARCHAR(255),
    role user_role_enum DEFAULT 'public',
    pwsid VARCHAR(9), -- For operators, link to their water system
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role user_role_enum NOT NULL,
    permission permission_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission)
);

-- User sessions for tracking
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for sensitive operations
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DATA TABLES
-- =====================================================

-- Public Water Systems table (updated with all fields from CSV)
CREATE TABLE public_water_systems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    pws_name VARCHAR(100),
    primacy_agency_code VARCHAR(2),
    epa_region VARCHAR(2),
    season_begin_date VARCHAR(5),
    season_end_date VARCHAR(5),
    pws_activity_code pws_activity_enum,
    pws_deactivation_date DATE,
    pws_type_code pws_type_enum,
    dbpr_schedule_cat_code VARCHAR(6),
    cds_id VARCHAR(100),
    gw_sw_code VARCHAR(2),
    lt2_schedule_cat_code VARCHAR(6),
    owner_type_code owner_type_enum,
    population_served_count INTEGER,
    pop_cat_2_code VARCHAR(2),
    pop_cat_3_code VARCHAR(2),
    pop_cat_4_code VARCHAR(2),
    pop_cat_5_code VARCHAR(2),
    pop_cat_11_code VARCHAR(2),
    primacy_type VARCHAR(20),
    primary_source_code primary_source_enum,
    is_grant_eligible_ind CHAR(1),
    is_wholesaler_ind CHAR(1),
    is_school_or_daycare_ind CHAR(1),
    service_connections_count INTEGER,
    submission_status_code submission_status_enum,
    org_name VARCHAR(100),
    admin_name VARCHAR(100),
    email_addr VARCHAR(100),
    phone_number VARCHAR(15),
    phone_ext_number VARCHAR(5),
    fax_number VARCHAR(15),
    alt_phone_number VARCHAR(15),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city_name VARCHAR(40),
    zip_code VARCHAR(14),
    country_code VARCHAR(2),
    first_reported_date DATE,
    last_reported_date DATE,
    state_code VARCHAR(2),
    source_water_protection_code VARCHAR(2),
    source_protection_begin_date DATE,
    outstanding_performer VARCHAR(2),
    outstanding_perform_begin_date DATE,
    reduced_rtcr_monitoring VARCHAR(20),
    reduced_monitoring_begin_date DATE,
    reduced_monitoring_end_date DATE,
    seasonal_startup_system VARCHAR(40),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid)
);

-- Violations and Enforcement table (updated with all fields from CSV)
CREATE TABLE violations_enforcement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    violation_id VARCHAR(20) NOT NULL,
    facility_id VARCHAR(12),
    compl_per_begin_date DATE,
    compl_per_end_date DATE,
    non_compl_per_begin_date DATE,
    non_compl_per_end_date DATE,
    pws_deactivation_date DATE,
    violation_code VARCHAR(4),
    violation_category_code violation_category_enum,
    is_health_based_ind CHAR(1),
    contaminant_code VARCHAR(4),
    viol_measure NUMERIC,
    unit_of_measure VARCHAR(9),
    federal_mcl VARCHAR(31),
    state_mcl NUMERIC,
    is_major_viol_ind CHAR(1),
    severity_ind_cnt INTEGER,
    calculated_rtc_date DATE,
    violation_status violation_status_enum,
    public_notification_tier INTEGER,
    calculated_pub_notif_tier INTEGER,
    viol_originator_code VARCHAR(4),
    sample_result_id VARCHAR(40),
    corrective_action_id VARCHAR(40),
    rule_code VARCHAR(3),
    rule_group_code VARCHAR(3),
    rule_family_code VARCHAR(3),
    viol_first_reported_date DATE,
    viol_last_reported_date DATE,
    enforcement_id VARCHAR(20),
    enforcement_date DATE,
    enforcement_action_type_code VARCHAR(4),
    enf_action_category enforcement_category_enum,
    enf_originator_code VARCHAR(4),
    enf_first_reported_date DATE,
    enf_last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid, violation_id)
);

-- Facilities table (updated with all fields from CSV)
CREATE TABLE facilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    facility_id VARCHAR(12) NOT NULL,
    facility_name VARCHAR(100),
    state_facility_id VARCHAR(40),
    facility_activity_code pws_activity_enum,
    facility_deactivation_date DATE,
    facility_type_code facility_type_enum,
    submission_status_code submission_status_enum,
    is_source_ind CHAR(1),
    water_type_code water_type_enum,
    availability_code availability_enum,
    seller_treatment_code VARCHAR(4),
    seller_pwsid VARCHAR(9),
    seller_pws_name VARCHAR(100),
    filtration_status_code VARCHAR(4),
    is_source_treated_ind CHAR(1),
    first_reported_date DATE,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid, facility_id)
);

-- Site Visits table (updated with all fields from CSV)
CREATE TABLE site_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    visit_id VARCHAR(20) NOT NULL,
    visit_date DATE,
    agency_type_code VARCHAR(2),
    visit_reason_code VARCHAR(4),
    management_ops_eval_code evaluation_code_enum,
    source_water_eval_code evaluation_code_enum,
    security_eval_code evaluation_code_enum,
    pumps_eval_code evaluation_code_enum,
    other_eval_code evaluation_code_enum,
    compliance_eval_code evaluation_code_enum,
    data_verification_eval_code evaluation_code_enum,
    treatment_eval_code evaluation_code_enum,
    finished_water_stor_eval_code evaluation_code_enum,
    distribution_eval_code evaluation_code_enum,
    financial_eval_code evaluation_code_enum,
    visit_comments TEXT,
    first_reported_date DATE,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid, visit_id)
);

-- Lead and Copper Samples table (updated with all fields from CSV)
CREATE TABLE lead_copper_samples (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    sample_id VARCHAR(20) NOT NULL,
    sampling_end_date DATE,
    sampling_start_date DATE,
    reconciliation_id VARCHAR(40),
    sample_first_reported_date DATE,
    sample_last_reported_date DATE,
    sar_id INTEGER NOT NULL,
    contaminant_code VARCHAR(4),
    result_sign_code result_sign_enum,
    sample_measure NUMERIC,
    unit_of_measure VARCHAR(4),
    sar_first_reported_date DATE,
    sar_last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid, sample_id, sar_id)
);

-- Geographic Areas table (updated with all fields from CSV)
CREATE TABLE geographic_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    geo_id VARCHAR(20) NOT NULL,
    area_type_code area_type_enum,
    tribal_code VARCHAR(10),
    state_served VARCHAR(4),
    ansi_entity_code VARCHAR(4),
    zip_code_served VARCHAR(5),
    city_served VARCHAR(40),
    county_served VARCHAR(40),
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid, geo_id)
);

-- Service Areas table (new)
CREATE TABLE service_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    service_area_type_code VARCHAR(4),
    is_primary_service_area_code CHAR(1),
    first_reported_date DATE,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events and Milestones table (new)
CREATE TABLE events_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    event_schedule_id VARCHAR(20) NOT NULL,
    event_end_date DATE,
    event_actual_date DATE,
    event_comments_text TEXT,
    event_milestone_code VARCHAR(4),
    event_reason_code VARCHAR(4),
    first_reported_date DATE,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid, event_schedule_id)
);

-- Public Notice Violations table (new)
CREATE TABLE public_notice_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_year_quarter VARCHAR(7) NOT NULL,
    pwsid VARCHAR(9) NOT NULL,
    pn_violation_id VARCHAR(20) NOT NULL,
    related_violation_id VARCHAR(20),
    non_compl_per_begin_date DATE,
    non_compl_per_end_date DATE,
    violation_code VARCHAR(4),
    contamination_code VARCHAR(4),
    first_reported_date DATE,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_year_quarter, pwsid, pn_violation_id)
);

-- Reference Codes table (updated)
CREATE TABLE reference_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    value_type VARCHAR(40) NOT NULL,
    value_code VARCHAR(40) NOT NULL,
    value_description VARCHAR(250),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(value_type, value_code)
);

-- ANSI Areas table (new)
CREATE TABLE ansi_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ansi_state_code VARCHAR(2) NOT NULL,
    ansi_entity_code VARCHAR(3) NOT NULL,
    ansi_name VARCHAR(40),
    state_code VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ansi_state_code, ansi_entity_code)
);

-- Create indexes for better performance
CREATE INDEX idx_public_water_systems_pwsid ON public_water_systems(pwsid);
CREATE INDEX idx_public_water_systems_submission ON public_water_systems(submission_year_quarter);
CREATE INDEX idx_public_water_systems_state ON public_water_systems(state_code);
CREATE INDEX idx_public_water_systems_city ON public_water_systems(city_name);
CREATE INDEX idx_public_water_systems_activity ON public_water_systems(pws_activity_code);

CREATE INDEX idx_violations_pwsid ON violations_enforcement(pwsid);
CREATE INDEX idx_violations_submission ON violations_enforcement(submission_year_quarter);
CREATE INDEX idx_violations_status ON violations_enforcement(violation_status);
CREATE INDEX idx_violations_category ON violations_enforcement(violation_category_code);
CREATE INDEX idx_violations_health_based ON violations_enforcement(is_health_based_ind);

CREATE INDEX idx_facilities_pwsid ON facilities(pwsid);
CREATE INDEX idx_facilities_submission ON facilities(submission_year_quarter);
CREATE INDEX idx_facilities_type ON facilities(facility_type_code);
CREATE INDEX idx_facilities_source ON facilities(is_source_ind);

CREATE INDEX idx_site_visits_pwsid ON site_visits(pwsid);
CREATE INDEX idx_site_visits_submission ON site_visits(submission_year_quarter);
CREATE INDEX idx_site_visits_date ON site_visits(visit_date);

CREATE INDEX idx_lead_copper_samples_pwsid ON lead_copper_samples(pwsid);
CREATE INDEX idx_lead_copper_samples_submission ON lead_copper_samples(submission_year_quarter);
CREATE INDEX idx_lead_copper_samples_contaminant ON lead_copper_samples(contaminant_code);

CREATE INDEX idx_geographic_areas_pwsid ON geographic_areas(pwsid);
CREATE INDEX idx_geographic_areas_submission ON geographic_areas(submission_year_quarter);
CREATE INDEX idx_geographic_areas_type ON geographic_areas(area_type_code);

CREATE INDEX idx_reference_codes_value_type ON reference_codes(value_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_public_water_systems_updated_at BEFORE UPDATE ON public_water_systems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_violations_enforcement_updated_at BEFORE UPDATE ON violations_enforcement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_visits_updated_at BEFORE UPDATE ON site_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_copper_samples_updated_at BEFORE UPDATE ON lead_copper_samples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_geographic_areas_updated_at BEFORE UPDATE ON geographic_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_areas_updated_at BEFORE UPDATE ON service_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_milestones_updated_at BEFORE UPDATE ON events_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_notice_violations_updated_at BEFORE UPDATE ON public_notice_violations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reference_codes_updated_at BEFORE UPDATE ON reference_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ansi_areas_updated_at BEFORE UPDATE ON ansi_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public_water_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations_enforcement ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_copper_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_notice_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ansi_areas ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to public_water_systems" ON public_water_systems FOR SELECT USING (true);
CREATE POLICY "Allow public read access to violations_enforcement" ON violations_enforcement FOR SELECT USING (true);
CREATE POLICY "Allow public read access to facilities" ON facilities FOR SELECT USING (true);
CREATE POLICY "Allow public read access to site_visits" ON site_visits FOR SELECT USING (true);
CREATE POLICY "Allow public read access to lead_copper_samples" ON lead_copper_samples FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geographic_areas" ON geographic_areas FOR SELECT USING (true);
CREATE POLICY "Allow public read access to service_areas" ON service_areas FOR SELECT USING (true);
CREATE POLICY "Allow public read access to events_milestones" ON events_milestones FOR SELECT USING (true);
CREATE POLICY "Allow public read access to public_notice_violations" ON public_notice_violations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reference_codes" ON reference_codes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ansi_areas" ON ansi_areas FOR SELECT USING (true);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_water_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations_enforcement ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_copper_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_notice_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ansi_areas ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Role permissions policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view role permissions" ON role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Public water systems policies (public read access)
CREATE POLICY "Public read access to water systems" ON public_water_systems
    FOR SELECT USING (true);

-- Violations policies (public read access)
CREATE POLICY "Public read access to violations" ON violations_enforcement
    FOR SELECT USING (true);

-- Facilities policies (public read access)
CREATE POLICY "Public read access to facilities" ON facilities
    FOR SELECT USING (true);

-- Site visits policies (public read access)
CREATE POLICY "Public read access to site visits" ON site_visits
    FOR SELECT USING (true);

-- Lead copper samples policies (public read access)
CREATE POLICY "Public read access to lead copper samples" ON lead_copper_samples
    FOR SELECT USING (true);

-- Geographic areas policies (public read access)
CREATE POLICY "Public read access to geographic areas" ON geographic_areas
    FOR SELECT USING (true);

-- Service areas policies (public read access)
CREATE POLICY "Public read access to service areas" ON service_areas
    FOR SELECT USING (true);

-- Events milestones policies (public read access)
CREATE POLICY "Public read access to events milestones" ON events_milestones
    FOR SELECT USING (true);

-- Public notice violations policies (public read access)
CREATE POLICY "Public read access to public notice violations" ON public_notice_violations
    FOR SELECT USING (true);

-- Reference codes policies (public read access)
CREATE POLICY "Public read access to reference codes" ON reference_codes
    FOR SELECT USING (true);

-- ANSI areas policies (public read access)
CREATE POLICY "Public read access to ansi areas" ON ansi_areas
    FOR SELECT USING (true);

-- Audit log policies (admin only)
CREATE POLICY "Only admins can view audit log" ON audit_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User sessions policies (users can view their own sessions)
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DEFAULT ROLE PERMISSIONS
-- =====================================================

-- Public role permissions (read-only access to public data)
INSERT INTO role_permissions (role, permission) VALUES
('public', 'read_public_data');

-- Operator role permissions
INSERT INTO role_permissions (role, permission) VALUES
('operator', 'read_public_data'),
('operator', 'read_operator_data'),
('operator', 'write_operator_data'),
('operator', 'export_data'),
('operator', 'view_analytics');

-- Laboratory role permissions
INSERT INTO role_permissions (role, permission) VALUES
('laboratory', 'read_public_data'),
('laboratory', 'read_lab_data'),
('laboratory', 'write_lab_data'),
('laboratory', 'export_data'),
('laboratory', 'view_analytics');

-- EPD staff role permissions
INSERT INTO role_permissions (role, permission) VALUES
('epd_staff', 'read_public_data'),
('epd_staff', 'read_operator_data'),
('epd_staff', 'read_lab_data'),
('epd_staff', 'read_epd_data'),
('epd_staff', 'write_epd_data'),
('epd_staff', 'export_data'),
('epd_staff', 'import_data'),
('epd_staff', 'view_analytics');

-- EPA staff role permissions
INSERT INTO role_permissions (role, permission) VALUES
('epa_staff', 'read_public_data'),
('epa_staff', 'read_operator_data'),
('epa_staff', 'read_lab_data'),
('epa_staff', 'read_epd_data'),
('epa_staff', 'read_epa_data'),
('epa_staff', 'write_epa_data'),
('epa_staff', 'export_data'),
('epa_staff', 'view_analytics');

-- Admin role permissions (full access)
INSERT INTO role_permissions (role, permission) VALUES
('admin', 'read_public_data'),
('admin', 'read_operator_data'),
('admin', 'read_lab_data'),
('admin', 'read_epd_data'),
('admin', 'read_epa_data'),
('admin', 'write_operator_data'),
('admin', 'write_lab_data'),
('admin', 'write_epd_data'),
('admin', 'write_epa_data'),
('admin', 'export_data'),
('admin', 'import_data'),
('admin', 'manage_users'),
('admin', 'view_analytics'),
('admin', 'manage_system');

-- =====================================================
-- INDEXES FOR AUTHENTICATION TABLES
-- =====================================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_pwsid ON user_profiles(pwsid);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);

-- Role permissions indexes
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Audit log indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at); 