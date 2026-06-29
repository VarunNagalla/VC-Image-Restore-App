import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJwt } from '@/lib/auth/session'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminJwt(token))) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
