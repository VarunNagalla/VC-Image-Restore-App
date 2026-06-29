import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJwt } from '@/lib/auth/session'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = createServerClient()
  const { data } = await db.from('site_settings').select('key, value')
  return NextResponse.json({ settings: data ?? [] })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { key, value } = await req.json()
  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const db = createServerClient()
  const { error } = await db.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
