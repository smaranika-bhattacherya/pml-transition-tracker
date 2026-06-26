import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import type { PlacementInput } from '@/types'

const VALID_REVIEWS = new Set(['Excellent', 'Average', 'Bad'])

export async function POST(request: NextRequest) {
  const { placements } = await request.json() as { placements: Partial<PlacementInput>[] }

  if (!Array.isArray(placements) || placements.length === 0) {
    return NextResponse.json({ error: 'No placements provided.' }, { status: 400 })
  }

  const rows = placements
    .map((r) => ({
      name:         (r.name ?? '').trim(),
      linkedin:     (r.linkedin ?? '').trim(),
      prev_company: (r.prev_company ?? '').trim(),
      prev_role:    (r.prev_role ?? '').trim(),
      new_company:  (r.new_company ?? '').trim(),
      new_role:     (r.new_role ?? '').trim(),
      transition:   (r.transition ?? '').trim(),
      review:       VALID_REVIEWS.has(r.review ?? '') ? r.review! : '' as PlacementInput['review'],
      highlight:    (r.highlight ?? '').trim(),
    }))
    .filter((r) => r.name.length > 0)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid rows — "name" is required in every row.' }, { status: 400 })
  }

  try {
    const inserted = await sql`
      INSERT INTO placements ${sql(rows, 'name', 'linkedin', 'prev_company', 'prev_role', 'new_company', 'new_role', 'transition', 'review', 'highlight')}
      RETURNING *
    `
    return NextResponse.json({ imported: inserted.length, placements: inserted })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
