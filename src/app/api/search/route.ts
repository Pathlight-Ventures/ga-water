import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

// Mock data for demo mode
const mockWaterSystems = [
  {
    pwsid: 'GA0000001',
    pws_name: 'Atlanta Water Plant #1',
    county_served: 'Fulton',
    pws_type_code: 'CWS',
    primary_source_code: 'SW',
    city_name: 'Atlanta',
    state_code: 'GA',
    activity_status_code: 'A',
    population_served: 500000,
    service_connections: 150000
  },
  {
    pwsid: 'GA0000002',
    pws_name: 'Savannah Water System',
    county_served: 'Chatham',
    pws_type_code: 'CWS',
    primary_source_code: 'GW',
    city_name: 'Savannah',
    state_code: 'GA',
    activity_status_code: 'A',
    population_served: 150000,
    service_connections: 45000
  },
  {
    pwsid: 'GA0000003',
    pws_name: 'Augusta Water Treatment Facility',
    county_served: 'Richmond',
    pws_type_code: 'CWS',
    primary_source_code: 'SW',
    city_name: 'Augusta',
    state_code: 'GA',
    activity_status_code: 'A',
    population_served: 200000,
    service_connections: 60000
  },
  {
    pwsid: 'GA0000004',
    pws_name: 'Columbus Water Works',
    county_served: 'Muscogee',
    pws_type_code: 'CWS',
    primary_source_code: 'SW',
    city_name: 'Columbus',
    state_code: 'GA',
    activity_status_code: 'A',
    population_served: 180000,
    service_connections: 55000
  },
  {
    pwsid: 'GA0000005',
    pws_name: 'Athens-Clarke County Water System',
    county_served: 'Clarke',
    pws_type_code: 'CWS',
    primary_source_code: 'GW',
    city_name: 'Athens',
    state_code: 'GA',
    activity_status_code: 'A',
    population_served: 120000,
    service_connections: 35000
  },
  {
    pwsid: 'GA0000006',
    pws_name: 'Macon Water Authority',
    county_served: 'Bibb',
    pws_type_code: 'CWS',
    primary_source_code: 'SW',
    city_name: 'Macon',
    state_code: 'GA',
    activity_status_code: 'A',
    population_served: 160000,
    service_connections: 48000
  }
]

function filterMockData(data: typeof mockWaterSystems, body: { search?: string; waterSystemNo?: string; waterSystemName?: string; county?: string; systemType?: string; sourceType?: string }) {
  let results = [...data]

  // Filter by search term
  if (body.search) {
    const searchLower = body.search.toLowerCase()
    results = results.filter(sys => 
      sys.pws_name.toLowerCase().includes(searchLower) ||
      sys.pwsid.toLowerCase().includes(searchLower) ||
      sys.county_served.toLowerCase().includes(searchLower)
    )
  }

  // Filter by water system number
  if (body.waterSystemNo) {
    results = results.filter(sys => sys.pwsid === body.waterSystemNo)
  }

  // Filter by water system name
  if (body.waterSystemName) {
    const nameLower = body.waterSystemName.toLowerCase()
    results = results.filter(sys => sys.pws_name.toLowerCase().includes(nameLower))
  }

  // Filter by county
  if (body.county && body.county !== 'All') {
    results = results.filter(sys => sys.county_served === body.county)
  }

  // Filter by system type
  if (body.systemType && body.systemType !== 'All') {
    results = results.filter(sys => sys.pws_type_code === body.systemType)
  }

  // Filter by source type
  if (body.sourceType && body.sourceType !== 'All') {
    results = results.filter(sys => sys.primary_source_code === body.sourceType)
  }

  return results.slice(0, 50)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Check if we're in demo mode (no Supabase configured)
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isDemoMode) {
    // Return mock data for demo
    const results = filterMockData(mockWaterSystems, body)
    return NextResponse.json({ results })
  }

  // Use real Supabase if configured
  const supabase = createSupabaseClient()

  // Build query
  let query = supabase.from('public_water_systems').select('*')

  if (body.search) {
    query = query.ilike('pws_name', `%${body.search}%`)
  }
  if (body.waterSystemNo) {
    query = query.eq('pwsid', body.waterSystemNo)
  }
  if (body.waterSystemName) {
    query = query.ilike('pws_name', `%${body.waterSystemName}%`)
  }
  if (body.county && body.county !== 'All') {
    query = query.eq('county_served', body.county)
  }
  if (body.systemType && body.systemType !== 'All') {
    query = query.eq('pws_type_code', body.systemType)
  }
  if (body.sourceType && body.sourceType !== 'All') {
    query = query.eq('primary_source_code', body.sourceType)
  }
  if (body.contactType && body.contactType !== 'None') {
    query = query.eq('point_of_contact_type', body.contactType)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ results: data || [] })
} 