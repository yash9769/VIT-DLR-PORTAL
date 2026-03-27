import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, FlaskConical, Building2, Copy, Play, Ghost, MousePointer2 } from 'lucide-react'
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
  const [filterDivision, setFilterDivision] = useState('')
  const [filterSem, setFilterSem] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [timetable, setTimetable] = useState([])
  const [conflicts, setConflicts] = useState([])
  
  const [useCustomFaculty, setUseCustomFaculty] = useState(false)
  const [useCustomDivision, setUseCustomDivision] = useState(false)
  const [useCustomSubject, setUseCustomSubject] = useState(false)
  const [useCustomRoom, setUseCustomRoom] = useState(false)
  const [useCustomTimeSlot, setUseCustomTimeSlot] = useState(false)
  
  // UX: Drag & Drop and Context Menu
  const [contextMenu, setContextMenu] = useState(null) // { x, y, entry }
  const [clipboard, setClipboard] = useState(null) // copied entry data
  const [draggingId, setDraggingId] = useState(null)

  // Master data
  const [faculties, setFaculties] = useState([])
  const [subjects, setSubjects] = useState([])
  const [divisions, setDivisions] = useState([])
  const [rooms, setRooms] = useState([])
  const [timeSlots, setTimeSlots] = useState([])

  const emptyForm = {
    faculty_id: '', custom_faculty: '',
    division_id: '', custom_division: '',
    subject_id: '', custom_subject: '',
    room_id: '', custom_room: '',
    time_slot_id: '', custom_time_slot: '',
    day_of_week: 'Monday', batch_number: ''
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
        .select(`*, subjects:subjects!subject_id(*), divisions:divisions!division_id(*), rooms:rooms!room_id(*), faculty:users!faculty_id(full_name, initials), time_slots:time_slots!time_slot_id(*)`)
      if (error) throw error
      setTimetable(data || [])
    } catch {
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const semesters = [...new Set(timetable.map(t => t.divisions?.semester).filter(Boolean))].sort((a,b)=>a-b)
  const batches   = [...new Set(timetable.map(t => t.batch_number).filter(Boolean))].sort()
  const hasActiveFilters = filterDay !== 'All' || filterFaculty || filterDivision || filterSem || filterBatch || filterSubject
  const filtered = timetable.filter(t => {
    if (filterDay !== 'All' && t.day_of_week !== filterDay) return false
    if (filterFaculty  && t.faculty_id !== filterFaculty) return false
    if (filterDivision && t.division_id !== filterDivision) return false
    if (filterSem      && t.divisions?.semester != filterSem) return false
    if (filterBatch    && t.batch_number != filterBatch) return false
    if (filterSubject  && t.subject_id  != filterSubject) return false
    return true
  })

  // Synchronize division filter when semester changes
  useEffect(() => {
    if (filterSem && filterDivision) {
      const selectedDiv = divisions.find(d => d.id === filterDivision)
      if (selectedDiv && selectedDiv.semester != filterSem) {
        setFilterDivision('')
      }
    }
  }, [filterSem, divisions])

  // Label helpers
  const facultyLabel = (t) => t.custom_faculty || t.faculty?.full_name || '—'
  const facultyInitials = (t) => t.faculty?.initials || (t.faculty?.full_name ? t.faculty.full_name.split(' ').map(w => w[0]).join('') : (t.custom_faculty ? t.custom_faculty.slice(0,3).toUpperCase() : '—'))
  const divisionLabel = (t) => t.custom_division || t.divisions?.division_name || '—'
  const subjectLabel = (t) => t.custom_subject || t.subjects?.subject_name || '—'
  const subjectShortLabel = (t) => {
    const raw = t.custom_subject || t.subjects?.subject_name || t.subjects?.subject_code || '—'
    const primary = raw.split('/')[0].trim()
    // If it's already an abbreviation (all caps, no spaces), just use it
    if (/^[A-Z0-9]{2,5}$/.test(primary)) return primary
    // Otherwise, generate it: "Python Programming" -> "PP" or "PGM"
    // Let's go with first letters of each word
    const words = primary.split(/[\s_-]+/).filter(w => w.length > 0 && !(['AND', 'OF', 'FOR', 'TO', 'WITH'].includes(w.toUpperCase())))
    if (words.length === 1 && words[0].length > 4) return words[0].slice(0,3).toUpperCase()
    return words.map(w => w[0]).join('').toUpperCase()
  }
  const roomLabel = (t) => t.custom_room || t.rooms?.room_number || '—'
  const timeSlotLabel = (t) => t.custom_time_slot || t.time_slots?.slot_label?.replace('Lab: ', '') || '—'

  // Division Name Cleaner (e.g., INFT-4-A -> A)
  const formatDivName = (name, semId) => {
    if (!name) return '—'
    // If we have a filterSem or a specific division is linked to a sem in the modal
    if (semId || filterSem) {
      // Regex to match patterns like "INFT-4-A" or "IT-6-B"
      const match = name.match(/[^-]+-[^-]+-(.+)$/)
      return match ? match[1] : name
    }
    return name
  }

  const openCreate = () => {
    setForm(emptyForm)
    setUseCustomFaculty(false)
    setUseCustomDivision(false)
    setUseCustomSubject(false)
    setUseCustomRoom(false)
    setUseCustomTimeSlot(false)
    setEditEntry(null)
    setConflicts([])
    setShowModal(true)
  }

  const openEdit = (entry) => {
    const hasC_Fac = !!entry.custom_faculty
    const hasC_Div = !!entry.custom_division
    const hasC_Sub = !!entry.custom_subject
    const hasC_Rm  = !!entry.custom_room
    const hasC_TS  = !!entry.custom_time_slot
    
    setForm({
      faculty_id: hasC_Fac ? '' : (entry.faculty_id || ''),
      custom_faculty: entry.custom_faculty || '',
      division_id: hasC_Div ? '' : (entry.division_id || ''),
      custom_division: entry.custom_division || '',
      subject_id: hasC_Sub ? '' : (entry.subject_id || ''),
      custom_subject: entry.custom_subject || '',
      room_id: hasC_Rm ? '' : (entry.room_id || ''),
      custom_room: entry.custom_room || '',
      time_slot_id: hasC_TS ? '' : (entry.time_slot_id || ''),
      custom_time_slot: entry.custom_time_slot || '',
      day_of_week: entry.day_of_week,
      batch_number: entry.batch_number || ''
    })
    
    setUseCustomFaculty(hasC_Fac)
    setUseCustomDivision(hasC_Div)
    setUseCustomSubject(hasC_Sub)
    setUseCustomRoom(hasC_Rm)
    setUseCustomTimeSlot(hasC_TS)
    
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
    if (!useCustomFaculty && !form.faculty_id) { toast.error('Faculty is required'); return }
    if (!useCustomDivision && !form.division_id) { toast.error('Division is required'); return }
    if (!useCustomSubject && !form.subject_id) { toast.error('Subject is required'); return }
    if (!useCustomTimeSlot && !form.time_slot_id) { toast.error('Time Slot is required'); return }
    if (useCustomFaculty && !form.custom_faculty.trim()) { toast.error('Custom Faculty name is required'); return }
    if (useCustomDivision && !form.custom_division.trim()) { toast.error('Custom Division is required'); return }
    if (useCustomSubject && !form.custom_subject.trim()) { toast.error('Custom Subject is required'); return }
    if (useCustomTimeSlot && !form.custom_time_slot.trim()) { toast.error('Custom Time Slot is required'); return }

    const found = checkConflicts(form)
    if (found.length > 0) {
      if (!window.confirm("There are scheduling conflicts. Do you still want to save this slot?")) {
        return
      }
    }

    try {
      const payload = {
        faculty_id: useCustomFaculty ? null : (form.faculty_id || null),
        custom_faculty: useCustomFaculty ? (form.custom_faculty || null) : null,
        
        division_id: useCustomDivision ? null : (form.division_id || null),
        custom_division: useCustomDivision ? (form.custom_division || null) : null,
        
        subject_id: useCustomSubject ? null : (form.subject_id || null),
        custom_subject: useCustomSubject ? (form.custom_subject || null) : null,
        
        room_id: useCustomRoom ? null : (form.room_id || null),
        custom_room: useCustomRoom ? (form.custom_room || null) : null,
        
        time_slot_id: useCustomTimeSlot ? null : (form.time_slot_id || null),
        custom_time_slot: useCustomTimeSlot ? (form.custom_time_slot || null) : null,
        
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

  // ── Context Menu & Clipboard Actions ─────────────────────────────────────
  const handleContextMenu = (e, entry) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, entry })
  }

  const handleDuplicate = async (entry) => {
    try {
      const { id, created_at, ...cleanEntry } = entry
      const { data, error } = await supabase.from('timetable').insert([{ ...cleanEntry, is_active: true }]).select().single()
      if (error) throw error
      toast.success('Entry duplicated')
      fetchTimetable()
    } catch (err) {
      toast.error('Duplicate failed')
    }
    setContextMenu(null)
  }

  const handleCopy = (entry) => {
    setClipboard(entry)
    toast.success('Entry copied to clipboard')
    setContextMenu(null)
  }

  const handlePaste = async (day, slotId) => {
    if (!clipboard) return
    try {
      const { id, created_at, ...cleanEntry } = clipboard
      const payload = { 
        ...cleanEntry, 
        day_of_week: day, 
        time_slot_id: slotId,
        is_active: true 
      }
      const { error } = await supabase.from('timetable').insert([payload])
      if (error) throw error
      toast.success(`Pasted into ${day}`)
      fetchTimetable()
    } catch (err) {
      toast.error('Paste failed')
    }
    setContextMenu(null)
  }

  // ── Drag and Drop Handlers ────────────────────────────────────────────────
  const onDragStart = (e, entry) => {
    setDraggingId(entry.id)
    e.dataTransfer.setData('entryId', entry.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDrop = async (e, targetDay, targetSlotId) => {
    e.preventDefault()
    const entryId = e.dataTransfer.getData('entryId')
    if (!entryId) return

    try {
      const { error } = await supabase
        .from('timetable')
        .update({ day_of_week: targetDay, time_slot_id: targetSlotId })
        .eq('id', entryId)
      
      if (error) throw error
      toast.success(`Moved to ${targetDay}`)
      fetchTimetable()
    } catch (err) {
      toast.error('Move failed')
    } finally {
      setDraggingId(null)
    }
  }

  // Separate regular (1h) and lab (2h) slots
  const regularSlots = timeSlots.filter(s => !s.is_break && !s.slot_label.startsWith('Lab:'))
  const labSlots = timeSlots.filter(s => !s.is_break && s.slot_label.startsWith('Lab:'))

  const GridView = () => {
    const days = filterDay === 'All' ? DAYS : [filterDay]
    return (
      <div className="overflow-x-auto border-2 border-slate-400 rounded-lg shadow-2xl" style={{ background: 'var(--bg-primary)' }}>
        <table className="w-full text-xs border-collapse timetable-grid" style={{ minWidth: `${Math.max(600, days.length * 100 + 100)}px` }}>
          <thead>
            <tr>
              <th className="p-2 px-3 text-left font-bold sticky left-0 z-20 border-r-2 border-b-2 border-slate-500" style={{ color: '#1e293b', width: '110px', background: '#f8fafc' }}>TIME</th>
              {days.map(d => <th key={d} className="p-2 text-center font-bold border-r-2 border-b-2 border-slate-500 truncate" style={{ color: '#334155', background: '#f1f5f9' }}>{d.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* 1-hour slots */}
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan={days.length + 1} className="px-3 py-1.5 border-b-2 border-slate-600/50 border-r-2 border-slate-600/50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600">Regular Lectures</p>
              </td>
            </tr>
            {regularSlots.map(slot => {
              const hasAny = filtered.some(t => t.time_slot_id === slot.id)
              return (
                <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2 px-3 font-mono text-[10px] font-bold sticky left-0 z-20 border-r-2 border-b-2 border-slate-500" style={{ color: '#475569', verticalAlign: 'middle', background: '#f8fafc' }}>
                    {slot.slot_label.split('(')[0]}
                  </td>
                  {days.map(day => {
                    const entries = filtered.filter(t => t.day_of_week === day && t.time_slot_id === slot.id).sort((a, b) => (a.batch_number || 0) - (b.batch_number || 0))
                    return (
                      <td key={day} className="p-1 border-r-2 border-b-2 border-slate-400 relative" 
                        style={{ verticalAlign: 'top', minWidth: '100px', background: draggingId ? 'rgba(74,108,247,0.03)' : '' }}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, day, slot.id)}
                        onContextMenu={(e) => handleContextMenu(e, { empty: true, day, slotId: slot.id })}>
                        {entries.map(e => {
                          const bc = e.batch_number ? getBatchColor(Number(e.batch_number)) : { bg: 'rgba(74,108,247,0.15)', border: 'rgba(74,108,247,0.4)', text: '#4a6cf7' }
                          return (
                            <div key={e.id} className={`p-0.5 px-1 rounded text-[10px] cursor-pointer group relative flex flex-col items-center justify-center text-center leading-[1.1] mb-0.5 transition-all
                              ${draggingId === e.id ? 'opacity-30' : 'opacity-100 hover:scale-[1.02] hover:shadow-lg'}`}
                              draggable="true"
                              onDragStart={(ev) => onDragStart(ev, e)}
                              onContextMenu={(ev) => handleContextMenu(ev, e)}
                              style={{ background: bc.bg, border: `1.5px solid ${bc.border}` }}
                              onClick={() => openEdit(e)}>
                              <p className="font-bold truncate w-full" style={{ color: bc.text }}>{subjectShortLabel(e)}</p>
                              <p className="opacity-80 truncate w-full font-bold" style={{ color: '#475569', fontSize: '8.5px' }}>
                                {facultyInitials(e)} · {roomLabel(e)}
                                {e.batch_number && <span className="ml-0.5 opacity-100 font-black" style={{color: bc.text}}>(B{e.batch_number})</span>}
                              </p>
                              
                              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-1 bg-black/60 rounded">
                                <button onClick={ev => { ev.stopPropagation(); openEdit(e) }} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'var(--brand)', color: 'white' }}><Edit2 className="w-2.5 h-2.5" /></button>
                                <button onClick={ev => { ev.stopPropagation(); setDeleteId(e.id) }} className="w-4 h-4 rounded flex items-center justify-center bg-red-500 text-white"><Trash2 className="w-2.5 h-2.5" /></button>
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
            <tr style={{ background: '#fffbeb' }}>
              <td colSpan={days.length + 1} className="px-3 py-1.5 border-b-2 border-slate-600/50 border-t-2 border-t-slate-600/50 border-r-2 border-slate-600/50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#d97706' }}>
                  Lab / Elective Slots
                </p>
              </td>
            </tr>
            {labSlots.map(slot => (
              <tr key={slot.id} className="hover:bg-amber-50/30 transition-colors">
                <td className="p-2 px-3 font-mono text-[10px] font-bold sticky left-0 z-20 border-r-2 border-b-2 border-slate-500" style={{ color: '#d97706', verticalAlign: 'middle', background: '#fffbeb' }}>
                  <FlaskConical className="w-2.5 h-2.5 inline mr-1 opacity-80" />
                  {slot.slot_label.replace('Lab: ', '').split('(')[0]}
                </td>
                {days.map(day => {
                  const entries = filtered.filter(t => t.day_of_week === day && t.time_slot_id === slot.id).sort((a, b) => (a.batch_number || 0) - (b.batch_number || 0))
                  return (
                    <td key={day} className="p-1 border-r-2 border-b-2 border-slate-400 relative" 
                      style={{ verticalAlign: 'top', minWidth: '100px', background: draggingId ? 'rgba(210,153,34,0.03)' : '' }}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, day, slot.id)}
                      onContextMenu={(e) => handleContextMenu(e, { empty: true, day, slotId: slot.id })}>
                      <div className="flex flex-wrap gap-0.5 min-h-[30px]">
                        {entries.map(e => {
                          const bc = e.batch_number ? getBatchColor(Number(e.batch_number)) : { bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.4)', text: '#d97706' }
                          return (
                            <div key={e.id} className={`p-0.5 px-1 rounded text-[10px] cursor-pointer group relative flex-1 min-w-[70px] flex flex-col items-center justify-center text-center leading-[1.1] transition-all
                               ${draggingId === e.id ? 'opacity-30' : 'opacity-100 hover:scale-[1.02] hover:shadow-lg'}`}
                              draggable="true"
                              onDragStart={(ev) => onDragStart(ev, e)}
                              onContextMenu={(ev) => handleContextMenu(ev, e)}
                              style={{ background: bc.bg, border: `1.5px solid ${bc.border}` }}
                              onClick={() => openEdit(e)}>
                              <p className="font-bold truncate w-full" style={{ color: bc.text }}>
                                {e.batch_number && <span className="font-black mr-0.5">B{e.batch_number}</span>}
                                {subjectShortLabel(e)}
                              </p>
                              <p className="opacity-80 truncate w-full mt-0.5 font-bold" style={{ color: '#78350f', fontSize: '8.5px' }}>
                                <span className="font-black">{facultyInitials(e)}</span> · {roomLabel(e)}
                              </p>
                              
                              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-1 bg-black/60 rounded">
                                <button onClick={ev => { ev.stopPropagation(); openEdit(e) }} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#d29922', color: 'black' }}><Edit2 className="w-2.5 h-2.5" /></button>
                                <button onClick={ev => { ev.stopPropagation(); setDeleteId(e.id) }} className="w-4 h-4 rounded flex items-center justify-center bg-red-500 text-white" ><Trash2 className="w-2.5 h-2.5" /></button>
                              </div>
                            </div>
                          )
                        })}
                        {entries.length === 0 && <span className="text-[10px] opacity-10 px-1">—</span>}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
            
            {/* Custom Time Slots notice */}
            {filtered.some(t => t.custom_time_slot) && (
              <tr><td colSpan={days.length + 1} className="px-2 pt-4 pb-2 text-center text-[10px] opacity-50 italic border-l-2 border-r-2 border-b-2 border-slate-500">
                Entries with Custom Time Slots appear only in List View.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  const isLabSlot = timeSlots.find(s => s.id === form.time_slot_id)?.slot_label?.startsWith('Lab:')

  // Generic Field component for toggling dropdown vs custom text
  const FieldToggle = ({ label, useCustom, setUseCustom, dropdownValue, textValue, onChangeDrop, onChangeText, options, dropPlaceholder, textPlaceholder }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="form-label mb-0">{label} {(!useCustom && !dropdownValue) && <span className="text-red-400">*</span>}</label>
        <button type="button" onClick={() => setUseCustom(!useCustom)}
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-colors"
          style={useCustom ? { background: 'rgba(74,108,247,0.15)', color: '#7090ff' } : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
          {useCustom ? '← Use List' : '+ Custom'}
        </button>
      </div>
      {useCustom ? (
        <input className="input-field" placeholder={textPlaceholder} value={textValue} onChange={e => onChangeText(e.target.value)} />
      ) : (
        <select className="select-field" value={dropdownValue} onChange={e => onChangeDrop(e.target.value)}>
          <option value="">{dropPlaceholder}</option>
          {options}
        </select>
      )}
    </div>
  )

  return (
    <div className="p-3 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Timetable Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{timetable.length} entries · Conflict detection · Batch & Custom support</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest opacity-50" style={{color:'var(--text-primary)'}}>Filters</span>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button onClick={() => { setFilterDay('All'); setFilterFaculty(''); setFilterDivision(''); setFilterSem(''); setFilterBatch('') }}
                className="text-xs font-semibold px-2 py-1 rounded-lg" style={{color:'var(--brand)',background:'rgba(74,108,247,0.1)'}}>
                Reset Filters
              </button>
            )}
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {['grid', 'list'].map(v => (
                <button key={v} onClick={() => setView(v)} className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={view === v ? { background: 'rgba(74,108,247,0.2)', color: '#7090ff' } : { color: 'var(--text-secondary)' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
          <div className="flex gap-2 flex-wrap">
            <select className="select-field text-sm flex-1 min-w-[120px]" value={filterDay} onChange={e => setFilterDay(e.target.value)}>
              <option value="All">All Days</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="select-field text-sm flex-1 min-w-[140px]" value={filterFaculty} onChange={e => setFilterFaculty(e.target.value)}>
              <option value="">All Faculty</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
            </select>
            <select className="select-field text-sm flex-1 min-w-[120px]" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
              <option value="">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <select className="select-field text-sm flex-1 min-w-[130px]" value={filterDivision} onChange={e => setFilterDivision(e.target.value)}>
              <option value="">All Divisions</option>
              {divisions
                .filter(d => !filterSem || d.semester == filterSem)
                .map(d => (
                  <option key={d.id} value={d.id}>
                    {filterSem ? formatDivName(d.division_name, filterSem) : `${d.division_name} (Sem ${d.semester})`}
                  </option>
                ))}
            </select>
            <select className="select-field text-sm flex-1 min-w-[110px]" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
              <option value="">All Batches</option>
              {batches.map(b => <option key={b} value={b}>Batch {b}</option>)}
            </select>
            <select className="select-field text-sm flex-1 min-w-[120px]" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
            </select>
          </div>
        {hasActiveFilters && <p className="text-xs opacity-50">{filtered.length} of {timetable.length} entries shown</p>}
      </div>

      <div className="glass-card p-2 overflow-x-auto">
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
                  <td className="text-sm">{facultyLabel(t)}</td>
                  <td><span className="badge badge-pending">{divisionLabel(t)}</span></td>
                  <td className="text-sm text-center">
                    {t.batch_number ? (
                      <span className="font-bold text-xs px-2 py-0.5 rounded-lg" style={getBatchColor(t.batch_number)}>B{t.batch_number}</span>
                    ) : '—'}
                  </td>
                  <td className="text-sm">{subjectLabel(t)}</td>
                  <td className="text-sm">
                    {t.custom_room ? (
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3 opacity-50" />{t.custom_room}</span>
                    ) : (t.rooms?.room_number || '—')}
                  </td>
                  <td className="text-sm">{t.day_of_week}</td>
                  <td className="text-sm font-mono">
                    {t.custom_time_slot ? t.custom_time_slot : (
                      <>
                        {t.time_slots?.slot_label?.startsWith('Lab:') && <FlaskConical className="w-3 h-3 inline mr-1 text-yellow-500" />}
                        {t.time_slots?.slot_label?.replace('Lab: ', '')}
                      </>
                    )}
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={<div className="flex items-center justify-between w-full pr-8"><span>{editEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</span> <button onClick={() => { setUseCustomFaculty(true); setUseCustomSubject(true); setUseCustomRoom(true); setForm(f => ({...f, custom_faculty: 'DO', custom_subject: 'DO', custom_room: 'DO', faculty_id: '', subject_id: '', room_id: ''})); setConflicts([]); }} className="text-xs bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 px-2 py-1 rounded">Set as Ditto (DO)</button></div>} size="md">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <ConflictWarning conflicts={conflicts} />

          {isLabSlot && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.25)' }}>
              <FlaskConical className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#d29922' }} />
              <div style={{ color: '#d29922' }}>
                <p className="font-bold">2-hour Lab / Elective Slot</p>
                <p className="opacity-80 mt-0.5">You can add up to 4 entries for the same slot. Using batch numbers bypasses division conflict limits.</p>
              </div>
            </div>
          )}

          <FieldToggle label="Faculty" dropPlaceholder="Select Faculty…" textPlaceholder="e.g. Guest Lecturer, Dr. Smith…"
            useCustom={useCustomFaculty} setUseCustom={setUseCustomFaculty}
            dropdownValue={form.faculty_id} onChangeDrop={v => { setForm(f => ({ ...f, faculty_id: v, custom_faculty: '' })); setConflicts([]) }}
            textValue={form.custom_faculty} onChangeText={v => setForm(f => ({ ...f, custom_faculty: v, faculty_id: '' }))}
            options={faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="form-label mb-0">Sem {(!form.division_id && !useCustomDivision) && <span className="text-red-400">*</span>}</label>
              <select className="select-field" 
                value={divisions.find(d => d.id === form.division_id)?.semester || ''}
                onChange={async (e) => {
                  const s = e.target.value
                  // We don't store sem on timetable directly, but we use it to filter divisions
                  // If current division doesn't match new sem, clear it
                  const currentDiv = divisions.find(d => d.id === form.division_id)
                  if (currentDiv && currentDiv.semester != s) {
                    setForm(f => ({ ...f, division_id: '' }))
                  }
                }}>
                <option value="">Select Sem…</option>
                {[4, 6, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>

            <FieldToggle label="Division" dropPlaceholder="Select Div…" textPlaceholder="e.g. FY-A, Special Batch…"
              useCustom={useCustomDivision} setUseCustom={setUseCustomDivision}
              dropdownValue={form.division_id} onChangeDrop={v => { setForm(f => ({ ...f, division_id: v, custom_division: '' })); setConflicts([]) }}
              textValue={form.custom_division} onChangeText={v => setForm(f => ({ ...f, custom_division: v, division_id: '' }))}
              options={(() => {
                const selectedSem = divisions.find(d => d.id === form.division_id)?.semester || document.querySelector('select[value=""]')?.value // This is tricky in React
                // Actually, let's just use a local state for the modal's sem filter if needed, 
                // but since we want to be able to pick ANY division if sem is not selected:
                const semInModal = divisions.find(d => d.id === form.division_id)?.semester
                return divisions
                  .filter(d => !semInModal || d.semester == semInModal)
                  .map(d => <option key={d.id} value={d.id}>
                    {semInModal ? formatDivName(d.division_name, semInModal) : `${d.division_name} (Sem ${d.semester})`}
                  </option>)
              })()} />
            
            <div>
              <label className="form-label">Batch <span className="opacity-50 text-xs">(optional)</span></label>
              <select className="select-field" value={form.batch_number}
                onChange={e => { setForm(f => ({ ...f, batch_number: e.target.value })); setConflicts([]) }}>
                <option value="">No Batch</option>
                <option value="1">Batch 1</option>
                <option value="2">Batch 2</option>
                <option value="3">Batch 3</option>
                <option value="4">Batch 4</option>
              </select>
            </div>
          </div>

          <FieldToggle label="Subject" dropPlaceholder="Select Subject…" textPlaceholder="e.g. Workshop, Seminar X…"
            useCustom={useCustomSubject} setUseCustom={setUseCustomSubject}
            dropdownValue={form.subject_id} onChangeDrop={v => { setForm(f => ({ ...f, subject_id: v, custom_subject: '' })); setConflicts([]) }}
            textValue={form.custom_subject} onChangeText={v => setForm(f => ({ ...f, custom_subject: v, subject_id: '' }))}
            options={subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)} />

          <FieldToggle label="Room" dropPlaceholder="No Room / TBD" textPlaceholder="e.g. Lab 402, Remote…"
            useCustom={useCustomRoom} setUseCustom={setUseCustomRoom}
            dropdownValue={form.room_id} onChangeDrop={v => { setForm(f => ({ ...f, room_id: v, custom_room: '' })); setConflicts([]) }}
            textValue={form.custom_room} onChangeText={v => setForm(f => ({ ...f, custom_room: v, room_id: '' }))}
            options={rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)} />

          <FieldToggle label="Time Slot" dropPlaceholder="Select Time Slot…" textPlaceholder="e.g. 17:00 - 18:30"
            useCustom={useCustomTimeSlot} setUseCustom={setUseCustomTimeSlot}
            dropdownValue={form.time_slot_id} onChangeDrop={v => { setForm(f => ({ ...f, time_slot_id: v, custom_time_slot: '' })); setConflicts([]) }}
            textValue={form.custom_time_slot} onChangeText={v => setForm(f => ({ ...f, custom_time_slot: v, time_slot_id: '' }))}
            options={<>
              <optgroup label="Regular (1 hour)">{regularSlots.map(s => <option key={s.id} value={s.id}>{s.slot_label}</option>)}</optgroup>
              <optgroup label="🧪 Lab / Elective (2 hours)">{labSlots.map(s => <option key={s.id} value={s.id}>{s.slot_label.replace('Lab: ', '')}</option>)}</optgroup>
            </>} />

          <div>
            <label className="form-label">Day of Week</label>
            <select className="select-field" value={form.day_of_week}
              onChange={e => { setForm(f => ({ ...f, day_of_week: e.target.value })); setConflicts([]) }}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

        </div>
        
        <div className="flex justify-between gap-3 pt-4 border-t mt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => { const c = checkConflicts(form); if (c.length === 0) toast.success('No conflicts found!') }}
            className="btn-secondary flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" /> Check Conflicts
          </button>
          <div className="flex gap-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className={`btn-primary ${conflicts.length > 0 ? 'bg-orange-500 hover:bg-orange-600 border-none' : ''}`}>
              {conflicts.length > 0 ? 'Save with Conflicts' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Delete Entry" message="Are you sure you want to delete this timetable entry?"
        onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} confirmLabel="Delete" danger />

      {/* ── Context Menu (Floating / Global) ────────────────────────────────── */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null) }} />
          <div className="fixed z-[101] w-48 bg-slate-900 border border-slate-700/50 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-150 backdrop-blur-xl"
            style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 200) }}>
            {!contextMenu.entry.empty ? (
              <div className="p-1.5 flex flex-col">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">Actions</p>
                <button onClick={() => { openEdit(contextMenu.entry); setContextMenu(null) }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-brand-500/20 hover:text-brand-300 rounded-lg transition-colors group">
                  <Edit2 className="w-4 h-4 text-slate-500 group-hover:text-brand-400" /> <span>Edit Entry</span>
                </button>
                <button onClick={() => handleDuplicate(contextMenu.entry)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors group">
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-green-400" /> <span>Duplicate</span>
                </button>
                <button onClick={() => handleCopy(contextMenu.entry)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-brand-500/20 hover:text-brand-400 rounded-lg transition-colors group">
                  <Copy className="w-4 h-4 text-slate-500 group-hover:text-brand-400" /> <span>Copy Entry</span>
                </button>
                <div className="h-px bg-slate-800 my-1 mx-2" />
                <button onClick={() => { setDeleteId(contextMenu.entry.id); setContextMenu(null) }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors group">
                  <Trash2 className="w-4 h-4 text-red-500/50 group-hover:text-red-400" /> <span>Delete</span>
                </button>
              </div>
            ) : (
              <div className="p-1.5 flex flex-col">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">Empty Slot</p>
                <button onClick={() => { 
                  setForm({ ...emptyForm, day_of_week: contextMenu.entry.day, time_slot_id: contextMenu.entry.slotId })
                  setEditEntry(null); setShowModal(true); setContextMenu(null)
                }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-brand-500/20 hover:text-brand-400 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 text-slate-500" /> <span>Add Entry Here</span>
                </button>
                {clipboard && (
                  <button onClick={() => handlePaste(contextMenu.entry.day, contextMenu.entry.slotId)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors border-t border-slate-800/50 mt-1">
                    <MousePointer2 className="w-4 h-4 text-slate-500" /> <span>Paste {subjectShortLabel(clipboard)}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
