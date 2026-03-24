import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Search, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Modal, toast } from '../../components/ui'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSem, setFilterSem] = useState('')
  const [filterDiv, setFilterDiv] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ roll_number: '', full_name: '', division_id: '', email: '', batch_number: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sRes, dRes] = await Promise.all([
        supabase.from('students').select('*, divisions(id, division_name, year, semester, department)').order('roll_number'),
        supabase.from('divisions').select('*').order('semester').order('division_name')
      ])
      if (sRes.error) throw sRes.error
      if (dRes.error) throw dRes.error
      setStudents(sRes.data || [])
      setDivisions(dRes.data || [])
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  // Derived filter options
  const semesters = useMemo(() => [...new Set(divisions.map(d => d.semester))].sort((a,b)=>a-b), [divisions])
  // Only show divisions that actually have students
  const divsWithStudents = useMemo(() => {
    const ids = new Set(students.map(s => s.division_id))
    return divisions.filter(d => ids.has(d.id))
  }, [divisions, students])
  const filteredDivisions = useMemo(() => filterSem ? divsWithStudents.filter(d => d.semester == filterSem) : divsWithStudents, [divsWithStudents, filterSem])
  const batches = useMemo(() => {
    const inScope = filterDiv ? students.filter(s => s.division_id === filterDiv) : students
    return [...new Set(inScope.map(s => s.batch_number).filter(Boolean))].sort((a,b)=>a-b)
  }, [students, filterDiv])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return students.filter(s => {
      const matchSearch = !q || s.full_name?.toLowerCase().includes(q) || s.roll_number?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
      const matchSem    = !filterSem   || s.divisions?.semester == filterSem
      const matchDiv    = !filterDiv   || s.division_id === filterDiv
      const matchBatch  = !filterBatch || String(s.batch_number) === filterBatch
      return matchSearch && matchSem && matchDiv && matchBatch
    })
  }, [students, search, filterSem, filterDiv, filterBatch])

  const handleSave = async () => {
    if (!form.roll_number.trim() || !form.full_name.trim() || !form.division_id) {
      toast.error('Roll number, name and division are required'); return
    }
    try {
      const payload = { ...form, batch_number: form.batch_number ? Number(form.batch_number) : null }
      if (editing) {
        const { error } = await supabase.from('students').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Student updated')
      } else {
        const { error } = await supabase.from('students').insert([{ ...payload, is_active: true }])
        if (error) throw error
        toast.success('Student added')
      }
      setShowModal(false); setEditing(null); resetForm(); fetchData()
    } catch (err) {
      toast.error(err.message?.includes('unique') ? 'Roll number already exists' : (editing ? 'Failed to update' : 'Failed to add'))
    }
  }

  const handleToggle = async (s) => {
    const { error } = await supabase.from('students').update({ is_active: !s.is_active }).eq('id', s.id)
    if (error) { toast.error('Failed to update'); return }
    toast.success(s.is_active ? 'Student deactivated' : 'Student activated')
    fetchData()
  }

  const resetForm = () => setForm({ roll_number: '', full_name: '', division_id: '', email: '', batch_number: '' })

  const clearFilters = () => { setFilterSem(''); setFilterDiv(''); setFilterBatch(''); setSearch('') }
  const hasFilters = search || filterSem || filterDiv || filterBatch

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Student Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {students.length} students · {students.filter(s => s.is_active !== false).length} active · {divisions.length} divisions
          </p>
        </div>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Stats by Semester */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'SE (Sem 4)', value: students.filter(s => s.divisions?.semester === 4).length, color: '#4A6CF7' },
          { label: 'TE (Sem 6)', value: students.filter(s => s.divisions?.semester === 6).length, color: '#f59e0b' },
          { label: 'BE (Sem 8)', value: students.filter(s => s.divisions?.semester === 8).length, color: '#3fb950' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <p className="font-display font-bold text-2xl" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-10 text-sm" placeholder="Search name, roll number…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="select-field text-sm" value={filterSem}
          onChange={e => { setFilterSem(e.target.value); setFilterDiv(''); setFilterBatch('') }}>
          <option value="">All Semesters</option>
          {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>

        <select className="select-field text-sm" value={filterDiv}
          onChange={e => { setFilterDiv(e.target.value); setFilterBatch('') }}>
          <option value="">All Divisions</option>
          {filteredDivisions.map(d => <option key={d.id} value={d.id}>{d.division_name} (Yr {d.year})</option>)}
        </select>

        <select className="select-field text-sm" value={filterBatch}
          onChange={e => setFilterBatch(e.target.value)}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b} value={b}>Batch {b}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0"
            style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149' }}>
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Showing <strong>{filtered.length}</strong> of {students.length} students
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full" style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Student Name</th>
                <th>Semester</th>
                <th>Division</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 opacity-50">Loading students...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm opacity-50">No students match the filters</p>
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} style={{ opacity: s.is_active === false ? 0.5 : 1 }}>
                  <td className="font-mono text-sm font-bold" style={{ color: 'var(--brand)' }}>{s.roll_number}</td>
                  <td className="font-medium text-sm">{s.full_name}</td>
                  <td>
                    <span className="badge badge-info text-xs">Sem {s.divisions?.semester || '—'}</span>
                  </td>
                  <td>
                    <span className="badge badge-pending text-xs">{s.divisions?.division_name || '—'}</span>
                  </td>
                  <td className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {s.batch_number ? `Batch ${s.batch_number}` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${s.is_active !== false ? 'badge-approved' : 'badge-rejected'} text-xs`}>
                      {s.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(s); setForm({ roll_number: s.roll_number, full_name: s.full_name, division_id: s.division_id, email: s.email || '', batch_number: s.batch_number || '' }); setShowModal(true) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,108,247,0.15)' }}>
                        <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                      </button>
                      <button onClick={() => handleToggle(s)} title={s.is_active !== false ? 'Deactivate' : 'Activate'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: s.is_active !== false ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.1)' }}>
                        <span style={{ color: s.is_active !== false ? '#f85149' : '#3fb950', fontSize: '10px' }}>
                          {s.is_active !== false ? '✕' : '✓'}
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

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null) }} title={editing ? 'Edit Student' : 'Add Student'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Roll Number <span className="text-red-400">*</span></label>
              <input className="input-field font-mono" placeholder="24101A0001" value={form.roll_number}
                onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))} disabled={!!editing} />
            </div>
            <div>
              <label className="form-label">Batch</label>
              <select className="select-field" value={form.batch_number}
                onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))}>
                <option value="">No Batch</option>
                {[1,2,3,4].map(b => <option key={b} value={b}>Batch {b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Full Name <span className="text-red-400">*</span></label>
            <input className="input-field" placeholder="John Doe" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Division <span className="text-red-400">*</span></label>
            <select className="select-field" value={form.division_id}
              onChange={e => setForm(f => ({ ...f, division_id: e.target.value }))}>
              <option value="">Select division…</option>
              {divisions.map(d => <option key={d.id} value={d.id}>{d.division_name} — Sem {d.semester}, Yr {d.year}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="input-field" placeholder="student@vit.edu" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setShowModal(false); setEditing(null) }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">{editing ? 'Update' : 'Add Student'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
