'use client'
import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/admin/stats-card'
import { SessionsChart } from '@/components/admin/sessions-chart'
import type { AdminStats } from '@/lib/types'

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/history?page=1').then(r => r.json()),
    ]).then(([s, h]) => {
      setStats(s)
      const days = getLast7Days()
      const countMap: Record<string, number> = {}
      days.forEach(d => { countMap[d] = 0 })
      ;(h.sessions ?? []).forEach((sess: { created_at: string }) => {
        const day = sess.created_at.slice(0, 10)
        if (day in countMap) countMap[day]++
      })
      setChartData(days.map(d => ({ date: d.slice(5), count: countMap[d] })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-zinc-500">Loading…</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-white text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Sessions Today" value={stats?.sessions_today ?? 0} />
        <StatsCard label="This Week" value={stats?.sessions_this_week ?? 0} />
        <StatsCard label="All Time" value={stats?.sessions_all_time ?? 0} />
        <StatsCard label="Images Processed" value={stats?.images_processed_all_time ?? 0} sub={stats?.most_used_feature ? `Top: ${stats.most_used_feature}` : undefined} />
      </div>
      <SessionsChart data={chartData} />
    </div>
  )
}
