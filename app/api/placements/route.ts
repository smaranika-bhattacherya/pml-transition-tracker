import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await sql`SELECT * FROM placements ORDER BY created_at ASC`
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, linkedin, prev_company, prev_role, new_company, new_role, transition, review, highlight } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  try {
    const [data] = await sql`
      INSERT INTO placements (name, linkedin, prev_company, prev_role, new_company, new_role, transition, review, highlight)
      VALUES (
        ${name.trim()},
        ${linkedin ?? ''},
        ${prev_company ?? ''},
        ${prev_role ?? ''},
        ${new_company ?? ''},
        ${new_role ?? ''},
        ${transition ?? ''},
        ${review ?? ''},
        ${highlight ?? ''}
      )
      RETURNING *
    `
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
