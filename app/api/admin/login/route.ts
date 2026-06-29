import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, checkBruteForce, recordLoginAttempt } from '@/lib/auth/admin'
import { signAdminJwt } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { username, password } = await req.json()

  if (await checkBruteForce(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  const validUser = username === process.env.ADMIN_USERNAME
  const validPass = validUser ? await verifyAdminPassword(password) : false

  if (!validUser || !validPass) {
    await recordLoginAttempt(ip, false)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  await recordLoginAttempt(ip, true)

  // Fire login notification (non-blocking)
  fetch(`${req.nextUrl.origin}/api/admin/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'login', data: { ip, timestamp: new Date().toISOString() } }),
  }).catch(() => {})

  const token = await signAdminJwt(ip)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
  return res
}
