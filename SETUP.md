# PML Tracker — Setup Guide

## 1. Install dependencies

```bash
cd pml-tracker
npm install
```

---

## 2. Create your Supabase project

1. Go to https://supabase.com → New project
2. Note your **Project URL** and **anon public key** (Settings → API)

### Run the schema

In the Supabase SQL editor, run **`supabase/schema.sql`** first, then **`supabase/seed.sql`**.

---

## 3. Configure Supabase Auth

### Allow OTP email sign-in

1. Supabase dashboard → Authentication → Sign In Methods
2. Enable **Email** → make sure **"Enable email OTP"** is on (not magic link — OTP)
3. Under **Email**, set **OTP expiry** to 600 seconds (10 min)

### (Production) Use Resend for email delivery

1. Create a free account at https://resend.com — get an API key
2. Supabase dashboard → Authentication → SMTP Settings
3. Enter:
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: your Resend API key
   - Sender email: e.g. `noreply@yourdomain.com`

> Without this, Supabase uses its own email (limited to ~3/hour on free tier).

---

## 4. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

---

## 6. Deploy to Vercel

```bash
npx vercel
```

Or push to GitHub and import the repo at https://vercel.com/new.

Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's project settings under **Environment Variables**.

---

## Project structure

```
app/
  layout.tsx          # Root layout (dark theme default)
  page.tsx            # Redirects to /login or /dashboard
  login/page.tsx      # Login page
  dashboard/page.tsx  # Dashboard (server-renders initial data)
  api/
    auth/send-otp/    # POST — sends OTP via Supabase Auth
    auth/verify-otp/  # POST — verifies OTP, sets session cookie
    auth/logout/      # POST — clears session
    placements/       # GET all, POST new
    placements/[id]/  # PUT update, DELETE
    transitions/      # GET all, POST new custom type

components/
  LoginForm.tsx       # Email → OTP login flow
  Dashboard.tsx       # Main client component (search, filter, CRUD)
  PlacementCard.tsx   # Individual placement card
  AddEditModal.tsx    # Add / edit modal

lib/supabase/
  server.ts           # Server-side Supabase client (cookies)
  client.ts           # Browser Supabase client

middleware.ts         # Protects /dashboard, redirects from /login if authed

supabase/
  schema.sql          # Tables + RLS policies (run first)
  seed.sql            # Default transitions + all original placement data
```
