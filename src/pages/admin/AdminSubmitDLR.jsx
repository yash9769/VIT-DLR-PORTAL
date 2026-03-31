import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, UserCheck, Calendar, BookOpen, Users, Check, AlertCircle, Clock, User } from 'lucide-react'
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

  // Master data
  const [faculties, setFaculties] = useState([])
  const [timetable, setTimetable] = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Step control (1-5)
  const [step, setStep] = useState(prefillRecord ? 3 : 1)

  // Form state
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
    present_count: prefillRecord?.present_count ?? prefillRecord?.attendance ?? '',
    actual_start: prefillRecord?.actual_start || prefillRecord?.actual_from || '',
    actual_end: prefillRecord?.actual_end || prefillRecord?.actual_to || '',
  })

  // Fetch faculty list
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

  // Fetch timetable for selected faculty + date
  useEffect(() => {
    if (!selectedFaculty || !lectureDate) { setTimetable([]); return }
    const dayName = new Date(lectureDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    const fetchTimetable = async () => {
      const { data } = await supabase
        .from('timetable')
        .select(`
          *,
          subjects (id, subject_name, short_name),
          divisions (id, division_name, semester, strength),
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

  // Fetch students for roll call
  useEffect(() => {
    if (!selectedSlot) return
    
    // Support both theory and labs
    const batchNum = selectedSlot.batch_number || selectedSlot.batch_no || null
    const divisionId = selectedSlot.division_id
    if (!divisionId) return

    const fetchStudents = async () => {
      setStudentsLoading(true)
      try {
        let q = supabase
          .from('students')
          .select('id, roll_number, full_name, batch_number')
          .eq('division_id', divisionId)
          .order('roll_number')

        // Filter by batch ONLY if it's a valid batch number (1, 2, 3...)
        // Theory classes usually have batch 0 or null
        if (batchNum && batchNum > 0) {
          q = q.eq('batch_number', batchNum)
        }

        const { data: list, error } = await q
        if (error) throw error
        setStudents(list || [])

        // If editing, load existing attendance
        const recordId = prefillRecord?.id
        if (recordId) {
          const { data: existingAtt } = await supabase
            .from('attendance')
            .select('student_id, is_present')
            .eq('lecture_record_id', recordId)
          if (existingAtt?.length > 0) {
            const attMap = {}
            existingAtt.forEach(a => { attMap[a.student_id] = a.is_present })
            setAttendance(attMap)
            return
          }
        }

        const init = {}
        ;(list || []).forEach(s => { init[s.id] = true })
        setAttendance(init)
      } catch (err) {
        console.error('Error fetching students:', err)
        toast.error('Failed to load students')
      } finally {
        setStudentsLoading(false)
      }
    }

    fetchStudents()
  }, [selectedSlot, prefillRecord])

  const toggleAttendance = (id) => setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  const presentCountResult = Object.values(attendance).filter(Boolean).length

  const handleSubmit = async () => {
    if (!selectedSlot && !prefillRecord) { toast.error('Please select a lecture slot'); return }
    if (!form.topic_covered.trim()) { toast.error('Topic covered is required'); return }

    const payload = {
      faculty_id: selectedFaculty,
      lecture_date: lectureDate,
      timetable_id: selectedSlot?.id || prefillRecord?.timetable_id || null,
      division_id: selectedSlot?.division_id || prefillRecord?.division_id || null,
      subject_id: selectedSlot?.subject_id || prefillRecord?.subject_id || null,
      room_id: selectedSlot?.room_id || prefillRecord?.room_id || null,
      
      // Column Set 1
      scheduled_start: selectedSlot?.time_slots?.start_time || prefillRecord?.scheduled_start || null,
      scheduled_end: selectedSlot?.time_slots?.end_time || prefillRecord?.scheduled_end || null,
      actual_start: form.actual_start || null,
      actual_end: form.actual_end || null,
      
      // Column Set 2 (Redundant columns used by reporting services)
      timetable_from: selectedSlot?.time_slots?.start_time || prefillRecord?.timetable_from || prefillRecord?.scheduled_start || null,
      timetable_to: selectedSlot?.time_slots?.end_time || prefillRecord?.timetable_to || prefillRecord?.scheduled_end || null,
      actual_from: form.actual_start || null,
      actual_to: form.actual_end || null,

      topic_covered: form.topic_covered,
      subtopics: form.subtopics,
      unit_number: form.unit_number ? Number(form.unit_number) : null,
      lcs_status: form.lcs_status,
      smartboard_pdf_uploaded: form.smartboard_pdf_uploaded,
      remarks: form.remarks,
      
      total_students: students.length > 0 ? students.length : (Number(form.total_students) || 60),
      present_count: (students.length > 0) ? presentCountResult : (Number(form.present_count) || 0),
      
      // Legacy columns
      attendance: (students.length > 0) ? presentCountResult : (Number(form.present_count) || 0),
      total_batch_strength: students.length > 0 ? students.length : (Number(form.total_students) || 60),

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

      // Sync attendance table
      if (students.length > 0 && recordId) {
        await supabase.from('attendance').delete().eq('lecture_record_id', recordId)
        const attRows = students.map(s => ({
          lecture_record_id: recordId,
          student_id: s.id,
          is_present: attendance[s.id] ?? true,
        }))
        const { error: attErr } = await supabase.from('attendance').insert(attRows)
        if (attErr) console.error('Attendance sync error:', attErr)
      }

      toast.success(prefillRecord ? 'DLR updated' : 'DLR submitted (Admin Override)')
      navigate('/admin/records')
    } catch (err) {
      console.error(err)
      toast.error('Submission failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const facultyObj = faculties.find(f => f.id === selectedFaculty)
  const STEPS = ['Select Faculty', 'Select Slot', 'Details', 'Roll Call', 'Review']

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium opacity-60">Initializing admin submission...</p>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white border border-slate-200 hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            {prefillRecord ? 'Edit DLR' : 'Admin Override DLR'}
          </h1>
          <p className="text-sm text-slate-500">Submit lecture record for any faculty member</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="glass-card p-6 bg-white shadow-sm border-slate-100">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const num = i + 1
            const isDone = step > num
            const isActive = step === num
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center group relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative z-10 ${
                    isDone ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-brand text-white shadow-lg ring-4 ring-brand/10' : 
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-[10px] absolute mt-10 font-bold uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-brand' : isDone ? 'text-green-500' : 'text-slate-400 opacity-0 sm:opacity-100'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-[2px] transition-all duration-300 mx-2 ${isDone ? 'bg-green-500' : 'bg-slate-100'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        {/* STEP 1: Faculty Selection */}
        {step === 1 && (
          <div className="glass-card p-6 space-y-6 bg-white animate-slide-up">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-2">Faculty Member</label>
                <select className="input-field w-full" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}>
                  <option value="">Select Faculty...</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.full_name} ({f.department || 'General'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-2">Lecture Date</label>
                <input type="date" className="input-field w-full" value={lectureDate} onChange={e => setLectureDate(e.target.value)} max={today()} />
              </div>
            </div>
            
            {selectedFaculty && (
              <div className="p-4 rounded-xl flex items-center gap-3 border border-brand/20 bg-brand/5">
                <UserCheck className="w-5 h-5 text-brand" />
                <div>
                  <p className="text-sm font-bold text-brand">Admin Override Active</p>
                  <p className="text-xs text-brand/70 font-medium">Creating record for {facultyObj?.full_name}</p>
                </div>
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!selectedFaculty} className="btn-primary w-full py-4 text-base shadow-brand/20 shadow-xl">
              Continue to Slot Selection →
            </button>
          </div>
        )}

        {/* STEP 2: Slot Selection */}
        {step === 2 && (
          <div className="glass-card p-6 space-y-6 bg-white animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-800">Select Lecture Slot</h2>
                <p className="text-xs text-slate-500">{getDayName(new Date(lectureDate))} schedule</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest">{lectureDate}</span>
            </div>

            {timetable.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-10 text-slate-900" />
                <p className="text-slate-500 font-bold">No schedule found</p>
                <p className="text-xs text-slate-400 mt-1">Please ensure the timetable exists for this faculty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timetable.map(entry => {
                  const isSelected = selectedSlot?.id === entry.id
                  const isLab = !!(entry.batch_number || entry.batch_no)
                  return (
                    <button
                      key={entry.id}
                      onClick={() => {
                        setSelectedSlot(entry)
                        setForm(f => ({ 
                          ...f, 
                          actual_start: entry.time_slots?.start_time?.slice(0,5) || '',
                          actual_end: entry.time_slots?.end_time?.slice(0,5) || '',
                          total_students: entry.divisions?.strength || 60
                        }))
                      }}
                      className={`w-full group p-4 rounded-2xl border text-left transition-all ${
                        isSelected ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-brand/40 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${isSelected ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-slate-50 text-slate-400'}`}>
                          <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{entry.time_slots?.slot_label}</p>
                          <Clock className="w-4 h-4 mt-0.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold transition-colors ${isSelected ? 'text-brand' : 'text-slate-800'}`}>
                            {entry.subjects?.subject_name || entry.custom_subject || 'Subject'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">{entry.divisions?.division_name}</span>
                            <span className="text-[10px] font-bold text-slate-400 border-l border-slate-200 pl-2 uppercase">{entry.time_slots?.start_time.slice(0,5)} – {entry.time_slots?.end_time.slice(0,5)}</span>
                            {isLab && <span className="text-[10px] font-black text-brand bg-brand/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">Batch {entry.batch_number || entry.batch_no}</span>}
                          </div>
                        </div>
                        {isSelected && <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStep(1)} className="btn-secondary py-4 font-bold text-slate-600">← Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedSlot} className="btn-primary py-4 font-bold disabled:opacity-50">Next: Details →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Details */}
        {step === 3 && (
          <div className="glass-card p-6 space-y-6 bg-white animate-slide-up">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-2">Topic Covered *</label>
                <textarea className="input-field min-h-[100px] resize-none w-full" placeholder="What was covered in this lecture?" value={form.topic_covered} onChange={e => setForm(f => ({ ...f, topic_covered: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-2">Subtopics (Optional)</label>
                <input className="input-field w-full" placeholder="Recursion, Dynamic Programming..." value={form.subtopics} onChange={e => setForm(f => ({ ...f, subtopics: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-brand tracking-widest block mb-2">Actual Start</label>
                  <input type="time" className="input-field w-full font-bold text-lg" value={form.actual_start} onChange={e => setForm(f => ({ ...f, actual_start: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-brand tracking-widest block mb-2">Actual End</label>
                  <input type="time" className="input-field w-full font-bold text-lg" value={form.actual_end} onChange={e => setForm(f => ({ ...f, actual_end: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-2">Unit Number</label>
                  <input type="number" className="input-field w-full" placeholder="Unit 1-6" value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-2">LCS Status</label>
                  <select className="input-field w-full" value={form.lcs_status} onChange={e => setForm(f => ({ ...f, lcs_status: e.target.value }))}>
                    {LCS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={() => setStep(2)} className="btn-secondary py-4 font-bold">Back</button>
              <button onClick={() => setStep(4)} disabled={!form.topic_covered} className="btn-primary py-4 font-bold disabled:opacity-50">Next: Roll Call →</button>
            </div>
          </div>
        )}

        {/* STEP 4: Roll Call */}
        {step === 4 && (
          <div className="glass-card p-6 space-y-6 bg-white animate-slide-up">
            <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-slate-800">Roll Call Selection</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { const all={}; students.forEach(s=>all[s.id]=true); setAttendance(all) }} className="text-[10px] font-black uppercase px-2 py-1 rounded bg-green-50 text-green-600 border border-green-200 hover:bg-green-100">All Present</button>
                <button onClick={() => { const all={}; students.forEach(s=>all[s.id]=false); setAttendance(all) }} className="text-[10px] font-black uppercase px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">All Absent</button>
              </div>
            </div>

            {studentsLoading ? (
              <div className="text-center py-12 animate-pulse">
                <Users className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">Fetching student registry...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
                <p className="text-sm text-amber-800 font-bold">No Students Synced</p>
                <p className="text-xs text-amber-600 mb-6">Students may not be mapped to this division/batch.</p>
                
                <div className="space-y-4 max-w-xs mx-auto text-left">
                  <div>
                    <label className="text-[10px] font-black uppercase text-amber-700 tracking-widest block mb-2">Manual Present Count</label>
                    <input type="number" className="input-field w-full text-center font-bold text-xl bg-white border-amber-200 focus:border-amber-500" value={form.present_count} onChange={e=>setForm(f=>({...f, present_count: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-amber-700 tracking-widest block mb-2">Manual Total Count</label>
                    <input type="number" className="input-field w-full text-center font-bold text-xl bg-white border-amber-200 focus:border-amber-500" value={form.total_students} onChange={e=>setForm(f=>({...f, total_students: e.target.value}))} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {students.map(s => {
                  const isPresent = attendance[s.id] ?? true
                  return (
                    <button key={s.id} onClick={() => toggleAttendance(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${
                        isPresent ? 'border-green-100 bg-green-50/20 hover:border-green-300' : 'border-slate-100 bg-white hover:border-red-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black shadow-sm transition-all ${
                        isPresent ? 'bg-green-500 text-white translate-x-0' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isPresent ? 'P' : 'A'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono font-bold text-slate-400 leading-none mb-1 uppercase tracking-tighter">{s.roll_number}</p>
                        <p className="text-xs font-bold text-slate-700 truncate leading-none">{s.full_name}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <button onClick={() => setStep(3)} className="btn-secondary py-4 font-bold">Back</button>
              <button onClick={() => setStep(5)} className="btn-primary py-4 font-bold">Review & Finish →</button>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review */}
        {step === 5 && (
          <div className="glass-card p-6 space-y-6 bg-white animate-slide-up">
            <h3 className="font-display font-bold text-xl text-slate-900">Final Confirmation</h3>
            
            <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
              {[
                { l: 'Faculty', v: facultyObj?.full_name, icon: User },
                { l: 'Date', v: lectureDate, icon: Calendar },
                { l: 'Subject', v: selectedSlot?.subjects?.subject_name || selectedSlot?.custom_subject || prefillRecord?.subjects?.subject_name, icon: BookOpen },
                { l: 'Division', v: selectedSlot?.divisions?.division_name || prefillRecord?.divisions?.division_name, icon: Users },
                { l: 'Time', v: `${form.actual_start} to ${form.actual_end}`, icon: Clock },
                { l: 'Attendance', v: `${students.length > 0 ? presentCountResult : form.present_count} / ${students.length > 0 ? students.length : form.total_students} students`, icon: Check },
              ].map(item => (
                <div key={item.l} className="flex items-center justify-between p-4 border-b border-slate-200 last:border-0 hover:bg-white group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.l}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{item.v || '—'}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl flex items-start gap-4 border border-amber-200 bg-amber-50">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-amber-800 font-bold leading-relaxed">
                ADMIN PRIVILEGE: <span className="font-medium text-amber-700">This submission bypasses faculty locks and will be recorded as a direct administrative entry.</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStep(4)} className="btn-secondary py-4 font-bold">Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-success py-4 text-base font-black shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50">
                {submitting ? 'PROCESSING...' : 'CONFIRM & SUBMIT ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
