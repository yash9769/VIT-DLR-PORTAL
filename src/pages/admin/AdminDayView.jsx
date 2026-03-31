import { useState, useEffect } from 'react'
import { Calendar, Search, FileText, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast, ConfirmDialog, Modal } from '../../components/ui'
import { today, getDayName, formatTime } from '../../utils/helpers'

export default function AdminDayView() {
  const [selectedDate, setSelectedDate] = useState(today())
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitModal, setSubmitModal] = useState(null)
  
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [studentsLoading, setStudentsLoading] = useState(false)
  
  const [form, setForm] = useState({
    actual_start: '',
    actual_end: '',
    topic_covered: '',
    total_batch_strength: 60,
    attendance: 60,
    lecture_capture_done: false,
    smart_board_uploaded: false,
    assignments_last_week: 0,
    assignments_given: 0,
    assignments_graded: 0,
    remarks: 'Submitted by Admin',
    actual_faculty_id: '',
    is_substitution: false,
    unit_number: '',
    subtopics: ''
  })

  // Sync present count with attendance toggles
  useEffect(() => {
    if (students.length === 0) return
    const presentCount = Object.values(attendance).filter(Boolean).length
    setForm(f => ({ ...f, attendance: presentCount, total_batch_strength: students.length }))
  }, [attendance])

  useEffect(() => {
    fetchDayData()
  }, [selectedDate])

  const fetchDayData = async () => {
    setLoading(true)
    try {
      const d = new Date(selectedDate)
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' })

      // Fetch timetable for this day
       const { data: ttData, error: ttError } = await supabase
        .from('timetable')
        .select(`
          *,
          faculty:users!faculty_id(id, full_name, initials),
          divisions:divisions!division_id(id, division_name, strength),
          subjects:subjects!subject_id(id, subject_name, short_name),
          rooms:rooms!room_id(id, room_number),
          time_slots:time_slots!time_slot_id(id, slot_label, start_time, end_time)
        `)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
      
      if (ttError) throw ttError

      // Fetch existing records for this date
      const { data: recordData, error: recError } = await supabase
        .from('lecture_records')
        .select('id, timetable_id, faculty_id, approval_status, lecture_date')
        .eq('lecture_date', selectedDate)

      if (recError) throw recError

      const recordsMap = recordData.reduce((acc, r) => {
        acc[r.timetable_id] = r
        return acc
      }, {})

      const merged = (ttData || []).map(t => ({
        ...t,
        record: recordsMap[t.id] || null
      }))

      // Sort by time
      merged.sort((a,b) => (a.time_slots?.start_time || '').localeCompare(b.time_slots?.start_time || ''))

      setSchedule(merged)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch schedule for today')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenSubmit = async (entry) => {
    const defaultData = {
      actual_start: entry.time_slots?.start_time || '09:00',
      actual_end: entry.time_slots?.end_time || '10:00',
      topic_covered: 'Admin Override Submission',
      total_batch_strength: entry.divisions?.strength || 60,
      attendance: entry.divisions?.strength || 60,
      lecture_capture_done: true,
      smart_board_uploaded: true,
      assignments_last_week: 0,
      assignments_given: 0,
      assignments_graded: 0,
      remarks: 'Submitted by Admin',
      actual_faculty_id: entry.faculty_id || '',
      is_substitution: false,
      unit_number: '',
      subtopics: ''
    }
    setForm(defaultData)
    setSubmitModal(entry)
    
    // Fetch students for this division/batch
    if (entry.division_id) {
      setStudentsLoading(true)
      try {
        const batchNum = entry.batch_number ?? null
        let q = supabase
          .from('students')
          .select('id, roll_number, full_name, batch_number')
          .eq('division_id', entry.division_id)
          .order('roll_number')
        if (batchNum) q = q.eq('batch_number', batchNum)
        
        const { data } = await q
        const list = data || []
        setStudents(list)
        const init = {}
        list.forEach(s => { init[s.id] = true })
        setAttendance(init)
        if (list.length > 0) {
          setForm(f => ({ ...f, total_batch_strength: list.length, attendance: list.length }))
        }
      } catch (err) {
        console.error('Error fetching students:', err)
      } finally {
        setStudentsLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (!form.topic_covered) return toast.error('Topic is required')
    
    try {
      const payload = {
        lecture_date: selectedDate,
        timetable_id: submitModal.id,
        faculty_id: submitModal.faculty_id,
        division_id: submitModal.division_id,
        subject_id: submitModal.subject_id,
        room_id: submitModal.room_id,
        
        timetable_from: submitModal.time_slots?.start_time || null,
        timetable_to: submitModal.time_slots?.end_time || null,
        actual_from: form.actual_start,
        actual_to: form.actual_end,
        actual_faculty_id: form.actual_faculty_id || submitModal.faculty_id,
        
        unit_number: form.unit_number ? Number(form.unit_number) : null,
        subtopics: form.subtopics || null,
        topic_covered: form.subtopics || form.topic_covered,
        attendance: Number(form.attendance),
        total_batch_strength: Number(form.total_batch_strength),
        
        lecture_capture_done: form.lecture_capture_done,
        smart_board_uploaded: form.smart_board_uploaded,
        
        assignments_last_week: Number(form.assignments_last_week),
        assignments_given: Number(form.assignments_given),
        assignments_graded: Number(form.assignments_graded),
        
        remarks: form.remarks,
        is_substitution: form.is_substitution,
        approval_status: 'approved',
        submitted_at: new Date().toISOString()
      }

      const { data: record, error } = await supabase.from('lecture_records').insert([payload]).select().single()
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

      toast.success('DLR Submitted directly by Admin')
      setSubmitModal(null)
      fetchDayData()
    } catch(err) {
      console.error(err)
      toast.error('Failed to submit DLR')
    }
  }

  const filtered = schedule.filter(s => {
    const term = searchTerm.toLowerCase()
    const fac = (s.faculty?.full_name || s.custom_faculty || '').toLowerCase()
    const sub = (s.subjects?.subject_name || s.custom_subject || '').toLowerCase()
    const div = (s.divisions?.division_name || s.custom_division || '').toLowerCase()
    return fac.includes(term) || sub.includes(term) || div.includes(term)
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Day View (DLR Submission)</h1>
          <p className="opacity-70 mt-1">View all scheduled lectures for a specific date and manually submit DLRs if required.</p>
        </div>
        <div className="flex items-center gap-4">
          <input type="date" className="input-field" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </div>

      <div className="glass-card shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search faculty, subject, division..." className="input-field w-full pl-9" 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm font-semibold opacity-70">
            {filtered.length} slots found
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center opacity-50">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No timetable entries found for this day.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100/10">
                  <th className="pb-3 px-4 font-medium">Time / Room</th>
                  <th className="pb-3 px-4 font-medium">Faculty</th>
                  <th className="pb-3 px-4 font-medium">Subject</th>
                  <th className="pb-3 px-4 font-medium">Division</th>
                  <th className="pb-3 px-4 font-medium text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {filtered.map(entry => {
                  const hasRecord = !!entry.record
                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-brand-300 relative inline-flex items-center gap-1.5 whitespace-nowrap">
                          {entry.time_slots ? <>{formatTime(entry.time_slots.start_time)} - {formatTime(entry.time_slots.end_time)}</> : entry.custom_time_slot}
                        </div>
                        <div className="text-xs opacity-60 mt-0.5 whitespace-nowrap">
                          {entry.rooms?.room_number || entry.custom_room || 'TBD'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium whitespace-nowrap">{entry.faculty?.full_name || entry.custom_faculty}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium whitespace-nowrap max-w-[200px] truncate">{entry.custom_subject || entry.subjects?.short_name || entry.subjects?.subject_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium whitespace-nowrap">
                          {entry.divisions?.division_name || entry.custom_division}
                          {entry.batch_number && <span className="ml-1 opacity-60">(B{entry.batch_number})</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {hasRecord ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400">
                            <CheckCircle className="w-3.5 h-3.5" /> Submitted ({entry.record.approval_status})
                          </div>
                        ) : (
                          <button onClick={() => handleOpenSubmit(entry)} className="btn-primary py-1 px-3 text-xs w-auto whitespace-nowrap">
                            Submit DLR
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {submitModal && (
        <Modal open={true} onClose={() => setSubmitModal(null)} title="Admin DLR Override Submission" size="lg">
          <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar p-2">
            {/* Header Info */}
            <div className="p-5 rounded-2xl border flex flex-col gap-1" style={{ background: 'linear-gradient(135deg, rgba(74,108,247,0.08), rgba(74,108,247,0.02))', borderColor: 'rgba(74,108,247,0.1)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Direct Admin Submission</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/20 font-bold">OVERRIDE MODE</span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-slate-900">{submitModal.subjects?.subject_name || submitModal.custom_subject}</h2>
              <p className="text-sm text-slate-500 font-medium">{submitModal.faculty?.full_name || submitModal.custom_faculty} · {submitModal.divisions?.division_name} {submitModal.batch_number ? `(Batch ${submitModal.batch_number})` : ''}</p>
            </div>
            
            {/* Topic & Time Section */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Section 1: Academic Details</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label mb-1.5">Unit Number</label>
                  <input type="number" className="input-field" placeholder="e.g. 1" 
                         value={form.unit_number} onChange={e=>setForm(f=>({...f, unit_number: e.target.value}))}/>
                </div>
                <div>
                  <label className="form-label mb-1.5">Subtopics</label>
                  <input type="text" className="input-field" placeholder="e.g. Hooks, Props"
                         value={form.subtopics} onChange={e=>setForm(f=>({...f, subtopics: e.target.value}))}/>
                </div>
              </div>

              <div>
                <label className="form-label mb-1.5">Topic Covered (Main)</label>
                <input type="text" className="input-field" value={form.topic_covered} 
                       placeholder="Summary of lecture topic"
                       onChange={e=>setForm(f=>({...f, topic_covered: e.target.value}))}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label mb-1.5">Actual Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input type="time" className="input-field pl-10" value={form.actual_start} 
                           onChange={e=>setForm(f=>({...f, actual_start: e.target.value}))}/>
                  </div>
                </div>
                <div>
                  <label className="form-label mb-1.5">Actual End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input type="time" className="input-field pl-10" value={form.actual_end} 
                           onChange={e=>setForm(f=>({...f, actual_end: e.target.value}))}/>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Section 2: Attendance & Batch</p>
                <span className="text-[10px] font-semibold text-slate-400">Manual Attendance Mode</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Batch Total</p>
                  <input type="number" className="bg-transparent border-none w-full font-bold text-2xl outline-none text-slate-900" 
                    value={form.total_batch_strength} onChange={e=>setForm(f=>({...f, total_batch_strength: e.target.value}))} />
                </div>
                <div className="p-4 rounded-xl border border-brand-100 bg-brand-50/30">
                  <p className="text-[10px] font-bold text-brand-500 uppercase mb-2">Present Count</p>
                  <input type="number" className="bg-transparent border-none w-full font-bold text-2xl outline-none text-brand-600" 
                    value={form.attendance} onChange={e=>setForm(f=>({...f, attendance: e.target.value}))} />
                </div>
              </div>

              {studentsLoading ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading student list...</p>
                </div>
              ) : students.length > 0 && (
                <div className="space-y-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Roll Call Quick-Select</p>
                    <div className="flex gap-2">
                       <button onClick={() => { const next={}; students.forEach(s=>next[s.id]=true); setAttendance(next) }} 
                               className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase border border-green-500/20 hover:bg-green-500/20 transition-colors">All P</button>
                       <button onClick={() => { const next={}; students.forEach(s=>next[s.id]=false); setAttendance(next) }} 
                               className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase border border-red-500/20 hover:bg-red-500/20 transition-colors">All A</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {students.map(s => {
                      const present = attendance[s.id] !== false
                      return (
                        <button key={s.id} onClick={() => setAttendance(prev=>({...prev, [s.id]: !prev[s.id]}))}
                          className={`p-2 rounded-lg text-left transition-all text-[10px] border ${present ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                          <p className="opacity-70 mb-0.5">{s.roll_number}</p>
                          <p className="truncate">{s.full_name.split(' ')[0]}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Systems & Assignments Section */}
            <div className="space-y-6 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Section 3: Systems & Reporting</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1 ${form.lecture_capture_done ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'}`}
                  onClick={() => setForm(f=>({...f, lecture_capture_done: !f.lecture_capture_done}))}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lecture Capture</p>
                  <p className={`text-xs font-bold ${form.lecture_capture_done ? 'text-green-600' : 'text-slate-500'}`}>{form.lecture_capture_done ? 'DONE ✓' : 'NOT COVERED'}</p>
                </div>
                <div className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1 ${form.smart_board_uploaded ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'}`}
                  onClick={() => setForm(f=>({...f, smart_board_uploaded: !f.smart_board_uploaded}))}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">VREFER Upload</p>
                  <p className={`text-xs font-bold ${form.smart_board_uploaded ? 'text-green-600' : 'text-slate-500'}`}>{form.smart_board_uploaded ? 'UPLOADED ✓' : 'PENDING'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Prev Collect</p>
                  <input type="number" className="bg-transparent border-none w-full font-bold text-xl outline-none text-slate-900" 
                    value={form.assignments_last_week} onChange={e=>setForm(f=>({...f, assignments_last_week: e.target.value}))} />
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">New Given</p>
                  <input type="number" className="bg-transparent border-none w-full font-bold text-xl outline-none text-slate-900" 
                    value={form.assignments_given} onChange={e=>setForm(f=>({...f, assignments_given: e.target.value}))} />
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Graded</p>
                  <input type="number" className="bg-transparent border-none w-full font-bold text-xl outline-none text-slate-900" 
                    value={form.assignments_graded} onChange={e=>setForm(f=>({...f, assignments_graded: e.target.value}))} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Section 4: Remarks</p>
              <textarea className="input-field min-h-[100px] text-sm resize-none" 
                        value={form.remarks} onChange={e=>setForm(f=>({...f, remarks: e.target.value}))}
                        placeholder="State reason for manual admin submission..." />
            </div>

            <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-md pb-2 border-t border-slate-100">
              <button className="btn-secondary px-6" onClick={()=>setSubmitModal(null)}>Cancel</button>
              <button className="btn-primary px-8 shadow-lg shadow-brand-500/10" onClick={handleSubmit}>Force Submit DLR</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
