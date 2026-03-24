import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Clock, BookOpen, Users, FileText, Upload, CheckCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/ui'
import { DEMO_TIMETABLE, DEMO_SUBJECTS, DEMO_DIVISIONS, DEMO_ROOMS } from '../../lib/demoData'
import { getDayName, today, generateId } from '../../utils/helpers'
import { format } from 'date-fns'

const STEPS = ['Lecture Info', 'Attendance', 'Status', 'Review']

const StepIndicator = ({ current, steps }) => (
  <div className="flex items-center gap-0">
    {steps.map((s, i) => (
      <div key={s} className="flex items-center flex-1">
        <div className="flex flex-col items-center flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i < current ? 'bg-green-500 text-white' : i === current ? 'bg-brand-500 text-white scale-110 shadow-brand' : ''
          }`} style={i > current ? { background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' } : {}}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <p className="text-xs mt-1 font-medium hidden sm:block" style={{ color: i === current ? 'var(--brand)' : 'var(--text-secondary)', fontSize: '10px' }}>{s}</p>
        </div>
        {i < steps.length - 1 && (
          <div className="flex-1 h-0.5 mx-1 rounded-full" style={{ background: i < current ? 'rgba(63,185,80,0.5)' : 'rgba(255,255,255,0.08)' }} />
        )}
      </div>
    ))}
  </div>
)

const TimeInput = ({ label, value, onChange, required }) => (
  <div>
    <label className="form-label">{label}</label>
    <input
      type="time"
      className="input-field text-center text-lg font-display font-semibold"
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      style={{ letterSpacing: '0.05em' }}
    />
  </div>
)

export default function LectureSubmitPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const preselected = location.state?.entry

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const dayName = getDayName()
  const todaySchedule = DEMO_TIMETABLE.filter(t => t.day_of_week === dayName)

  const now = new Date()
  const nowStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const [form, setForm] = useState({
    timetable_entry: preselected || null,
    subject_id: preselected?.subject_id || '',
    division_id: preselected?.division_id || '',
    room_id: preselected?.room_id || '',
    lecture_date: today(),
    scheduled_start: preselected?.time_slots?.start_time?.substring(0,5) || '',
    scheduled_end: preselected?.time_slots?.end_time?.substring(0,5) || '',
    actual_start: preselected?.time_slots?.start_time?.substring(0,5) || nowStr,
    actual_end: nowStr,
    topic_covered: '',
    subtopics: '',
    unit_number: '',
    total_students: preselected?.divisions?.strength || 60,
    present_count: 0,
    lcs_status: 'covered',
    smartboard_pdf_uploaded: false,
    is_substitution: false,
    remarks: '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const selectedEntry = form.timetable_entry
  const selectedSubject = DEMO_SUBJECTS.find(s => s.id === form.subject_id)
  const selectedDivision = DEMO_DIVISIONS.find(d => d.id === form.division_id)
  const selectedRoom = DEMO_ROOMS.find(r => r.id === form.room_id)

  const canNext = () => {
    if (step === 0) return form.subject_id && form.division_id && form.topic_covered && form.actual_start && form.actual_end
    if (step === 1) return form.present_count !== undefined
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500)) // simulate network
    setSubmitting(false)
    setDone(true)
    toast.success('Lecture record submitted successfully!')
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(63,185,80,0.15)', border: '2px solid rgba(63,185,80,0.4)' }}>
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Submitted!</h2>
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{form.topic_covered}</p>
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          {selectedSubject?.subject_name} • {selectedDivision?.division_name}
        </p>
        <div className="w-full space-y-3">
          <button className="btn-primary w-full min-h-[52px]" onClick={() => { setDone(false); setStep(0); setForm(f => ({ ...f, topic_covered: '', actual_start: nowStr, actual_end: nowStr })) }}>
            Submit Another
          </button>
          <button className="btn-secondary w-full min-h-[52px]" onClick={() => navigate('/faculty')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)} className="flex items-center gap-1.5 mb-4" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{step === 0 ? 'Cancel' : 'Back'}</span>
        </button>
        <h1 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Submit Lecture Record</h1>
        <StepIndicator current={step} steps={STEPS} />
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 pt-4 pb-6 animate-fade-in space-y-4">

        {/* ── Step 0: Lecture Info ─────────────────────────────────── */}
        {step === 0 && (
          <>
            {/* Timetable quick-pick */}
            {todaySchedule.length > 0 && (
              <div>
                <label className="form-label">Quick Select from Today's Schedule</label>
                <div className="space-y-2">
                  {todaySchedule.map(entry => (
                    <button key={entry.id} onClick={() => {
                      set('timetable_entry', entry)
                      set('subject_id', entry.subject_id)
                      set('division_id', entry.division_id)
                      set('room_id', entry.room_id)
                      set('scheduled_start', entry.time_slots?.start_time?.substring(0,5) || '')
                      set('scheduled_end', entry.time_slots?.end_time?.substring(0,5) || '')
                      set('actual_start', entry.time_slots?.start_time?.substring(0,5) || '')
                      set('total_students', entry.divisions?.strength || 60)
                    }} className={`w-full text-left p-3 rounded-xl border transition-all ${form.subject_id === entry.subject_id && form.division_id === entry.division_id ? 'border-brand-500 bg-brand-500/10' : 'border-white/8'}`} style={form.subject_id !== entry.subject_id ? { background: 'rgba(255,255,255,0.04)' } : {}}>
                      <div className="flex items-center gap-3">
                        <div className="text-center w-12">
                          <p className="text-xs font-bold" style={{ color: 'var(--brand)' }}>{entry.time_slots?.start_time?.substring(0,5)}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{entry.time_slots?.end_time?.substring(0,5)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{entry.subjects?.subject_name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{entry.divisions?.division_name} • {entry.rooms?.room_number}</p>
                        </div>
                        {form.subject_id === entry.subject_id && form.division_id === entry.division_id && (
                          <CheckCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual subject selection */}
            <div>
              <label className="form-label">Subject *</label>
              <div className="relative">
                <select className="select-field" value={form.subject_id} onChange={e => set('subject_id', e.target.value)} required>
                  <option value="">Select Subject</option>
                  {DEMO_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.subject_code} — {s.subject_name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div>
              <label className="form-label">Division *</label>
              <div className="relative">
                <select className="select-field" value={form.division_id} onChange={e => { set('division_id', e.target.value); const d = DEMO_DIVISIONS.find(x => x.id === e.target.value); if (d) set('total_students', d.strength) }}>
                  <option value="">Select Division</option>
                  {DEMO_DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.division_name} ({d.strength} students)</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TimeInput label="Actual Start *" value={form.actual_start} onChange={v => set('actual_start', v)} required />
              <TimeInput label="Actual End *" value={form.actual_end} onChange={v => set('actual_end', v)} required />
            </div>

            <div>
              <label className="form-label">Topic Covered *</label>
              <textarea className="input-field resize-none" rows={3} placeholder="e.g., Introduction to AES Encryption Algorithm, Key scheduling…" value={form.topic_covered} onChange={e => set('topic_covered', e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Unit No.</label>
                <input type="number" className="input-field" placeholder="3" min={1} max={8} value={form.unit_number} onChange={e => set('unit_number', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Room</label>
                <div className="relative">
                  <select className="select-field" value={form.room_id} onChange={e => set('room_id', e.target.value)}>
                    <option value="">Select</option>
                    {DEMO_ROOMS.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 1: Attendance ───────────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="glass-card p-4">
              <p className="form-label mb-3">Quick Attendance Count</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="font-display font-bold text-3xl" style={{ color: 'var(--brand)' }}>{form.present_count}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Present</p>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-3xl" style={{ color: '#f85149' }}>{form.total_students - form.present_count}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Absent</p>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-3xl" style={{ color: '#3fb950' }}>
                    {form.total_students > 0 ? Math.round(form.present_count / form.total_students * 100) : 0}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rate</p>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="form-label mb-0">Present Students</label>
                  <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{form.present_count} / {form.total_students}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={form.total_students}
                  value={form.present_count}
                  onChange={e => set('present_count', Number(e.target.value))}
                  className="w-full accent-brand-500"
                  style={{ accentColor: '#4A6CF7' }}
                />
                <div className="flex gap-3 mt-3">
                  <div>
                    <label className="form-label">Present</label>
                    <input type="number" className="input-field text-center" min={0} max={form.total_students} value={form.present_count} onChange={e => set('present_count', Math.min(Number(e.target.value), form.total_students))} />
                  </div>
                  <div>
                    <label className="form-label">Total Strength</label>
                    <input type="number" className="input-field text-center" min={1} value={form.total_students} onChange={e => set('total_students', Number(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('/faculty/attendance', { state: { form } })} className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[52px]">
              <Users className="w-5 h-5" />
              Take Digital Roll Call (Optional)
            </button>
          </>
        )}

        {/* ── Step 2: Status ───────────────────────────────────────── */}
        {step === 2 && (
          <>
            <div>
              <label className="form-label">LCS (Lecture Content Sheet) Status</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'covered', label: 'Covered', color: '#3fb950' },
                  { val: 'partially_covered', label: 'Partial', color: '#d29922' },
                  { val: 'not_covered', label: 'Not Covered', color: '#f85149' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => set('lcs_status', opt.val)} className={`py-3 px-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${form.lcs_status === opt.val ? 'border-current' : 'border-white/10'}`} style={{ color: form.lcs_status === opt.val ? opt.color : 'var(--text-secondary)', background: form.lcs_status === opt.val ? `${opt.color}18` : 'rgba(255,255,255,0.03)' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Smartboard PDF</label>
              <button onClick={() => set('smartboard_pdf_uploaded', !form.smartboard_pdf_uploaded)} className={`w-full min-h-[60px] rounded-2xl flex items-center gap-4 px-5 border transition-all ${form.smartboard_pdf_uploaded ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 bg-white/3'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.smartboard_pdf_uploaded ? 'bg-green-500/20' : 'bg-white/8'}`}>
                  {form.smartboard_pdf_uploaded ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Upload className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm" style={{ color: form.smartboard_pdf_uploaded ? '#3fb950' : 'var(--text-primary)' }}>
                    {form.smartboard_pdf_uploaded ? 'PDF Uploaded ✓' : 'Mark as Uploaded'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tap to toggle status</p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex-1">
                <p className="font-semibold text-sm">Is this a substitution?</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Are you taking this in place of another faculty?</p>
              </div>
              <button onClick={() => set('is_substitution', !form.is_substitution)} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${form.is_substitution ? 'bg-brand-500' : 'bg-white/15'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${form.is_substitution ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div>
              <label className="form-label">Remarks (Optional)</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Any special notes for HOD / Admin..." value={form.remarks} onChange={e => set('remarks', e.target.value)} />
            </div>
          </>
        )}

        {/* ── Step 3: Review ───────────────────────────────────────── */}
        {step === 3 && (
          <>
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Review & Confirm</h3>

              {[
                { label: 'Subject', value: selectedSubject?.subject_name || '—' },
                { label: 'Division', value: selectedDivision?.division_name || '—' },
                { label: 'Date', value: form.lecture_date },
                { label: 'Actual Time', value: `${form.actual_start} → ${form.actual_end}` },
                { label: 'Topic', value: form.topic_covered },
                { label: 'Attendance', value: `${form.present_count} / ${form.total_students} (${form.total_students > 0 ? Math.round(form.present_count / form.total_students * 100) : 0}%)` },
                { label: 'LCS Status', value: form.lcs_status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
                { label: 'Smartboard PDF', value: form.smartboard_pdf_uploaded ? 'Uploaded ✓' : 'Not Uploaded' },
                { label: 'Substitution', value: form.is_substitution ? 'Yes' : 'No' },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-xs font-semibold w-28 flex-shrink-0 pt-0.5" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border" style={{ background: 'rgba(74,108,247,0.08)', borderColor: 'rgba(74,108,247,0.25)' }}>
              <p className="text-xs" style={{ color: 'rgba(74,108,247,0.9)' }}>
                By submitting, you confirm that the above information is accurate and complete. This record will be sent for admin/HOD review.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-4 pb-4 space-y-2">
        {step < 3 ? (
          <button disabled={!canNext()} onClick={() => setStep(s => s + 1)} className="btn-primary w-full min-h-[56px] text-base disabled:opacity-50">
            Continue →
          </button>
        ) : (
          <button disabled={submitting} onClick={handleSubmit} className="btn-success w-full min-h-[56px] text-base flex items-center justify-center gap-2">
            {submitting ? (
              <><span className="animate-spin">⟳</span> Submitting…</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Submit Record</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
