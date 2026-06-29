import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VC Image Restore — Bring old photos back to life',
  description: 'Restore old, blurry, scratched, and faded photos with AI-powered denoise, sharpen, color correction, face enhancement, colorization, and 4× upscale. Photos are processed in memory and never stored.',
  authors: [{ name: 'Varun Nagalla' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-zinc-950 text-white">
        {children}
      </body>
    </html>
  )
}
