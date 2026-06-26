'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [loading, setLoading] = useState(false)
  const otpRef = useRef<HTMLInputElement>(null)

  async function sendOtp() {
    setEmailErr('')
    if (!email) { setEmailErr('Please enter your email.'); return }
    if (!email.trim().toLowerCase().endsWith('@airtribe.live')) {
      setEmailErr('Only @airtribe.live emails are allowed.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const json = await res.json()
      if (!res.ok) { setEmailErr(json.error || 'Failed to send OTP.'); return }
      setStep('otp')
      setTimeout(() => otpRef.current?.focus(), 50)
    } catch {
      setEmailErr('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setOtpErr('')
    if (otp.trim().length !== 6) { setOtpErr('Please enter the 6-digit OTP.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setOtpErr(json.error || 'Incorrect OTP.'); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setOtpErr('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">AT</div>
        <div className="login-title">PML Placements</div>
        <div className="login-sub">Sign in with your Airtribe email</div>

        {step === 'email' ? (
          <>
            <div className="login-field">
              <label>Work email</label>
              <input
                type="email"
                placeholder="you@airtribe.live"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                autoFocus
              />
            </div>
            <button className="login-btn" onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
            <div className="login-err">{emailErr}</div>
          </>
        ) : (
          <>
            <div className="login-user">
              OTP sent to <span>{email}</span>
            </div>
            <div className="login-field">
              <label>Enter 6-digit OTP</label>
              <input
                ref={otpRef}
                type="text"
                placeholder="••••••"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '.2em' }}
              />
            </div>
            <button className="login-btn" onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Sign in'}
            </button>
            <div className="login-err">{otpErr}</div>
            <button
              className="login-back"
              onClick={() => { setStep('email'); setOtp(''); setOtpErr('') }}
            >
              ← Use a different email
            </button>
          </>
        )}
      </div>
    </div>
  )
}
