import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  const body = await req.json()
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
  // Sample class, date range, etc. can be added as needed

  const { data, error } = await query.limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ results: data })
} 