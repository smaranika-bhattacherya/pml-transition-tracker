'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PlacementCard from './PlacementCard'
import AddEditModal from './AddEditModal'
import ImportModal from './ImportModal'
import type { Placement, PlacementInput } from '@/types'

const TOP_PILLS = ['Tech to PM', 'PM - PM', 'APM to PM', 'Business Analyst to PM', 'PM to SPM', 'Product Owner to PM']

interface Props {
  initialPlacements: Placement[]
  initialTransitions: string[]
}

export default function Dashboard({ initialPlacements, initialTransitions }: Props) {
  const router = useRouter()

  const [placements, setPlacements] = useState<Placement[]>(initialPlacements)
  const [transitions, setTransitions] = useState<string[]>(initialTransitions)
  const [search, setSearch] = useState('')
  const [transFilter, setTransFilter] = useState('')
  const [reviewFilter, setReviewFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Placement | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const toastRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  // Restore theme from localStorage on mount
  useEffect(() => {
    const saved = (localStorage.getItem('pml_theme') || 'dark') as 'dark' | 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('pml_theme', next)
  }

  function showToast(msg: string) {
    const el = toastRef.current
    if (!el) return
    el.textContent = msg
    el.classList.add('show')
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => el.classList.remove('show'), 2500)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(p: Placement) { setEditing(p); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  const handleSave = useCallback(async (data: PlacementInput) => {
    if (editing) {
      const res = await fetch(`/api/placements/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { showToast('Error saving — try again'); return }
      const updated: Placement = await res.json()
      setPlacements((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      showToast('Changes saved ✓')
    } else {
      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { showToast('Error saving — try again'); return }
      const created: Placement = await res.json()
      setPlacements((prev) => [...prev, created])
      showToast('Placement saved ✓')
    }
    closeModal()
  }, [editing])

  const handleDelete = useCallback(async () => {
    if (!editing) return
    if (!confirm('Delete this placement?')) return
    const res = await fetch(`/api/placements/${editing.id}`, { method: 'DELETE' })
    if (!res.ok) { showToast('Error deleting — try again'); return }
    setPlacements((prev) => prev.filter((p) => p.id !== editing.id))
    closeModal()
    showToast('Deleted')
  }, [editing])

  const handleAddTransition = useCallback(async (name: string) => {
    if (transitions.includes(name)) return
    await fetch('/api/transitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setTransitions((prev) => [...prev, name].sort())
    showToast(`"${name}" added`)
  }, [transitions])

  // Filtered results
  const results = placements.filter((p) => {
    if (!p.name) return false
    const txt = [p.name, p.prev_company, p.prev_role, p.new_company, p.new_role, p.transition]
      .join(' ').toLowerCase()
    return (
      (!search || txt.includes(search.toLowerCase())) &&
      (!transFilter || p.transition === transFilter) &&
      (!reviewFilter || p.review === reviewFilter)
    )
  })

  // Stats
  const withLI = placements.filter((p) => p.linkedin?.startsWith('http')).length
  const excellent = placements.filter((p) => p.review === 'Excellent').length
  const uniqueTransitions = new Set(placements.map((p) => p.transition).filter(Boolean)).size

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-mark">AT</div>
          <div>
            <div className="logo-text">Airtribe</div>
            <div className="logo-sub">PML · Placement tracker</div>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☽'}
          </button>
          <button className="icon-btn" onClick={logout} title="Sign out" style={{ fontSize: 13 }}>
            ⏏
          </button>
          <button className="import-btn" onClick={() => setImportOpen(true)}>
            ↑ Import
          </button>
          <button className="add-btn" onClick={openAdd}>+ Add placement</button>
        </div>
      </header>

      <main className="page">
        {/* Stats */}
        <div className="stats">
          <div className="stat"><div className="stat-label">Placements</div><div className="stat-num">{placements.length}</div></div>
          <div className="stat"><div className="stat-label">With LinkedIn</div><div className="stat-num">{withLI}</div></div>
          <div className="stat"><div className="stat-label">Excellent reviews</div><div className="stat-num">{excellent}</div></div>
          <div className="stat"><div className="stat-label">Transitions</div><div className="stat-num">{uniqueTransitions}</div></div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search name, company, role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={transFilter}
              onChange={(e) => { setTransFilter(e.target.value) }}
            >
              <option value="">All transitions</option>
              {transitions.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={reviewFilter} onChange={(e) => setReviewFilter(e.target.value)}>
              <option value="">All reviews</option>
              <option>Excellent</option>
              <option>Average</option>
              <option>Bad</option>
            </select>
          </div>

          {/* Pills */}
          <div className="pills">
            <button
              className={`pill${!transFilter ? ' active' : ''}`}
              onClick={() => setTransFilter('')}
            >
              All
            </button>
            {TOP_PILLS.map((t) => (
              <button
                key={t}
                className={`pill${transFilter === t ? ' active' : ''}`}
                onClick={() => setTransFilter((prev) => (prev === t ? '' : t))}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="meta">{results.length} result{results.length !== 1 ? 's' : ''}</div>

        <div className="cards">
          {results.length === 0 ? (
            <div className="empty">No placements match your filters</div>
          ) : (
            results.map((p) => (
              <PlacementCard key={p.id} placement={p} onEdit={openEdit} />
            ))
          )}
        </div>
      </main>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(newPlacements) => {
          setPlacements((prev) => [...prev, ...newPlacements])
          showToast(`${newPlacements.length} placement${newPlacements.length !== 1 ? 's' : ''} imported ✓`)
        }}
      />

      <AddEditModal
        open={modalOpen}
        editing={editing}
        transitions={transitions}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddTransition={handleAddTransition}
      />

      <div className="toast" ref={toastRef} />
    </>
  )
}
