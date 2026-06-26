'use client'

import { useEffect, useRef, useState } from 'react'
import type { Placement, PlacementInput } from '@/types'

interface Props {
  open: boolean
  editing: Placement | null
  transitions: string[]
  onClose: () => void
  onSave: (data: PlacementInput) => Promise<void>
  onDelete: () => Promise<void>
  onAddTransition: (name: string) => Promise<void>
}

const EMPTY: PlacementInput = {
  name: '', linkedin: '', prev_company: '', prev_role: '',
  new_company: '', new_role: '', transition: '', review: '', highlight: '',
}

export default function AddEditModal({
  open, editing, transitions, onClose, onSave, onDelete, onAddTransition,
}: Props) {
  const [form, setForm] = useState<PlacementInput>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showNewType, setShowNewType] = useState(false)
  const [newType, setNewType] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm(editing ? {
        name: editing.name,
        linkedin: editing.linkedin,
        prev_company: editing.prev_company,
        prev_role: editing.prev_role,
        new_company: editing.new_company,
        new_role: editing.new_role,
        transition: editing.transition,
        review: editing.review,
        highlight: editing.highlight,
      } : EMPTY)
      setShowNewType(false)
      setNewType('')
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [open, editing])

  function set(key: keyof PlacementInput, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) { alert('Name is required'); return }
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  async function handleAddType() {
    if (!newType.trim()) return
    await onAddTransition(newType.trim())
    set('transition', newType.trim())
    setNewType('')
    setShowNewType(false)
  }

  if (!open) return null

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{editing ? 'Edit placement' : 'Add new placement'}</h2>

        <div className="field">
          <label>Name *</label>
          <input ref={nameRef} placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>LinkedIn URL</label>
          <input placeholder="https://linkedin.com/in/…" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Previous company</label>
            <input value={form.prev_company} onChange={(e) => set('prev_company', e.target.value)} />
          </div>
          <div className="field">
            <label>Previous role</label>
            <input value={form.prev_role} onChange={(e) => set('prev_role', e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>New company</label>
            <input value={form.new_company} onChange={(e) => set('new_company', e.target.value)} />
          </div>
          <div className="field">
            <label>New role</label>
            <input value={form.new_role} onChange={(e) => set('new_role', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Transition type</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select style={{ flex: 1 }} value={form.transition} onChange={(e) => set('transition', e.target.value)}>
              <option value="">— select —</option>
              {transitions.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button type="button" className="btn-new-type" onClick={() => setShowNewType((s) => !s)}>
              + New type
            </button>
          </div>
          <div className={`new-type-row${showNewType ? ' show' : ''}`}>
            <input
              placeholder="e.g. Operations to PM"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
            />
            <button type="button" className="btn-add-type" onClick={handleAddType}>Add</button>
          </div>
        </div>
        <div className="field">
          <label>Review</label>
          <select value={form.review} onChange={(e) => set('review', e.target.value as PlacementInput['review'])}>
            <option value="">—</option>
            <option>Excellent</option>
            <option>Average</option>
            <option>Bad</option>
          </select>
        </div>

        <div className="modal-actions">
          {editing && (
            <button className="btn-danger" onClick={onDelete}>Delete</button>
          )}
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Save placement'}
          </button>
        </div>
      </div>
    </div>
  )
}
