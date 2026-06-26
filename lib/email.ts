export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    // Dev fallback: print OTP to terminal
    console.log(`\n╔══════════════════════════════╗`)
    console.log(`║  OTP for ${email.padEnd(20)}║`)
    console.log(`║  Code: ${otp.padEnd(23)}║`)
    console.log(`╚══════════════════════════════╝\n`)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'PML Placements <onboarding@resend.dev>',
      to: [email],
      subject: 'Your PML Placements login code',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 8px;font-size:18px">Your login code</h2>
          <p style="margin:0 0 24px;color:#666;font-size:14px">Enter this code to sign in to PML Placements.</p>
          <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;font-family:monospace">
            ${otp}
          </div>
          <p style="margin:24px 0 0;color:#999;font-size:12px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}
