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

  // Load feature flags
  const db = createServerClient()
  const { data: flags } = await db.from('feature_flags').select('feature_name, enabled')
  const flagMap = Object.fromEntries((flags ?? []).map(f => [f.feature_name, f.enabled]))

  // Processing order: traditional first, AI second, upscale last
  if (options.denoise && flagMap['denoise'] !== false) {
    buf = await denoise(buf)
    featuresApplied.push('denoise')
  }
  if (options.scratchCleanup && flagMap['scratch_cleanup'] !== false) {
    buf = await scratchCleanup(buf)
    featuresApplied.push('scratch_cleanup')
  }
  if (options.colorCorrection && flagMap['color_correction'] !== false) {
    buf = await colorCorrection(buf)
    featuresApplied.push('color_correction')
  }
  if (options.sharpen && flagMap['sharpen'] !== false) {
    buf = await sharpenImage(buf)
    featuresApplied.push('sharpen')
  }
  if (options.faceEnhancement && flagMap['face_enhancement'] !== false) {
    try {
      buf = await faceEnhancement(buf)
      featuresApplied.push('face_enhancement')
    } catch {
      fetch(`${req.nextUrl.origin}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'hf_failure', data: { feature: 'face_enhancement' } }),
      }).catch(() => {})
    }
  }
  if (options.colorization && flagMap['colorization'] !== false) {
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
  if (options.upscale === '2x' && flagMap['upscale_2x'] !== false) {
    buf = await upscale2x(buf)
    featuresApplied.push('upscale_2x')
  } else if (options.upscale === '4x' && flagMap['upscale_4x'] !== false) {
    try {
      buf = await upscale4x(buf)
      featuresApplied.push('upscale_4x')
    } catch {
      buf = await upscale2x(buf)
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
