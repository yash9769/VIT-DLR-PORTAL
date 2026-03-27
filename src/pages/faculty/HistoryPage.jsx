import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Filter, FileText, Clock, Users, ChevronLeft, Edit2, Check, X, AlertCircle, Save, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, attendancePercent } from '../../utils/helpers'
import { StatusBadge, toast } from '../../components/ui'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected']

const LCS_OPTIONS = [
  { value: 'covered', label: 'Covered', color: '#3fb950' },
  { value: 'partially_covered', label: 'Partially Covered', color: '#d29922' },
  { value: 'not_covered', label: 'Not Covered', color: '#f85149' },
]

export default function HistoryPage() {
  const { profile } = useAuth()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [lockedDates, setLockedDates] = useState([])

  useEffect(() => {
    if (profile?.id) {
      fetchHistory()
    }
  }, [profile?.id])

  // Handle auto-edit from navigation state
  useEffect(() => {
    if (!loading && records.length > 0 && location.state?.autoEditId) {
      const recordToEdit = records.find(r => r.id === location.state.autoEditId)
      if (recordToEdit) {
        setSelected(recordToEdit)
        startEdit(recordToEdit)
      }
    }
  }, [loading, records, location.state])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      
      // Fetch locked dates
      const { data: locks } = await supabase.from('locked_dates').select('locked_date')
      if (locks) setLockedDates(locks.map(l => l.locked_date))

      const { data, error } = await supabase
        .from('lecture_records')
        .select('*, subjects(*), divisions(*), rooms:room_id(*), attendance(student_id, is_present, students(full_name, roll_number))')
        .eq('faculty_id', profile.id)
        .order('lecture_date', { ascending: false })
      
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(r =>
    filter === 'All' ? true : r.approval_status === filter.toLowerCase()
  )

  const handleSelect = (r) => {
    setSelected(r)
    setEditing(false)
    setEditForm({})
  }

  const startEdit = (rec = selected) => {
    if (!rec) return
    // Initialize attendance from the fetched record
    const att = {}
    if (rec.attendance) {
      rec.attendance.forEach(a => {
        att[a.student_id] = a.is_present
      })
    }

    setEditForm({
      topic_covered: rec.topic_covered,
      subtopics: rec.subtopics || '',
      unit_number: rec.unit_number || '',
      remarks: rec.remarks || '',
      lcs_status: rec.lcs_status,
      smartboard_pdf_uploaded: rec.smartboard_pdf_uploaded,
      actual_from: rec.actual_from || rec.actual_start || '',
      actual_to: rec.actual_to || rec.actual_end || '',
      timetable_from: rec.timetable_from || rec.scheduled_start || '',
      timetable_to: rec.timetable_to || rec.scheduled_end || '',
      timetable_faculty: rec.timetable_faculty || profile.full_name,
      timetable_subject: rec.timetable_subject || rec.subjects?.subject_name || '',
      timetable_division: rec.timetable_division || rec.divisions?.division_name || '',
      lecture_date: rec.lecture_date,
      present_count: rec.present_count,
      total_students: rec.total_students,
      attendanceDetails: att,
    })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!editForm.topic_covered || editForm.topic_covered.length < 5) {
      toast.error('Topic must be at least 5 characters')
      return
    }
    try {
      setSaving(true)
      const { attendanceDetails, ...rest } = editForm
      
      // Sanitize times to prevent empty string errors in Postgres TIME columns
      const sanitized = { ...rest }
      if (sanitized.actual_from === '') sanitized.actual_from = null
      if (sanitized.actual_to === '') sanitized.actual_to = null
      if (sanitized.timetable_from === '') sanitized.timetable_from = null
      if (sanitized.timetable_to === '') sanitized.timetable_to = null

      const { error } = await supabase
        .from('lecture_records')
        .update({
          ...sanitized,
          present_count: Number(editForm.present_count),
          total_students: Number(editForm.total_students),
          absent_count: Number(editForm.total_students) - Number(editForm.present_count),
          approval_status: 'pending', // re-submit for review
          rejection_reason: null,
          approved_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selected.id)
        .eq('faculty_id', profile.id)

      if (error) throw error

      // Update attendance records if we have details
      if (attendanceDetails && Object.keys(attendanceDetails).length > 0) {
        // Delete old attendance
        await supabase.from('attendance').delete().eq('lecture_record_id', selected.id)
        
        // Insert new ones
        const newAtt = Object.entries(attendanceDetails).map(([sid, present]) => ({
          lecture_record_id: selected.id,
          student_id: sid,
          is_present: present
        }))
        await supabase.from('attendance').insert(newAtt)
      }

      toast.success(selected.approval_status === 'approved' ? 'Record updated and resubmitted' : 'Record resubmitted for review!')
      await fetchHistory()
      
      setEditing(false)
      setSelected(null) // Return to list to refresh data properly
    } catch (error) {
      console.error(error)
      toast.error('Failed to update record')
    } finally {
      setSaving(false)
    }
  }

  const toggleStudent = (id) => {
    const next = { ...editForm.attendanceDetails, [id]: !editForm.attendanceDetails[id] }
    const presentCount = Object.values(next).filter(Boolean).length
    setEditForm(prev => ({
      ...prev,
      attendanceDetails: next,
      present_count: presentCount
    }))
  }

  const markAll = (present) => {
    const next = {}
    Object.keys(editForm.attendanceDetails).forEach(id => { next[id] = present })
    setEditForm(prev => ({
      ...prev,
      attendanceDetails: next,
      present_count: present ? prev.total_students : 0
    }))
  }

  const ef = (key, val) => setEditForm(f => ({ ...f, [key]: val }))

  if (selected) {
    const r = selected
    return (
      <div className="px-4 pt-5 pb-24 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { setSelected(null); setEditing(false) }} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft className="w-4 h-4" /> Back to History
          </button>
          {!lockedDates.includes(r.lecture_date) && !editing && (
            <button onClick={startEdit} className="flex items-center gap-2 text-sm btn-secondary py-1.5 px-3">
              <Edit2 className="w-3.5 h-3.5" /> {r.approval_status === 'approved' ? 'Edit Record' : 'Edit & Resubmit'}
            </button>
          )}
          {lockedDates.includes(r.lecture_date) && !editing && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149', border: '1px solid rgba(248,81,73,0.2)' }}>
              <Lock className="w-3 h-3" /> Locked by Admin
            </div>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="flex items-center gap-1 text-sm py-1.5 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm btn-primary py-1.5 px-3">
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Resubmit
              </button>
            </div>
          )}
        </div>

        {/* Admin feedback banner */}
        {(r.admin_comment || r.rejection_reason) && (
          <div className="mb-4 p-4 rounded-xl border" style={{ background: r.approval_status === 'rejected' ? 'rgba(248,81,73,0.06)' : 'rgba(74,108,247,0.05)', borderColor: r.approval_status === 'rejected' ? 'rgba(248,81,73,0.25)' : 'rgba(74,108,247,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" style={{ color: r.approval_status === 'rejected' ? '#f85149' : '#7090ff' }} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: r.approval_status === 'rejected' ? '#f85149' : '#7090ff' }}>
                {r.approval_status === 'rejected' ? 'Rejected — Admin Feedback' : 'Admin Comment'}
              </p>
            </div>
            <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
              "{r.admin_comment || r.rejection_reason}"
            </p>
            {r.approval_status === 'rejected' && !editing && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Click <strong>Edit &amp; Resubmit</strong> above to make corrections and send for review again.
              </p>
            )}
          </div>
        )}

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-bold text-lg">{r.custom_subject || r.subjects?.subject_name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.custom_division || r.divisions?.division_name} - {r.custom_room || r.rooms?.room_number || '—'}</p>
            </div>
            <StatusBadge status={editing ? 'pending' : (lockedDates.includes(r.lecture_date) ? 'locked' : r.approval_status)} />
          </div>
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Read-only fields */}
          {/* Editable Header Fields */}
          {editing ? (
            <div className="space-y-4 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="space-y-1.5">
                <label className="form-label">Lecture Date</label>
                <input type="date" className="input-field" value={editForm.lecture_date} onChange={e => ef('lecture_date', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Scheduled From</label>
                  <input type="time" className="input-field" value={editForm.timetable_from} onChange={e => ef('timetable_from', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Scheduled To</label>
                  <input type="time" className="input-field" value={editForm.timetable_to} onChange={e => ef('timetable_to', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Faculty</label>
                  <input type="text" className="input-field" value={editForm.timetable_faculty} onChange={e => ef('timetable_faculty', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input type="text" className="input-field" value={editForm.timetable_subject} onChange={e => ef('timetable_subject', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Division</label>
                <input type="text" className="input-field" value={editForm.timetable_division} onChange={e => ef('timetable_division', e.target.value)} />
              </div>
            </div>
          ) : (
            <>
              {[
                ['Date', formatDate(r.lecture_date)],
                ['Scheduled', formatTime(r.timetable_from || r.scheduled_start) + ' to ' + formatTime(r.timetable_to || r.scheduled_end)],
                ['Faculty', r.timetable_faculty || r.faculty?.full_name || '—'],
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span className="font-semibold text-right max-w-[60%]">{val}</span>
                </div>
              ))}
            </>
          )}

          {/* Editable fields */}
          {editing ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Actual Start</label>
                  <input type="time" className="input-field" value={editForm.actual_from} onChange={e => ef('actual_from', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Actual End</label>
                  <input type="time" className="input-field" value={editForm.actual_to} onChange={e => ef('actual_to', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Topic Covered <span className="text-red-400">*</span></label>
                <textarea className="input-field resize-none" rows={3} value={editForm.topic_covered} onChange={e => ef('topic_covered', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Subtopics / References</label>
                <input className="input-field" value={editForm.subtopics} onChange={e => ef('subtopics', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Unit Number</label>
                <input type="number" className="input-field" min={1} max={10} value={editForm.unit_number} onChange={e => ef('unit_number', e.target.value)} />
              </div>
              {editForm.attendanceDetails && Object.keys(editForm.attendanceDetails).length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="form-label mb-0">Student Attendance</label>
                    <span className="text-xs font-bold" style={{ color: Number(editForm.present_count)/Number(editForm.total_students) >= 0.75 ? '#3fb950' : '#f85149' }}>
                      {editForm.present_count} / {editForm.total_students} ({Math.round(Number(editForm.present_count)/Number(editForm.total_students)*100)}%)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markAll(true)} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
                      style={{ background:'rgba(63,185,80,0.15)',color:'#3fb950',border:'1px solid rgba(63,185,80,0.3)' }}>All Present</button>
                    <button onClick={() => markAll(false)} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
                      style={{ background:'rgba(248,81,73,0.1)',color:'#f85149',border:'1px solid rgba(248,81,73,0.25)' }}>All Absent</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {selected.attendance?.map(a => {
                      const sid = a.student_id
                      const present = editForm.attendanceDetails[sid]
                      return (
                        <button key={sid} onClick={() => toggleStudent(sid)}
                          className="p-2 rounded-lg text-left transition-all active:scale-95"
                          style={{ background:present?'rgba(63,185,80,0.08)':'rgba(248,81,73,0.05)', border:`1px solid ${present?'rgba(63,185,80,0.3)':'rgba(248,81,73,0.2)'}` }}>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ background:present?'rgba(63,185,80,0.2)':'rgba(248,81,73,0.15)',color:present?'#3fb950':'#f85149' }}>
                              {present?'✓':'✗'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold truncate leading-none" style={{ color:present?'#3fb950':'#f85149' }}>{a.students?.roll_number}</p>
                              <p className="text-[10px] truncate leading-tight mt-0.5" style={{ color:'var(--text-primary)' }}>{a.students?.full_name}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Total Students</label>
                    <input type="number" className="input-field text-center font-bold" value={editForm.total_students} onChange={e => ef('total_students', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Present</label>
                    <input type="number" className="input-field text-center font-bold" min={0} max={editForm.total_students} value={editForm.present_count} onChange={e => ef('present_count', e.target.value)} />
                  </div>
                </div>
              )}
              <div>
                <label className="form-label">LCS Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {LCS_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => ef('lcs_status', opt.value)}
                      className="py-2 px-1 rounded-xl text-xs font-semibold transition-all text-center"
                      style={{
                        background: editForm.lcs_status === opt.value ? `${opt.color}22` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${editForm.lcs_status === opt.value ? opt.color : 'rgba(255,255,255,0.08)'}`,
                        color: editForm.lcs_status === opt.value ? opt.color : 'var(--text-secondary)',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                style={{ background: editForm.smartboard_pdf_uploaded ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editForm.smartboard_pdf_uploaded ? 'rgba(63,185,80,0.3)' : 'rgba(255,255,255,0.08)'}` }}
                onClick={() => ef('smartboard_pdf_uploaded', !editForm.smartboard_pdf_uploaded)}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${editForm.smartboard_pdf_uploaded ? 'bg-green-500' : 'bg-white/10'}`}>
                  {editForm.smartboard_pdf_uploaded && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-semibold">Smartboard PDF Uploaded</span>
              </div>
              <div>
                <label className="form-label">Remarks</label>
                <textarea className="input-field resize-none" rows={2} value={editForm.remarks} onChange={e => ef('remarks', e.target.value)} />
              </div>
              <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.2)', color: 'var(--text-secondary)' }}>
                <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-brand-400" />
                Saving will resubmit this record as <strong>Pending</strong> for admin review.
              </div>
            </div>
          ) : (
            <>
              {[
                ['Actual', formatTime(r.actual_from || r.actual_start) + ' to ' + formatTime(r.actual_to || r.actual_end)],
                ['Topic', r.topic_covered || r.remarks || '—'],
                ['Attendance', r.present_count + '/' + r.total_students + ' (' + attendancePercent(r.present_count, r.total_students) + '%)'],
                ['LCS', r.lcs_status === 'covered' ? 'Covered' : r.lcs_status === 'partially_covered' ? 'Partial' : 'Not Covered'],
                ['SB PDF', r.smartboard_pdf_uploaded ? 'Uploaded' : 'Not uploaded'],
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span className="font-semibold text-right max-w-[60%]">{val}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-5 pb-24 animate-fade-in">
      <h1 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>History</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
            style={filter === f
              ? { background: 'rgba(74,108,247,0.2)', border: '1px solid rgba(74,108,247,0.4)', color: '#7090ff' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 opacity-50">Loading history...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(r => {
            const isLocked = lockedDates.includes(r.lecture_date)
            const canEdit = !isLocked && (r.approval_status === 'pending' || r.approval_status === 'rejected' || r.approval_status === 'approved')
            
            return (
              <div key={r.id} className="relative group">
                <button onClick={() => handleSelect(r)} className="w-full glass-card p-4 text-left transition-all hover:border-brand-300">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display font-semibold text-sm">{r.timetable_subject || r.custom_subject || r.subjects?.subject_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.timetable_division || r.custom_division || r.divisions?.division_name} - {formatDate(r.lecture_date)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={isLocked ? 'locked' : r.approval_status} />
                    </div>
                  </div>
                  
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{r.topic_covered || r.remarks}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(r.actual_from || r.actual_start)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r.present_count}/{r.total_students}</span>
                      <span className="font-bold" style={{ color: attendancePercent(r.present_count, r.total_students) >= 75 ? '#3fb950' : '#f85149' }}>
                        {attendancePercent(r.present_count, r.total_students)}%
                      </span>
                    </div>
                    
                    {canEdit && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelect(r); startEdit(r); }}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>

                  {r.rejection_reason && (
                    <p className="text-[10px] mt-2 px-2 py-1 rounded-md" style={{ background: 'rgba(248,81,73,0.06)', color: '#f85149', borderLeft: '2px solid #f85149' }}>
                      ✕ {r.rejection_reason}
                    </p>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
