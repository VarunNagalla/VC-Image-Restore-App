'use client'
import { useCallback, useRef, useState } from 'react'

const STANDARD_TYPES = ['image/jpeg','image/png','image/webp','image/tiff','image/bmp','image/gif']
const HEIC_EXTS = ['.heic', '.heif']
const RAW_EXTS = ['.cr2','.cr3','.nef','.arw','.dng','.orf','.rw2','.raf','.pef']
const MAX_FILES = 10
const MAX_SIZE_MB = 20

interface UploadZoneProps {
  onFiles: (files: File[]) => void
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default
  const blob = await (heic2any as Function)({ blob: file, toType: 'image/jpeg', quality: 0.92 }) as Blob
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
      setError(`RAW files (${rawFiles.map(f => f.name).join(', ')}) are not supported. Please export as JPEG or PNG from your camera software first.`)
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
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all select-none
        ${dragging ? 'border-indigo-400 bg-indigo-950/30' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900'}`}
    >
      <input
        ref={inputRef} type="file" accept="image/*,.heic,.heif"
        multiple className="hidden"
        onChange={e => e.target.files && processFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-3">
        {converting ? (
          <p className="text-zinc-400">Converting HEIC files…</p>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Drop photos here</p>
              <p className="text-zinc-400 text-sm mt-1">or click to browse — up to {MAX_FILES} images, {MAX_SIZE_MB}MB each</p>
            </div>
            <p className="text-zinc-600 text-xs">JPEG · PNG · WEBP · TIFF · BMP · GIF · HEIC supported</p>
          </>
        )}
      </div>
      {error && (
        <div className="mt-4 flex items-center gap-2 justify-center text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
