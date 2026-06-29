import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJwt } from '@/lib/auth/session'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = 20
  const offset = (page - 1) * limit

  const db = createServerClient()
  const { data, count, error } = await db
    .from('sessions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sessions: data, total: count, page, limit })
}
