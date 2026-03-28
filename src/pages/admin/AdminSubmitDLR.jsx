import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, UserCheck, Calendar, BookOpen, Users, Check, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from '../../components/ui'
import { today, getDayName, formatTime } from '../../utils/helpers'

const LCS_OPTIONS = [
  { value: 'covered', label: 'Covered', color: '#3fb950' },
  { value: 'partially_covered', label: 'Partially Covered', color: '#d29922' },
  { value: 'not_covered', label: 'Not Covered', color: '#f85149' },
]

export default function AdminSubmitDLR() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillRecord = location.state?.editRecord

  // ── Master data ──────────────────────────────────────────────────
  const [faculties, setFaculties] = useState([])
  const [timetable, setTimetable] = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ── Step control ─────────────────────────────────────────────────
  // Step 1: Choose faculty + date
  // Step 2: Choose lecture slot
  // Step 3: Fill details
  // Step 4: Roll call
  // Step 5: Review + submit
  const [step, setStep] = useState(prefillRecord ? 3 : 1)

  // ── Form state ────────────────────────────────────────────────────
  const [selectedFaculty, setSelectedFaculty] = useState(prefillRecord?.faculty_id || '')
  const [lectureDate, setLectureDate] = useState(prefillRecord?.lecture_date || today())
  const [selectedSlot, setSelectedSlot] = useState(null)

  const [form, setForm] = useState({
    id: prefillRecord?.id || '',
    topic_covered: prefillRecord?.topic_covered || '',
    subtopics: prefillRecord?.subtopics || '',
    unit_number: prefillRecord?.unit_number || '',
    lcs_status: prefillRecord?.lcs_status || 'covered',
    smartboard_pdf_uploaded: prefillRecord?.smartboard_pdf_uploaded || false,
    remarks: prefillRecord?.remarks || '',
    total_students: prefillRecord?.total_students || 60,
    present_count: prefillRecord?.present_count || '',
    actual_start: prefillRecord?.actual_start || '',
    actual_end: prefillRecord?.actual_end || '',
  })

  // ── Fetch faculty list on mount ───────────────────────────────────
  useEffect(() => {
    const fetchFaculties = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, department, initials')
        .in('role', ['faculty', 'hod'])
        .eq('is_active', true)
        .order('full_name')
      setFaculties(data || [])
      setLoading(false)
    }
    fetchFaculties()
  }, [])

  // ── Fetch timetable for selected faculty + date ───────────────────
  useEffect(() => {
    if (!selectedFaculty || !lectureDate) { setTimetable([]); return }
    const dayName = new Date(lectureDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    const fetchTimetable = async () => {
      const { data } = await supabase
        .from('timetable')
        .select(`
          *,
          subjects (id, subject_name, short_name),
          divisions (id, division_name, semester),
          rooms (id, room_number),
          time_slots (id, slot_label, start_time, end_time)
        `)
        .eq('faculty_id', selectedFaculty)
        .eq('day_of_week', dayName)
        .eq('is_active', true)
      setTimetable(data || [])
    }
    fetchTimetable()
  }, [selectedFaculty, lectureDate])

  // ── Fetch students for roll call ──────────────────────────────────
  useEffect(() => {
    if (!selectedSlot) return
    const batchNum = selectedSlot.batch_number ?? null
    const divisionId = selectedSlot.division_id
    if (!divisionId) return

    const fetchStudents = async () => {
      setStudentsLoading(true)
      let q = supabase
        .from('students')
        .select('id, roll_number, full_name, batch_number')
        .eq('division_id', divisionId)
        .order('roll_number')
      if (batchNum) q = q.eq('batch_number', batchNum)
      const { data: list } = await q
      setStudents(list || [])

      // If editing, load existing attendance
      if (prefillRecord?.id) {
        const { data: existingAtt } = await supabase
          .from('attendance')
          .select('student_id, is_present')
          .eq('lecture_record_id', prefillRecord.id)
        if (existingAtt?.length > 0) {
          const attMap = {}
          existingAtt.forEach(a => { attMap[a.student_id] = a.is_present })
          setAttendance(attMap)
          setStudentsLoading(false)
          return
        }
      }

      const init = {}
      ;(list || []).forEach(s => { init[s.id] = true })
      setAttendance(init)
      setStudentsLoading(false)
    }

    fetchStudents()
  }, [selectedSlot])

  const toggleAttendance = (id) => setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  const presentCount = Object.values(attendance).filter(Boolean).length

  const handleSubmit = async () => {
    if (!selectedSlot && !prefillRecord) { toast.error('Please select a lecture slot'); return }
    if (!form.topic_covered.trim()) { toast.error('Topic covered is required'); return }

    const slot = selectedSlot
    const payload = {
      faculty_id: selectedFaculty,
      lecture_date: lectureDate,
      timetable_id: selectedSlot?.id || prefillRecord?.timetable_id || null,
      division_id: selectedSlot?.division_id || prefillRecord?.division_id || null,
      subject_id: selectedSlot?.subject_id || prefillRecord?.subject_id || null,
      room_id: selectedSlot?.room_id || prefillRecord?.room_id || null,
      scheduled_start: selectedSlot?.time_slots?.start_time || prefillRecord?.scheduled_start || null,
      scheduled_end: selectedSlot?.time_slots?.end_time || prefillRecord?.scheduled_end || null,
      actual_start: form.actual_start || null,
      actual_end: form.actual_end || null,
      topic_covered: form.topic_covered,
      subtopics: form.subtopics,
      unit_number: form.unit_number ? Number(form.unit_number) : null,
      lcs_status: form.lcs_status,
      smartboard_pdf_uploaded: form.smartboard_pdf_uploaded,
      remarks: form.remarks,
      total_students: students.length > 0 ? students.length : (Number(form.total_students) || 60),
      present_count: (students.length > 0) ? presentCount : (Number(form.present_count) || Number(form.total_students) || 60),
      approval_status: 'pending',
      submitted_at: new Date().toISOString(),
    }

    setSubmitting(true)
    try {
      let recordId = prefillRecord?.id
      if (recordId) {
        const { error } = await supabase.from('lecture_records').update(payload).eq('id', recordId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('lecture_records').insert([payload]).select().single()
        if (error) throw error
        recordId = data.id
      }

      // Sync attendance
      if (students.length > 0 && recordId) {
        await supabase.from('attendance').delete().eq('lecture_record_id', recordId)
        const attRows = students.map(s => ({
          lecture_record_id: recordId,
          student_id: s.id,
          is_present: attendance[s.id] ?? true,
        }))
        const { error: attErr } = await supabase.from('attendance').insert(attRows)
        if (attErr) console.error('Attendance insert error:', attErr)
      }

      toast.success(prefillRecord ? 'DLR updated successfully' : 'DLR submitted on behalf of faculty')
      navigate('/admin/records')
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit DLR: ' + (err.message || ''))
    } finally {
      setSubmitting(false)
    }
  }

  const facultyObj = faculties.find(f => f.id === selectedFaculty)
  const STEPS = ['Faculty & Date', 'Lecture Slot', 'Details', 'Roll Call', 'Review']

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm opacity-50">Loading faculty list…</p>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            {prefillRecord ? 'Edit DLR (Admin)' : 'Submit DLR on Behalf of Faculty'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Admin override — fills a lecture record for any faculty member
          </p>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-1.5">
          {STEPS.map((label, i) => {
            const s = i + 1
            const done = step > s
            const active = step === s
            return (
              <div key={label} className="flex items-center gap-1.5 flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'text-white' : ''}`}
                    style={done ? {} : active ? { background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                    {done ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider hidden sm:block" style={{ color: active ? 'var(--brand)' : done ? '#3fb950' : 'var(--text-secondary)' }}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full transition-all mt-[-14px]" style={{ background: done ? '#3fb950' : 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* STEP 1: Faculty + Date */}
      {step === 1 && (
        <div className="glass-card p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="form-label">Faculty Member <span className="text-red-400">*</span></label>
            <select className="select-field w-full" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}>
              <option value="">Choose a faculty member…</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.full_name} ({f.department})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="form-label">Lecture Date <span className="text-red-400">*</span></label>
            <input type="date" className="input-field w-full" value={lectureDate} onChange={e => setLectureDate(e.target.value)} max={today()} />
          </div>
          {selectedFaculty && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.2)' }}>
              <UserCheck className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Submitting as admin for <span className="font-bold">{facultyObj?.full_name}</span>
              </p>
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            disabled={!selectedFaculty || !lectureDate}
            className="btn-primary w-full disabled:opacity-40"
          >
            Next: Select Lecture Slot →
          </button>
        </div>
      )}

      {/* STEP 2: Lecture Slot */}
      {step === 2 && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Schedule for {facultyObj?.full_name} · {lectureDate}
            </p>
          </div>

          {timetable.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No timetable entries for this faculty on {new Date(lectureDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })}.</p>
              <p className="text-xs mt-1 opacity-50">Check if the date falls on a working day and the timetable is set up.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {timetable.map(entry => {
                const isSelected = selectedSlot?.id === entry.id
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setSelectedSlot(entry)
                      setForm(f => ({ 
                        ...f, 
                        actual_start: entry.time_slots?.start_time || '',
                        actual_end: entry.time_slots?.end_time || ''
                      }))
                    }}
                    className="w-full text-left p-4 rounded-2xl border transition-all"
                    style={{
                      background: isSelected ? 'rgba(74,108,247,0.1)' : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? 'rgba(74,108,247,0.5)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: isSelected ? 'var(--brand)' : 'rgba(255,255,255,0.3)', background: isSelected ? 'var(--brand)' : 'transparent' }}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {entry.subjects?.subject_name || entry.custom_subject || 'Unknown Subject'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span>{entry.time_slots?.start_time?.slice(0, 5)} – {entry.time_slots?.end_time?.slice(0, 5)}</span>
                          <span>{entry.divisions?.division_name || entry.custom_division}</span>
                          <span>{entry.rooms?.room_number || entry.custom_room || '—'}</span>
                          {entry.batch_number && <span className="font-bold" style={{ color: 'var(--brand)' }}>B{entry.batch_number}</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
            <button
              onClick={() => { setStep(3); setForm(f => ({ ...f, total_students: selectedSlot?.divisions?.strength || 60 })) }}
              disabled={!selectedSlot}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              Next: Fill Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Lecture Details */}
      {step === 3 && (
        <div className="glass-card p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="form-label">Topic Covered <span className="text-red-400">*</span></label>
            <input className="input-field w-full" placeholder="e.g. Introduction to Recursion" value={form.topic_covered} onChange={e => setForm(f => ({ ...f, topic_covered: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="form-label">Subtopics <span className="opacity-50 text-xs">(optional)</span></label>
            <input className="input-field w-full" placeholder="e.g. Base case, recursive tree" value={form.subtopics} onChange={e => setForm(f => ({ ...f, subtopics: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="form-label">Actual Start</label>
              <input type="time" className="input-field w-full" value={form.actual_start} onChange={e => setForm(f => ({ ...f, actual_start: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Actual End</label>
              <input type="time" className="input-field w-full" value={form.actual_end} onChange={e => setForm(f => ({ ...f, actual_end: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="form-label">Unit Number</label>
              <input type="number" min="1" max="10" className="input-field w-full" placeholder="e.g. 3" value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">LCS Coverage</label>
              <select className="select-field w-full" value={form.lcs_status} onChange={e => setForm(f => ({ ...f, lcs_status: e.target.value }))}>
                {LCS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: form.smartboard_pdf_uploaded ? 'rgba(63,185,80,0.08)' : 'rgba(255,255,255,0.03)', borderColor: form.smartboard_pdf_uploaded ? 'rgba(63,185,80,0.3)' : 'rgba(255,255,255,0.08)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Smartboard PDF Uploaded</p>
            <button type="button"
              onClick={() => setForm(f => ({ ...f, smartboard_pdf_uploaded: !f.smartboard_pdf_uploaded }))}
              className={`toggle-track ${form.smartboard_pdf_uploaded ? 'active' : ''}`}
              style={form.smartboard_pdf_uploaded ? { background: '#3fb950 !important' } : {}}
            >
              <div className="toggle-knob" />
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="form-label">Remarks <span className="opacity-50 text-xs">(optional)</span></label>
            <textarea className="input-field w-full min-h-[70px] resize-none" placeholder="Any additional notes…" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(prefillRecord ? 1 : 2)} className="btn-secondary flex-1">← Back</button>
            <button onClick={() => setStep(4)} disabled={!form.topic_covered.trim()} className="btn-primary flex-1 disabled:opacity-40">
              Next: Roll Call →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Roll Call */}
      {step === 4 && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Roll Call · {presentCount}/{students.length} Present
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { const all = {}; students.forEach(s => { all[s.id] = true }); setAttendance(all) }} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950' }}>All P</button>
              <button onClick={() => { const all = {}; students.forEach(s => { all[s.id] = false }); setAttendance(all) }} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: 'rgba(248,81,73,0.12)', color: '#f85149' }}>All A</button>
            </div>
          </div>

          {studentsLoading ? (
            <p className="text-center py-8 text-sm opacity-50">Loading students…</p>
          ) : students.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm opacity-50">No students found for this division/batch.</p>
              <p className="text-xs mt-1 opacity-30">You can still submit with a manual count.</p>
              <div className="mt-4 space-y-1.5">
                <label className="form-label">Manual Present Count</label>
                <input type="number" className="input-field w-full" placeholder="e.g. 60" value={form.present_count} onChange={e => setForm(f => ({ ...f, present_count: e.target.value }))} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {students.map(s => {
                const present = attendance[s.id] ?? true
                return (
                  <button key={s.id} onClick={() => toggleAttendance(s.id)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all"
                    style={{ background: present ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.06)', borderColor: present ? 'rgba(63,185,80,0.25)' : 'rgba(248,81,73,0.2)' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ background: present ? '#3fb950' : '#f85149' }}>
                      {present ? 'P' : 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono truncate" style={{ color: 'var(--text-secondary)' }}>{s.roll_number}</p>
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{s.full_name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">← Back</button>
            <button onClick={() => setStep(5)} className="btn-primary flex-1">Review & Submit →</button>
          </div>
        </div>
      )}

      {/* STEP 5: Review */}
      {step === 5 && (
        <div className="glass-card p-5 space-y-4">
          <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'rgba(74,108,247,0.06)', borderColor: 'rgba(74,108,247,0.2)' }}>
            <p className="font-display font-bold text-sm" style={{ color: 'var(--brand)' }}>Submission Summary</p>
            {[
              ['Faculty', facultyObj?.full_name],
              ['Date', lectureDate],
              ['Subject', selectedSlot?.subjects?.subject_name || selectedSlot?.custom_subject || prefillRecord?.subjects?.subject_name || '—'],
              ['Division', selectedSlot?.divisions?.division_name || selectedSlot?.custom_division || prefillRecord?.divisions?.division_name || '—'],
              ['Time', selectedSlot ? `${formatTime(selectedSlot.time_slots?.start_time)} – ${formatTime(selectedSlot.time_slots?.end_time)}` : `${formatTime(prefillRecord?.actual_start)} – ${formatTime(prefillRecord?.actual_end)}`],
              ['Topic', form.topic_covered],
              ['Unit', form.unit_number || '—'],
              ['LCS', form.lcs_status.replace(/_/g, ' ')],
              ['Attendance', `${students.length > 0 ? presentCount : form.present_count} / ${students.length > 0 ? students.length : form.total_students}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b py-1.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#d97706' }} />
            <p style={{ color: '#d97706' }}>This record will be submitted on behalf of the faculty and will show as <strong>Pending</strong> for admin approval.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(4)} className="btn-secondary flex-1">← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
              {submitting ? 'Submitting…' : '✓ Submit DLR'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
