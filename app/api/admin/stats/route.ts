import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJwt } from '@/lib/auth/session'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [todaySessions, weekSessions, allSessions] = await Promise.all([
    db.from('sessions').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    db.from('sessions').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
    db.from('sessions').select('image_count, features_used'),
  ])

  const sessions = allSessions.data ?? []
  const totalImages = sessions.reduce((s, r) => s + (r.image_count ?? 0), 0)

  const featureCount: Record<string, number> = {}
  for (const row of sessions) {
    for (const f of (row.features_used ?? [])) {
      featureCount[f] = (featureCount[f] ?? 0) + 1
    }
  }
  const mostUsedFeature = Object.entries(featureCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return NextResponse.json({
    sessions_today: todaySessions.count ?? 0,
    sessions_this_week: weekSessions.count ?? 0,
    sessions_all_time: sessions.length,
    images_processed_all_time: totalImages,
    most_used_feature: mostUsedFeature,
  })
}
