import Link from 'next/link'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          VC Image Restore
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400 sm:flex">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/restore" className="hover:text-white transition-colors">Restore</Link>
        </nav>

        <Link href="/restore"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          Start Restoring
        </Link>
      </div>
    </header>
  )
}
