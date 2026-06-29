interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
}

export function StatsCard({ label, value, sub }: StatsCardProps) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-1">
      <p className="text-zinc-500 text-xs uppercase tracking-widest">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {sub && <p className="text-zinc-500 text-xs">{sub}</p>}
    </div>
  )
}
