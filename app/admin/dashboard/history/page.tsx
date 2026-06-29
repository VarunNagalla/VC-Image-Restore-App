'use client'
import { useEffect, useState } from 'react'
import type { Session } from '@/lib/types'

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/history?page=${page}`)
      .then(r => r.json())
      .then(d => { setSessions(d.sessions ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5 max-w-5xl">
      <h1 className="text-white text-2xl font-bold">Session History</h1>
      <p className="text-zinc-500 text-sm">{total} total sessions</p>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-zinc-400 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-medium">Device</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-medium">Images</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-medium">Features</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">Loading…</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No sessions yet.</td></tr>
            ) : sessions.map(s => (
              <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3 text-white">{s.user_name}</td>
                <td className="px-4 py-3 text-zinc-400 capitalize">{s.device_type}</td>
                <td className="px-4 py-3 text-zinc-400">{s.image_count}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{(s.features_used ?? []).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                  {new Date(s.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 text-sm transition-colors">
            ← Prev
          </button>
          <span className="text-zinc-500 text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 text-sm transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
