'use client'
import { useState, useCallback, useEffect } from 'react'
import { UploadZone } from '@/components/upload-zone'
import { EnhancementPanel } from '@/components/enhancement-panel'
import { BeforeAfterSlider } from '@/components/before-after-slider'
import { ThumbnailStrip } from '@/components/thumbnail-strip'
import { ProgressIndicator } from '@/components/progress-indicator'
import type { ProcessingOptions, FeatureFlag } from '@/lib/types'

const DEFAULT_OPTIONS: ProcessingOptions = {
  denoise: true,
  sharpen: true,
  scratchCleanup: true,
  colorCorrection: true,
  faceEnhancement: false,
  colorization: false,
  upscale: 'none',
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
    }).catch(() => {})
  }, [])

  const onFiles = useCallback((newFiles: File[]) => {
    setPreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return [] })
    setResults(prev => { prev.forEach(u => u && URL.revokeObjectURL(u)); return [] })
    setFiles(newFiles)
    setResults(new Array(newFiles.length).fill(null))
    setProcessedSet(new Set())
    setSelected(0)
    setPreviews(newFiles.map(f => URL.createObjectURL(f)))
  }, [])

  async function processAll() {
    if (!files.length || processing) return
    setProcessing(true)
    const newResults: (string | null)[] = [...results]
    const newProcessed = new Set<number>()

    for (let i = 0; i < files.length; i++) {
      setSelected(i)
      setProgress({ current: i, total: files.length, label: `Enhancing ${files[i].name}…` })
      const fd = new FormData()
      fd.append('image', files[i])
      fd.append('options', JSON.stringify(options))
      try {
        const res = await fetch('/api/process', { method: 'POST', body: fd })
        if (res.ok) {
          const blob = await res.blob()
          if (newResults[i]) URL.revokeObjectURL(newResults[i]!)
          newResults[i] = URL.createObjectURL(blob)
          newProcessed.add(i)
        }
      } catch { /* result stays null */ }
      setResults([...newResults])
      setProcessedSet(new Set(newProcessed))
    }

    setProgress({ current: files.length, total: files.length, label: 'All done!' })
    setProcessing(false)

    const userName = typeof window !== 'undefined' ? localStorage.getItem('vc_user_name') ?? 'Anonymous' : 'Anonymous'
    const featuresUsed = [
      options.denoise && 'denoise',
      options.sharpen && 'sharpen',
      options.scratchCleanup && 'scratch_cleanup',
      options.colorCorrection && 'color_correction',
      options.faceEnhancement && 'face_enhancement',
      options.colorization && 'colorization',
      options.upscale !== 'none' && `upscale_${options.upscale}`,
    ].filter(Boolean)

    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: userName, device_type: detectDevice(), features_used: featuresUsed, image_count: files.length }),
    }).catch(() => {})
  }

  async function downloadAll() {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    await Promise.all(results.map(async (url, i) => {
      if (!url) return
      const blob = await fetch(url).then(r => r.blob())
      zip.file(`vc-restored-${i + 1}.jpg`, blob)
    }))
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'vc-image-restore.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function downloadSingle(i: number) {
    const url = results[i]; if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `vc-restored-${i + 1}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const anyProcessed = processedSet.size > 0

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Restore Photos</h1>
          {files.length > 0 && (
            <button onClick={() => onFiles([])}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              ← Upload different images
            </button>
          )}
        </div>

        {!files.length && <UploadZone onFiles={onFiles} />}

        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <EnhancementPanel options={options} onChange={setOptions} flags={flags} />

              <button onClick={processAll} disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
                {processing ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>Enhancing…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>Enhance {files.length} Image{files.length > 1 ? 's' : ''}</>
                )}
              </button>

              {anyProcessed && (
                <button onClick={downloadAll}
                  className="w-full flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All as ZIP
                </button>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              {processing && progress.total > 0 && (
                <ProgressIndicator current={progress.current} total={progress.total} label={progress.label} />
              )}
              {previews[selected] && (
                results[selected]
                  ? <BeforeAfterSlider before={previews[selected]} after={results[selected]!} />
                  : <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previews[selected]} alt="Original" className="max-h-full max-w-full object-contain" />
                    </div>
              )}
              {results[selected] && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => downloadSingle(selected)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Enhanced Photo
                  </button>
                  {files.length > 1 && (
                    <button onClick={downloadAll}
                      className="flex-1 flex items-center justify-center gap-2 border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white font-medium py-3 rounded-xl transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download All as ZIP
                    </button>
                  )}
                </div>
              )}
              <ThumbnailStrip previews={previews} selected={selected} onSelect={setSelected} processedIndices={processedSet} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
