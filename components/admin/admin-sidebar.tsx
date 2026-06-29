'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { href: '/admin/dashboard/history', label: 'Session History', icon: '📋' },
  { href: '/admin/dashboard/appearance', label: 'Appearance', icon: '🎨' },
  { href: '/admin/dashboard/flags', label: 'Feature Flags', icon: '🚩' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin'
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800 min-h-screen">
      <div className="p-5 border-b border-zinc-800">
        <p className="text-white font-bold text-sm">VC Admin</p>
        <p className="text-zinc-500 text-xs mt-0.5">Image Restore</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${active ? 'bg-indigo-600/20 text-indigo-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
