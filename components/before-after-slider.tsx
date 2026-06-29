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
      className="relative select-none overflow-hidden rounded-2xl cursor-col-resize bg-zinc-950"
      style={{ aspectRatio: '16/9' }}
      onMouseDown={e => { dragging.current = true; updatePos(e.clientX) }}
      onMouseMove={e => dragging.current && updatePos(e.clientX)}
      onMouseUp={() => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onTouchStart={e => { dragging.current = true; updatePos(e.touches[0].clientX) }}
      onTouchMove={e => { e.preventDefault(); dragging.current && updatePos(e.touches[0].clientX) }}
      onTouchEnd={() => { dragging.current = false }}
    >
      {/* Before (full width, background) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before} alt="Original" className="absolute inset-0 w-full h-full object-contain" draggable={false} />

      {/* After (clipped to left of slider) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after} alt="Restored"
          className="absolute inset-0 h-full object-contain"
          style={{ width: containerRef.current?.offsetWidth ?? '100%' }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div className="absolute top-0 bottom-0 w-px bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      <span className="absolute bottom-3 left-3 text-xs bg-black/70 text-white px-2 py-1 rounded-full backdrop-blur-sm">Before</span>
      <span className="absolute bottom-3 right-3 text-xs bg-indigo-600/90 text-white px-2 py-1 rounded-full backdrop-blur-sm">After</span>
    </div>
  )
}
