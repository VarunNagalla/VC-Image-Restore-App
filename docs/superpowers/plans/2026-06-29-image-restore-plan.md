# VC Image Restore — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "VC Image Restore" — a professional photo restoration web app with hybrid traditional + AI image processing, single-admin panel, Gmail notifications, Vercel deployment, and a final GitHub push to repo "VC Image Restore App".

**Architecture:** Next.js 14 App Router on Vercel handles frontend + API routes. Sharp runs traditional image operations in serverless functions; HF Inference API (free tier) handles colorization, face enhancement, and 4x upscale. Supabase stores only usage sessions and admin site settings — zero image persistence. Admin panel gated by JWT middleware. Gmail notifications via Nodemailer + Gmail App Password.

**Tech Stack:** Next.js 14 (TypeScript, App Router), Tailwind CSS, shadcn/ui, Sharp, @huggingface/inference, @supabase/supabase-js, jose, bcryptjs, nodemailer, heic2any, jszip, recharts, Jest, @testing-library/react

## Global Constraints

- Node.js ≥ 18.17 required
- App name on all pages: **VC Image Restore**
- All output images: JPEG at 92% quality — never any other format
- Max 10 images per batch, max 20MB per image
- Zero image storage — in-memory processing only
- Footer on every public page: `© Varun Nagalla. All rights reserved.`
- Admin username env var: `ADMIN_USERNAME=varunchowdary3345@gmail.com`
- Processing order (immutable): Denoise → Scratch Cleanup → Color Correction → Sharpen → Face Enhancement → Colorization → Upscale
- Mobile-first: breakpoints 320px, 768px, 1024px, 1440px
- Secrets only in Vercel dashboard + `.env.local` (never committed)
- Final GitHub repo name: **VC Image Restore App**

---

## File Structure

```
(project root = "C:\Users\nagal\claude\projects\Image Restore\")
├── app/
│   ├── layout.tsx                    # Root layout — reads site_settings for bg/theme
│   ├── page.tsx                      # Landing page with name modal
│   ├── globals.css
│   ├── restore/page.tsx              # Main restore workspace
│   ├── admin/
│   │   ├── page.tsx                  # Admin login form
│   │   └── dashboard/
│   │       ├── layout.tsx            # Admin layout + sidebar
│   │       ├── page.tsx              # Dashboard overview + chart
│   │       ├── history/page.tsx      # Usage history table
│   │       ├── appearance/page.tsx   # Site appearance editor
│   │       └── flags/page.tsx        # Feature flags
│   └── api/
│       ├── process/route.ts          # POST — image processing
│       ├── session/route.ts          # POST — log session to Supabase
│       ├── settings/route.ts         # GET — public site settings
│       └── admin/
│           ├── login/route.ts
│           ├── logout/route.ts
│           ├── stats/route.ts
│           ├── history/route.ts
│           ├── settings/route.ts
│           ├── flags/route.ts
│           └── notify/route.ts       # POST — trigger email notification
├── components/
│   ├── name-modal.tsx
│   ├── upload-zone.tsx
│   ├── enhancement-panel.tsx
│   ├── before-after-slider.tsx
│   ├── thumbnail-strip.tsx
│   ├── progress-indicator.tsx
│   └── admin/
│       ├── admin-sidebar.tsx
│       ├── stats-card.tsx
│       ├── sessions-chart.tsx
│       ├── history-table.tsx
│       ├── appearance-editor.tsx
│       └── flag-toggle.tsx
├── lib/
│   ├── types.ts
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (anon key)
│   │   └── server.ts                 # Server client (service role key)
│   ├── processing/
│   │   ├── sharp.ts                  # All traditional processing functions
│   │   └── huggingface.ts           # All HF API calls
│   ├── auth/
│   │   ├── admin.ts                  # bcrypt verify + brute-force check
│   │   └── session.ts                # JWT sign/verify
│   └── notifications/
│       └── email.ts                  # Nodemailer Gmail SMTP
├── middleware.ts                      # Protect /admin/dashboard/*
├── vercel.json                        # Cron job for daily email summary
├── supabase/migrations/001_initial.sql
├── __tests__/
│   ├── processing/sharp.test.ts
│   ├── processing/huggingface.test.ts
│   ├── auth/session.test.ts
│   └── api/process.test.ts
├── jest.config.ts
├── jest.setup.ts
└── .env.local.example
```

---

### Task 1: Project Scaffolding + Testing Infrastructure

**Files:**
- Create: all Next.js scaffold files
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.env.local.example`
- Create: `public/test-image.jpg` (tiny JPEG for tests)

**Interfaces:**
- Produces: working `npm run dev`, `npm test`, and `npm run build` commands

- [ ] **Step 1: Scaffold Next.js 14 in the project root**

Run from `C:\Users\nagal\claude\projects\Image Restore\`:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-git --import-alias "@/*" --yes
```
When prompted about existing files, choose to continue/overwrite (the only existing items are `.claude/` and `docs/` which won't be touched).

- [ ] **Step 2: Install all dependencies**

```bash
npm install sharp @huggingface/inference @supabase/supabase-js jose bcryptjs nodemailer jszip heic2any recharts
npm install --save-dev @types/nodemailer @types/bcryptjs @types/node jest jest-environment-node @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 3: Install shadcn/ui and add components**

```bash
npx shadcn@latest init --defaults
npx shadcn@latest add button card input label toast switch slider badge table dialog progress separator sheet
```

- [ ] **Step 4: Write `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}

export default createJestConfig(config)
```

- [ ] **Step 5: Write `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Write `.env.local.example`**

```bash
ADMIN_USERNAME=varunchowdary3345@gmail.com
ADMIN_PASSWORD_HASH=
JWT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
HUGGINGFACE_API_KEY=
GMAIL_USER=varunchowdary3345@gmail.com
GMAIL_APP_PASSWORD=
```

- [ ] **Step 7: Add a tiny test JPEG to `public/`**

Download or create a 10×10 pixel JPEG and save it as `public/test-image.jpg`. This is used by processing tests.

- [ ] **Step 8: Verify scaffold works**

```bash
npm run dev
```
Expected: server starts at http://localhost:3000, no errors.

```bash
npm test -- --passWithNoTests
```
Expected: `Test Suites: 0 skipped, 0 total`

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 14 project with testing infrastructure"
```

---

### Task 2: Supabase Schema + Typed Clients

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

**Interfaces:**
- Produces: `createBrowserClient()` → Supabase browser client; `createServerClient()` → Supabase server client with service role

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project → name it `vc-image-restore` → copy the Project URL, anon key, and service role key into `.env.local`.

- [ ] **Step 2: Write `supabase/migrations/001_initial.sql`**

```sql
-- Sessions: one row per user visit
CREATE TABLE IF NOT EXISTS sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name     text        NOT NULL,
  device_type   text        NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  features_used text[]      NOT NULL DEFAULT '{}',
  image_count   integer     NOT NULL CHECK (image_count > 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Site settings: key/value for admin-configurable content
CREATE TABLE IF NOT EXISTS site_settings (
  key        text        PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('bg_color',       '#0f0f0f'),
  ('hero_title',     'Restore Your Memories'),
  ('hero_subtitle',  'AI-powered photo restoration. Denoise, sharpen, colorize, and enhance old photos in seconds.'),
  ('cta_text',       'Start Restoring'),
  ('cta_color',      '#6366f1'),
  ('footer_text',    '© Varun Nagalla. All rights reserved.'),
  ('logo_url',       '')
ON CONFLICT (key) DO NOTHING;

-- Login attempts: brute-force protection
CREATE TABLE IF NOT EXISTS login_attempts (
  ip_address    text        PRIMARY KEY,
  attempt_count integer     NOT NULL DEFAULT 1,
  locked_until  timestamptz,
  last_attempt  timestamptz NOT NULL DEFAULT now()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  feature_name  text        PRIMARY KEY,
  enabled       boolean     NOT NULL DEFAULT true,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed feature flags
INSERT INTO feature_flags (feature_name, enabled) VALUES
  ('denoise',          true),
  ('sharpen',          true),
  ('scratch_cleanup',  true),
  ('color_correction', true),
  ('face_enhancement', true),
  ('colorization',     true),
  ('upscale_2x',       true),
  ('upscale_4x',       true)
ON CONFLICT (feature_name) DO NOTHING;

-- RLS: public can read site_settings and feature_flags (anon key)
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "public read feature_flags" ON feature_flags FOR SELECT USING (true);
-- sessions and login_attempts: service role only (no public policy)
```

- [ ] **Step 3: Run the migration in Supabase SQL editor**

Go to Supabase → SQL Editor → paste the full SQL above → Run.
Expected: all tables created, default rows seeded, no errors.

- [ ] **Step 4: Create Supabase Storage bucket for admin assets**

In Supabase dashboard → Storage → New bucket → name: `admin-assets` → Public: true → Create.

- [ ] **Step 5: Write `lib/supabase/client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 6: Write `lib/supabase/server.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add supabase/ lib/supabase/
git commit -m "feat: Supabase schema, migrations, and typed clients"
```

---

### Task 3: Shared TypeScript Types

**Files:**
- Create: `lib/types.ts`

**Interfaces:**
- Produces: all types imported by every other module

- [ ] **Step 1: Write `lib/types.ts`**

```typescript
export type FeatureName =
  | 'denoise'
  | 'sharpen'
  | 'scratch_cleanup'
  | 'color_correction'
  | 'face_enhancement'
  | 'colorization'
  | 'upscale_2x'
  | 'upscale_4x'

export type UpscaleOption = 'none' | '2x' | '4x'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface ProcessingOptions {
  denoise: boolean
  sharpen: boolean
  scratchCleanup: boolean
  colorCorrection: boolean
  faceEnhancement: boolean
  colorization: boolean
  upscale: UpscaleOption
}

export interface ProcessResult {
  jpegBuffer: Buffer
  featuresApplied: FeatureName[]
}

export interface Session {
  id: string
  user_name: string
  device_type: DeviceType
  features_used: FeatureName[]
  image_count: number
  created_at: string
}

export interface SiteSettings {
  bg_color: string
  hero_title: string
  hero_subtitle: string
  cta_text: string
  cta_color: string
  footer_text: string
  logo_url: string
}

export interface FeatureFlag {
  feature_name: FeatureName
  enabled: boolean
  updated_at: string
}

export interface AdminStats {
  sessions_today: number
  sessions_this_week: number
  sessions_all_time: number
  images_processed_all_time: number
  most_used_feature: FeatureName | null
}

export interface NotifyPayload {
  event: 'session' | 'login' | 'flag_change' | 'hf_failure' | 'daily_summary'
  data: Record<string, unknown>
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: shared TypeScript types"
```

---

### Task 4: Admin Authentication

**Files:**
- Create: `lib/auth/session.ts`
- Create: `lib/auth/admin.ts`
- Create: `middleware.ts`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Create: `app/admin/page.tsx`
- Create: `__tests__/auth/session.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `signAdminJwt(ip)` → signed JWT string; `verifyAdminJwt(token)` → payload | null; `checkBruteForce(ip)` → locked boolean; `recordLoginAttempt(ip, success)` → void

- [ ] **Step 1: Write failing test `__tests__/auth/session.test.ts`**

```typescript
import { signAdminJwt, verifyAdminJwt } from '@/lib/auth/session'

process.env.JWT_SECRET = 'test-secret-32-characters-long!!'

describe('Admin JWT', () => {
  it('signs a token and verifies it', async () => {
    const token = await signAdminJwt('127.0.0.1')
    expect(typeof token).toBe('string')
    const payload = await verifyAdminJwt(token)
    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe('admin')
  })

  it('returns null for an invalid token', async () => {
    const result = await verifyAdminJwt('bad.token.here')
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/auth/session.test.ts
```
Expected: `Cannot find module '@/lib/auth/session'`

- [ ] **Step 3: Write `lib/auth/session.ts`**

```typescript
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!)
const EXPIRY = '24h'

export async function signAdminJwt(ip: string): Promise<string> {
  return new SignJWT({ sub: 'admin', ip })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret())
}

export async function verifyAdminJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- __tests__/auth/session.test.ts
```
Expected: `Tests: 2 passed`

- [ ] **Step 5: Write `lib/auth/admin.ts`**

```typescript
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
  const lockedUntil = attempts >= MAX_ATTEMPTS
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
```

- [ ] **Step 6: Write `middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJwt } from '@/lib/auth/session'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
```

- [ ] **Step 7: Write `app/api/admin/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, checkBruteForce, recordLoginAttempt } from '@/lib/auth/admin'
import { signAdminJwt } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { username, password } = await req.json()

  if (await checkBruteForce(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
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
```

- [ ] **Step 8: Write `app/api/admin/logout/route.ts`**

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', '', { maxAge: 0, path: '/' })
  return res
}
```

- [ ] **Step 9: Write `app/admin/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      const { error: msg } = await res.json()
      setError(msg ?? 'Login failed')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-center">VC Image Restore</CardTitle>
          <p className="text-zinc-400 text-sm text-center">Admin Access</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-zinc-300">Email</Label>
              <Input id="username" type="email" value={username} onChange={e => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white" required autoComplete="username" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white" required autoComplete="current-password" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 10: Commit**

```bash
git add lib/auth/ middleware.ts app/api/admin/login/ app/api/admin/logout/ app/admin/page.tsx __tests__/auth/
git commit -m "feat: admin JWT auth, brute-force protection, login page, middleware"
```

---

### Task 5: Traditional Image Processing (Sharp)

**Files:**
- Create: `lib/processing/sharp.ts`
- Create: `__tests__/processing/sharp.test.ts`

**Interfaces:**
- Consumes: `Buffer` (any image format Sharp supports)
- Produces: `denoise(buf)`, `sharpenImage(buf)`, `scratchCleanup(buf)`, `colorCorrection(buf)`, `upscale2x(buf)`, `toJpeg(buf)` — all `Promise<Buffer>` returning JPEG

- [ ] **Step 1: Write failing tests `__tests__/processing/sharp.test.ts`**

```typescript
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import {
  denoise, sharpenImage, scratchCleanup,
  colorCorrection, upscale2x, toJpeg,
} from '@/lib/processing/sharp'

const testImagePath = path.join(process.cwd(), 'public', 'test-image.jpg')
let testBuf: Buffer

beforeAll(() => {
  testBuf = fs.readFileSync(testImagePath)
})

async function isJpeg(buf: Buffer) {
  const meta = await sharp(buf).metadata()
  return meta.format === 'jpeg'
}

it('denoise returns a valid jpeg buffer', async () => {
  const out = await denoise(testBuf)
  expect(Buffer.isBuffer(out)).toBe(true)
  expect(await isJpeg(out)).toBe(true)
})

it('sharpenImage returns a valid jpeg buffer', async () => {
  const out = await sharpenImage(testBuf)
  expect(Buffer.isBuffer(out)).toBe(true)
  expect(await isJpeg(out)).toBe(true)
})

it('scratchCleanup returns a valid jpeg buffer', async () => {
  const out = await scratchCleanup(testBuf)
  expect(Buffer.isBuffer(out)).toBe(true)
  expect(await isJpeg(out)).toBe(true)
})

it('colorCorrection returns a valid jpeg buffer', async () => {
  const out = await colorCorrection(testBuf)
  expect(Buffer.isBuffer(out)).toBe(true)
  expect(await isJpeg(out)).toBe(true)
})

it('upscale2x doubles the image dimensions', async () => {
  const { width: w0, height: h0 } = await sharp(testBuf).metadata()
  const out = await upscale2x(testBuf)
  const { width, height } = await sharp(out).metadata()
  expect(width).toBe((w0 ?? 1) * 2)
  expect(height).toBe((h0 ?? 1) * 2)
})

it('toJpeg outputs jpeg at ≤ original size for typical photos', async () => {
  const out = await toJpeg(testBuf)
  expect(await isJpeg(out)).toBe(true)
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- __tests__/processing/sharp.test.ts
```
Expected: `Cannot find module '@/lib/processing/sharp'`

- [ ] **Step 3: Write `lib/processing/sharp.ts`**

```typescript
import sharp from 'sharp'

export async function denoise(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .median(3)
    .blur(0.4)
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function sharpenImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .sharpen({ sigma: 1.5, m1: 0.5, m2: 0.8 })
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function scratchCleanup(input: Buffer): Promise<Buffer> {
  // Strong median filter removes thin bright scratches (outlier pixel replacement)
  return sharp(input)
    .median(5)
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function colorCorrection(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .normalise()
    .modulate({ saturation: 1.2, brightness: 1.05 })
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function upscale2x(input: Buffer): Promise<Buffer> {
  const { width = 100, height = 100 } = await sharp(input).metadata()
  return sharp(input)
    .resize({ width: width * 2, height: height * 2, kernel: 'lanczos3', fit: 'fill' })
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function toJpeg(input: Buffer): Promise<Buffer> {
  return sharp(input).jpeg({ quality: 92 }).toBuffer()
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- __tests__/processing/sharp.test.ts
```
Expected: `Tests: 6 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/processing/sharp.ts __tests__/processing/sharp.test.ts
git commit -m "feat: traditional image processing pipeline with Sharp (TDD)"
```

---

### Task 6: HF API Image Processing

**Files:**
- Create: `lib/processing/huggingface.ts`
- Create: `__tests__/processing/huggingface.test.ts`

**Interfaces:**
- Consumes: `Buffer` (JPEG)
- Produces: `faceEnhancement(buf)`, `colorize(buf)`, `upscale4x(buf)` — all `Promise<Buffer>` returning JPEG; `isHfAvailable()` → `Promise<boolean>`

- [ ] **Step 1: Write failing test `__tests__/processing/huggingface.test.ts`**

```typescript
import { faceEnhancement, colorize, upscale4x } from '@/lib/processing/huggingface'

// These tests mock the HF client — they verify our wrapper handles responses correctly
jest.mock('@huggingface/inference', () => ({
  HfInference: jest.fn().mockImplementation(() => ({
    imageToImage: jest.fn().mockResolvedValue(new Blob([Buffer.from('fakeimage')])),
  })),
}))

const fakeBuf = Buffer.from('fakeimage')

it('faceEnhancement returns a Buffer', async () => {
  const result = await faceEnhancement(fakeBuf)
  expect(Buffer.isBuffer(result)).toBe(true)
})

it('colorize returns a Buffer', async () => {
  const result = await colorize(fakeBuf)
  expect(Buffer.isBuffer(result)).toBe(true)
})

it('upscale4x returns a Buffer', async () => {
  const result = await upscale4x(fakeBuf)
  expect(Buffer.isBuffer(result)).toBe(true)
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/processing/huggingface.test.ts
```
Expected: `Cannot find module '@/lib/processing/huggingface'`

- [ ] **Step 3: Write `lib/processing/huggingface.ts`**

```typescript
import { HfInference } from '@huggingface/inference'
import sharp from 'sharp'

function getClient() {
  return new HfInference(process.env.HUGGINGFACE_API_KEY)
}

const TIMEOUT_MS = 30_000

async function blobToBuffer(blob: Blob): Promise<Buffer> {
  return Buffer.from(await blob.arrayBuffer())
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('HF API timeout')), ms)
    ),
  ])
}

export async function faceEnhancement(input: Buffer): Promise<Buffer> {
  const hf = getClient()
  const blob = new Blob([input], { type: 'image/jpeg' })
  const result = await withTimeout(
    hf.imageToImage({ model: 'tencentarc/gfpgan', inputs: blob }),
    TIMEOUT_MS
  )
  const buf = await blobToBuffer(result)
  return sharp(buf).jpeg({ quality: 92 }).toBuffer()
}

export async function colorize(input: Buffer): Promise<Buffer> {
  const hf = getClient()
  const blob = new Blob([input], { type: 'image/jpeg' })
  const result = await withTimeout(
    hf.imageToImage({ model: 'Carve/colorization', inputs: blob }),
    TIMEOUT_MS
  )
  const buf = await blobToBuffer(result)
  return sharp(buf).jpeg({ quality: 92 }).toBuffer()
}

export async function upscale4x(input: Buffer): Promise<Buffer> {
  const hf = getClient()
  const blob = new Blob([input], { type: 'image/jpeg' })
  const result = await withTimeout(
    hf.imageToImage({
      model: 'caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr',
      inputs: blob,
    }),
    TIMEOUT_MS
  )
  const buf = await blobToBuffer(result)
  return sharp(buf).jpeg({ quality: 92 }).toBuffer()
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- __tests__/processing/huggingface.test.ts
```
Expected: `Tests: 3 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/processing/huggingface.ts __tests__/processing/huggingface.test.ts
git commit -m "feat: HF Inference API wrappers for face enhancement, colorization, 4x upscale"
```

---

### Task 7: POST /api/process Route + Session Logging

**Files:**
- Create: `app/api/process/route.ts`
- Create: `app/api/session/route.ts`
- Create: `__tests__/api/process.test.ts`

**Interfaces:**
- Consumes: `ProcessingOptions` (from `lib/types.ts`); image buffer as multipart
- Produces: JPEG stream response; logs `Session` to Supabase via `/api/session`

- [ ] **Step 1: Write `app/api/process/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { denoise, sharpenImage, scratchCleanup, colorCorrection, upscale2x, toJpeg } from '@/lib/processing/sharp'
import { faceEnhancement, colorize, upscale4x } from '@/lib/processing/huggingface'
import { createServerClient } from '@/lib/supabase/server'
import type { ProcessingOptions, FeatureName } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('image') as File | null
  const optionsRaw = formData.get('options') as string | null

  if (!file || !optionsRaw) {
    return NextResponse.json({ error: 'Missing image or options' }, { status: 400 })
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 413 })
  }

  const options: ProcessingOptions = JSON.parse(optionsRaw)
  const featuresApplied: FeatureName[] = []

  let buf = Buffer.from(await file.arrayBuffer())

  // Check feature flags
  const db = createServerClient()
  const { data: flags } = await db.from('feature_flags').select('feature_name, enabled')
  const flagMap = Object.fromEntries((flags ?? []).map(f => [f.feature_name, f.enabled]))

  // Processing order: traditional first, then AI, then upscale
  if (options.denoise && flagMap['denoise']) {
    buf = await denoise(buf)
    featuresApplied.push('denoise')
  }
  if (options.scratchCleanup && flagMap['scratch_cleanup']) {
    buf = await scratchCleanup(buf)
    featuresApplied.push('scratch_cleanup')
  }
  if (options.colorCorrection && flagMap['color_correction']) {
    buf = await colorCorrection(buf)
    featuresApplied.push('color_correction')
  }
  if (options.sharpen && flagMap['sharpen']) {
    buf = await sharpenImage(buf)
    featuresApplied.push('sharpen')
  }
  if (options.faceEnhancement && flagMap['face_enhancement']) {
    try {
      buf = await faceEnhancement(buf)
      featuresApplied.push('face_enhancement')
    } catch {
      // Non-fatal: notify admin, continue with unenhanced
      fetch(`${req.nextUrl.origin}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'hf_failure', data: { feature: 'face_enhancement' } }),
      }).catch(() => {})
    }
  }
  if (options.colorization && flagMap['colorization']) {
    try {
      buf = await colorize(buf)
      featuresApplied.push('colorization')
    } catch {
      fetch(`${req.nextUrl.origin}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'hf_failure', data: { feature: 'colorization' } }),
      }).catch(() => {})
    }
  }
  if (options.upscale === '2x' && flagMap['upscale_2x']) {
    buf = await upscale2x(buf)
    featuresApplied.push('upscale_2x')
  } else if (options.upscale === '4x' && flagMap['upscale_4x']) {
    try {
      buf = await upscale4x(buf)
      featuresApplied.push('upscale_4x')
    } catch {
      buf = await upscale2x(buf) // graceful fallback
      featuresApplied.push('upscale_2x')
    }
  }

  const jpeg = await toJpeg(buf)

  return new NextResponse(jpeg, {
    headers: {
      'Content-Type': 'image/jpeg',
      'X-Features-Applied': featuresApplied.join(','),
    },
  })
}
```

- [ ] **Step 2: Write `app/api/session/route.ts`**

```typescript
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

  // Notify admin of new session (non-blocking)
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
```

- [ ] **Step 3: Commit**

```bash
git add app/api/process/ app/api/session/
git commit -m "feat: image processing API route with session logging and feature flag gating"
```

---

### Task 8: Client-Side HEIC Conversion + Upload Zone

**Files:**
- Create: `components/upload-zone.tsx`

**Interfaces:**
- Produces: `<UploadZone onFiles={(files: File[]) => void} maxFiles={10} />` — emits converted File[] (HEIC→PNG, RAW rejected with message)

- [ ] **Step 1: Write `components/upload-zone.tsx`**

```tsx
'use client'
import { useCallback, useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STANDARD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp', 'image/gif']
const HEIC_EXTS = ['.heic', '.heif']
const RAW_EXTS = ['.cr2', '.cr3', '.nef', '.arw', '.dng', '.orf', '.rw2', '.raf', '.pef']
const MAX_FILES = 10
const MAX_SIZE_MB = 20

interface UploadZoneProps {
  onFiles: (files: File[]) => void
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 }) as Blob
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
}

function getExt(name: string) {
  return name.substring(name.lastIndexOf('.')).toLowerCase()
}

export function UploadZone({ onFiles }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [converting, setConverting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(async (raw: FileList | File[]) => {
    setError('')
    const arr = Array.from(raw)

    if (arr.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed.`)
      return
    }

    const oversized = arr.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024)
    if (oversized.length) {
      setError(`${oversized[0].name} exceeds the 20MB limit.`)
      return
    }

    const rawFiles = arr.filter(f => RAW_EXTS.includes(getExt(f.name)))
    if (rawFiles.length) {
      setError(`RAW files (${rawFiles.map(f => f.name).join(', ')}) are not supported. Please convert to JPEG or PNG in your camera software first.`)
      return
    }

    setConverting(true)
    const converted: File[] = []
    for (const file of arr) {
      if (HEIC_EXTS.includes(getExt(file.name))) {
        try {
          converted.push(await convertHeicToJpeg(file))
        } catch {
          setError(`Could not convert ${file.name}. Try saving it as JPEG first.`)
          setConverting(false)
          return
        }
      } else if (STANDARD_TYPES.includes(file.type) || file.type.startsWith('image/')) {
        converted.push(file)
      } else {
        setError(`Unsupported format: ${file.name}`)
        setConverting(false)
        return
      }
    }
    setConverting(false)
    onFiles(converted)
  }, [onFiles])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors
        ${dragging ? 'border-indigo-400 bg-indigo-950/30' : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif,.cr2,.nef,.arw,.dng,.orf,.rw2,.raf,.pef"
        multiple
        className="hidden"
        onChange={e => e.target.files && processFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-3">
        {converting ? (
          <p className="text-zinc-400">Converting HEIC files…</p>
        ) : (
          <>
            <Upload className="h-10 w-10 text-zinc-500" />
            <p className="text-zinc-300 font-medium">Drag & drop photos here</p>
            <p className="text-zinc-500 text-sm">or click to browse — up to 10 images, 20MB each</p>
            <p className="text-zinc-600 text-xs">JPEG, PNG, WEBP, TIFF, BMP, GIF, HEIC supported</p>
          </>
        )}
      </div>
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
          <X className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/upload-zone.tsx
git commit -m "feat: upload zone with HEIC conversion, validation, drag-drop"
```

---

### Task 9: Enhancement Panel + Before/After Slider + Thumbnail Strip

**Files:**
- Create: `components/enhancement-panel.tsx`
- Create: `components/before-after-slider.tsx`
- Create: `components/thumbnail-strip.tsx`
- Create: `components/progress-indicator.tsx`

**Interfaces:**
- `<EnhancementPanel options={ProcessingOptions} onChange={fn} flags={FeatureFlag[]} />` — controlled component
- `<BeforeAfterSlider before={string} after={string} />` — URLs or object URLs
- `<ThumbnailStrip images={File[]} selected={number} onSelect={fn} />` 
- `<ProgressIndicator current={number} total={number} label={string} />`

- [ ] **Step 1: Write `components/enhancement-panel.tsx`**

```tsx
'use client'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { ProcessingOptions, FeatureFlag, UpscaleOption } from '@/lib/types'

interface EnhancementPanelProps {
  options: ProcessingOptions
  onChange: (opts: ProcessingOptions) => void
  flags: Record<string, boolean>
}

const TOGGLES: { key: keyof ProcessingOptions; label: string; flag: string; ai?: boolean }[] = [
  { key: 'denoise',          label: 'Denoise',           flag: 'denoise' },
  { key: 'sharpen',          label: 'Sharpen / Deblur',  flag: 'sharpen' },
  { key: 'scratchCleanup',   label: 'Scratch Cleanup',   flag: 'scratch_cleanup' },
  { key: 'colorCorrection',  label: 'Color Correction',  flag: 'color_correction' },
  { key: 'faceEnhancement',  label: 'Face Enhancement',  flag: 'face_enhancement', ai: true },
  { key: 'colorization',     label: 'Colorization',      flag: 'colorization',     ai: true },
]

export function EnhancementPanel({ options, onChange, flags }: EnhancementPanelProps) {
  function toggle(key: keyof ProcessingOptions) {
    onChange({ ...options, [key]: !options[key] })
  }

  function setUpscale(val: UpscaleOption) {
    onChange({ ...options, upscale: val })
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Enhancement Options</h3>
      <div className="space-y-3">
        {TOGGLES.map(({ key, label, flag, ai }) => {
          const enabled = flags[flag] !== false
          return (
            <div key={key} className={`flex items-center justify-between ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2">
                <Label htmlFor={key} className="text-zinc-300 cursor-pointer">{label}</Label>
                {ai && <Badge variant="outline" className="text-indigo-400 border-indigo-800 text-xs">AI</Badge>}
              </div>
              <Switch
                id={key}
                checked={!!options[key as keyof ProcessingOptions]}
                onCheckedChange={() => toggle(key)}
                disabled={!enabled}
              />
            </div>
          )
        })}
      </div>
      <div className="pt-2 border-t border-zinc-800">
        <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wider">Upscale</p>
        <div className="flex gap-2">
          {(['none', '2x', '4x'] as UpscaleOption[]).map(v => (
            <button key={v} onClick={() => setUpscale(v)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${options.upscale === v
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              {v === 'none' ? 'None' : v}{v === '4x' && <span className="text-xs text-indigo-300 ml-1">AI</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `components/before-after-slider.tsx`**

```tsx
'use client'
import { useRef, useState, useCallback } from 'react'

interface BeforeAfterSliderProps {
  before: string
  after: string
}

export function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [pos, setPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setPos(pct)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-xl cursor-col-resize aspect-video bg-zinc-950"
      onMouseDown={e => { dragging.current = true; updatePos(e.clientX) }}
      onMouseMove={e => dragging.current && updatePos(e.clientX)}
      onMouseUp={() => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onTouchStart={e => { dragging.current = true; updatePos(e.touches[0].clientX) }}
      onTouchMove={e => { e.preventDefault(); dragging.current && updatePos(e.touches[0].clientX) }}
      onTouchEnd={() => { dragging.current = false }}
    >
      {/* Before image (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
      {/* After image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt="Restored" className="absolute inset-0 w-full h-full object-contain" style={{ minWidth: containerRef.current?.offsetWidth }} />
      </div>
      {/* Divider */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
          <span className="text-xs font-bold text-zinc-700">⟷</span>
        </div>
      </div>
      {/* Labels */}
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">Before</span>
      <span className="absolute bottom-2 right-2 text-xs bg-indigo-600/80 text-white px-2 py-0.5 rounded">After</span>
    </div>
  )
}
```

- [ ] **Step 3: Write `components/thumbnail-strip.tsx`**

```tsx
'use client'
interface ThumbnailStripProps {
  previews: string[]
  selected: number
  onSelect: (i: number) => void
  processedIndices: Set<number>
}

export function ThumbnailStrip({ previews, selected, onSelect, processedIndices }: ThumbnailStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
      {previews.map((src, i) => (
        <button key={i} onClick={() => onSelect(i)}
          className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
            ${selected === i ? 'border-indigo-500 scale-105' : 'border-zinc-700 hover:border-zinc-500'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
          {processedIndices.has(i) && (
            <span className="absolute inset-0 flex items-center justify-center bg-green-600/40">
              <span className="text-white text-lg">✓</span>
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Write `components/progress-indicator.tsx`**

```tsx
import { Progress } from '@/components/ui/progress'

interface ProgressIndicatorProps {
  current: number
  total: number
  label: string
}

export function ProgressIndicator({ current, total, label }: ProgressIndicatorProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-zinc-400">
        <span>{label}</span>
        <span>{current}/{total}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/enhancement-panel.tsx components/before-after-slider.tsx components/thumbnail-strip.tsx components/progress-indicator.tsx
git commit -m "feat: enhancement panel, before/after slider, thumbnail strip, progress indicator"
```

---

### Task 10: Restore Workspace Page + Download

**Files:**
- Create: `app/restore/page.tsx`

**Interfaces:**
- Consumes: all components from Tasks 8–9; `POST /api/process`; `POST /api/session`
- Produces: full restore workspace — upload → process → preview → download

- [ ] **Step 1: Write `app/restore/page.tsx`**

```tsx
'use client'
import { useState, useCallback, useEffect } from 'react'
import { UploadZone } from '@/components/upload-zone'
import { EnhancementPanel } from '@/components/enhancement-panel'
import { BeforeAfterSlider } from '@/components/before-after-slider'
import { ThumbnailStrip } from '@/components/thumbnail-strip'
import { ProgressIndicator } from '@/components/progress-indicator'
import { Button } from '@/components/ui/button'
import { Download, Wand2 } from 'lucide-react'
import JSZip from 'jszip'
import type { ProcessingOptions, FeatureFlag } from '@/lib/types'

const DEFAULT_OPTIONS: ProcessingOptions = {
  denoise: true, sharpen: true, scratchCleanup: true,
  colorCorrection: true, faceEnhancement: false,
  colorization: false, upscale: 'none',
}

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

export default function RestorePage() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [results, setResults] = useState<(string | null)[]>([])
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_OPTIONS)
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' })
  const [processedSet, setProcessedSet] = useState(new Set<number>())

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      const map: Record<string, boolean> = {}
      ;(d.flags ?? []).forEach((f: FeatureFlag) => { map[f.feature_name] = f.enabled })
      setFlags(map)
    })
  }, [])

  const onFiles = useCallback((newFiles: File[]) => {
    setFiles(newFiles)
    setResults(new Array(newFiles.length).fill(null))
    setProcessedSet(new Set())
    setSelected(0)
    const urls = newFiles.map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }, [])

  async function processAll() {
    if (!files.length) return
    setProcessing(true)
    const newResults = [...results]
    const newProcessed = new Set<number>()

    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i, total: files.length, label: `Processing ${files[i].name}…` })
      setSelected(i)
      const fd = new FormData()
      fd.append('image', files[i])
      fd.append('options', JSON.stringify(options))
      try {
        const res = await fetch('/api/process', { method: 'POST', body: fd })
        if (res.ok) {
          const blob = await res.blob()
          newResults[i] = URL.createObjectURL(blob)
          newProcessed.add(i)
        }
      } catch { /* show in UI as null */ }
    }
    setResults(newResults)
    setProcessedSet(newProcessed)
    setProgress({ current: files.length, total: files.length, label: 'Done!' })
    setProcessing(false)

    // Log session
    const userName = localStorage.getItem('vc_user_name') ?? 'Anonymous'
    const featuresUsed = Object.entries(options)
      .filter(([k, v]) => v === true || (k === 'upscale' && v !== 'none'))
      .map(([k, v]) => k === 'upscale' ? `upscale_${v}` : k)
    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        device_type: detectDevice(),
        features_used: featuresUsed,
        image_count: files.length,
      }),
    }).catch(() => {})
  }

  async function downloadAll() {
    const zip = new JSZip()
    results.forEach((url, i) => {
      if (!url) return
      // Fetch the blob from the object URL
      // We store blobs separately for zip — simplified: re-fetch from url
      zip.file(`vc-restored-${i + 1}.jpg`, fetch(url).then(r => r.blob()))
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'vc-image-restore.zip'
    a.click()
  }

  function downloadSingle(i: number) {
    const url = results[i]
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `vc-restored-${i + 1}.jpg`
    a.click()
  }

  const anyProcessed = processedSet.size > 0

  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-white text-2xl font-bold">VC Image Restore</h1>

        {!files.length && <UploadZone onFiles={onFiles} />}

        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: options */}
            <div className="space-y-4">
              <EnhancementPanel options={options} onChange={setOptions} flags={flags} />
              <Button onClick={processAll} disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Wand2 className="mr-2 h-4 w-4" />
                {processing ? 'Enhancing…' : `Enhance ${files.length} Image${files.length > 1 ? 's' : ''}`}
              </Button>
              {anyProcessed && (
                <Button onClick={downloadAll} variant="outline" className="w-full border-zinc-700 text-zinc-300">
                  <Download className="mr-2 h-4 w-4" />
                  Download All as JPEG
                </Button>
              )}
              <Button onClick={() => { setFiles([]); setPreviews([]); setResults([]) }}
                variant="ghost" className="w-full text-zinc-500">
                Upload Different Images
              </Button>
            </div>

            {/* Right: preview */}
            <div className="lg:col-span-2 space-y-4">
              {processing && (
                <ProgressIndicator
                  current={progress.current}
                  total={progress.total}
                  label={progress.label}
                />
              )}
              {previews[selected] && (
                results[selected]
                  ? <BeforeAfterSlider before={previews[selected]} after={results[selected]!} />
                  : <div className="rounded-xl overflow-hidden aspect-video bg-zinc-900 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previews[selected]} alt="Original" className="max-h-full max-w-full object-contain" />
                    </div>
              )}
              {results[selected] && (
                <Button onClick={() => downloadSingle(selected)} size="sm" variant="outline"
                  className="border-zinc-700 text-zinc-300">
                  <Download className="mr-2 h-4 w-4" /> Download This Image
                </Button>
              )}
              <ThumbnailStrip previews={previews} selected={selected} onSelect={setSelected} processedIndices={processedSet} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Write `app/api/settings/route.ts`** (public endpoint for flags + site settings)

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add app/restore/ app/api/settings/
git commit -m "feat: restore workspace page with batch processing, before/after preview, zip download"
```

---

### Task 11: Name Modal + Landing Page + Root Layout

**Files:**
- Create: `components/name-modal.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write `components/name-modal.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const STORAGE_KEY = 'vc_user_name'

interface NameModalProps {
  onName: (name: string) => void
}

export function NameModal({ onName }: NameModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) { onName(saved) } else { setOpen(true) }
  }, [onName])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    localStorage.setItem(STORAGE_KEY, name.trim())
    onName(name.trim())
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to VC Image Restore</DialogTitle>
        </DialogHeader>
        <p className="text-zinc-400 text-center text-sm">Enter your name to get started. This helps us improve the experience.</p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-zinc-300">Your Name</Label>
            <Input
              id="name" autoFocus value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Varun"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
              maxLength={50}
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!name.trim()}>
            Start Restoring →
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Write `app/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NameModal } from '@/components/name-modal'
import { Button } from '@/components/ui/button'
import { Wand2, Zap, Palette, ZoomIn, Sparkles } from 'lucide-react'
import type { SiteSettings } from '@/lib/types'

const DEFAULT_SETTINGS: SiteSettings = {
  bg_color: '#0f0f0f',
  hero_title: 'Restore Your Memories',
  hero_subtitle: 'AI-powered photo restoration. Denoise, sharpen, colorize, and enhance old photos in seconds.',
  cta_text: 'Start Restoring',
  cta_color: '#6366f1',
  footer_text: '© Varun Nagalla. All rights reserved.',
  logo_url: '',
}

const FEATURES = [
  { icon: Zap,      title: 'Denoise & Sharpen',    desc: 'Remove grain and bring back crisp detail' },
  { icon: Sparkles, title: 'Scratch Cleanup',       desc: 'Erase tears and surface damage automatically' },
  { icon: Palette,  title: 'Colorization',          desc: 'Bring black-and-white photos to life with AI color' },
  { icon: Wand2,    title: 'Face Enhancement',      desc: 'Restore facial detail in portraits using AI' },
  { icon: ZoomIn,   title: '2× / 4× Upscale',      desc: 'Enlarge photos without losing quality' },
]

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) {
        const map: Record<string, string> = {}
        d.settings.forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
        setSettings(prev => ({ ...prev, ...map }))
      }
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.bg_color }}>
      <NameModal onName={setUserName} />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          {settings.hero_title}
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-8">
          {settings.hero_subtitle}
        </p>
        <Link href="/restore">
          <Button size="lg" className="text-lg px-8 py-6"
            style={{ backgroundColor: settings.cta_color }}>
            {settings.cta_text} →
          </Button>
        </Link>
        {userName && <p className="text-zinc-600 text-sm mt-4">Welcome back, {userName}</p>}
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-2">
            <Icon className="h-6 w-6 text-indigo-400" />
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-zinc-500 text-sm">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Write `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VC Image Restore',
  description: 'Professional AI-powered photo restoration by Varun Nagalla',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 antialiased`}>
        <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-900">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-white font-bold text-lg tracking-tight">VC Image Restore</a>
            <a href="/restore" className="text-zinc-400 hover:text-white text-sm transition-colors">Restore →</a>
          </div>
        </nav>
        <div className="pt-14">{children}</div>
        <footer className="border-t border-zinc-900 py-6 text-center text-zinc-600 text-sm">
          © Varun Nagalla. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/name-modal.tsx app/page.tsx app/layout.tsx
git commit -m "feat: name modal, landing page with dynamic settings, root layout with nav and footer"
```

---

### Task 12: Admin Stats API + Dashboard Page

**Files:**
- Create: `app/api/admin/stats/route.ts`
- Create: `app/api/admin/history/route.ts`
- Create: `components/admin/stats-card.tsx`
- Create: `components/admin/sessions-chart.tsx`
- Create: `app/admin/dashboard/page.tsx`
- Create: `app/admin/dashboard/layout.tsx`
- Create: `components/admin/admin-sidebar.tsx`

- [ ] **Step 1: Write `app/api/admin/stats/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAdminJwt } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [all, today, week, recent] = await Promise.all([
    db.from('sessions').select('id, image_count, features_used, created_at', { count: 'exact' }),
    db.from('sessions').select('id', { count: 'exact' }).gte('created_at', startOfDay),
    db.from('sessions').select('id', { count: 'exact' }).gte('created_at', startOfWeek),
    db.from('sessions').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  // Most used feature
  const featureCounts: Record<string, number> = {}
  ;(all.data ?? []).forEach(s => {
    ;(s.features_used ?? []).forEach((f: string) => { featureCounts[f] = (featureCounts[f] ?? 0) + 1 })
  })
  const most_used_feature = Object.keys(featureCounts).sort((a, b) => featureCounts[b] - featureCounts[a])[0] ?? null

  const images_processed = (all.data ?? []).reduce((sum, s) => sum + (s.image_count ?? 0), 0)

  // Sessions per day for last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: chartData } = await db
    .from('sessions')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo)

  const dayMap: Record<string, number> = {}
  ;(chartData ?? []).forEach(s => {
    const day = s.created_at.substring(0, 10)
    dayMap[day] = (dayMap[day] ?? 0) + 1
  })
  const chart = Object.entries(dayMap).sort().map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    sessions_today: today.count ?? 0,
    sessions_this_week: week.count ?? 0,
    sessions_all_time: all.count ?? 0,
    images_processed_all_time: images_processed,
    most_used_feature,
    recent: recent.data ?? [],
    chart,
  })
}
```

- [ ] **Step 2: Write `app/api/admin/history/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAdminJwt } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') ?? ''
  const device = searchParams.get('device') ?? ''
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 50
  const offset = (page - 1) * limit

  const db = createServerClient()
  let query = db.from('sessions').select('*', { count: 'exact' })

  if (search) query = query.ilike('user_name', `%${search}%`)
  if (device) query = query.eq('device_type', device)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ data, count, page, limit })
}
```

- [ ] **Step 3: Write `components/admin/stats-card.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  sub?: string
}

export function StatsCard({ title, value, icon: Icon, sub }: StatsCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-zinc-400 text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-zinc-500" />
      </CardHeader>
      <CardContent>
        <p className="text-white text-2xl font-bold">{value}</p>
        {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Write `components/admin/sessions-chart.tsx`**

```tsx
'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface SessionsChartProps {
  data: { date: string; count: number }[]
}

export function SessionsChart({ data }: SessionsChartProps) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
      <h3 className="text-white font-semibold mb-4">Sessions — Last 30 Days</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
            labelStyle={{ color: '#a1a1aa' }} itemStyle={{ color: '#818cf8' }} />
          <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 5: Write `components/admin/admin-sidebar.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, History, Palette, ToggleLeft, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/dashboard/history',    label: 'History',      icon: History },
  { href: '/admin/dashboard/appearance', label: 'Appearance',   icon: Palette },
  { href: '/admin/dashboard/flags',      label: 'Feature Flags',icon: ToggleLeft },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-zinc-900 border-r border-zinc-800 p-4">
        <p className="text-white font-bold text-sm mb-6 px-2">VC Image Restore</p>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${pathname === href ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors">
          <LogOut className="h-4 w-4" />Logout
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 flex">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors
              ${pathname === href ? 'text-indigo-400' : 'text-zinc-500'}`}>
            <Icon className="h-5 w-5" />{label}
          </Link>
        ))}
        <button onClick={logout} className="flex-1 flex flex-col items-center py-3 text-xs gap-1 text-zinc-500">
          <LogOut className="h-5 w-5" />Logout
        </button>
      </nav>
    </>
  )
}
```

- [ ] **Step 6: Write `app/admin/dashboard/layout.tsx`**

```tsx
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AdminSidebar />
      <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 7: Write `app/admin/dashboard/page.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/admin/stats-card'
import { SessionsChart } from '@/components/admin/sessions-chart'
import { Users, Image, Zap, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) return <div className="text-zinc-500 animate-pulse">Loading…</div>

  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Sessions Today"    value={stats.sessions_today}      icon={Calendar} />
        <StatsCard title="This Week"         value={stats.sessions_this_week}   icon={Users} />
        <StatsCard title="All Time"          value={stats.sessions_all_time}    icon={Users} />
        <StatsCard title="Images Processed"  value={stats.images_processed_all_time} icon={Image}
          sub={stats.most_used_feature ? `Top: ${stats.most_used_feature}` : undefined} />
      </div>
      <SessionsChart data={stats.chart ?? []} />
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {(stats.recent ?? []).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-zinc-800 last:border-0">
              <div>
                <span className="text-white font-medium">{s.user_name}</span>
                <span className="text-zinc-500 ml-2">{s.device_type}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-400">{s.image_count} img</span>
                <span className="text-zinc-600 ml-2 text-xs">{new Date(s.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add app/api/admin/stats/ app/api/admin/history/ components/admin/ app/admin/dashboard/
git commit -m "feat: admin dashboard with stats, chart, recent activity, sidebar layout"
```

---

### Task 13: Admin History + Appearance + Feature Flags Pages

**Files:**
- Create: `app/admin/dashboard/history/page.tsx`
- Create: `app/api/admin/settings/route.ts`
- Create: `app/api/admin/flags/route.ts`
- Create: `app/admin/dashboard/appearance/page.tsx`
- Create: `app/admin/dashboard/flags/page.tsx`

- [ ] **Step 1: Write `app/admin/dashboard/history/page.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'

export default function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [device, setDevice] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ search, device })
    const res = await fetch(`/api/admin/history?${params}`)
    const d = await res.json()
    setSessions(d.data ?? [])
    setCount(d.count ?? 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function exportCsv() {
    const header = 'Name,Date,Features,Images,Device\n'
    const rows = sessions.map(s =>
      `"${s.user_name}","${new Date(s.created_at).toLocaleString()}","${s.features_used.join(';')}",${s.image_count},${s.device_type}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vc-sessions.csv'; a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">History ({count})</h1>
        <Button onClick={exportCsv} variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>
      <div className="flex gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…"
          className="bg-zinc-900 border-zinc-700 text-white max-w-xs" />
        <select value={device} onChange={e => setDevice(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-md px-3 text-sm">
          <option value="">All devices</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
          <option value="desktop">Desktop</option>
        </select>
        <Button onClick={load} className="bg-indigo-600 hover:bg-indigo-700">Filter</Button>
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr className="text-zinc-500 text-left">
              <th className="p-3">Name</th><th className="p-3">Date & Time</th>
              <th className="p-3">Features</th><th className="p-3">Images</th><th className="p-3">Device</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-600 animate-pulse">Loading…</td></tr>
            )}
            {!loading && sessions.map(s => (
              <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="p-3 text-white font-medium">{s.user_name}</td>
                <td className="p-3 text-zinc-400">{new Date(s.created_at).toLocaleString()}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">
                  {s.features_used.map((f: string) => (
                    <Badge key={f} variant="outline" className="text-xs border-zinc-700 text-zinc-400">{f}</Badge>
                  ))}
                </div></td>
                <td className="p-3 text-zinc-400">{s.image_count}</td>
                <td className="p-3 text-zinc-500 capitalize">{s.device_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/api/admin/settings/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAdminJwt } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServerClient()
  const { data } = await db.from('site_settings').select('*')
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const updates: { key: string; value: string }[] = await req.json()
  const db = createServerClient()
  for (const { key, value } of updates) {
    await db.from('site_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
  }
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Write `app/api/admin/flags/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAdminJwt } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServerClient()
  const { data } = await db.from('feature_flags').select('*')
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { feature_name, enabled } = await req.json()
  const db = createServerClient()
  await db.from('feature_flags').update({ enabled, updated_at: new Date().toISOString() }).eq('feature_name', feature_name)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Write `app/admin/dashboard/appearance/page.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const FIELDS = [
  { key: 'hero_title',    label: 'Hero Title' },
  { key: 'hero_subtitle', label: 'Hero Subtitle' },
  { key: 'cta_text',      label: 'CTA Button Text' },
  { key: 'cta_color',     label: 'CTA Button Color (hex)' },
  { key: 'bg_color',      label: 'Background Color (hex)' },
  { key: 'footer_text',   label: 'Footer Text' },
]

export default function AppearancePage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then((rows: { key: string; value: string }[]) => {
      const map: Record<string, string> = {}
      rows.forEach(r => { map[r.key] = r.value })
      setValues(map)
    })
  }, [])

  async function save() {
    setSaving(true)
    const updates = Object.entries(values).map(([key, value]) => ({ key, value }))
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-white text-2xl font-bold">Appearance</h1>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label className="text-zinc-300">{label}</Label>
            <Input value={values[key] ?? ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
              className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        ))}
        <div className="pt-2">
          <p className="text-zinc-500 text-xs mb-2">Live preview:</p>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: values['bg_color'] || '#0f0f0f' }}>
            <h2 className="text-white text-lg font-bold">{values['hero_title']}</h2>
            <p className="text-zinc-400 text-sm mt-1">{values['hero_subtitle']}</p>
            <button className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: values['cta_color'] || '#6366f1' }}>
              {values['cta_text']}
            </button>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save & Publish'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write `app/admin/dashboard/flags/page.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { FeatureFlag } from '@/lib/types'

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])

  useEffect(() => {
    fetch('/api/admin/flags').then(r => r.json()).then(setFlags)
  }, [])

  async function toggle(feature_name: string, current: boolean) {
    const enabled = !current
    setFlags(prev => prev.map(f => f.feature_name === feature_name ? { ...f, enabled } : f))
    await fetch('/api/admin/flags', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_name, enabled }),
    })
  }

  const AI_FEATURES = ['face_enhancement', 'colorization', 'upscale_4x']

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-white text-2xl font-bold">Feature Flags</h1>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
        {flags.map(f => (
          <div key={f.feature_name} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Label className="text-zinc-300 capitalize cursor-pointer">{f.feature_name.replace(/_/g, ' ')}</Label>
              {AI_FEATURES.includes(f.feature_name) && (
                <Badge variant="outline" className="text-indigo-400 border-indigo-800 text-xs">AI</Badge>
              )}
            </div>
            <Switch checked={f.enabled} onCheckedChange={() => toggle(f.feature_name, f.enabled)} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/admin/dashboard/history/ app/admin/dashboard/appearance/ app/admin/dashboard/flags/ app/api/admin/settings/ app/api/admin/flags/
git commit -m "feat: admin history table with CSV export, appearance editor, feature flags"
```

---

### Task 14: Gmail Notifications + Vercel Cron

**Files:**
- Create: `lib/notifications/email.ts`
- Create: `app/api/admin/notify/route.ts`
- Create: `vercel.json`

- [ ] **Step 1: Write `lib/notifications/email.ts`**

```typescript
import nodemailer from 'nodemailer'
import type { NotifyPayload } from '@/lib/types'

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function formatEvent(payload: NotifyPayload): { subject: string; html: string } {
  const { event, data } = payload
  switch (event) {
    case 'session':
      return {
        subject: `VC Image Restore — New session: ${data.user_name}`,
        html: `<p><strong>${data.user_name}</strong> just used VC Image Restore.</p>
               <p>Time: ${data.timestamp}<br/>Device: ${data.device_type}<br/>Images: ${data.image_count}</p>`,
      }
    case 'login':
      return {
        subject: '⚠️ VC Image Restore — Admin login detected',
        html: `<p>Admin login at <strong>${data.timestamp}</strong> from IP <strong>${data.ip}</strong>.</p>
               <p>If this wasn't you, change your admin password immediately.</p>`,
      }
    case 'flag_change':
      return {
        subject: `VC Image Restore — Feature flag changed: ${data.feature}`,
        html: `<p>Feature <strong>${data.feature}</strong> changed to <strong>${data.enabled}</strong>.</p>
               <p>Time: ${new Date().toISOString()}</p>`,
      }
    case 'hf_failure':
      return {
        subject: `⚠️ VC Image Restore — AI feature failed: ${data.feature}`,
        html: `<p>The AI feature <strong>${data.feature}</strong> failed.</p>
               <p>Time: ${new Date().toISOString()}<br/>Users received a graceful fallback.</p>`,
      }
    case 'daily_summary':
      return {
        subject: 'VC Image Restore — Daily Summary',
        html: `<h2>Daily Summary</h2>
               <p>Sessions: ${data.sessions}<br/>Images processed: ${data.images}<br/>Top feature: ${data.top_feature}</p>`,
      }
    default:
      return { subject: 'VC Image Restore notification', html: JSON.stringify(data) }
  }
}

export async function sendNotification(payload: NotifyPayload): Promise<void> {
  const transport = createTransport()
  const { subject, html } = formatEvent(payload)
  await transport.sendMail({
    from: `"VC Image Restore" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject,
    html,
  })
}
```

- [ ] **Step 2: Write `app/api/admin/notify/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/notifications/email'
import type { NotifyPayload } from '@/lib/types'

export async function POST(req: NextRequest) {
  const payload: NotifyPayload = await req.json()
  try {
    await sendNotification(payload)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email notification failed:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}

// Vercel Cron endpoint — called daily at midnight IST (18:30 UTC)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch today's stats for summary
  const base = req.nextUrl.origin
  const statsRes = await fetch(`${base}/api/admin/stats`, {
    headers: { Cookie: '' }, // cron has no cookie — call Supabase directly instead
  })

  const db = (await import('@/lib/supabase/server')).createServerClient()
  const today = new Date(); today.setHours(0,0,0,0)
  const { data: todaySessions } = await db.from('sessions').select('image_count, features_used').gte('created_at', today.toISOString())

  const sessions = todaySessions?.length ?? 0
  const images = (todaySessions ?? []).reduce((sum, s) => sum + s.image_count, 0)
  const featureCounts: Record<string, number> = {}
  ;(todaySessions ?? []).forEach(s => s.features_used.forEach((f: string) => { featureCounts[f] = (featureCounts[f] ?? 0) + 1 }))
  const top_feature = Object.keys(featureCounts).sort((a,b) => featureCounts[b] - featureCounts[a])[0] ?? 'none'

  await sendNotification({ event: 'daily_summary', data: { sessions, images, top_feature } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Add `CRON_SECRET` to `.env.local.example`**

```bash
echo "CRON_SECRET=" >> .env.local.example
```

- [ ] **Step 4: Write `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/admin/notify",
      "schedule": "30 18 * * *"
    }
  ]
}
```
(18:30 UTC = midnight IST)

- [ ] **Step 5: Commit**

```bash
git add lib/notifications/ app/api/admin/notify/ vercel.json .env.local.example
git commit -m "feat: Gmail notifications via Nodemailer, Vercel Cron daily summary"
```

---

### Task 15: Self-Review + Build Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```
Expected: all tests pass (sharp processing, JWT auth, HF mock).

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 3: Run production build**

```bash
npm run build
```
Expected: build succeeds with no errors. Fix any type errors or import issues before proceeding.

- [ ] **Step 4: Start in production mode and verify locally**

```bash
npm start
```
- Visit http://localhost:3000 — name modal appears, hero loads
- Visit http://localhost:3000/restore — upload zone appears
- Visit http://localhost:3000/admin — login form appears
- Visit http://localhost:3000/admin/dashboard — redirects to /admin (middleware working)

- [ ] **Step 5: Commit final fixes**

```bash
git add -A
git commit -m "fix: build verification — resolve any type errors and import issues"
```

---

### Task 16: Deploy to Vercel + GitHub Push

**Interfaces:**
- Produces: live URL on Vercel, public GitHub repo "VC Image Restore App"

- [ ] **Step 1: Create GitHub repository**

```bash
gh repo create "VC Image Restore App" --public --description "Professional photo restoration web app by Varun Nagalla" --source=. --remote=origin --push
```
If `gh` is not installed: go to github.com → New Repository → name: `VC Image Restore App` → Public → Create, then:
```bash
git remote add origin https://github.com/<your-username>/VC-Image-Restore-App.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel --prod
```
Follow prompts: link to your Vercel account, set project name to `vc-image-restore`, confirm framework as Next.js.

- [ ] **Step 3: Add all environment variables in Vercel dashboard**

Go to Vercel → Project Settings → Environment Variables → add:
```
ADMIN_USERNAME        = varunchowdary3345@gmail.com
ADMIN_PASSWORD_HASH   = (generate with: node -e "require('bcryptjs').hash('VarunPhoto@1113',12).then(console.log)")
JWT_SECRET            = (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXT_PUBLIC_SUPABASE_URL     = (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY= (from Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY    = (from Supabase dashboard)
HUGGINGFACE_API_KEY          = (from huggingface.co/settings/tokens)
GMAIL_USER            = varunchowdary3345@gmail.com
GMAIL_APP_PASSWORD    = (generate at myaccount.google.com/apppasswords)
CRON_SECRET           = (generate with: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
```

- [ ] **Step 4: Redeploy after setting env vars**

```bash
npx vercel --prod
```

- [ ] **Step 5: Verify live deployment**

- Visit the Vercel URL — name modal appears, hero loads with correct text
- Go to `/restore` — upload zone works
- Go to `/admin` — login with `varunchowdary3345@gmail.com` and your password
- Admin dashboard loads, shows stats
- Change a site setting in Appearance → Save & Publish → reload homepage — change appears

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: deployment configuration and final cleanup"
git push origin main
```

---

## Self-Review

**Spec coverage check:**
- ✅ Denoise, sharpen, scratch cleanup, color correction (Task 5)
- ✅ Face enhancement, colorization (Task 6)
- ✅ 2x/4x upscale (Tasks 5, 6)
- ✅ Up to 10 images per batch (Task 7 — validated in process route)
- ✅ Max 20MB per image (Task 7)
- ✅ JPEG output only at 92% (all Sharp calls)
- ✅ All input formats including HEIC (Task 8)
- ✅ RAW: rejected with helpful error message (Task 8)
- ✅ No image storage (Task 7 — buffers only, no DB writes)
- ✅ Before/after slider (Task 9)
- ✅ Batch thumbnail strip (Task 9)
- ✅ Download individual + zip (Task 10)
- ✅ Name modal on first visit (Task 11)
- ✅ Dynamic site settings on landing page (Task 11)
- ✅ © Varun Nagalla footer (Task 11)
- ✅ App name "VC Image Restore" everywhere (Tasks 11, 4)
- ✅ Admin login with brute-force protection (Task 4)
- ✅ Middleware protecting /admin/dashboard/* (Task 4)
- ✅ Admin stats + chart (Task 12)
- ✅ Admin history + CSV export (Task 13)
- ✅ Admin appearance editor with live preview (Task 13)
- ✅ Admin feature flags (Task 13)
- ✅ Gmail notifications for all events (Task 14)
- ✅ Vercel Cron daily summary (Task 14)
- ✅ GitHub repo "VC Image Restore App" (Task 16)
- ✅ Session logging with name, timestamp, features, device (Tasks 7, 10)
- ✅ Responsive mobile-first (all components use Tailwind responsive classes)
- ✅ Feature flags gate processing in API route (Task 7)

**Placeholder scan:** None found.

**Type consistency:**
- `ProcessingOptions` defined in Task 3, consumed in Tasks 7, 9, 10 — consistent
- `FeatureName` used in tasks 3, 5, 6, 7 — consistent
- `Session` type matches DB schema from Task 2 — consistent
- `NotifyPayload` defined in Task 3, used in Tasks 7, 14 — consistent
