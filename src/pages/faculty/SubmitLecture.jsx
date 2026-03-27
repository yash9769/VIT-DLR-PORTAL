import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, BookOpen, Users, FileText, Upload, ChevronDown, Check, AlertCircle, Edit2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { today, getDayName, formatTime } from '../../utils/helpers'
import { toast } from '../../components/ui'
import { supabase } from '../../lib/supabase'

const LCS_OPTIONS = [
  { value: 'covered', label: 'Covered', color: '#3fb950' },
  { value: 'partially_covered', label: 'Partially Covered', color: '#d29922' },
  { value: 'not_covered', label: 'Not Covered', color: '#f85149' },
]

const Step = ({ num, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'text-white' : 'text-gray-500'}`}
      style={done ? {} : active ? { background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {done ? <Check className="w-3.5 h-3.5" /> : num}
    </div>
    <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-brand-400' : done ? 'text-green-400' : 'text-gray-500'}`}>{label}</span>
  </div>
)

const StepDivider = ({ done }) => (
  <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${done ? 'bg-green-500' : 'bg-white/10'}`} />
)

export default function SubmitLecture() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state?.entry
  const savedState = location.state?.restoredForm
  const savedStep = location.state?.restoredStep

  const [step, setStep] = useState(savedStep || 1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newRecordId, setNewRecordId] = useState(null)
  const [substitutionBlocked, setSubstitutionBlocked] = useState(false)
  const [blockedReason, setBlockedReason] = useState('')

  const [todaySchedule, setTodaySchedule] = useState([])
  const [divisions, setDivisions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [rooms, setRooms] = useState([])
  const [allFaculty, setAllFaculty] = useState([])
  const [students, setStudents] = useState([])        // for roll call
  const [attendance, setAttendance] = useState({})   // { [student_id]: true|false }
  const [studentsLoading, setStudentsLoading] = useState(false)

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const [form, setForm] = useState(savedState || {
    lecture_date: today(),
    timetable_id: prefill?.id || '',
    faculty_id: profile?.id || '',
    division_id: prefill?.division_id || '',
    subject_id: prefill?.subject_id || '',
    room_id: prefill?.room_id || '',
    
    // Timetable (Group 1-2)
    timetable_from: prefill?.time_slots?.start_time || '',
    timetable_to: prefill?.time_slots?.end_time || '',
    timetable_faculty: profile?.full_name || '',
    timetable_division: prefill?.divisions?.division_name || '',
    timetable_subject: prefill?.subjects?.subject_name || '',
    total_batch_strength: prefill?.divisions?.strength || 60,

    // Actual (Group 3-4)
    actual_from: prefill?.time_slots?.start_time || currentTime,
    actual_to: prefill?.time_slots?.end_time || currentTime,
    actual_faculty_id: profile?.id || '',
    actual_faculty_name: profile?.full_name || '',
    attendance: location.state?.presentCount !== undefined ? location.state.presentCount : (savedState?.attendance || ''),
    
    // Classroom + System (Group 4)
    lecture_capture_done: savedState?.lecture_capture_done || false,
    smart_board_uploaded: savedState?.smart_board_uploaded || false,
    
    // Assignments (Group 5)
    assignments_last_week: savedState?.assignments_last_week || 0,
    assignments_given: savedState?.assignments_given || 0,
    assignments_graded: savedState?.assignments_graded || 0,

    remarks: savedState?.remarks || '',
    is_substitution: savedState?.is_substitution || false,
    attendanceDetails: savedState?.attendanceDetails || location.state?.attendanceDetails || {},
  })

  // Fetch students for roll call whenever division or timetable entry batch changes
  useEffect(() => {
    if (!form.division_id) return
    const fetchStudents = async () => {
      setStudentsLoading(true)
      try {
        // Find the batch for this timetable entry
        const entry = todaySchedule.find(e => e.id === form.timetable_id)
        const batchNum = entry?.batch_number ?? null
        let q = supabase
          .from('students')
          .select('id, roll_number, full_name, batch_number')
          .eq('division_id', form.division_id)
          .order('roll_number')
        if (batchNum) q = q.eq('batch_number', batchNum)
        const { data } = await q
        const list = data || []
        setStudents(list)
        // Default everyone to present
        const init = {}
        list.forEach(s => { init[s.id] = true })
        setAttendance(init)
        set('total_students', (list && list.length > 0) ? list.length : (Number(form.total_students) || 60))
        set('present_count', (list && list.length > 0) ? list.length : (Number(form.present_count) || Number(form.total_students) || 60))
      } finally {
        setStudentsLoading(false)
      }
    }
    fetchStudents()
  }, [form.division_id, form.timetable_id])

  // Keep present_count in sync with attendance toggles
  useEffect(() => {
    if (students.length === 0) return
    const presentCount = Object.values(attendance).filter(Boolean).length
    set('attendance', presentCount)
    set('total_batch_strength', students.length)
  }, [attendance])

  const toggleStudent = (id) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const markAll = (present) => {
    const next = {}
    students.forEach(s => { next[s.id] = present })
    setAttendance(next)
  }

  useEffect(() => {
    if (profile?.id) fetchFormData()
  }, [profile?.id])

  const fetchFormData = async () => {
    try {
      setLoading(true)
      const dayName = getDayName()
      const t = today()

      const [ttRes, divRes, subRes, rmRes, lrRes, taughtRes, facRes] = await Promise.all([
        supabase.from('timetable').select('*, subjects(*), divisions(*), rooms(*), time_slots(*), custom_room, custom_subject, custom_division, custom_time_slot').eq('faculty_id', profile.id).eq('day_of_week', dayName).eq('is_active', true),
        supabase.from('divisions').select('*').order('division_name'),
        supabase.from('subjects').select('*').order('subject_name'),
        supabase.from('rooms').select('*').order('room_number'),
        supabase.from('lecture_records').select('timetable_id').eq('faculty_id', profile.id).eq('lecture_date', t),
        supabase.from('timetable').select('subject_id, subjects(*)').eq('faculty_id', profile.id),
        supabase.from('users').select('id, full_name').eq('is_active', true).order('full_name')
      ])

      const submittedIds = lrRes.data?.map(r => r.timetable_id) || []
      const remaining = (ttRes.data || []).filter(tt => !submittedIds.includes(tt.id))

      // Filter subjects: only what this faculty teaches
      const uniqueSubjects = Array.from(
        new Map(taughtRes.data?.filter(s => s.subjects).map(s => [s.subjects.id, s.subjects])).values()
      )
      
      setTodaySchedule(remaining)
      setDivisions(divRes.data || [])
      setSubjects(uniqueSubjects.length > 0 ? uniqueSubjects : (subRes.data || []))
      setRooms(rmRes.data || [])
      setAllFaculty(facRes.data || [])

      try {
        const { data: absentSubs } = await supabase
          .from('substitutions')
          .select('timetable_id, substitution_date')
          .eq('absent_faculty_id', profile.id)
          .eq('substitution_date', t)
        
        if (absentSubs && absentSubs.filter(s => s.substitution_date === t).length > 0) {
          setSubstitutionBlocked(true)
          setBlockedReason('A substitution has been assigned for your slot(s) today. DLR submission is not allowed for those slots. Please contact admin if this is incorrect.')
        }
      } catch(_) {}
    } catch (error) {
      console.error('Error fetching form data:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedEntry = todaySchedule.find(t => t.id === form.timetable_id) || prefill

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleNext = () => {
    if (step === 1) {
      if (!form.timetable_id && (!form.division_id || !form.subject_id)) {
        toast.error('Please select a lecture or fill division and subject')
        return
      }
    }
    if (step === 2) {
      if (!form.actual_from || !form.actual_to) {
        toast.error('Please enter actual start and end times')
        return
      }
    }
    if (step === 3) {
      if (form.attendance === '') {
        toast.error('Please enter attendance count')
        return
      }
      if (Number(form.attendance) > Number(form.total_batch_strength)) {
        toast.error('Attendance cannot exceed batch strength')
        return
      }
    }
    setStep(s => s + 1)
  }

  const handleSelectEntry = (entry) => {
    setForm(f => ({
      ...f,
      timetable_id: entry.id,
      division_id: entry.division_id || '',
      subject_id: entry.subject_id || '',
      room_id: entry.room_id || '',
      timetable_from: entry.time_slots?.start_time || '',
      timetable_to: entry.time_slots?.end_time || '',
      timetable_faculty: profile?.full_name || '',
      timetable_division: entry.divisions?.division_name || '',
      timetable_subject: entry.subjects?.subject_name || '',
      total_batch_strength: entry.divisions?.strength || 60,
      actual_from: entry.time_slots?.start_time || currentTime,
      actual_to: entry.time_slots?.end_time || currentTime,
      actual_faculty_id: profile?.id || '',
      actual_faculty_name: profile?.full_name || '',
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const data = {
        faculty_id: profile.id,
        lecture_date: form.lecture_date,
        timetable_id: form.timetable_id || null,
        division_id: form.division_id || null,
        subject_id: form.subject_id || null,
        room_id: form.room_id || null,
        
        timetable_from: form.timetable_from || null,
        timetable_to: form.timetable_to || null,
        actual_from: form.actual_from || null,
        actual_to: form.actual_to || null,
        actual_faculty_id: form.actual_faculty_id || profile.id,
        
        attendance: Number(form.attendance),
        total_batch_strength: Number(form.total_batch_strength),
        
        lecture_capture_done: form.lecture_capture_done,
        smart_board_uploaded: form.smart_board_uploaded,
        
        assignments_last_week: Number(form.assignments_last_week),
        assignments_given: Number(form.assignments_given),
        assignments_graded: Number(form.assignments_graded),
        
        topic_covered: form.remarks || 'Main Lecture',
        remarks: form.remarks || null,
        is_substitution: form.is_substitution,
        submitted_at: new Date().toISOString()
      }

      const { data: record, error } = await supabase.from('lecture_records').insert([data]).select().single()
      if (error) throw error

      // NEW: Save student-wise attendance if available
      if (students.length > 0) {
        const attendanceData = students.map(s => ({
          lecture_record_id: record.id,
          student_id: s.id,
          is_present: attendance[s.id] !== false
        }))
        const { error: attError } = await supabase.from('attendance').insert(attendanceData)
        if (attError) console.error('Error saving individual attendance:', attError)
      }

      setNewRecordId(record.id)
      setSubmitted(true)
      toast.success('DLR submitted successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to submit lecture record.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-sm opacity-50">Loading submission form...</div>
  if (submitted) {
    const subName = selectedEntry?.subjects?.subject_name || subjects.find(s=>s.id===form.subject_id)?.subject_name
    const divName = selectedEntry?.divisions?.division_name || divisions.find(d=>d.id===form.division_id)?.division_name

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(63,185,80,0.15)', border: '2px solid rgba(63,185,80,0.4)' }}>
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Submitted!</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your lecture record has been submitted for admin review.</p>
        <div className="flex flex-col gap-2 mt-6 w-full max-w-xs">
          <button onClick={() => navigate('/faculty/history', { state: { autoEditId: newRecordId } })} className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg flex items-center justify-center gap-2">
            <Edit2 className="w-4 h-4" /> Correction / Edit Attendance
          </button>
          <div className="flex gap-2 w-full">
            <button onClick={() => navigate('/faculty')} className="btn-secondary flex-1 py-3 text-xs font-bold">Dashboard</button>
            <button onClick={() => navigate('/faculty/history')} className="btn-secondary flex-1 py-3 text-xs font-bold">Full History</button>
          </div>
        </div>
        <div className="mt-6 glass-card p-4 w-full text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Subject</span>
            <span className="font-semibold">{subName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Division</span>
            <span className="font-semibold">{divName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Time</span>
            <span className="font-semibold">{formatTime(form.actual_start)} – {formatTime(form.actual_end)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Attendance</span>
            <span className="font-semibold">{form.present_count}/{form.total_students}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-5 pb-4 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Submit Lecture Record</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Complete all steps to submit your DLR</p>
      </div>

      {/* Warning banner if substitution exists */}
      {substitutionBlocked && (
        <div className="mb-6 p-4 rounded-2xl flex gap-3 border animate-pulse-slow shadow-lg" style={{ background: 'rgba(210,153,34,0.08)', borderColor: 'rgba(210,153,34,0.3)', color: '#d29922' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold mb-1">DLR Warning / Conflict</p>
            <p className="opacity-90">{blockedReason}</p>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center mb-6">
        <Step num={1} label="Select" active={step===1} done={step>1} />
        <StepDivider done={step>1} />
        <Step num={2} label="Details" active={step===2} done={step>2} />
        <StepDivider done={step>2} />
        <Step num={3} label="Attendance" active={step===3} done={step>3} />
        <StepDivider done={step>3} />
        <Step num={4} label="Review" active={step===4} done={false} />
      </div>

      {/* ── STEP 1: Select lecture ────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Select today's lecture or enter manually</p>

          {todaySchedule.length > 0 && (
            <div className="space-y-2">
              <p className="form-label">Today's Schedule</p>
              {todaySchedule.map(entry => (
                <button key={entry.id} onClick={() => handleSelectEntry(entry)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${form.timetable_id === entry.id ? 'ring-2 ring-brand-500' : ''}`}
                  style={{ background: form.timetable_id === entry.id ? 'rgba(74,108,247,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.timetable_id === entry.id ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: form.timetable_id === entry.id ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.06)' }}>
                    <BookOpen className="w-5 h-5" style={{ color: form.timetable_id === entry.id ? '#4A6CF7' : 'var(--text-secondary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm truncate">{entry.custom_subject || entry.subjects?.subject_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {entry.custom_division || entry.divisions?.division_name}
                      {entry.batch_number ? ` · Batch ${entry.batch_number}` : ''}
                      {' · '}{entry.custom_time_slot || entry.time_slots?.slot_label}
                      {' · '}{entry.custom_room || entry.rooms?.room_number || '—'}
                    </p>
                  </div>
                  {form.timetable_id === entry.id && <Check className="w-5 h-5 text-brand-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Manual fallback */}
          <div className="space-y-3">
            <p className="form-label">Or Select Manually</p>
            <div>
              <label className="form-label">Division</label>
              <select className="select-field" value={form.division_id} onChange={e => set('division_id', e.target.value)}>
                <option value="">Select division…</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.division_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Subject</label>
              <select className="select-field" value={form.subject_id} onChange={e => set('subject_id', e.target.value)}>
                <option value="">Select subject…</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Room</label>
              <select className="select-field" value={form.room_id} onChange={e => set('room_id', e.target.value)}>
                <option value="">Select room…</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Actual Lecture & Systems ──────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6 animate-slide-up">
          {/* Section 1: Timetable (Readonly) */}
          <div className="glass-card p-4 space-y-3 opacity-80 bg-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Section 1: Timetable (As Per Timetable)</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-[10px] opacity-50 uppercase block mb-1">Timing</label>
                <div className="font-semibold">{formatTime(form.timetable_from)} – {formatTime(form.timetable_to)}</div>
              </div>
              <div>
                <label className="text-[10px] opacity-50 uppercase block mb-1">Faculty</label>
                <div className="font-semibold">{form.timetable_faculty}</div>
              </div>
              <div>
                <label className="text-[10px] opacity-50 uppercase block mb-1">Subject</label>
                <div className="font-semibold">{form.timetable_subject}</div>
              </div>
              <div>
                <label className="text-[10px] opacity-50 uppercase block mb-1">Division</label>
                <div className="font-semibold">{form.timetable_division}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Actual Lecture (Editable) */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Section 2: Actual Lecture</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Actual From <span className="text-red-400">*</span></label>
                <input type="time" className="input-field" value={form.actual_from} onChange={e => set('actual_from', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Actual To <span className="text-red-400">*</span></label>
                <input type="time" className="input-field" value={form.actual_to} onChange={e => set('actual_to', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="form-label">Professor (Select for Substitution)</label>
              <select className="select-field" value={form.actual_faculty_id} onChange={e => {
                const f = allFaculty.find(fac => fac.id === e.target.value);
                setForm(prev => ({ 
                  ...prev, 
                  actual_faculty_id: e.target.value,
                  actual_faculty_name: f?.full_name || '',
                  is_substitution: e.target.value !== profile?.id
                }))
              }}>
                {allFaculty.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
              </select>
            </div>
          </div>

          {/* Section 4 & 5: Systems */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex flex-col gap-2 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden`} 
                 style={{ 
                   background: form.lecture_capture_done ? 'rgba(63,185,80,0.12)' : 'rgba(255,255,255,0.03)', 
                   border: `1.5px solid ${form.lecture_capture_done ? 'rgba(63,185,80,0.4)' : 'rgba(255,255,255,0.1)'}`,
                   boxShadow: form.lecture_capture_done ? '0 0 20px rgba(63,185,80,0.1)' : 'none'
                 }}
                 onClick={() => set('lecture_capture_done', !form.lecture_capture_done)}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-[10px] uppercase tracking-widest" style={{ color: form.lecture_capture_done ? '#3fb950' : 'var(--text-secondary)' }}>Lecture Capture</p>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${form.lecture_capture_done ? 'bg-green-500 shadow-[0_0_10px_rgba(63,185,80,0.5)]' : 'bg-white/10'}`}>
                  {form.lecture_capture_done ? <Check className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                </div>
              </div>
              <p className="text-[11px] font-semibold leading-tight pr-4">
                {form.lecture_capture_done ? 'Recorded successfully' : 'Not recorded yet?'}
              </p>
              <div className="mt-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-[9px] uppercase tracking-tighter font-bold">Tap to toggle</span>
              </div>
              {form.lecture_capture_done && <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-green-500/10 blur-xl rounded-full" />}
            </div>

            <div className={`flex flex-col gap-2 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden`} 
                 style={{ 
                   background: form.smart_board_uploaded ? 'rgba(63,185,80,0.12)' : 'rgba(255,255,255,0.03)', 
                   border: `1.5px solid ${form.smart_board_uploaded ? 'rgba(63,185,80,0.4)' : 'rgba(255,255,255,0.1)'}`,
                   boxShadow: form.smart_board_uploaded ? '0 0 20px rgba(63,185,80,0.1)' : 'none'
                 }}
                 onClick={() => set('smart_board_uploaded', !form.smart_board_uploaded)}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-[10px] uppercase tracking-widest" style={{ color: form.smart_board_uploaded ? '#3fb950' : 'var(--text-secondary)' }}>Smart Board PDF</p>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${form.smart_board_uploaded ? 'bg-green-500 shadow-[0_0_10px_rgba(63,185,80,0.5)]' : 'bg-white/10'}`}>
                  {form.smart_board_uploaded ? <Check className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                </div>
              </div>
              <p className="text-[11px] font-semibold leading-tight pr-4">
                {form.smart_board_uploaded ? 'PDF uploaded on VREFER' : 'Not uploaded manually?'}
              </p>
              <div className="mt-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-[9px] uppercase tracking-tighter font-bold">Tap to toggle</span>
              </div>
              {form.smart_board_uploaded && <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-green-500/10 blur-xl rounded-full" />}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Attendance */}
      {step === 3 && (
        <div className="space-y-6 animate-slide-up">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Section 3: Attendance</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <label className="text-[10px] font-bold opacity-50 uppercase block mb-2">Total Batch Strength</label>
              <input type="number" className="text-2xl font-bold bg-transparent border-none w-full outline-none" 
                     value={form.total_batch_strength} onChange={e => set('total_batch_strength', e.target.value)} />
            </div>
            <div className="glass-card p-4 border-brand-500/30">
              <label className="text-[10px] font-bold opacity-50 uppercase block mb-2" style={{ color: 'var(--brand)' }}>Present Students *</label>
              <input type="number" className="text-2xl font-bold bg-transparent border-none w-full outline-none" autoFocus
                     value={form.attendance} onChange={e => set('attendance', e.target.value)} />
            </div>
          </div>

          <div className="p-4 rounded-2xl flex gap-3 border" style={{ background: 'rgba(74,108,247,0.05)', borderColor: 'rgba(74,108,247,0.2)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-500/10">
              <Users className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-xs">
              <p className="font-bold mb-0.5">Quick Roll Call (Optional)</p>
              <p style={{ color: 'var(--text-secondary)' }}>You can still use individual student marking below to auto-calculate the count.</p>
            </div>
          </div>

          {studentsLoading ? (
            <div className="text-center py-8 glass-card">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading students…</p>
            </div>
          ) : students.length > 0 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => markAll(true)} className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                  style={{ background:'rgba(63,185,80,0.1)',color:'#3fb950',border:'1px solid rgba(63,185,80,0.2)' }}>✓ All Present</button>
                <button onClick={() => markAll(false)} className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                  style={{ background:'rgba(248,81,73,0.08)',color:'#f85149',border:'1px solid rgba(248,81,73,0.15)' }}>✗ All Absent</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {students.map(s => {
                  const present = attendance[s.id] !== false
                  return (
                    <button key={s.id} onClick={() => toggleStudent(s.id)}
                      className="p-2.5 rounded-xl text-left transition-all active:scale-95"
                      style={{ background:present?'rgba(63,185,80,0.08)':'rgba(248,81,73,0.05)', border:`1.5px solid ${present?'rgba(63,185,80,0.3)':'rgba(248,81,73,0.2)'}` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background:present?'rgba(63,185,80,0.2)':'rgba(248,81,73,0.15)',color:present?'#3fb950':'#f85149' }}>
                          {present?'✓':'✗'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold truncate" style={{ color:present?'#3fb950':'#f85149' }}>{s.roll_number}</p>
                          <p className="text-[10px] font-semibold truncate leading-tight" style={{ color:'var(--text-primary)' }}>{s.full_name.split(' ')[0]}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Assignments & Remarks */}
      {step === 4 && (
        <div className="space-y-6 animate-slide-up">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Section 6: Assignments</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 glass-card">
                <label className="text-xs font-semibold">Assignments (of Last Week) Collected</label>
                <input type="number" className="w-16 bg-white/5 border border-white/10 rounded-lg py-2 text-center font-bold"
                       value={form.assignments_last_week} onChange={e => set('assignments_last_week', e.target.value)} />
              </div>
              
              <div className="flex items-center justify-between p-4 glass-card">
                <label className="text-xs font-semibold">Assignments (for Coming Week) Given</label>
                <input type="number" className="w-16 bg-white/5 border border-white/10 rounded-lg py-2 text-center font-bold"
                       value={form.assignments_given} onChange={e => set('assignments_given', e.target.value)} />
              </div>

              <div className="flex items-center justify-between p-4 glass-card">
                <label className="text-xs font-semibold">Prev. Week Graded and Distributed</label>
                <input type="number" className="w-16 bg-white/5 border border-white/10 rounded-lg py-2 text-center font-bold"
                       value={form.assignments_graded} onChange={e => set('assignments_graded', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Section 7: Remarks</p>
            <textarea className="input-field min-h-[100px] resize-none" placeholder="Any special notes or observations…"
                      value={form.remarks} onChange={e => set('remarks', e.target.value)} />
          </div>

          <div className="p-4 rounded-2xl glass-card space-y-3 border-brand-500/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Summary Review</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between border-b border-white/5 py-1">
                <span style={{ color: 'var(--text-secondary)' }}>Actual Time</span>
                <span className="font-bold">{formatTime(form.actual_from)} – {formatTime(form.actual_to)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span style={{ color: 'var(--text-secondary)' }}>Attendance</span>
                <span className="font-bold">{form.attendance}/{form.total_batch_strength}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span style={{ color: 'var(--text-secondary)' }}>Professor</span>
                <span className="font-bold">{form.actual_faculty_name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span style={{ color: 'var(--text-secondary)' }}>LCS Status</span>
                <span className={`font-bold ${form.lecture_capture_done ? 'text-green-400' : 'text-red-400'}`}>{form.lecture_capture_done ? 'Success' : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.2)' }}>
            <AlertCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <p style={{ color: 'var(--text-secondary)' }}>Once submitted, records can only be edited before admin locks the day. Ensure all details are correct.</p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1 min-h-[52px]">Back</button>
        )}
        {step < 4 ? (
          <button onClick={handleNext} className="btn-primary flex-1 min-h-[52px]">
            Continue
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 min-h-[52px] flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
            ) : (
              <><Check className="w-5 h-5" /> Submit Record</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
