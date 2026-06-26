'use client'

import { useCallback, useRef, useState } from 'react'
import type { Placement, PlacementInput } from '@/types'

// ── Column alias mapping ───────────────────────────────────────────────────
const COLUMN_MAP: Record<string, keyof PlacementInput> = {
  name: 'name', full_name: 'name', fullname: 'name',
  linkedin: 'linkedin', linkedin_url: 'linkedin', linkedin_profile: 'linkedin',
  prev_company: 'prev_company', previous_company: 'prev_company',
  from_company: 'prev_company', old_company: 'prev_company',
  prev_role: 'prev_role', previous_role: 'prev_role',
  from_role: 'prev_role', old_role: 'prev_role',
  new_company: 'new_company', to_company: 'new_company',
  current_company: 'new_company', joined_company: 'new_company',
  new_role: 'new_role', to_role: 'new_role',
  current_role: 'new_role', joined_role: 'new_role',
  transition: 'transition', transition_type: 'transition', type: 'transition',
  review: 'review', rating: 'review',
  highlight: 'highlight',
}

function normalizeKey(k: string): string {
  return k.toLowerCase().trim().replace(/[\s\-]+/g, '_')
}

function mapRow(raw: Record<string, string>): PlacementInput {
  const out: PlacementInput = {
    name: '', linkedin: '', prev_company: '', prev_role: '',
    new_company: '', new_role: '', transition: '', review: '', highlight: '',
  }
  for (const [rawKey, val] of Object.entries(raw)) {
    const mapped = COLUMN_MAP[normalizeKey(rawKey)]
    if (mapped) (out[mapped] as string) = String(val ?? '').trim()
  }
  return out
}

interface ParsedRow {
  data: PlacementInput
  valid: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  onImported: (placements: Placement[]) => void
}

const TEMPLATE_HEADERS = [
  'name', 'linkedin', 'prev_company', 'prev_role',
  'new_company', 'new_role', 'transition', 'review', 'highlight',
]
const TEMPLATE_EXAMPLE = [
  'Jane Doe', 'https://linkedin.com/in/janedoe', 'Accenture', 'Senior BA',
  'Google', 'APM', 'Business Analyst to PM', 'Excellent', '',
]

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS.join(','), TEMPLATE_EXAMPLE.join(',')].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'placements_template.csv'
  a.click(); URL.revokeObjectURL(url)
}

export default function ImportModal({ open, onClose, onImported }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [parseErr, setParseErr] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setRows([]); setFileName(''); setParseErr(''); setImported(null)
  }

  async function parseFile(file: File) {
    setParseErr(''); setRows([]); setFileName(file.name); setImported(null)
    const allowed = [
      'text/csv', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!allowed.includes(file.type) && !['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setParseErr('Only .csv, .xlsx, and .xls files are supported.')
      return
    }
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
      if (raw.length === 0) { setParseErr('The file appears to be empty.'); return }
      const parsed: ParsedRow[] = raw.map((r) => {
        const data = mapRow(r)
        return { data, valid: data.name.length > 0 }
      })
      setRows(parsed)
    } catch {
      setParseErr('Failed to parse file. Make sure it is a valid CSV or XLSX.')
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
    e.target.value = ''
  }

  const handleImport = useCallback(async () => {
    const valid = rows.filter((r) => r.valid).map((r) => r.data)
    if (valid.length === 0) return
    setImporting(true)
    try {
      const res = await fetch('/api/placements/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placements: valid }),
      })
      const json = await res.json()
      if (!res.ok) { setParseErr(json.error || 'Import failed.'); return }
      setImported(json.imported)
      onImported(json.placements)
    } catch {
      setParseErr('Network error — please try again.')
    } finally {
      setImporting(false)
    }
  }, [rows, onImported])

  if (!open) return null

  const validCount = rows.filter((r) => r.valid).length
  const skipCount = rows.length - validCount

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 660 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0 }}>Import placements</h2>
          <button
            onClick={downloadTemplate}
            style={{
              fontSize: 12, color: 'var(--orange-text)', background: 'transparent',
              border: '1px solid var(--orange-dim)', borderRadius: 6,
              padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ↓ Download template
          </button>
        </div>

        {/* Drop zone */}
        {rows.length === 0 && imported === null && (
          <div
            className={`import-drop${dragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="import-drop-icon">📂</div>
            <div className="import-drop-title">Drop your CSV or XLSX file here</div>
            <div className="import-drop-sub">or click to browse — .csv, .xlsx, .xls</div>
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileInput} style={{ display: 'none' }} />
          </div>
        )}

        {/* Parse error */}
        {parseErr && (
          <div style={{ fontSize: 12, color: 'var(--red-text)', marginBottom: '.75rem' }}>{parseErr}</div>
        )}

        {/* Column hint */}
        {rows.length === 0 && imported === null && (
          <div className="import-hint">
            Supported columns: <code>Name</code>, <code>LinkedIn</code>, <code>Previous Company</code>,{' '}
            <code>Previous Role</code>, <code>Current Company</code>, <code>Current Role</code>.{' '}
            Only <code>Name</code> is required. Extra columns like <code>Contact</code> or <code>Cohort</code> are ignored.
            Transition type can be added manually after import.
          </div>
        )}

        {/* Success state */}
        {imported !== null && (
          <div className="import-success">
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{imported} placement{imported !== 1 ? 's' : ''} imported</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>They are now visible in the dashboard.</div>
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && imported === null && (
          <>
            <div className="import-summary">
              <strong style={{ color: 'var(--text)' }}>{fileName}</strong>
              {' · '}
              <span style={{ color: '#22c55e' }}>{validCount} valid</span>
              {skipCount > 0 && <><span style={{ color: 'var(--text3)' }}> · </span><span style={{ color: 'var(--red-text)' }}>{skipCount} skipped (missing name)</span></>}
            </div>
            <div className="import-preview">
              <table className="import-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Transition</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={row.valid ? '' : 'row-invalid'}>
                      <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                      <td>
                        {row.valid
                          ? row.data.name
                          : <span style={{ color: 'var(--red-text)' }}>— missing name</span>}
                      </td>
                      <td>{[row.data.prev_role, row.data.prev_company].filter(Boolean).join(' @ ') || '—'}</td>
                      <td>{[row.data.new_role, row.data.new_company].filter(Boolean).join(' @ ') || '—'}</td>
                      <td>{row.data.transition || '—'}</td>
                      <td>{row.data.review || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
          {rows.length > 0 && imported === null && (
            <button className="btn-ghost" onClick={reset} style={{ marginRight: 'auto' }}>
              ← Choose another file
            </button>
          )}
          <button className="btn-ghost" onClick={onClose}>
            {imported !== null ? 'Close' : 'Cancel'}
          </button>
          {rows.length > 0 && imported === null && (
            <button
              className="btn-primary"
              onClick={handleImport}
              disabled={importing || validCount === 0}
            >
              {importing ? 'Importing…' : `Import ${validCount} placement${validCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
