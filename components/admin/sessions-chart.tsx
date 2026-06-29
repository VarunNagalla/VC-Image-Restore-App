'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface SessionsChartProps {
  data: { date: string; count: number }[]
}

export function SessionsChart({ data }: SessionsChartProps) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
      <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-4">Sessions (last 7 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fff' }}
            cursor={{ fill: '#3f3f46' }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sessions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
