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
  
  const [form, setForm] = useState({
    actual_start: '',
    actual_end: '',
    topic_covered: '',
    total_students: 60,
    present_count: 60,
    lcs_status: 'covered',
    remarks: 'Submitted by Admin'
  })

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

  const handleOpenSubmit = (entry) => {
    setForm({
      actual_start: entry.time_slots?.start_time || '09:00',
      actual_end: entry.time_slots?.end_time || '10:00',
      topic_covered: 'Admin Override Submission',
      total_students: entry.divisions?.strength || 60,
      present_count: entry.divisions?.strength || 60,
      lcs_status: 'covered',
      remarks: 'Submitted by Admin'
    })
    setSubmitModal(entry)
  }

  const handleSubmit = async () => {
    if (!form.topic_covered) return toast.error('Topic is required')
    
    try {
      const payload = {
        lecture_date: selectedDate,
        timetable_id: submitModal.id,
        faculty_id: submitModal.faculty_id,
        division_id: submitModal.division_id,
        custom_division: submitModal.custom_division,
        subject_id: submitModal.subject_id,
        custom_subject: submitModal.custom_subject,
        room_id: submitModal.room_id,
        custom_room: submitModal.custom_room,
        custom_time_slot: submitModal.custom_time_slot,
        scheduled_start: submitModal.time_slots?.start_time || null,
        scheduled_end: submitModal.time_slots?.end_time || null,
        actual_start: form.actual_start,
        actual_end: form.actual_end,
        topic_covered: form.topic_covered,
        total_students: Number(form.total_students),
        present_count: Number(form.present_count),
        absent_count: Number(form.total_students) - Number(form.present_count),
        lcs_status: form.lcs_status,
        remarks: form.remarks,
        approval_status: 'approved', // Auto approve since it's admin
      }

      const { error } = await supabase.from('lecture_records').insert([payload])
      if (error) throw error

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
          <div className="space-y-4">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
              <p className="text-sm font-bold text-brand-300">{submitModal.faculty?.full_name || submitModal.custom_faculty}</p>
              <p className="text-xs opacity-80">{submitModal.subjects?.subject_name || submitModal.custom_subject}</p>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Total Students</label>
                <input type="number" className="input-field" value={form.total_students} onChange={e=>setForm(f=>({...f, total_students: e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Present Count</label>
                <input type="number" className="input-field" value={form.present_count} onChange={e=>setForm(f=>({...f, present_count: e.target.value}))}/>
              </div>
            </div>

            <div>
              <label className="form-label">LCS Status</label>
              <select className="select-field" value={form.lcs_status} onChange={e=>setForm(f=>({...f, lcs_status: e.target.value}))}>
                <option value="covered">Covered</option>
                <option value="partially_covered">Partially Covered</option>
                <option value="not_covered">Not Covered</option>
              </select>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button className="btn-secondary" onClick={()=>setSubmitModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>Force Submit DLR</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
