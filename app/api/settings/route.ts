import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const db = createServerClient()
  const [{ data: settings }, { data: flags }] = await Promise.all([
    db.from('site_settings').select('key, value'),
    db.from('feature_flags').select('feature_name, enabled'),
  ])
  return NextResponse.json({ settings, flags })
}
