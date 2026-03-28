import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Search, Mail, Hash, User, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'
import { Modal, toast } from '../../components/ui'

import { getInitials } from '../../utils/helpers'

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ full_name: '', initials: '', department: 'IT', email: '', role: 'faculty' })
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, department, role, initials, is_active')
        .eq('role', 'faculty')
        .order('full_name')
      if (error) throw error
      setFaculty(data || [])
    } catch (error) {
      toast.error('Failed to fetch faculty')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required'); return }
    try {
      if (editing) {
        const { error } = await supabase
          .from('users')
          .update({ full_name: form.full_name, email: form.email, department: form.department, initials: form.initials })
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Faculty updated')
      } else {
        // Note: Adding via users table directly (requires admin privileges)
        const { error } = await supabase
          .from('users')
          .insert([{ full_name: form.full_name, email: form.email, department: form.department, initials: form.initials, role: form.role }])
        if (error) throw error
        toast.success('Faculty added')
      }
      setShowModal(false)
      setEditing(null)
      resetForm()
      fetchFaculty()
    } catch (error) {
      console.error(error)
      toast.error(editing ? 'Failed to update faculty' : 'Failed to add faculty. Use Supabase auth to create accounts.')
    }
  }

  const handleImportExcel = async (file) => {
    if (!file) return
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      let rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      // Handle files with empty header row (xlsx uses __EMPTY, __EMPTY_1, etc.)
      const hasEmptyHeaders = rows.length > 0 && Object.keys(rows[0]).some(k => k?.startsWith('__EMPTY'))
      if (hasEmptyHeaders) {
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
        const firstNonEmptyRow = raw.findIndex(r => Array.isArray(r) && r.some(cell => `${cell}`.trim() !== ''))
        if (firstNonEmptyRow !== -1) {
          const headerRow = raw[firstNonEmptyRow].map(h => `${h}`.trim())
          const dataRows = raw.slice(firstNonEmptyRow + 1)
          rows = dataRows
            .filter(r => Array.isArray(r) && r.some(cell => `${cell}`.trim() !== ''))
            .map(r => {
              const obj = {}
              headerRow.forEach((key, idx) => {
                if (key) obj[key] = r[idx]
              })
              return obj
            })
        }
      }

      if (!rows.length) {
        toast.error('Excel file is empty')
        return
      }

      const normalizeKey = (key) =>
        key?.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || ''

      const getValue = (row, candidates) => {
        const normalizedRow = Object.keys(row || {}).reduce((acc, key) => {
          acc[normalizeKey(key)] = row[key]
          return acc
        }, {})

        for (const candidate of candidates) {
          const val = normalizedRow[normalizeKey(candidate)]
          if (val !== undefined && val !== null && `${val}`.trim() !== '') return `${val}`
        }

        // Fallback: find any field that contains the candidate substring
        for (const [k, v] of Object.entries(normalizedRow)) {
          if (!v) continue
          if (candidates.some(c => k.includes(normalizeKey(c)))) return `${v}`
        }

        return ''
      }

      const normalized = rows
        .map(r => ({
          full_name: getValue(r, ['Full Name', 'Name', 'Faculty Name', 'Faculty', 'Teacher', 'Instructor']).trim(),
          email: getValue(r, ['Email', 'E-mail', 'Email Address', 'EmailID', 'Email Id']).trim(),
          initials: getValue(r, ['Initials', 'Initial', 'Initials.']).trim().toUpperCase(),
          department: getValue(r, ['Department', 'Dept']).trim() || 'IT',
          role: getValue(r, ['Role']).trim() || 'faculty',
        }))
        .filter(r => r.email && r.full_name)

      if (!normalized.length) {
        const headerKeys = Object.keys(rows[0] || {})
        console.warn('Excel import - detected columns:', headerKeys)
        toast.error(
          `No valid faculty rows found in the Excel file. Detected columns: ${headerKeys
            .slice(0, 10)
            .join(', ')}${headerKeys.length > 10 ? ', ...' : ''}`
        )
        return
      }

      const { error } = await supabase
        .from('users')
        .upsert(normalized, { onConflict: 'email' })

      if (error) throw error
      toast.success(`Imported ${normalized.length} faculty from Excel`)
      fetchFaculty()
    } catch (err) {
      console.error(err)
      toast.error('Failed to import from Excel')
    }
  }

  const handleToggleActive = async (f) => {
    try {
      const { error } = await supabase.from('users').update({ is_active: !f.is_active }).eq('id', f.id)
      if (error) throw error
      toast.success(f.is_active ? 'Faculty deactivated' : 'Faculty activated')
      fetchFaculty()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => setForm({ full_name: '', initials: '', department: 'IT', email: '', role: 'faculty' })

  const filtered = faculty.filter(f =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Faculty Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{faculty.length} faculty members</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel
          </button>
          <button onClick={() => { resetForm(); setEditing(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          handleImportExcel(file)
          e.target.value = ''
        }}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <input className="input-field pl-10 text-sm" placeholder="Search by name, ID, email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full" style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Initials</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 opacity-50">Loading faculty...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 opacity-50">No faculty found</td></tr>
              ) : filtered.map(f => (
                <tr key={f.id} style={{ opacity: f.is_active === false ? 0.5 : 1 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
                        {f.initials || getInitials(f.full_name)}
                      </div>
                      <span className="font-medium text-sm">{f.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs px-2 py-1 rounded-lg font-bold" style={{ background: 'rgba(74,108,247,0.12)', color: '#7090ff' }}>
                      {f.initials || getInitials(f.full_name)}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">{f.email || '—'}</span>
                    </div>
                  </td>
                  <td className="text-sm">{f.department}</td>
                  <td>
                    <span className={`badge ${f.is_active !== false ? 'badge-approved' : 'badge-rejected'}`}>
                      {f.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditing(f); setForm({ full_name: f.full_name, initials: f.initials || '', department: f.department || 'IT', email: f.email || '', role: f.role }); setShowModal(true) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(74,108,247,0.15)' }}>
                        <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(f)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        title={f.is_active !== false ? 'Deactivate' : 'Activate'}
                        style={{ background: f.is_active !== false ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.1)' }}>
                        <span style={{ color: f.is_active !== false ? '#f85149' : '#3fb950', fontSize: '10px' }}>
                          {f.is_active !== false ? '✕' : '✓'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null) }} title={editing ? 'Edit Faculty' : 'Add Faculty'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name <span className="text-red-400">*</span></label>
              <input className="input-field" placeholder="Dr. Priya Sharma" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Initials</label>
              <input className="input-field" placeholder="PS" maxLength={4} value={form.initials} onChange={e => setForm(f => ({ ...f, initials: e.target.value.toUpperCase() }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Department</label>
              <select className="select-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {['IT', 'CS', 'EXTC', 'MECH', 'CIVIL', 'MBA'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="input-field" placeholder="name@vit.edu.in" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          {!editing && (
            <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.3)', color: '#d29922' }}>
              ⚠️ To create login credentials, use Supabase Auth. This form only edits profile data.
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setShowModal(false); setEditing(null) }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">{editing ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
