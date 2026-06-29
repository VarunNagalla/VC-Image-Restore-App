'use client'
import { useState, useEffect, useRef } from 'react'

interface NameModalProps {
  onSubmit: (name: string) => void
}

export function NameModal({ onSubmit }: NameModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name to continue.'); return }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters.'); return }
    if (trimmed.length > 60) { setError('Name must be under 60 characters.'); return }
    localStorage.setItem('vc_user_name', trimmed)
    onSubmit(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-bold">Welcome to VC Image Restore</h2>
            <p className="text-zinc-400 text-sm mt-1">Enter your name to get started</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Your name"
              maxLength={60}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 transition-colors"
            />
            {error && <p className="text-red-400 text-sm mt-1.5">{error}</p>}
          </div>
          <button type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
