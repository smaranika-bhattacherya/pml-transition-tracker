import sql from '@/lib/db'
import Dashboard from '@/components/Dashboard'
import type { Placement } from '@/types'

export default async function DashboardPage() {
  let placements: Placement[] = []
  let transitions: string[] = []

  try {
    const [p, t] = await Promise.all([
      sql<Placement[]>`SELECT * FROM placements ORDER BY created_at ASC`,
      sql<{ name: string }[]>`SELECT name FROM transitions ORDER BY name`,
    ])
    placements = p
    transitions = t.map((r) => r.name)
  } catch { /* renders with empty state until DB is reachable */ }

  return <Dashboard initialPlacements={placements} initialTransitions={transitions} />
}
