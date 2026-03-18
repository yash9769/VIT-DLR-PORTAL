import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Filter, FileText, Clock, Users, ChevronLeft, Edit2, Check, X, AlertCircle, Save } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      fetchHistory()
    }
  }, [profile?.id])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lecture_records')
        .select('*, subjects(*), divisions(*), rooms:room_id(*)')
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

  const startEdit = () => {
    setEditForm({
      topic_covered: selected.topic_covered,
      subtopics: selected.subtopics || '',
      unit_number: selected.unit_number || '',
      remarks: selected.remarks || '',
      lcs_status: selected.lcs_status,
      smartboard_pdf_uploaded: selected.smartboard_pdf_uploaded,
      actual_start: selected.actual_start || '',
      actual_end: selected.actual_end || '',
      present_count: selected.present_count,
      total_students: selected.total_students,
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
      const { error } = await supabase
        .from('lecture_records')
        .update({
          ...editForm,
          present_count: Number(editForm.present_count),
          total_students: Number(editForm.total_students),
          absent_count: Number(editForm.total_students) - Number(editForm.present_count),
          approval_status: 'pending', // re-submit for review
          rejection_reason: null,
          approved_at: null,
        })
        .eq('id', selected.id)
        .eq('faculty_id', profile.id)

      if (error) throw error
      toast.success('Record resubmitted for review!')
      await fetchHistory()
      // Update the selected record to reflect new state
      const updated = records.find(r => r.id === selected.id)
      if (updated) setSelected({ ...updated, ...editForm, approval_status: 'pending' })
      setEditing(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update record')
    } finally {
      setSaving(false)
    }
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
          {r.approval_status === 'rejected' && !editing && (
            <button onClick={startEdit} className="flex items-center gap-2 text-sm btn-secondary py-1.5 px-3">
              <Edit2 className="w-3.5 h-3.5" /> Edit & Resubmit
            </button>
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
            <StatusBadge status={editing ? 'pending' : r.approval_status} />
          </div>
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Read-only fields */}
          {[
            ['Date', formatDate(r.lecture_date)],
            ['Scheduled', formatTime(r.scheduled_start) + ' to ' + formatTime(r.scheduled_end)],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
              <span className="font-semibold text-right max-w-[60%]">{val}</span>
            </div>
          ))}

          {/* Editable fields */}
          {editing ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Actual Start</label>
                  <input type="time" className="input-field" value={editForm.actual_start} onChange={e => ef('actual_start', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Actual End</label>
                  <input type="time" className="input-field" value={editForm.actual_end} onChange={e => ef('actual_end', e.target.value)} />
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
                ['Actual', formatTime(r.actual_start) + ' to ' + formatTime(r.actual_end)],
                ['Topic', r.topic_covered],
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
          {filteredRecords.map(r => (
            <button key={r.id} onClick={() => handleSelect(r)} className="w-full glass-card p-4 text-left">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-semibold text-sm">{r.custom_subject || r.subjects?.subject_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.custom_division || r.divisions?.division_name} - {formatDate(r.lecture_date)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={r.approval_status} />
                  {r.approval_status === 'rejected' && (
                    <span className="text-[10px] font-bold" style={{ color: '#f85149' }}>Tap to edit</span>
                  )}
                </div>
              </div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{r.topic_covered}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span><Clock className="w-3 h-3 inline mr-1" />{formatTime(r.actual_start)}</span>
                <span><Users className="w-3 h-3 inline mr-1" />{r.present_count}/{r.total_students}</span>
                <span style={{ color: attendancePercent(r.present_count, r.total_students) >= 75 ? '#3fb950' : '#f85149' }}>
                  {attendancePercent(r.present_count, r.total_students)}%
                </span>
              </div>
              {r.rejection_reason && (
                <p className="text-xs mt-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(248,81,73,0.08)', color: '#f85149', borderLeft: '2px solid #f85149' }}>
                  ✕ {r.rejection_reason}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
