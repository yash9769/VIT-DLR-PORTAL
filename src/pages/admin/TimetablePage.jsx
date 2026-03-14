import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { detectConflicts } from '../../utils/helpers'
import { Modal, ConfirmDialog, ConflictWarning, toast } from '../../components/ui'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default function TimetablePage() {
  const [view, setView] = useState('grid') 
  const [loading, setLoading] = useState(true)
  const [filterDay, setFilterDay] = useState('All')
  const [filterFaculty, setFilterFaculty] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [timetable, setTimetable] = useState([])
  const [conflicts, setConflicts] = useState([])
  
  // Master data
  const [faculties, setFaculties] = useState([])
  const [subjects, setSubjects] = useState([])
  const [divisions, setDivisions] = useState([])
  const [rooms, setRooms] = useState([])
  const [timeSlots, setTimeSlots] = useState([])

  const [form, setForm] = useState({
    faculty_id: '', division_id: '', subject_id: '', room_id: '', time_slot_id: '', day_of_week: 'Monday'
  })

  useEffect(() => {
    fetchMasterData()
    fetchTimetable()
  }, [])

  const fetchMasterData = async () => {
    try {
      const [f, s, d, r, st] = await Promise.all([
        supabase.from('users').select('id, full_name').eq('role', 'faculty'),
        supabase.from('subjects').select('*'),
        supabase.from('divisions').select('*'),
        supabase.from('rooms').select('*'),
        supabase.from('time_slots').select('*').order('start_time')
      ])
      setFaculties(f.data || [])
      setSubjects(s.data || [])
      setDivisions(d.data || [])
      setRooms(r.data || [])
      setTimeSlots(st.data || [])
    } catch (error) {
      toast.error('Failed to load master data')
    }
  }

  const fetchTimetable = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('timetable')
        .select(`
          *,
          subjects (*),
          divisions (*),
          rooms:room_id (*),
          faculty:faculty_id (full_name),
          time_slots:time_slot_id (*)
        `)
      if (error) throw error
      setTimetable(data || [])
    } catch (error) {
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const filtered = timetable.filter(t => {
    if (filterDay !== 'All' && t.day_of_week !== filterDay) return false
    if (filterFaculty && t.faculty_id !== filterFaculty) return false
    return true
  })

  const openCreate = () => {
    setForm({ faculty_id: '', division_id: '', subject_id: '', room_id: '', time_slot_id: '', day_of_week: 'Monday' })
    setEditEntry(null)
    setConflicts([])
    setShowModal(true)
  }

  const openEdit = (entry) => {
    setForm({ faculty_id: entry.faculty_id, division_id: entry.division_id, subject_id: entry.subject_id, room_id: entry.room_id || '', time_slot_id: entry.time_slot_id, day_of_week: entry.day_of_week })
    setEditEntry(entry)
    setConflicts([])
    setShowModal(true)
  }

  const checkConflicts = (f) => {
    const newEntry = { 
      ...f, 
      id: editEntry?.id || 'new',
      divisions: divisions.find(d=>d.id===f.division_id),
      subjects: subjects.find(s=>s.id===f.subject_id),
      rooms: rooms.find(r=>r.id===f.room_id),
      time_slots: timeSlots.find(s=>s.id===f.time_slot_id)
    }
    const found = detectConflicts(newEntry, timetable, editEntry?.id)
    setConflicts(found)
    return found
  }

  const handleSave = async () => {
    const found = checkConflicts(form)
    if (found.length > 0) return

    try {
      if (editEntry) {
        const { error } = await supabase
          .from('timetable')
          .update(form)
          .eq('id', editEntry.id)
        if (error) throw error
        toast.success('Entry updated')
      } else {
        const { error } = await supabase
          .from('timetable')
          .insert([{ ...form, is_active: true }])
        if (error) throw error
        toast.success('Entry added')
      }
      setShowModal(false)
      fetchTimetable()
    } catch (error) {
      toast.error('Failed to save entry')
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Entry deleted')
      fetchTimetable()
    } catch (error) {
      toast.error('Failed to delete entry')
    } finally {
      setDeleteId(null)
    }
  }

  // Grid view: days as columns, slots as rows
  const GridView = () => {
    const slots = timeSlots.filter(s => !s.is_break)
    const days = filterDay === 'All' ? DAYS : [filterDay]
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: '700px' }}>
          <thead>
            <tr>
              <th className="p-2 text-left font-semibold" style={{ color: 'var(--text-secondary)', width: '100px' }}>Time</th>
              {days.map(d => <th key={d} className="p-2 text-center font-semibold" style={{ color: 'var(--text-secondary)' }}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot.id} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <td className="p-2 font-mono text-xs" style={{ color: 'var(--text-secondary)', verticalAlign: 'top' }}>{slot.slot_label}</td>
                {days.map(day => {
                  const entries = filtered.filter(t => t.day_of_week === day && t.time_slot_id === slot.id)
                  return (
                    <td key={day} className="p-1" style={{ verticalAlign: 'top' }}>
                      {entries.map(e => (
                        <div key={e.id} className="mb-1 p-2 rounded-lg text-xs cursor-pointer group relative" style={{ background: 'rgba(74,108,247,0.12)', border: '1px solid rgba(74,108,247,0.25)' }}
                          onClick={() => openEdit(e)}>
                          <p className="font-semibold truncate" style={{ color: '#7090ff' }}>{e.subjects?.short_name}</p>
                          <p className="truncate" style={{ color: 'var(--text-secondary)' }}>{e.divisions?.division_name}</p>
                          <p className="truncate" style={{ color: 'var(--text-secondary)' }}>{e.rooms?.room_number}</p>
                          <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                            <button onClick={(ev) => { ev.stopPropagation(); openEdit(e) }} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={(ev) => { ev.stopPropagation(); setDeleteId(e.id) }} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.2)' }}>
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Timetable Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{timetable.length} active entries · Conflict detection enabled</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="select-field text-sm flex-1 min-w-[160px] max-w-xs" value={filterDay} onChange={e => setFilterDay(e.target.value)}>
          <option value="All">All Days</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="select-field text-sm flex-1 min-w-[160px] max-w-xs" value={filterFaculty} onChange={e => setFilterFaculty(e.target.value)}>
          <option value="">All Faculty</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
        </select>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {['grid','list'].map(v => (
            <button key={v} onClick={() => setView(v)} className="px-4 py-2 text-sm font-medium capitalize transition-colors"
              style={view === v ? { background: 'rgba(74,108,247,0.2)', color: '#7090ff' } : { color: 'var(--text-secondary)' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 overflow-x-auto">
        {view === 'grid' ? <GridView /> : (
          <table className="data-table w-full">
            <thead><tr>
              <th>Faculty</th><th>Division</th><th>Subject</th><th>Room</th><th>Day</th><th>Time</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="text-sm">{t.faculty?.full_name || '—'}</td>
                  <td><span className="badge badge-pending">{t.divisions?.division_name}</span></td>
                  <td className="text-sm">{t.subjects?.subject_name}</td>
                  <td className="text-sm">{t.rooms?.room_number}</td>
                  <td className="text-sm">{t.day_of_week}</td>
                  <td className="text-sm font-mono">{t.time_slots?.slot_label}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,108,247,0.15)' }}><Edit2 className="w-3.5 h-3.5 text-brand-400" /></button>
                      <button onClick={() => setDeleteId(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.1)' }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'} size="md">
        <div className="space-y-4">
          <ConflictWarning conflicts={conflicts} />
          {[
            { label: 'Faculty', key: 'faculty_id', options: faculties.map(f => ({ value: f.id, label: f.full_name })) },
            { label: 'Division', key: 'division_id', options: divisions.map(d => ({ value: d.id, label: d.division_name })) },
            { label: 'Subject', key: 'subject_id', options: subjects.map(s => ({ value: s.id, label: s.subject_name })) },
            { label: 'Room', key: 'room_id', options: rooms.map(r => ({ value: r.id, label: r.room_number })) },
            { label: 'Time Slot', key: 'time_slot_id', options: timeSlots.filter(s=>!s.is_break).map(s => ({ value: s.id, label: s.slot_label })) },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <select className="select-field" value={form[key]} onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setConflicts([]) }}>
                <option value="">Select {label}…</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="form-label">Day of Week</label>
            <select className="select-field" value={form.day_of_week} onChange={e => { setForm(f => ({ ...f, day_of_week: e.target.value })); setConflicts([]) }}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex justify-between gap-3 pt-2">
            <button onClick={() => { const c = checkConflicts(form); if (c.length === 0) alert('No conflicts found!') }} className="btn-secondary flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" /> Check Conflicts
            </button>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={conflicts.length > 0} className="btn-primary disabled:opacity-40">Save</button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this timetable entry? This cannot be undone."
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
