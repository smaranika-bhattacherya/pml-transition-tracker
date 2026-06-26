import type { Placement } from '@/types'

const AV_COLS = ['av-o', 'av-b', 'av-g', 'av-p', 'av-t']

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase()
}

function avatarClass(name: string) {
  return AV_COLS[(name || 'A').charCodeAt(0) % AV_COLS.length]
}

interface Props {
  placement: Placement
  onEdit: (p: Placement) => void
}

export default function PlacementCard({ placement: p, onEdit }: Props) {
  const hasLI = p.linkedin && (p.linkedin.startsWith('http') || p.linkedin.startsWith('www'))
  const liUrl = hasLI ? (p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`) : ''

  const dot =
    p.review === 'Excellent' ? <span className="review-dot" style={{ background: '#22c55e' }} title="Excellent" /> :
    p.review === 'Average'   ? <span className="review-dot" style={{ background: '#f59e0b' }} title="Average" /> :
    p.review === 'Bad'       ? <span className="review-dot" style={{ background: '#ef4444' }} title="Bad" /> : null

  const isTestimonial = (p.highlight || '').toLowerCase().includes('testimonial')

  return (
    <div className="card">
      <div className="card-top">
        <div className={`avatar ${avatarClass(p.name)}`}>{initials(p.name)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="card-name">
            {p.name}
            {isTestimonial && <span className="badge-test">testimonial</span>}
          </div>
          <div className="card-co">→ {p.new_company || '—'}</div>
        </div>
        <button className="edit-btn" onClick={() => onEdit(p)} title="Edit">✏</button>
      </div>

      {p.transition && <div className="trans-tag">{p.transition}</div>}

      <div className="role-row">
        <span className="role-chip" title={p.prev_role}>{p.prev_role || '—'}</span>
        <span className="role-arrow">→</span>
        <span className="role-chip" title={p.new_role}>{p.new_role || '—'}</span>
        {dot}
      </div>

      {hasLI ? (
        <a className="li-btn" href={liUrl} target="_blank" rel="noopener noreferrer">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
          LinkedIn
        </a>
      ) : (
        <span className="no-li">No LinkedIn</span>
      )}
    </div>
  )
}
