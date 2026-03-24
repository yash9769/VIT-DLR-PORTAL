import { useState } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { DEMO_SUBJECTS, DEMO_ROOMS } from '../../lib/demoData'
import { SectionHeader, Modal, ConfirmDialog, toast } from '../../components/ui'

// ── Subjects ─────────────────────────────────────────────────────────────────
export function SubjectsPage() {
  const [subjects, setSubjects] = useState(DEMO_SUBJECTS)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ subject_code: '', subject_name: '', short_name: '', department: 'IT', semester: 6, credits: 3, lecture_type: 'theory' })

  const filtered = subjects.filter(s => !search || s.subject_name.toLowerCase().includes(search.toLowerCase()) || s.subject_code.toLowerCase().includes(search.toLowerCase()))

  const openEdit = (s) => { setEditing(s); setForm(s); setModalOpen(true) }
  const openAdd = () => { setEditing(null); setForm({ subject_code: '', subject_name: '', short_name: '', department: 'IT', semester: 6, credits: 3, lecture_type: 'theory' }); setModalOpen(true) }

  const handleSave = () => {
    if (editing) { setSubjects(p => p.map(s => s.id === editing.id ? { ...s, ...form } : s)); toast.success('Subject updated') }
    else { setSubjects(p => [...p, { ...form, id: `s-${Date.now()}` }]); toast.success('Subject added') }
    setModalOpen(false)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <SectionHeader title="Subjects" subtitle="Manage subject catalog and metadata"
        action={<button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Subject</button>} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <input className="input-field pl-9 py-2" placeholder="Search subjects…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th>Short</th><th>Sem</th><th>Credits</th><th>Type</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="font-mono text-sm font-bold" style={{ color: 'var(--brand)' }}>{s.subject_code}</td>
                <td className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.subject_name}</td>
                <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.short_name}</td>
                <td className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{s.semester}</td>
                <td className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{s.credits}</td>
                <td><span className="badge" style={{ background: 'rgba(74,108,247,0.12)', color: '#7090ff', border: '1px solid rgba(74,108,247,0.2)' }}>{s.lecture_type || 'theory'}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"><Edit2 className="w-3.5 h-3.5 text-blue-400" /></button>
                    <button onClick={() => setDeleteTarget(s)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'subject_code', label: 'Subject Code', placeholder: 'IT601' },
              { key: 'short_name', label: 'Short Name', placeholder: 'IS' },
            ].map(f => (
              <div key={f.key}>
                <label className="form-label">{f.label}</label>
                <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div>
            <label className="form-label">Subject Name</label>
            <input className="input-field" placeholder="Information Security" value={form.subject_name} onChange={e => setForm(p => ({ ...p, subject_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Semester</label>
              <input type="number" className="input-field" min={1} max={8} value={form.semester} onChange={e => setForm(p => ({ ...p, semester: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label">Credits</label>
              <input type="number" className="input-field" min={1} max={6} value={form.credits} onChange={e => setForm(p => ({ ...p, credits: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label">Type</label>
              <select className="select-field" value={form.lecture_type} onChange={e => setForm(p => ({ ...p, lecture_type: e.target.value }))}>
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary flex-1" disabled={!form.subject_code || !form.subject_name} onClick={handleSave}>{editing ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Subject" message={`Remove "${deleteTarget?.subject_name}"?`} onConfirm={() => { setSubjects(p => p.filter(s => s.id !== deleteTarget.id)); setDeleteTarget(null); toast.success('Deleted') }} onCancel={() => setDeleteTarget(null)} confirmLabel="Delete" danger />
    </div>
  )
}

// ── Rooms ─────────────────────────────────────────────────────────────────────
export function RoomsPage() {
  const [rooms, setRooms] = useState(DEMO_ROOMS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ room_number: '', building: 'A', floor: 1, capacity: 60, has_smartboard: false, has_projector: false, room_type: 'classroom' })

  const openEdit = (r) => { setEditing(r); setForm(r); setModalOpen(true) }
  const openAdd = () => { setEditing(null); setForm({ room_number: '', building: 'A', floor: 1, capacity: 60, has_smartboard: false, has_projector: false, room_type: 'classroom' }); setModalOpen(true) }

  const handleSave = () => {
    if (editing) { setRooms(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r)); toast.success('Room updated') }
    else { setRooms(p => [...p, { ...form, id: `r-${Date.now()}` }]); toast.success('Room added') }
    setModalOpen(false)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <SectionHeader title="Room Management" subtitle="Manage classrooms and labs"
        action={<button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Room</button>} />

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Room No.</th><th>Building</th><th>Floor</th><th>Capacity</th><th>Smartboard</th><th>Projector</th><th>Type</th><th>Actions</th></tr></thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id}>
                <td className="font-mono font-bold text-sm" style={{ color: 'var(--brand)' }}>{r.room_number}</td>
                <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bldg. {r.building}</td>
                <td className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{r.floor}</td>
                <td className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{r.capacity}</td>
                <td className="text-center"><span className={r.has_smartboard ? 'text-green-400' : 'text-red-400'}>{r.has_smartboard ? '✓' : '✗'}</span></td>
                <td className="text-center"><span className={r.has_projector ? 'text-green-400' : 'text-red-400'}>{r.has_projector ? '✓' : '✗'}</span></td>
                <td><span className="badge" style={{ background: 'rgba(74,108,247,0.12)', color: '#7090ff', border: '1px solid rgba(74,108,247,0.2)' }}>{r.room_type || 'classroom'}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"><Edit2 className="w-3.5 h-3.5 text-blue-400" /></button>
                    <button onClick={() => setDeleteTarget(r)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Room' : 'Add Room'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'room_number', label: 'Room Number', placeholder: 'A-301' },
              { key: 'building', label: 'Building', placeholder: 'A' },
            ].map(f => (
              <div key={f.key}>
                <label className="form-label">{f.label}</label>
                <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="form-label">Floor</label>
              <input type="number" className="input-field" min={0} max={10} value={form.floor} onChange={e => setForm(p => ({ ...p, floor: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label">Capacity</label>
              <input type="number" className="input-field" min={1} value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="form-label">Room Type</label>
            <select className="select-field" value={form.room_type} onChange={e => setForm(p => ({ ...p, room_type: e.target.value }))}>
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
              <option value="seminar_hall">Seminar Hall</option>
            </select>
          </div>
          <div className="flex gap-4">
            {[{ key: 'has_smartboard', label: 'Smartboard' }, { key: 'has_projector', label: 'Projector' }].map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))} className="rounded" />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{f.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary flex-1" disabled={!form.room_number} onClick={handleSave}>{editing ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Room" message={`Remove room ${deleteTarget?.room_number}?`} onConfirm={() => { setRooms(p => p.filter(r => r.id !== deleteTarget.id)); setDeleteTarget(null); toast.success('Deleted') }} onCancel={() => setDeleteTarget(null)} confirmLabel="Delete" danger />
    </div>
  )
}
