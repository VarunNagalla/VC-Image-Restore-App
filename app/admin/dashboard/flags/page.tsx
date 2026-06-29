'use client'
import { useEffect, useState } from 'react'
import type { FeatureFlag } from '@/lib/types'

const FEATURE_LABELS: Record<string, string> = {
  denoise: 'Denoise',
  sharpen: 'Sharpen / Deblur',
  scratch_cleanup: 'Scratch Cleanup',
  color_correction: 'Color Correction',
  face_enhancement: 'Face Enhancement (AI)',
  colorization: 'Colorization (AI)',
  upscale_2x: 'Upscale 2×',
  upscale_4x: 'Upscale 4× (AI)',
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/flags').then(r => r.json()).then(d => setFlags(d.flags ?? []))
  }, [])

  async function toggle(flag: FeatureFlag) {
    setToggling(flag.feature_name)
    const newEnabled = !flag.enabled
    await fetch('/api/admin/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_name: flag.feature_name, enabled: newEnabled }),
    })
    setFlags(prev => prev.map(f => f.feature_name === flag.feature_name ? { ...f, enabled: newEnabled } : f))
    setToggling(null)
  }

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-white text-2xl font-bold">Feature Flags</h1>
      <p className="text-zinc-500 text-sm">Enable or disable features for all users instantly.</p>
      <div className="space-y-2">
        {flags.map(flag => (
          <div key={flag.feature_name}
            className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
            <div>
              <p className="text-white text-sm font-medium">{FEATURE_LABELS[flag.feature_name] ?? flag.feature_name}</p>
              <p className="text-zinc-600 text-xs">{flag.feature_name}</p>
            </div>
            <button
              onClick={() => toggle(flag)} disabled={toggling === flag.feature_name}
              className={`relative w-10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${flag.enabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
              style={{ height: '1.375rem' }}>
              <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: flag.enabled ? 'translateX(1.125rem)' : 'translateX(0)' }} />
            </button>
          </div>
        ))}
        {flags.length === 0 && <p className="text-zinc-600 text-sm">No feature flags found.</p>}
      </div>
    </div>
  )
}
