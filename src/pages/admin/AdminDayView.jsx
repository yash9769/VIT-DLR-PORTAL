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
    is_substitution: false
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
          faculty:users!faculty_id(*),
          divisions:divisions!division_id(*),
          subjects:subjects!subject_id(*),
          rooms:rooms!room_id(*),
          time_slots:time_slots!time_slot_id(*)
        `)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
      
      if (ttError) throw ttError

      // Fetch existing records for this date
      const { data: recordData, error: recError } = await supabase
        .from('lecture_records')
        .select('*')
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
      is_substitution: false
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
        actual_end: form.actual_end,
        actual_faculty_id: form.actual_faculty_id || submitModal.faculty_id,
        
        topic_covered: form.topic_covered,
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
                        <div className="font-medium whitespace-nowrap max-w-[200px] truncate">{entry.subjects?.subject_name || entry.custom_subject}</div>
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
        <Modal open={true} onClose={() => setSubmitModal(null)} title="Admin DLR Override Submission">
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
              <p className="text-sm font-bold text-brand-300">{submitModal.faculty?.full_name || submitModal.custom_faculty}</p>
              <p className="text-xs opacity-80">{submitModal.subjects?.subject_name || submitModal.custom_subject} · {submitModal.divisions?.division_name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Actual Start</label>
                <input type="time" className="input-field" value={form.actual_start} onChange={e=>setForm(f=>({...f, actual_start: e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Actual End</label>
                <input type="time" className="input-field" value={form.actual_end} onChange={e=>setForm(f=>({...f, actual_end: e.target.value}))}/>
              </div>
            </div>

            <div>
              <label className="form-label">Topic Covered</label>
              <input type="text" className="input-field" value={form.topic_covered} onChange={e=>setForm(f=>({...f, topic_covered: e.target.value}))}/>
            </div>

            {/* Attendance Section */}
            <div className="border-t border-white/5 pt-4">
              <label className="form-label mb-2 block">Attendance</label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="glass-card p-3">
                  <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Total</p>
                  <input type="number" className="bg-transparent border-none w-full font-bold text-lg outline-none" 
                    value={form.total_batch_strength} onChange={e=>setForm(f=>({...f, total_batch_strength: e.target.value}))} />
                </div>
                <div className="glass-card p-3 border-brand-500/30">
                  <p className="text-[10px] font-bold text-brand-400 uppercase mb-1">Present Count</p>
                  <input type="number" className="bg-transparent border-none w-full font-bold text-lg outline-none text-brand-400" 
                    value={form.attendance} onChange={e=>setForm(f=>({...f, attendance: e.target.value}))} />
                </div>
              </div>

              {studentsLoading ? (
                <p className="text-xs opacity-50 text-center py-4">Loading student list...</p>
              ) : students.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => { const next={}; students.forEach(s=>next[s.id]=true); setAttendance(next) }} className="flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Check All</button>
                    <button onClick={() => { const next={}; students.forEach(s=>next[s.id]=false); setAttendance(next) }} className="flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">Uncheck All</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {students.map(s => {
                      const present = attendance[s.id] !== false
                      return (
                        <button key={s.id} onClick={() => setAttendance(prev=>({...prev, [s.id]: !prev[s.id]}))}
                          className={`p-2 rounded-lg text-left transition-all text-[10px] border ${present ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                          <p className="font-bold opacity-70 mb-0.5">{s.roll_number}</p>
                          <p className="font-medium truncate">{s.full_name.split(' ')[0]}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Systems Section */}
            <div className="border-t border-white/5 pt-4">
              <label className="form-label mb-2 block">Classroom & Systems</label>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl cursor-pointer border transition-all ${form.lecture_capture_done ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}
                  onClick={() => setForm(f=>({...f, lecture_capture_done: !f.lecture_capture_done}))}>
                  <p className="text-[10px] font-bold uppercase opacity-50 mb-1 text-white">LCS Success</p>
                  <p className="text-xs font-bold text-white">{form.lecture_capture_done ? 'DONE ✓' : 'NO'}</p>
                </div>
                <div className={`p-3 rounded-xl cursor-pointer border transition-all ${form.smart_board_uploaded ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}
                  onClick={() => setForm(f=>({...f, smart_board_uploaded: !f.smart_board_uploaded}))}>
                  <p className="text-[10px] font-bold uppercase opacity-50 mb-1 text-white">VREFER Upload</p>
                  <p className="text-xs font-bold text-white">{form.smart_board_uploaded ? 'DONE ✓' : 'NO'}</p>
                </div>
              </div>
            </div>

            {/* Assignments Section */}
            <div className="border-t border-white/5 pt-4 grid grid-cols-3 gap-3">
              <div className="glass-card p-3">
                <p className="text-[9px] font-bold text-white/50 uppercase mb-1 leading-tight">Collected (Prev)</p>
                <input type="number" className="bg-transparent border-none w-full font-bold text-sm outline-none text-white" 
                  value={form.assignments_last_week} onChange={e=>setForm(f=>({...f, assignments_last_week: e.target.value}))} />
              </div>
              <div className="glass-card p-3">
                <p className="text-[9px] font-bold text-white/50 uppercase mb-1 leading-tight">Given (New)</p>
                <input type="number" className="bg-transparent border-none w-full font-bold text-sm outline-none text-white" 
                  value={form.assignments_given} onChange={e=>setForm(f=>({...f, assignments_given: e.target.value}))} />
              </div>
              <div className="glass-card p-3">
                <p className="text-[9px] font-bold text-white/50 uppercase mb-1 leading-tight">Graded</p>
                <input type="number" className="bg-transparent border-none w-full font-bold text-sm outline-none text-white" 
                  value={form.assignments_graded} onChange={e=>setForm(f=>({...f, assignments_graded: e.target.value}))} />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <label className="form-label">Admin Remarks</label>
              <textarea className="input-field min-h-[60px] text-sm resize-none" value={form.remarks} onChange={e=>setForm(f=>({...f, remarks: e.target.value}))}/>
            </div>

            <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-[#0a0c10] py-4 border-t border-white/5">
              <button className="btn-secondary" onClick={()=>setSubmitModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>Force Submit DLR</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
