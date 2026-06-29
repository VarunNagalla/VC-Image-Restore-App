'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NameModal } from '@/components/name-modal'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'

const FEATURES = [
  { icon: '🔇', title: 'Denoise', desc: 'Remove grain and digital noise from old scans.' },
  { icon: '🔍', title: 'Sharpen / Deblur', desc: 'Restore crisp details from blurry photos.' },
  { icon: '🩹', title: 'Scratch Cleanup', desc: 'Erase scratches, dust, and surface damage.' },
  { icon: '🎨', title: 'Color Correction', desc: 'Fix faded and washed-out colors automatically.' },
  { icon: '🤖', title: 'Face Enhancement', desc: 'AI-powered restoration of facial details.' },
  { icon: '🌈', title: 'Colorization', desc: 'Turn black & white photos into vivid color with AI.' },
  { icon: '⬆️', title: '2× / 4× Upscale', desc: 'Double or quadruple resolution with AI super-resolution.' },
  { icon: '📦', title: 'Batch Processing', desc: 'Enhance up to 10 images in one go.' },
]

export default function HomePage() {
  const [showModal, setShowModal] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('vc_user_name')
    if (saved) setUserName(saved)
  }, [])

  function handleNameSubmit(name: string) {
    setUserName(name)
    setShowModal(false)
  }

  function handleCTA() {
    if (!userName) { setShowModal(true); return }
    window.location.href = '/restore'
  }

  return (
    <>
      {showModal && <NameModal onSubmit={handleNameSubmit} />}
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <Navbar />

        <main className="flex-1">
          {/* Hero */}
          <section className="relative overflow-hidden px-6 py-24 md:py-32 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-zinc-950 to-zinc-950 pointer-events-none" />
            <div className="relative max-w-3xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-800/50 bg-indigo-950/40 px-4 py-1.5 text-xs font-medium text-indigo-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Free · No account needed · Photos never stored
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Bring faded, blurry,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  damaged photos
                </span>{' '}
                back to life
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                Denoise, sharpen, fix colors, enhance faces, colorize, and upscale — up to 10 images at once. Results download as JPEG instantly.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button onClick={handleCTA}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-indigo-600/20">
                  {userName ? `Restore Photos, ${userName}` : 'Start Restoring'}
                </button>
                <a href="#features" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                  See all features ↓
                </a>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="text-center text-2xl font-bold text-white mb-10">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { n: '1', title: 'Upload your photos', desc: 'Drag and drop up to 10 images — JPEG, PNG, WEBP, HEIC, TIFF, BMP, GIF all supported.' },
                { n: '2', title: 'Choose enhancements', desc: 'Toggle denoise, sharpen, color correction, face AI, colorization, and upscale independently.' },
                { n: '3', title: 'Download as JPEG', desc: 'Compare before/after with the drag slider, then download all images in a single ZIP.' },
              ].map(step => (
                <div key={step.n} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-lg">{step.n}</div>
                  <h3 className="text-white font-semibold">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section id="features" className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="text-center text-2xl font-bold text-white mb-10">Restoration tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {FEATURES.map(f => (
                <div key={f.title} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-2 hover:border-zinc-700 transition-colors">
                  <div className="text-2xl">{f.icon}</div>
                  <h3 className="text-white font-semibold text-sm">{f.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy CTA */}
          <section className="max-w-3xl mx-auto px-6 py-16 text-center">
            <div className="rounded-2xl border border-indigo-800/30 bg-indigo-950/20 p-10 space-y-4">
              <div className="text-3xl">🔒</div>
              <h2 className="text-white text-2xl font-bold">Privacy first, always</h2>
              <p className="text-zinc-400 leading-relaxed">
                Your photos are processed in memory for a single request and immediately discarded. We never write them to a database or storage bucket.
              </p>
              <button onClick={handleCTA}
                className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors">
                Try it free →
              </button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
