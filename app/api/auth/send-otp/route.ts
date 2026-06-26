import sql from '@/lib/db'
import { sendOtpEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()
  if (!normalized.endsWith('@airtribe.live')) {
    return NextResponse.json({ error: 'Only @airtribe.live emails are allowed.' }, { status: 400 })
  }

  const otp = String(randomInt(100000, 999999))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await sql`
    INSERT INTO otps (email, code, expires_at)
    VALUES (${normalized}, ${otp}, ${expiresAt})
    ON CONFLICT (email) DO UPDATE SET code = ${otp}, expires_at = ${expiresAt}
  `

  await sendOtpEmail(normalized, otp)

  return NextResponse.json({ ok: true })
}
