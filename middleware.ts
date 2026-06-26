import { jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'

const secret = () => new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
)

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('pml_session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const authed = await isAuthenticated(request)

  if (!authed && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authed && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
