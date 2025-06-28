-- Database Functions and Stored Procedures for SDWIS Data
-- These functions provide a secure API layer and prevent SQL injection

-- =====================================================
-- PUBLIC WATER SYSTEMS FUNCTIONS
-- =====================================================

-- Get water system by PWSID
CREATE OR REPLACE FUNCTION get_water_system_by_pwsid(p_pwsid VARCHAR(9))
RETURNS TABLE (
    id UUID,
    submission_year_quarter VARCHAR(7),
    pwsid VARCHAR(9),
    pws_name VARCHAR(100),
    primacy_agency_code VARCHAR(2),
    epa_region VARCHAR(2),
    pws_activity_code pws_activity_enum,
    pws_type_code pws_type_enum,
    owner_type_code owner_type_enum,
    population_served_count INTEGER,
    primary_source_code primary_source_enum,
    service_connections_count INTEGER,
    org_name VARCHAR(100),
    admin_name VARCHAR(100),
    email_addr VARCHAR(100),
    phone_number VARCHAR(15),
    address_line1 VARCHAR(200),
    city_name VARCHAR(40),
    state_code VARCHAR(2),
    zip_code VARCHAR(14),
    first_reported_date DATE,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pws.id,
        pws.submission_year_quarter,
        pws.pwsid,
        pws.pws_name,
        pws.primacy_agency_code,
        pws.epa_region,
        pws.pws_activity_code,
        pws.pws_type_code,
        pws.owner_type_code,
        pws.population_served_count,
        pws.primary_source_code,
        pws.service_connections_count,
        pws.org_name,
        pws.admin_name,
        pws.email_addr,
        pws.phone_number,
        pws.address_line1,
        pws.city_name,
        pws.state_code,
        pws.zip_code,
        pws.first_reported_date,
        pws.last_reported_date,
        pws.created_at,
        pws.updated_at
    FROM public_water_systems pws
    WHERE pws.pwsid = p_pwsid
    ORDER BY pws.submission_year_quarter DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search water systems with filters
CREATE OR REPLACE FUNCTION search_water_systems(
    p_search_term VARCHAR(100) DEFAULT NULL,
    p_state_code VARCHAR(2) DEFAULT NULL,
    p_pws_type VARCHAR(10) DEFAULT NULL,
    p_activity_status VARCHAR(10) DEFAULT NULL,
    p_has_violations BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    pwsid VARCHAR(9),
    pws_name VARCHAR(100),
    pws_type_code pws_type_enum,
    pws_activity_code pws_activity_enum,
    population_served_count INTEGER,
    city_name VARCHAR(40),
    state_code VARCHAR(2),
    violation_count BIGINT,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pws.id,
        pws.pwsid,
        pws.pws_name,
        pws.pws_type_code,
        pws.pws_activity_code,
        pws.population_served_count,
        pws.city_name,
        pws.state_code,
        COALESCE(viol.violation_count, 0) as violation_count,
        pws.last_reported_date,
        pws.created_at
    FROM public_water_systems pws
    LEFT JOIN (
        SELECT 
            pwsid,
            COUNT(*) as violation_count
        FROM violations_enforcement
        WHERE violation_status = 'Unaddressed'
        GROUP BY pwsid
    ) viol ON pws.pwsid = viol.pwsid
    WHERE 
        (p_search_term IS NULL OR 
         pws.pws_name ILIKE '%' || p_search_term || '%' OR 
         pws.pwsid ILIKE '%' || p_search_term || '%' OR
         pws.city_name ILIKE '%' || p_search_term || '%')
        AND (p_state_code IS NULL OR pws.state_code = p_state_code)
        AND (p_pws_type IS NULL OR pws.pws_type_code::VARCHAR = p_pws_type)
        AND (p_activity_status IS NULL OR pws.pws_activity_code::VARCHAR = p_activity_status)
        AND (p_has_violations IS NULL OR 
             (p_has_violations = true AND viol.violation_count > 0) OR
             (p_has_violations = false AND (viol.violation_count = 0 OR viol.violation_count IS NULL)))
    ORDER BY pws.pws_name
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get water system statistics
CREATE OR REPLACE FUNCTION get_water_system_stats()
RETURNS TABLE (
    total_systems BIGINT,
    active_systems BIGINT,
    systems_with_violations BIGINT,
    total_population_served BIGINT,
    avg_population_per_system NUMERIC,
    systems_by_type JSON,
    systems_by_state JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total_systems,
            COUNT(*) FILTER (WHERE pws_activity_code = 'A') as active_systems,
            COUNT(DISTINCT pwsid) FILTER (WHERE pwsid IN (
                SELECT DISTINCT pwsid FROM violations_enforcement 
                WHERE violation_status = 'Unaddressed'
            )) as systems_with_violations,
            COALESCE(SUM(population_served_count), 0) as total_population_served,
            COALESCE(AVG(population_served_count), 0) as avg_population_per_system
        FROM public_water_systems
        WHERE submission_year_quarter = (SELECT MAX(submission_year_quarter) FROM public_water_systems)
    ),
    type_stats AS (
        SELECT 
            pws_type_code,
            COUNT(*) as count
        FROM public_water_systems
        WHERE submission_year_quarter = (SELECT MAX(submission_year_quarter) FROM public_water_systems)
        GROUP BY pws_type_code
    ),
    state_stats AS (
        SELECT 
            state_code,
            COUNT(*) as count
        FROM public_water_systems
        WHERE submission_year_quarter = (SELECT MAX(submission_year_quarter) FROM public_water_systems)
        GROUP BY state_code
    )
    SELECT 
        s.total_systems,
        s.active_systems,
        s.systems_with_violations,
        s.total_population_served,
        s.avg_population_per_system,
        (SELECT json_agg(json_build_object('type', pws_type_code, 'count', count)) FROM type_stats) as systems_by_type,
        (SELECT json_agg(json_build_object('state', state_code, 'count', count)) FROM state_stats) as systems_by_state
    FROM stats s;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIOLATIONS FUNCTIONS
-- =====================================================

-- Get violations for a water system
CREATE OR REPLACE FUNCTION get_violations_by_pwsid(
    p_pwsid VARCHAR(9),
    p_status VARCHAR(20) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    violation_id VARCHAR(20),
    violation_code VARCHAR(4),
    violation_category_code violation_category_enum,
    is_health_based_ind CHAR(1),
    contaminant_code VARCHAR(4),
    viol_measure NUMERIC,
    unit_of_measure VARCHAR(9),
    federal_mcl VARCHAR(31),
    violation_status violation_status_enum,
    public_notification_tier INTEGER,
    compl_per_begin_date DATE,
    compl_per_end_date DATE,
    non_compl_per_begin_date DATE,
    non_compl_per_end_date DATE,
    calculated_rtc_date DATE,
    enforcement_id VARCHAR(20),
    enforcement_date DATE,
    enforcement_action_type_code VARCHAR(4),
    enf_action_category enforcement_category_enum,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ve.id,
        ve.violation_id,
        ve.violation_code,
        ve.violation_category_code,
        ve.is_health_based_ind,
        ve.contaminant_code,
        ve.viol_measure,
        ve.unit_of_measure,
        ve.federal_mcl,
        ve.violation_status,
        ve.public_notification_tier,
        ve.compl_per_begin_date,
        ve.compl_per_end_date,
        ve.non_compl_per_begin_date,
        ve.non_compl_per_end_date,
        ve.calculated_rtc_date,
        ve.enforcement_id,
        ve.enforcement_date,
        ve.enforcement_action_type_code,
        ve.enf_action_category,
        ve.created_at
    FROM violations_enforcement ve
    WHERE ve.pwsid = p_pwsid
        AND (p_status IS NULL OR ve.violation_status::VARCHAR = p_status)
    ORDER BY ve.non_compl_per_begin_date DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get violation statistics
CREATE OR REPLACE FUNCTION get_violation_stats()
RETURNS TABLE (
    total_violations BIGINT,
    active_violations BIGINT,
    health_based_violations BIGINT,
    violations_by_category JSON,
    violations_by_status JSON,
    avg_resolution_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH violation_stats AS (
        SELECT 
            COUNT(*) as total_violations,
            COUNT(*) FILTER (WHERE violation_status = 'Unaddressed') as active_violations,
            COUNT(*) FILTER (WHERE is_health_based_ind = 'Y') as health_based_violations,
            AVG(
                CASE 
                    WHEN violation_status = 'Resolved' AND non_compl_per_begin_date IS NOT NULL AND calculated_rtc_date IS NOT NULL
                    THEN EXTRACT(DAY FROM (calculated_rtc_date - non_compl_per_begin_date))
                    ELSE NULL
                END
            ) as avg_resolution_days
        FROM violations_enforcement
        WHERE submission_year_quarter = (SELECT MAX(submission_year_quarter) FROM violations_enforcement)
    ),
    category_stats AS (
        SELECT 
            violation_category_code,
            COUNT(*) as count
        FROM violations_enforcement
        WHERE submission_year_quarter = (SELECT MAX(submission_year_quarter) FROM violations_enforcement)
        GROUP BY violation_category_code
    ),
    status_stats AS (
        SELECT 
            violation_status,
            COUNT(*) as count
        FROM violations_enforcement
        WHERE submission_year_quarter = (SELECT MAX(submission_year_quarter) FROM violations_enforcement)
        GROUP BY violation_status
    )
    SELECT 
        vs.total_violations,
        vs.active_violations,
        vs.health_based_violations,
        (SELECT json_agg(json_build_object('category', violation_category_code, 'count', count)) FROM category_stats) as violations_by_category,
        (SELECT json_agg(json_build_object('status', violation_status, 'count', count)) FROM status_stats) as violations_by_status,
        vs.avg_resolution_days
    FROM violation_stats vs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FACILITIES FUNCTIONS
-- =====================================================

-- Get facilities for a water system
CREATE OR REPLACE FUNCTION get_facilities_by_pwsid(p_pwsid VARCHAR(9))
RETURNS TABLE (
    id UUID,
    facility_id VARCHAR(12),
    facility_name VARCHAR(100),
    facility_type_code facility_type_enum,
    facility_activity_code pws_activity_enum,
    is_source_ind CHAR(1),
    water_type_code water_type_enum,
    availability_code availability_enum,
    first_reported_date DATE,
    last_reported_date DATE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.facility_id,
        f.facility_name,
        f.facility_type_code,
        f.facility_activity_code,
        f.is_source_ind,
        f.water_type_code,
        f.availability_code,
        f.first_reported_date,
        f.last_reported_date,
        f.created_at
    FROM facilities f
    WHERE f.pwsid = p_pwsid
    ORDER BY f.facility_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SITE VISITS FUNCTIONS
-- =====================================================

-- Get site visits for a water system
CREATE OR REPLACE FUNCTION get_site_visits_by_pwsid(
    p_pwsid VARCHAR(9),
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    visit_id VARCHAR(20),
    visit_date DATE,
    agency_type_code VARCHAR(2),
    visit_reason_code VARCHAR(4),
    management_ops_eval_code evaluation_code_enum,
    source_water_eval_code evaluation_code_enum,
    security_eval_code evaluation_code_enum,
    compliance_eval_code evaluation_code_enum,
    visit_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sv.id,
        sv.visit_id,
        sv.visit_date,
        sv.agency_type_code,
        sv.visit_reason_code,
        sv.management_ops_eval_code,
        sv.source_water_eval_code,
        sv.security_eval_code,
        sv.compliance_eval_code,
        sv.visit_comments,
        sv.created_at
    FROM site_visits sv
    WHERE sv.pwsid = p_pwsid
    ORDER BY sv.visit_date DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- LEAD AND COPPER FUNCTIONS
-- =====================================================

-- Get lead and copper samples for a water system
CREATE OR REPLACE FUNCTION get_lead_copper_samples_by_pwsid(
    p_pwsid VARCHAR(9),
    p_contaminant_code VARCHAR(4) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    sample_id VARCHAR(20),
    contaminant_code VARCHAR(4),
    result_sign_code result_sign_enum,
    sample_measure NUMERIC,
    unit_of_measure VARCHAR(4),
    sampling_start_date DATE,
    sampling_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lcs.id,
        lcs.sample_id,
        lcs.contaminant_code,
        lcs.result_sign_code,
        lcs.sample_measure,
        lcs.unit_of_measure,
        lcs.sampling_start_date,
        lcs.sampling_end_date,
        lcs.created_at
    FROM lead_copper_samples lcs
    WHERE lcs.pwsid = p_pwsid
        AND (p_contaminant_code IS NULL OR lcs.contaminant_code = p_contaminant_code)
    ORDER BY lcs.sampling_end_date DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GEOGRAPHIC FUNCTIONS
-- =====================================================

-- Get geographic areas for a water system
CREATE OR REPLACE FUNCTION get_geographic_areas_by_pwsid(p_pwsid VARCHAR(9))
RETURNS TABLE (
    id UUID,
    geo_id VARCHAR(20),
    area_type_code area_type_enum,
    tribal_code VARCHAR(10),
    state_served VARCHAR(4),
    ansi_entity_code VARCHAR(4),
    zip_code_served VARCHAR(5),
    city_served VARCHAR(40),
    county_served VARCHAR(40),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ga.id,
        ga.geo_id,
        ga.area_type_code,
        ga.tribal_code,
        ga.state_served,
        ga.ansi_entity_code,
        ga.zip_code_served,
        ga.city_served,
        ga.county_served,
        ga.created_at
    FROM geographic_areas ga
    WHERE ga.pwsid = p_pwsid
    ORDER BY ga.area_type_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REFERENCE DATA FUNCTIONS
-- =====================================================

-- Get reference codes by type
CREATE OR REPLACE FUNCTION get_reference_codes(p_value_type VARCHAR(40))
RETURNS TABLE (
    value_code VARCHAR(40),
    value_description VARCHAR(250)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.value_code,
        rc.value_description
    FROM reference_codes rc
    WHERE rc.value_type = p_value_type
    ORDER BY rc.value_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Get compliance trends over time
CREATE OR REPLACE FUNCTION get_compliance_trends(
    p_months_back INTEGER DEFAULT 12
)
RETURNS TABLE (
    month_date DATE,
    total_systems BIGINT,
    compliant_systems BIGINT,
    non_compliant_systems BIGINT,
    compliance_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_stats AS (
        SELECT 
            DATE_TRUNC('month', ve.non_compl_per_begin_date) as month_date,
            COUNT(DISTINCT pws.pwsid) as total_systems,
            COUNT(DISTINCT pws.pwsid) FILTER (WHERE ve.violation_status = 'Resolved') as compliant_systems,
            COUNT(DISTINCT pws.pwsid) FILTER (WHERE ve.violation_status = 'Unaddressed') as non_compliant_systems
        FROM public_water_systems pws
        LEFT JOIN violations_enforcement ve ON pws.pwsid = ve.pwsid
        WHERE pws.submission_year_quarter = (SELECT MAX(submission_year_quarter) FROM public_water_systems)
            AND (ve.non_compl_per_begin_date IS NULL OR ve.non_compl_per_begin_date >= CURRENT_DATE - INTERVAL '1 month' * p_months_back)
        GROUP BY DATE_TRUNC('month', ve.non_compl_per_begin_date)
    )
    SELECT 
        ms.month_date,
        ms.total_systems,
        ms.compliant_systems,
        ms.non_compliant_systems,
        CASE 
            WHEN ms.total_systems > 0 
            THEN ROUND((ms.compliant_systems::NUMERIC / ms.total_systems::NUMERIC) * 100, 2)
            ELSE 0
        END as compliance_rate
    FROM monthly_stats ms
    ORDER BY ms.month_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DATA IMPORT FUNCTIONS
-- =====================================================

-- Bulk insert water systems (for data import)
CREATE OR REPLACE FUNCTION bulk_insert_water_systems(
    p_data JSON
)
RETURNS INTEGER AS $$
DECLARE
    record_count INTEGER := 0;
    record_data JSON;
BEGIN
    -- Loop through each record in the JSON array
    FOR record_data IN SELECT * FROM json_array_elements(p_data)
    LOOP
        INSERT INTO public_water_systems (
            submission_year_quarter,
            pwsid,
            pws_name,
            primacy_agency_code,
            epa_region,
            season_begin_date,
            season_end_date,
            pws_activity_code,
            pws_deactivation_date,
            pws_type_code,
            dbpr_schedule_cat_code,
            cds_id,
            gw_sw_code,
            lt2_schedule_cat_code,
            owner_type_code,
            population_served_count,
            pop_cat_2_code,
            pop_cat_3_code,
            pop_cat_4_code,
            pop_cat_5_code,
            pop_cat_11_code,
            primacy_type,
            primary_source_code,
            is_grant_eligible_ind,
            is_wholesaler_ind,
            is_school_or_daycare_ind,
            service_connections_count,
            submission_status_code,
            org_name,
            admin_name,
            email_addr,
            phone_number,
            phone_ext_number,
            fax_number,
            alt_phone_number,
            address_line1,
            address_line2,
            city_name,
            zip_code,
            country_code,
            first_reported_date,
            last_reported_date,
            state_code,
            source_water_protection_code,
            source_protection_begin_date,
            outstanding_performer,
            outstanding_perform_begin_date,
            reduced_rtcr_monitoring,
            reduced_monitoring_begin_date,
            reduced_monitoring_end_date,
            seasonal_startup_system
        ) VALUES (
            (record_data->>'submission_year_quarter')::VARCHAR(7),
            (record_data->>'pwsid')::VARCHAR(9),
            record_data->>'pws_name',
            record_data->>'primacy_agency_code',
            record_data->>'epa_region',
            record_data->>'season_begin_date',
            record_data->>'season_end_date',
            (record_data->>'pws_activity_code')::pws_activity_enum,
            (record_data->>'pws_deactivation_date')::DATE,
            (record_data->>'pws_type_code')::pws_type_enum,
            record_data->>'dbpr_schedule_cat_code',
            record_data->>'cds_id',
            record_data->>'gw_sw_code',
            record_data->>'lt2_schedule_cat_code',
            (record_data->>'owner_type_code')::owner_type_enum,
            (record_data->>'population_served_count')::INTEGER,
            record_data->>'pop_cat_2_code',
            record_data->>'pop_cat_3_code',
            record_data->>'pop_cat_4_code',
            record_data->>'pop_cat_5_code',
            record_data->>'pop_cat_11_code',
            record_data->>'primacy_type',
            (record_data->>'primary_source_code')::primary_source_enum,
            record_data->>'is_grant_eligible_ind',
            record_data->>'is_wholesaler_ind',
            record_data->>'is_school_or_daycare_ind',
            (record_data->>'service_connections_count')::INTEGER,
            (record_data->>'submission_status_code')::submission_status_enum,
            record_data->>'org_name',
            record_data->>'admin_name',
            record_data->>'email_addr',
            record_data->>'phone_number',
            record_data->>'phone_ext_number',
            record_data->>'fax_number',
            record_data->>'alt_phone_number',
            record_data->>'address_line1',
            record_data->>'address_line2',
            record_data->>'city_name',
            record_data->>'zip_code',
            record_data->>'country_code',
            (record_data->>'first_reported_date')::DATE,
            (record_data->>'last_reported_date')::DATE,
            record_data->>'state_code',
            record_data->>'source_water_protection_code',
            (record_data->>'source_protection_begin_date')::DATE,
            record_data->>'outstanding_performer',
            (record_data->>'outstanding_perform_begin_date')::DATE,
            record_data->>'reduced_rtcr_monitoring',
            (record_data->>'reduced_monitoring_begin_date')::DATE,
            (record_data->>'reduced_monitoring_end_date')::DATE,
            record_data->>'seasonal_startup_system'
        )
        ON CONFLICT (submission_year_quarter, pwsid) 
        DO UPDATE SET
            pws_name = EXCLUDED.pws_name,
            pws_activity_code = EXCLUDED.pws_activity_code,
            pws_type_code = EXCLUDED.pws_type_code,
            population_served_count = EXCLUDED.population_served_count,
            primary_source_code = EXCLUDED.primary_source_code,
            service_connections_count = EXCLUDED.service_connections_count,
            org_name = EXCLUDED.org_name,
            admin_name = EXCLUDED.admin_name,
            email_addr = EXCLUDED.email_addr,
            phone_number = EXCLUDED.phone_number,
            address_line1 = EXCLUDED.address_line1,
            city_name = EXCLUDED.city_name,
            state_code = EXCLUDED.state_code,
            zip_code = EXCLUDED.zip_code,
            last_reported_date = EXCLUDED.last_reported_date,
            updated_at = NOW();
        
        record_count := record_count + 1;
    END LOOP;
    
    RETURN record_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon; 