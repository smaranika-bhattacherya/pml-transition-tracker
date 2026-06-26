export interface Placement {
  id: string
  name: string
  linkedin: string
  prev_company: string
  prev_role: string
  new_company: string
  new_role: string
  transition: string
  review: 'Excellent' | 'Average' | 'Bad' | ''
  highlight: string
  created_at: string
  updated_at: string
}

export type PlacementInput = Omit<Placement, 'id' | 'created_at' | 'updated_at'>
