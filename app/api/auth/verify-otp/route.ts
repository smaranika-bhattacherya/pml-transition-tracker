import sql from '@/lib/db'
import { createSession, SESSION_COOKIE } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, otp } = await request.json()

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()

  if (process.env.NODE_ENV !== 'production') {
    // Dev mode: accept any 6-digit code
    if (!/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json({ error: 'Enter any 6-digit code in dev mode.' }, { status: 400 })
    }
  } else {
    const rows = await sql`
      SELECT email FROM otps
      WHERE email = ${normalized}
        AND code = ${otp.trim()}
        AND expires_at > NOW()
    `
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
    }
    await sql`DELETE FROM otps WHERE email = ${normalized}`
  }

  const token = await createSession(normalized)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return response
}
