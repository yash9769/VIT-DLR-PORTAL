import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, BookOpen, Users, FileText, Upload, ChevronDown, Check, AlertCircle } from 'lucide-react'
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

  const [todaySchedule, setTodaySchedule] = useState([])
  const [divisions, setDivisions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [rooms, setRooms] = useState([])

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const [form, setForm] = useState(savedState || {
    lecture_date: today(),
    timetable_id: prefill?.id || '',
    faculty_id: profile?.id || '',
    division_id: prefill?.division_id || '',
    subject_id: prefill?.subject_id || '',
    room_id: prefill?.room_id || '',
    scheduled_start: prefill?.time_slots?.start_time || '',
    scheduled_end: prefill?.time_slots?.end_time || '',
    actual_start: prefill?.time_slots?.start_time || currentTime,
    actual_end: currentTime,
    topic_covered: '',
    subtopics: '',
    unit_number: '',
    total_students: prefill?.divisions?.strength || 60,
    present_count: location.state?.presentCount !== undefined ? location.state.presentCount : (savedState?.present_count || ''),
    lcs_status: savedState?.lcs_status || 'covered',
    smartboard_pdf_uploaded: savedState?.smartboard_pdf_uploaded || false,
    is_substitution: savedState?.is_substitution || false,
    remarks: savedState?.remarks || '',
    attendanceDetails: savedState?.attendanceDetails || location.state?.attendanceDetails || {},
  })

  useEffect(() => {
    if (profile?.id) {
      fetchFormData()
    }
  }, [profile?.id])

  const fetchFormData = async () => {
    try {
      setLoading(true)
      const dayName = getDayName()
      const t = today()

      const [ttRes, divRes, subRes, rmRes, lrRes] = await Promise.all([
        supabase.from('timetable').select('*, subjects(*), divisions(*), rooms(*), time_slots(*)').eq('faculty_id', profile.id).eq('day_of_week', dayName).eq('is_active', true),
        supabase.from('divisions').select('*').order('division_name'),
        supabase.from('subjects').select('*').order('subject_name'),
        supabase.from('rooms').select('*').order('room_number'),
        supabase.from('lecture_records').select('timetable_id').eq('faculty_id', profile.id).eq('lecture_date', t)
      ])

      const submittedIds = lrRes.data?.map(r => r.timetable_id) || []
      const remaining = (ttRes.data || []).filter(tt => !submittedIds.includes(tt.id))

      setTodaySchedule(remaining)
      setDivisions(divRes.data || [])
      setSubjects(subRes.data || [])
      setRooms(rmRes.data || [])
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
      if (!form.actual_start || !form.actual_end) {
        toast.error('Please enter start and end times')
        return
      }
      if (form.topic_covered.length < 5) {
        toast.error('Topic covered must be at least 5 characters')
        return
      }
    }
    if (step === 3) {
      if (form.present_count === '') {
        toast.error('Please enter attendance count')
        return
      }
      if (Number(form.present_count) > Number(form.total_students)) {
        toast.error('Present count cannot exceed total students')
        return
      }
    }
    setStep(s => s + 1)
  }

  const handleSelectEntry = (entry) => {
    set('timetable_id', entry.id)
    set('division_id', entry.division_id)
    set('subject_id', entry.subject_id)
    set('room_id', entry.room_id || '')
    set('scheduled_start', entry.time_slots?.start_time || '')
    set('scheduled_end', entry.time_slots?.end_time || '')
    set('actual_start', entry.time_slots?.start_time || currentTime)
    set('total_students', entry.divisions?.strength || 60)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      // 2. Prepare data for Supabase (exclude UI-only fields)
      const { attendanceDetails, ...dbForm } = form
      
      const submissionData = {
        ...dbForm,
        faculty_id: profile.id,
        present_count: Number(form.present_count),
        total_students: Number(form.total_students),
        absent_count: Number(form.total_students) - Number(form.present_count),
        submitted_at: new Date().toISOString(),
        // Convert empty strings to null for time columns to avoid Postgres type errors
        scheduled_start: form.scheduled_start || null,
        scheduled_end: form.scheduled_end || null,
        actual_start: form.actual_start || null,
        actual_end: form.actual_end || null,
      }

      const { data: record, error } = await supabase
        .from('lecture_records')
        .upsert([submissionData], { onConflict: 'faculty_id, lecture_date, scheduled_start, division_id' })
        .select()
        .single()

      if (error) throw error

      // 4. Save individual attendance records if present
      if (form.attendanceDetails && Object.keys(form.attendanceDetails).length > 0) {
        const attendanceRecords = Object.entries(form.attendanceDetails).map(([studentId, isPresent]) => ({
          lecture_record_id: record.id,
          student_id: studentId,
          is_present: isPresent
        }))
        
        const { error: attError } = await supabase.from('attendance').insert(attendanceRecords)
        if (attError) console.error('Error saving individual attendance:', attError)
      }

      setSubmitted(true)
      toast.success('Lecture record submitted successfully!')
      setTimeout(() => navigate('/faculty'), 1800)
    } catch (error) {
      console.error('Error submitting lecture record:', error)
      toast.error('Failed to submit lecture record. Please try again.')
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
    <div className="px-4 pt-5 pb-4 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Submit Lecture Record</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Complete all steps to submit your DLR</p>
      </div>

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
                    <p className="font-display font-semibold text-sm truncate">{entry.subjects?.subject_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {entry.divisions?.division_name} · {entry.time_slots?.slot_label} · {entry.rooms?.room_number}
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

      {/* ── STEP 2: Time & Topic ─────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div className="glass-card p-3 flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <div>
              <p className="font-semibold text-sm">{selectedEntry?.subjects?.subject_name || subjects.find(s=>s.id===form.subject_id)?.subject_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedEntry?.divisions?.division_name || divisions.find(d=>d.id===form.division_id)?.division_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Actual Start Time</label>
              <input type="time" className="input-field" value={form.actual_start} onChange={e => set('actual_start', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Actual End Time</label>
              <input type="time" className="input-field" value={form.actual_end} onChange={e => set('actual_end', e.target.value)} />
            </div>
          </div>

          {form.scheduled_start && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
              <Clock className="w-3.5 h-3.5" />
              Scheduled: {formatTime(form.scheduled_start)} – {formatTime(form.scheduled_end)}
            </div>
          )}

          <div>
            <label className="form-label">Topic Covered <span className="text-red-400">*</span></label>
            <textarea 
              className={`input-field resize-none ${form.topic_covered.length > 0 && form.topic_covered.length < 5 ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} 
              rows={3} 
              placeholder="e.g. Introduction to AES Encryption, Key expansion algorithm…"
              value={form.topic_covered} 
              onChange={e => set('topic_covered', e.target.value)} 
            />
            <div className="flex justify-between items-center mt-1">
              <p className={`text-xs transition-colors ${form.topic_covered.length > 0 && form.topic_covered.length < 5 ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                {form.topic_covered.length < 5 
                  ? `Min 5 characters required (${5 - form.topic_covered.length} more)` 
                  : 'Length requirement met ✓'
                }
              </p>
              <p className="text-xs opacity-50">{form.topic_covered.length} chars</p>
            </div>
          </div>

          <div>
            <label className="form-label">Subtopics / References</label>
            <input type="text" className="input-field" placeholder="Optional" value={form.subtopics} onChange={e => set('subtopics', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Unit Number</label>
            <input type="number" className="input-field" placeholder="e.g. 3" min="1" max="10" value={form.unit_number} onChange={e => set('unit_number', e.target.value)} />
          </div>

          <div>
            <label className="form-label">LCS Status <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {LCS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => set('lcs_status', opt.value)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all active:scale-95 text-center`}
                  style={{
                    background: form.lcs_status === opt.value ? `${opt.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.lcs_status === opt.value ? opt.color : 'rgba(255,255,255,0.08)'}`,
                    color: form.lcs_status === opt.value ? opt.color : 'var(--text-secondary)',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all" style={{ background: form.smartboard_pdf_uploaded ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.smartboard_pdf_uploaded ? 'rgba(63,185,80,0.3)' : 'rgba(255,255,255,0.08)'}` }}
            onClick={() => set('smartboard_pdf_uploaded', !form.smartboard_pdf_uploaded)}>
            <Upload className="w-5 h-5" style={{ color: form.smartboard_pdf_uploaded ? '#3fb950' : 'var(--text-secondary)' }} />
            <div className="flex-1">
              <p className="font-semibold text-sm">Smartboard PDF Uploaded</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Toggle if you uploaded the lecture PDF</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${form.smartboard_pdf_uploaded ? 'bg-green-500' : 'bg-white/10'}`}>
              {form.smartboard_pdf_uploaded && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => set('is_substitution', !form.is_substitution)}>
            <Users className="w-5 h-5" style={{ color: form.is_substitution ? '#d29922' : 'var(--text-secondary)' }} />
            <div className="flex-1">
              <p className="font-semibold text-sm">Substitution Lecture</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>I covered this for another faculty</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${form.is_substitution ? '' : 'bg-white/10'}`} style={form.is_substitution ? { background: '#d29922' } : {}}>
              {form.is_substitution && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Attendance ───────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex flex-col gap-2">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter attendance count quickly, or use Roll Call for individual marking.</p>
            <div className="flex items-center gap-2 text-[10px] bg-blue-500/10 text-brand-400 px-2 py-1.5 rounded-xl border border-brand-500/20 w-fit">
              <span className="font-bold uppercase tracking-wider">✨ Tip:</span>
              <span>Use Digital Roll Call to show student names to the Admin.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Total Students</label>
              <input type="number" className="input-field text-center text-xl font-bold" min="1" max="120"
                value={form.total_students} onChange={e => set('total_students', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Present</label>
              <input type="number" className="input-field text-center text-xl font-bold" min="0" max={form.total_students}
                value={form.present_count} onChange={e => set('present_count', e.target.value)} style={{ borderColor: form.present_count !== '' ? 'rgba(74,108,247,0.5)' : '' }} />
            </div>
          </div>

          {/* Visual indicator */}
          {form.present_count !== '' && (
            <div className="glass-card p-4">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: 'var(--text-secondary)' }}>Attendance</span>
                <span className="font-bold text-lg" style={{ color: Number(form.present_count)/Number(form.total_students) >= 0.75 ? '#3fb950' : '#f85149' }}>
                  {Math.round(Number(form.present_count)/Number(form.total_students)*100)}%
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(100, Math.round(Number(form.present_count)/Number(form.total_students)*100))}%`,
                  background: Number(form.present_count)/Number(form.total_students) >= 0.75 ? 'linear-gradient(90deg,#3fb950,#2da040)' : 'linear-gradient(90deg,#f85149,#d73a3a)'
                }} />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-green-400">Present: {form.present_count}</span>
                <span className="text-red-400">Absent: {Number(form.total_students) - Number(form.present_count)}</span>
              </div>
            </div>
          )}

          <button onClick={() => navigate('/faculty/attendance', { 
            state: { 
              divisionId: form.division_id, 
              lectureId: null,
              returnTo: '/faculty/submit',
              restoredForm: form,
              restoredStep: step,
              initialAttendance: form.attendanceDetails
            } 
          })}
            className="w-full touch-btn btn-secondary justify-center gap-2">
            <Users className="w-5 h-5" />
            Open Digital Roll Call
          </button>

          <div>
            <label className="form-label">Remarks (Optional)</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Any notes, guest lectures, etc."
              value={form.remarks} onChange={e => set('remarks', e.target.value)} />
          </div>
        </div>
      )}

      {/* ── STEP 4: Review & Submit ──────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-4 animate-slide-up">
          <div className="glass-card p-4 space-y-3">
            <p className="font-display font-semibold text-sm mb-1">Review Before Submitting</p>
            {[
              ['Subject', selectedEntry?.subjects?.subject_name || subjects.find(s=>s.id===form.subject_id)?.subject_name || '—'],
              ['Division', selectedEntry?.divisions?.division_name || divisions.find(d=>d.id===form.division_id)?.division_name || '—'],
              ['Room', selectedEntry?.rooms?.room_number || rooms.find(r=>r.id===form.room_id)?.room_number || '—'],
              ['Actual Time', `${formatTime(form.actual_start)} – ${formatTime(form.actual_end)}`],
              ['Topic', form.topic_covered],
              ['LCS Status', LCS_OPTIONS.find(o=>o.value===form.lcs_status)?.label],
              ['Smartboard PDF', form.smartboard_pdf_uploaded ? 'Yes' : 'No'],
              ['Substitution', form.is_substitution ? 'Yes' : 'No'],
              ['Present / Total', `${form.present_count} / ${form.total_students}`],
              ['Attendance %', `${Math.round(Number(form.present_count)/Number(form.total_students)*100)}%`],
            ].map(([key, val]) => (
              <div key={key} className="flex items-start justify-between gap-4 text-sm py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                <span className="font-semibold text-right">{val}</span>
              </div>
            ))}
          </div>

          {form.remarks && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Remarks: </span>{form.remarks}
            </div>
          )}

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
