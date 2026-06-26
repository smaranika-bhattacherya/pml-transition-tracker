import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name, linkedin, prev_company, prev_role, new_company, new_role, transition, review, highlight } = await request.json()

  try {
    const [data] = await sql`
      UPDATE placements SET
        name         = ${name ?? ''},
        linkedin     = ${linkedin ?? ''},
        prev_company = ${prev_company ?? ''},
        prev_role    = ${prev_role ?? ''},
        new_company  = ${new_company ?? ''},
        new_role     = ${new_role ?? ''},
        transition   = ${transition ?? ''},
        review       = ${review ?? ''},
        highlight    = ${highlight ?? ''},
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await sql`DELETE FROM placements WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
