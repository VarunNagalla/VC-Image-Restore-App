interface ProgressIndicatorProps {
  current: number
  total: number
  label: string
}

export function ProgressIndicator({ current, total, label }: ProgressIndicatorProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-zinc-400">
        <span className="truncate">{label}</span>
        <span className="flex-shrink-0 ml-2">{current}/{total}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
