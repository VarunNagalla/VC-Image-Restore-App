'use client'

interface ThumbnailStripProps {
  previews: string[]
  selected: number
  onSelect: (i: number) => void
  processedIndices: Set<number>
}

export function ThumbnailStrip({ previews, selected, onSelect, processedIndices }: ThumbnailStripProps) {
  if (previews.length <= 1) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {previews.map((src, i) => (
        <button key={i} onClick={() => onSelect(i)}
          className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
            ${selected === i ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-zinc-700 hover:border-zinc-500'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
          {processedIndices.has(i) && (
            <div className="absolute inset-0 bg-green-600/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/60 text-white px-1 rounded">{i + 1}</span>
        </button>
      ))}
    </div>
  )
}
