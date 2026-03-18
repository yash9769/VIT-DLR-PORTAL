import { useState, useEffect } from 'react'
import { Plus, Edit2, Search, Users, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Modal, toast } from '../../components/ui'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDivision, setFilterDivision] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ roll_number: '', full_name: '', division_id: '', email: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sRes, dRes] = await Promise.all([
        supabase.from('students').select('*, divisions(division_name, year, semester, department)').order('roll_number'),
        supabase.from('divisions').select('*').order('division_name')
      ])
      if (sRes.error) throw sRes.error
      if (dRes.error) throw dRes.error
      setStudents(sRes.data || [])
      setDivisions(dRes.data || [])
    } catch (error) {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      s.full_name?.toLowerCase().includes(q) ||
      s.roll_number?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    const matchDiv = !filterDivision || s.division_id === filterDivision
    return matchSearch && matchDiv
  })

  const handleSave = async () => {
    if (!form.roll_number.trim() || !form.full_name.trim() || !form.division_id) {
      toast.error('Roll number, name and division are required')
      return
    }
    try {
      if (editing) {
        const { error } = await supabase.from('students').update(form).eq('id', editing.id)
        if (error) throw error
        toast.success('Student updated')
      } else {
        const { error } = await supabase.from('students').insert([{ ...form, is_active: true }])
        if (error) throw error
        toast.success('Student added')
      }
      setShowModal(false)
      setEditing(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error(error.message?.includes('unique') ? 'Roll number already exists' : (editing ? 'Failed to update' : 'Failed to add'))
    }
  }

  const handleToggle = async (s) => {
    const { error } = await supabase.from('students').update({ is_active: !s.is_active }).eq('id', s.id)
    if (error) { toast.error('Failed to update'); return }
    toast.success(s.is_active ? 'Student deactivated' : 'Student activated')
    fetchData()
  }

  const resetForm = () => setForm({ roll_number: '', full_name: '', division_id: '', email: '' })

  const counts = {
    total: students.length,
    active: students.filter(s => s.is_active !== false).length,
    divisionCount: divisions.length
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Student Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {counts.total} students · {counts.active} active · {counts.divisionCount} divisions
          </p>
        </div>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: counts.total, color: '#4A6CF7' },
          { label: 'Active', value: counts.active, color: '#3fb950' },
          { label: 'Divisions', value: counts.divisionCount, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-10 text-sm" placeholder="Search name, roll number, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field text-sm min-w-[180px]" value={filterDivision} onChange={e => setFilterDivision(e.target.value)}>
          <option value="">All Divisions</option>
          {divisions.map(d => <option key={d.id} value={d.id}>{d.division_name} (Yr {d.year})</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full" style={{ minWidth: '650px' }}>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Student Name</th>
                <th>Division</th>
                <th>Year / Sem</th>
                <th>Email</th>
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
                    <p className="text-sm opacity-50">No students found</p>
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} style={{ opacity: s.is_active === false ? 0.5 : 1 }}>
                  <td className="font-mono text-sm font-bold" style={{ color: 'var(--brand)' }}>{s.roll_number}</td>
                  <td className="font-medium text-sm">{s.full_name}</td>
                  <td>
                    <span className="badge badge-pending text-xs">{s.divisions?.division_name || '—'}</span>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Yr {s.divisions?.year} / Sem {s.divisions?.semester}
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.email || '—'}</td>
                  <td>
                    <span className={`badge ${s.is_active !== false ? 'badge-approved' : 'badge-rejected'} text-xs`}>
                      {s.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditing(s); setForm({ roll_number: s.roll_number, full_name: s.full_name, division_id: s.division_id, email: s.email || '' }); setShowModal(true) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(74,108,247,0.15)' }}>
                        <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                      </button>
                      <button
                        onClick={() => handleToggle(s)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        title={s.is_active !== false ? 'Deactivate' : 'Activate'}
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

      {filtered.length > 0 && (
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          Showing {filtered.length} of {students.length} students
        </p>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null) }} title={editing ? 'Edit Student' : 'Add Student'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Roll Number <span className="text-red-400">*</span></label>
              <input className="input-field font-mono" placeholder="2021IT0001" value={form.roll_number} onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))} disabled={!!editing} />
            </div>
            <div>
              <label className="form-label">Division <span className="text-red-400">*</span></label>
              <select className="select-field" value={form.division_id} onChange={e => setForm(f => ({ ...f, division_id: e.target.value }))}>
                <option value="">Select division…</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.division_name} — Yr {d.year}, Sem {d.semester}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Full Name <span className="text-red-400">*</span></label>
            <input className="input-field" placeholder="John Doe" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="input-field" placeholder="student@vit.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
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
