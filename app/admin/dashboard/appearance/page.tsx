'use client'
import { useEffect, useState } from 'react'

const FIELDS = [
  { key: 'hero_title', label: 'Hero Title', type: 'text' },
  { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
  { key: 'cta_text', label: 'CTA Button Text', type: 'text' },
  { key: 'cta_color', label: 'CTA Color (hex)', type: 'text' },
  { key: 'footer_text', label: 'Footer Text', type: 'text' },
  { key: 'bg_color', label: 'Background Color (hex)', type: 'text' },
  { key: 'logo_url', label: 'Logo URL', type: 'text' },
]

export default function AppearancePage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      const map: Record<string, string> = {}
      ;(d.settings ?? []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
      setValues(map)
    })
  }, [])

  async function save(key: string) {
    setSaving(key)
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: values[key] ?? '' }),
    })
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-white text-2xl font-bold">Appearance</h1>
      <p className="text-zinc-500 text-sm">Customize landing page content and branding.</p>
      {FIELDS.map(({ key, label }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">{label}</label>
          <div className="flex gap-2">
            <input
              type="text" value={values[key] ?? ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
              className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-colors"
            />
            <button onClick={() => save(key)} disabled={saving === key}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap">
              {saving === key ? '…' : saved === key ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
