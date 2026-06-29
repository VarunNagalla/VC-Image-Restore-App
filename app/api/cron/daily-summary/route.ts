import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/notifications/email'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: sessions } = await db
    .from('sessions')
    .select('user_name, image_count, features_used')
    .gte('created_at', todayStart.toISOString())

  const totalImages = (sessions ?? []).reduce((s, r) => s + (r.image_count ?? 0), 0)
  const featureMap: Record<string, number> = {}
  ;(sessions ?? []).forEach(s => (s.features_used ?? []).forEach((f: string) => { featureMap[f] = (featureMap[f] ?? 0) + 1 }))
  const topFeature = Object.entries(featureMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none'

  await sendNotification({
    event: 'daily_summary',
    data: {
      sessions_today: sessions?.length ?? 0,
      images_processed: totalImages,
      top_feature: topFeature,
      date: todayStart.toISOString().slice(0, 10),
    },
  })

  return NextResponse.json({ ok: true })
}
