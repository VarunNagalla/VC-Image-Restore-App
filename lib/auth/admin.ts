import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase/server'

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH!
  return bcrypt.compare(password, hash)
}

export async function checkBruteForce(ip: string): Promise<boolean> {
  const db = createServerClient()
  const { data } = await db
    .from('login_attempts')
    .select('attempt_count, locked_until')
    .eq('ip_address', ip)
    .single()

  if (!data) return false
  if (data.locked_until && new Date(data.locked_until) > new Date()) return true
  return false
}

export async function recordLoginAttempt(ip: string, success: boolean): Promise<void> {
  const db = createServerClient()
  if (success) {
    await db.from('login_attempts').delete().eq('ip_address', ip)
    return
  }
  const { data } = await db
    .from('login_attempts')
    .select('attempt_count')
    .eq('ip_address', ip)
    .single()

  const attempts = (data?.attempt_count ?? 0) + 1
  const lockedUntil =
    attempts >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
      : null

  await db.from('login_attempts').upsert({
    ip_address: ip,
    attempt_count: attempts,
    locked_until: lockedUntil,
    last_attempt: new Date().toISOString(),
  })
}

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 12)
}
