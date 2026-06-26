export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  if (!process.env.EMAILJS_SERVICE_ID) {
    // Dev fallback: print OTP to terminal
    console.log(`\n╔══════════════════════════════╗`)
    console.log(`║  OTP for ${email.padEnd(20)}║`)
    console.log(`║  Code: ${otp.padEnd(23)}║`)
    console.log(`╚══════════════════════════════╝\n`)
    return
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        otp_code: otp,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`EmailJS error ${res.status}: ${body}`)
  }
}
