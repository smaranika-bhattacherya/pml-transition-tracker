import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await sql<{ name: string }[]>`SELECT name FROM transitions ORDER BY name`
    return NextResponse.json(data.map((t) => t.name))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { name } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  try {
    await sql`INSERT INTO transitions (name) VALUES (${name.trim()}) ON CONFLICT (name) DO NOTHING`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
