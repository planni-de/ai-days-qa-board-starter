import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    return new NextResponse('Admin disabled', { status: 404 })
  }

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6))
      const idx = decoded.indexOf(':')
      const pwd = idx >= 0 ? decoded.slice(idx + 1) : ''
      if (pwd === password) return NextResponse.next()
    } catch {}
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="planni admin"' },
  })
}
