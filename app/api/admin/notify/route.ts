import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/notifications/email'
import type { NotifyPayload } from '@/lib/types'

// Internal endpoint — called fire-and-forget from server routes and cron
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as NotifyPayload
    await sendNotification(payload)
  } catch { /* non-critical — never fail callers */ }
  return NextResponse.json({ ok: true })
}
