import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, FlaskConical, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { detectConflicts } from '../../utils/helpers'
import { Modal, ConfirmDialog, ConflictWarning, toast } from '../../components/ui'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

// Color helpers for batch cards
const BATCH_COLORS = [
  { bg: 'rgba(74,108,247,0.12)',  border: 'rgba(74,108,247,0.3)',  text: '#7090ff' },  // B1
  { bg: 'rgba(63,185,80,0.12)',   border: 'rgba(63,185,80,0.3)',   text: '#3fb950' },  // B2
  { bg: 'rgba(210,153,34,0.12)',  border: 'rgba(210,153,34,0.3)',  text: '#d29922' },  // B3
  { bg: 'rgba(248,81,73,0.12)',   border: 'rgba(248,81,73,0.3)',   text: '#f85149' },  // B4
]
const getBatchColor = (n) => BATCH_COLORS[(n - 1) % 4] || BATCH_COLORS[0]

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
  const [useCustomRoom, setUseCustomRoom] = useState(false)

  // Master data
  const [faculties, setFaculties] = useState([])
  const [subjects, setSubjects] = useState([])
  const [divisions, setDivisions] = useState([])
  const [rooms, setRooms] = useState([])
  const [timeSlots, setTimeSlots] = useState([])

  const emptyForm = {
    faculty_id: '', division_id: '', subject_id: '',
    room_id: '', custom_room: '',
    time_slot_id: '', day_of_week: 'Monday', batch_number: ''
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchMasterData()
    fetchTimetable()
  }, [])

  const fetchMasterData = async () => {
    try {
      const [f, s, d, r, st] = await Promise.all([
        supabase.from('users').select('id, full_name').eq('role', 'faculty').order('full_name'),
        supabase.from('subjects').select('*').order('subject_name'),
        supabase.from('divisions').select('*').order('division_name'),
        supabase.from('rooms').select('*').order('room_number'),
        supabase.from('time_slots').select('*').order('slot_order')
      ])
      setFaculties(f.data || [])
      setSubjects(s.data || [])
      setDivisions(d.data || [])
      setRooms(r.data || [])
      setTimeSlots(st.data || [])
    } catch {
      toast.error('Failed to load master data')
    }
  }

  const fetchTimetable = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('timetable')
        .select(`*, subjects(*), divisions(*), rooms:room_id(*), faculty:faculty_id(full_name), time_slots:time_slot_id(*)`)
      if (error) throw error
      setTimetable(data || [])
    } catch {
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

  // Room label helper: show custom_room if set, otherwise rooms table
  const roomLabel = (t) => t.custom_room || t.rooms?.room_number || '—'

  const openCreate = () => {
    setForm(emptyForm)
    setUseCustomRoom(false)
    setEditEntry(null)
    setConflicts([])
    setShowModal(true)
  }

  const openEdit = (entry) => {
    const hasCustomRoom = !!entry.custom_room
    setForm({
      faculty_id: entry.faculty_id,
      division_id: entry.division_id,
      subject_id: entry.subject_id,
      room_id: hasCustomRoom ? '' : (entry.room_id || ''),
      custom_room: entry.custom_room || '',
      time_slot_id: entry.time_slot_id,
      day_of_week: entry.day_of_week,
      batch_number: entry.batch_number || ''
    })
    setUseCustomRoom(hasCustomRoom)
    setEditEntry(entry)
    setConflicts([])
    setShowModal(true)
  }

  const checkConflicts = (f) => {
    const newEntry = {
      ...f,
      id: editEntry?.id || 'new',
      divisions: divisions.find(d => d.id === f.division_id),
      subjects: subjects.find(s => s.id === f.subject_id),
      rooms: rooms.find(r => r.id === f.room_id),
      time_slots: timeSlots.find(s => s.id === f.time_slot_id)
    }
    const found = detectConflicts(newEntry, timetable, editEntry?.id)
    setConflicts(found)
    return found
  }

  const handleSave = async () => {
    if (!form.faculty_id || !form.division_id || !form.subject_id || !form.time_slot_id) {
      toast.error('Faculty, Division, Subject and Time Slot are required')
      return
    }
    const found = checkConflicts(form)
    if (found.length > 0) return

    try {
      const payload = {
        faculty_id: form.faculty_id,
        division_id: form.division_id,
        subject_id: form.subject_id,
        room_id: useCustomRoom ? null : (form.room_id || null),
        custom_room: useCustomRoom ? (form.custom_room || null) : null,
        time_slot_id: form.time_slot_id,
        day_of_week: form.day_of_week,
        batch_number: form.batch_number ? Number(form.batch_number) : null,
      }
      if (editEntry) {
        const { error } = await supabase.from('timetable').update(payload).eq('id', editEntry.id)
        if (error) throw error
        toast.success('Entry updated')
      } else {
        const { error } = await supabase.from('timetable').insert([{ ...payload, is_active: true }])
        if (error) throw error
        toast.success('Entry added')
      }
      setShowModal(false)
      fetchTimetable()
    } catch (error) {
      console.error(error)
      toast.error('Failed to save entry')
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('timetable').delete().eq('id', id)
      if (error) throw error
      toast.success('Entry deleted')
      fetchTimetable()
    } catch {
      toast.error('Failed to delete entry')
    } finally {
      setDeleteId(null)
    }
  }

  // Separate regular (1h) and lab (2h) slots
  const regularSlots = timeSlots.filter(s => !s.is_break && !s.slot_label.startsWith('Lab:'))
  const labSlots = timeSlots.filter(s => !s.is_break && s.slot_label.startsWith('Lab:'))
  const allDisplaySlots = timeSlots.filter(s => !s.is_break)

  const GridView = () => {
    const days = filterDay === 'All' ? DAYS : [filterDay]
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: `${Math.max(700, days.length * 130 + 110)}px` }}>
          <thead>
            <tr>
              <th className="p-2 text-left font-semibold sticky left-0 z-10" style={{ color: 'var(--text-secondary)', width: '120px', background: 'var(--bg-secondary)' }}>Time Slot</th>
              {days.map(d => <th key={d} className="p-2 text-center font-semibold" style={{ color: 'var(--text-secondary)' }}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* 1-hour slots */}
            <tr><td colSpan={days.length + 1} className="px-2 pt-3 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Regular Lectures (1 hr)</p>
            </td></tr>
            {regularSlots.map(slot => {
              const hasAny = filtered.some(t => t.time_slot_id === slot.id)
              return (
                <tr key={slot.id} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <td className="p-2 font-mono text-xs sticky left-0 z-10" style={{ color: 'var(--text-secondary)', verticalAlign: 'top', background: 'var(--bg-secondary)' }}>
                    {slot.slot_label}
                  </td>
                  {days.map(day => {
                    const entries = filtered.filter(t => t.day_of_week === day && t.time_slot_id === slot.id)
                    return (
                      <td key={day} className="p-1" style={{ verticalAlign: 'top', minWidth: '120px' }}>
                        {entries.map(e => {
                          const bc = e.batch_number ? getBatchColor(Number(e.batch_number)) : { bg: 'rgba(74,108,247,0.12)', border: 'rgba(74,108,247,0.25)', text: '#7090ff' }
                          return (
                            <div key={e.id} className="mb-1 p-2 rounded-lg text-xs cursor-pointer group relative"
                              style={{ background: bc.bg, border: `1px solid ${bc.border}` }}
                              onClick={() => openEdit(e)}>
                              {e.batch_number && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mb-1 inline-block" style={{ background: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>B{e.batch_number}</span>}
                              <p className="font-semibold truncate" style={{ color: bc.text }}>{e.subjects?.short_name}</p>
                              <p className="truncate" style={{ color: 'var(--text-secondary)' }}>{e.divisions?.division_name}</p>
                              <p className="truncate" style={{ color: 'var(--text-secondary)' }}>{roomLabel(e)}</p>
                              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                <button onClick={ev => { ev.stopPropagation(); openEdit(e) }} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}><Edit2 className="w-3 h-3" /></button>
                                <button onClick={ev => { ev.stopPropagation(); setDeleteId(e.id) }} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.2)' }}><Trash2 className="w-3 h-3 text-red-400" /></button>
                              </div>
                            </div>
                          )
                        })}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {/* 2-hour lab slots */}
            <tr><td colSpan={days.length + 1} className="px-2 pt-4 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d29922', opacity: 0.8 }}>
                🧪 Lab / Elective Slots (2 hrs · up to 4 batches each)
              </p>
            </td></tr>
            {labSlots.map(slot => (
              <tr key={slot.id} className="border-t" style={{ borderColor: 'rgba(210,153,34,0.15)' }}>
                <td className="p-2 font-mono text-xs sticky left-0 z-10" style={{ color: '#d29922', verticalAlign: 'top', background: 'var(--bg-secondary)' }}>
                  <FlaskConical className="w-3 h-3 inline mr-1 opacity-70" />
                  {slot.slot_label.replace('Lab: ', '')}
                </td>
                {days.map(day => {
                  const entries = filtered.filter(t => t.day_of_week === day && t.time_slot_id === slot.id)
                  return (
                    <td key={day} className="p-1" style={{ verticalAlign: 'top', minWidth: '120px' }}>
                      <div className="flex flex-wrap gap-1">
                        {entries.map(e => {
                          const bc = e.batch_number ? getBatchColor(Number(e.batch_number)) : { bg: 'rgba(210,153,34,0.12)', border: 'rgba(210,153,34,0.3)', text: '#d29922' }
                          return (
                            <div key={e.id} className="p-2 rounded-lg text-xs cursor-pointer group relative flex-1 min-w-[80px]"
                              style={{ background: bc.bg, border: `1px solid ${bc.border}` }}
                              onClick={() => openEdit(e)}>
                              {e.batch_number && <span className="text-[9px] font-bold" style={{ color: bc.text }}>B{e.batch_number} · </span>}
                              <span className="font-semibold" style={{ color: bc.text }}>{e.subjects?.short_name}</span>
                              <p className="truncate mt-0.5" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{e.faculty?.full_name?.split(' ').slice(-1)[0]}</p>
                              <p className="truncate" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{roomLabel(e)}</p>
                              <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                                <button onClick={ev => { ev.stopPropagation(); openEdit(e) }} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}><Edit2 className="w-2.5 h-2.5" /></button>
                                <button onClick={ev => { ev.stopPropagation(); setDeleteId(e.id) }} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.2)' }}><Trash2 className="w-2.5 h-2.5 text-red-400" /></button>
                              </div>
                            </div>
                          )
                        })}
                        {entries.length === 0 && <span className="text-[10px] opacity-20 px-1">—</span>}
                      </div>
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

  // Is the currently selected time slot a lab (2hr) slot?
  const isLabSlot = timeSlots.find(s => s.id === form.time_slot_id)?.slot_label?.startsWith('Lab:')

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Timetable Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{timetable.length} entries · Conflict detection · Batch lab support</p>
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
          {['grid', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)} className="px-4 py-2 text-sm font-medium capitalize transition-colors"
              style={view === v ? { background: 'rgba(74,108,247,0.2)', color: '#7090ff' } : { color: 'var(--text-secondary)' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 opacity-50 text-sm">Loading timetable...</div>
        ) : view === 'grid' ? <GridView /> : (
          <table className="data-table w-full">
            <thead><tr>
              <th>Faculty</th><th>Division</th><th>Batch</th><th>Subject</th><th>Room</th><th>Day</th><th>Time Slot</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 opacity-40">No entries found</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id}>
                  <td className="text-sm">{t.faculty?.full_name || '—'}</td>
                  <td><span className="badge badge-pending">{t.divisions?.division_name}</span></td>
                  <td className="text-sm text-center">
                    {t.batch_number ? (
                      <span className="font-bold text-xs px-2 py-0.5 rounded-lg" style={getBatchColor(t.batch_number)}>B{t.batch_number}</span>
                    ) : '—'}
                  </td>
                  <td className="text-sm">{t.subjects?.subject_name}</td>
                  <td className="text-sm">
                    {t.custom_room ? (
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3 opacity-50" />{t.custom_room}</span>
                    ) : (t.rooms?.room_number || '—')}
                  </td>
                  <td className="text-sm">{t.day_of_week}</td>
                  <td className="text-sm font-mono">
                    {t.time_slots?.slot_label?.startsWith('Lab:') && <FlaskConical className="w-3 h-3 inline mr-1 text-yellow-500" />}
                    {t.time_slots?.slot_label?.replace('Lab: ', '')}
                  </td>
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

      {/* ── Add / Edit Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'} size="md">
        <div className="space-y-4">
          <ConflictWarning conflicts={conflicts} />

          {/* Lab batch info banner */}
          {isLabSlot && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.25)' }}>
              <FlaskConical className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#d29922' }} />
              <div style={{ color: '#d29922' }}>
                <p className="font-bold">2-hour Lab / Elective Slot</p>
                <p className="opacity-80 mt-0.5">You can add up to 4 entries for the same slot with different faculty and batches. Each batch has a different track/elective and no division conflict will be flagged.</p>
              </div>
            </div>
          )}

          {/* Faculty */}
          <div>
            <label className="form-label">Faculty <span className="text-red-400">*</span></label>
            <select className="select-field" value={form.faculty_id}
              onChange={e => { setForm(f => ({ ...f, faculty_id: e.target.value })); setConflicts([]) }}>
              <option value="">Select Faculty…</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
            </select>
          </div>

          {/* Division + Batch */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Division <span className="text-red-400">*</span></label>
              <select className="select-field" value={form.division_id}
                onChange={e => { setForm(f => ({ ...f, division_id: e.target.value })); setConflicts([]) }}>
                <option value="">Select Division…</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.division_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">
                Batch
                {isLabSlot && <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(210,153,34,0.15)', color: '#d29922' }}>Required for labs</span>}
              </label>
              <select className="select-field" value={form.batch_number}
                onChange={e => { setForm(f => ({ ...f, batch_number: e.target.value })); setConflicts([]) }}>
                <option value="">No Batch (Full Division)</option>
                <option value="1">Batch 1</option>
                <option value="2">Batch 2</option>
                <option value="3">Batch 3</option>
                <option value="4">Batch 4</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="form-label">Subject <span className="text-red-400">*</span></label>
            <select className="select-field" value={form.subject_id}
              onChange={e => { setForm(f => ({ ...f, subject_id: e.target.value })); setConflicts([]) }}>
              <option value="">Select Subject…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
            </select>
          </div>

          {/* Room — dropdown OR custom text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label mb-0">Room</label>
              <button
                type="button"
                onClick={() => { setUseCustomRoom(c => !c); setForm(f => ({ ...f, room_id: '', custom_room: '' })) }}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-colors"
                style={useCustomRoom
                  ? { background: 'rgba(74,108,247,0.15)', color: '#7090ff' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                {useCustomRoom ? '← Back to List' : '+ Custom Room'}
              </button>
            </div>
            {useCustomRoom ? (
              <input
                className="input-field"
                placeholder="e.g. Lab 402, Annexe Room 1, Online…"
                value={form.custom_room}
                onChange={e => setForm(f => ({ ...f, custom_room: e.target.value }))}
              />
            ) : (
              <select className="select-field" value={form.room_id}
                onChange={e => { setForm(f => ({ ...f, room_id: e.target.value })); setConflicts([]) }}>
                <option value="">No Room / TBD</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
              </select>
            )}
          </div>

          {/* Time Slot — grouped */}
          <div>
            <label className="form-label">Time Slot <span className="text-red-400">*</span></label>
            <select className="select-field" value={form.time_slot_id}
              onChange={e => { setForm(f => ({ ...f, time_slot_id: e.target.value })); setConflicts([]) }}>
              <option value="">Select Time Slot…</option>
              <optgroup label="Regular (1 hour)">
                {regularSlots.map(s => <option key={s.id} value={s.id}>{s.slot_label}</option>)}
              </optgroup>
              <optgroup label="🧪 Lab / Elective (2 hours)">
                {labSlots.map(s => <option key={s.id} value={s.id}>{s.slot_label.replace('Lab: ', '')}</option>)}
              </optgroup>
            </select>
          </div>

          {/* Day */}
          <div>
            <label className="form-label">Day of Week</label>
            <select className="select-field" value={form.day_of_week}
              onChange={e => { setForm(f => ({ ...f, day_of_week: e.target.value })); setConflicts([]) }}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button
              onClick={() => { const c = checkConflicts(form); if (c.length === 0) toast.success('No conflicts found!') }}
              className="btn-secondary flex items-center gap-2 text-sm">
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
