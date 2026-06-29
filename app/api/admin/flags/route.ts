import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJwt } from '@/lib/auth/session'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = createServerClient()
  const { data } = await db.from('feature_flags').select('*')
  return NextResponse.json({ flags: data ?? [] })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { feature_name, enabled } = await req.json()
  if (!feature_name || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const db = createServerClient()
  const { error } = await db.from('feature_flags')
    .upsert({ feature_name, enabled, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  fetch(`${req.nextUrl.origin}/api/admin/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'flag_change', data: { feature_name, enabled } }),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
