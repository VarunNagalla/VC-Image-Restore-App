'use client'
import type { ProcessingOptions, UpscaleOption } from '@/lib/types'

interface EnhancementPanelProps {
  options: ProcessingOptions
  onChange: (opts: ProcessingOptions) => void
  flags: Record<string, boolean>
}

const TOGGLES: { key: keyof ProcessingOptions; label: string; flag: string; ai?: boolean }[] = [
  { key: 'denoise',         label: 'Denoise',          flag: 'denoise' },
  { key: 'sharpen',         label: 'Sharpen / Deblur', flag: 'sharpen' },
  { key: 'scratchCleanup',  label: 'Scratch Cleanup',  flag: 'scratch_cleanup' },
  { key: 'colorCorrection', label: 'Color Correction', flag: 'color_correction' },
  { key: 'faceEnhancement', label: 'Face Enhancement', flag: 'face_enhancement', ai: true },
  { key: 'colorization',    label: 'Colorization',     flag: 'colorization',     ai: true },
]

export function EnhancementPanel({ options, onChange, flags }: EnhancementPanelProps) {
  function toggle(key: keyof ProcessingOptions) {
    onChange({ ...options, [key]: !options[key as keyof ProcessingOptions] })
  }

  function setUpscale(val: UpscaleOption) {
    onChange({ ...options, upscale: val })
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
      <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Enhancement Options</h3>
      <div className="space-y-3">
        {TOGGLES.map(({ key, label, flag, ai }) => {
          const enabled = flags[flag] !== false
          const isOn = !!options[key as keyof ProcessingOptions]
          return (
            <div key={key} className={`flex items-center justify-between ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-zinc-300 text-sm">{label}</span>
                {ai && (
                  <span className="text-[10px] font-semibold text-indigo-400 border border-indigo-800 rounded px-1.5 py-0.5">AI</span>
                )}
              </div>
              <button
                role="switch" aria-checked={isOn}
                onClick={() => toggle(key)}
                className={`relative w-10 h-5.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isOn ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                style={{ height: '1.375rem' }}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-4.5' : ''}`}
                  style={{ transform: isOn ? 'translateX(1.125rem)' : 'translateX(0)' }} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-zinc-800">
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Upscale</p>
        <div className="flex gap-2">
          {(['none', '2x', '4x'] as UpscaleOption[]).map(v => (
            <button key={v} onClick={() => setUpscale(v)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${options.upscale === v ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
              {v === 'none' ? 'None' : v}
              {v === '4x' && <span className="text-[10px] text-indigo-300 ml-1">AI</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
