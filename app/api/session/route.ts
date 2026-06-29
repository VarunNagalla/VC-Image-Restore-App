import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { DeviceType, FeatureName } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { user_name, device_type, features_used, image_count } = await req.json() as {
    user_name: string
    device_type: DeviceType
    features_used: FeatureName[]
    image_count: number
  }

  const db = createServerClient()
  const { error } = await db.from('sessions').insert({
    user_name,
    device_type,
    features_used,
    image_count,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  fetch(`${req.nextUrl.origin}/api/admin/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'session',
      data: { user_name, device_type, image_count, timestamp: new Date().toISOString() },
    }),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
