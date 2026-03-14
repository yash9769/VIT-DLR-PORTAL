import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Filter, FileText, Clock, Users, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, attendancePercent } from '../../utils/helpers'
import { StatusBadge } from '../../components/ui'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected']

export default function HistoryPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

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

  if (selected) {
    const r = selected
    return (
      <div className="px-4 pt-5 pb-24 animate-slide-up">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="w-4 h-4" /> Back to History
        </button>
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-bold text-lg">{r.subjects?.subject_name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.divisions?.division_name} - {r.rooms?.room_number}</p>
            </div>
            <StatusBadge status={r.approval_status} />
          </div>
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          {[
            ['Date', formatDate(r.lecture_date)],
            ['Scheduled', formatTime(r.scheduled_start) + ' to ' + formatTime(r.scheduled_end)],
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
          
          {(r.admin_comment || r.rejection_reason) && (
            <div className="mt-4 p-4 rounded-xl border" style={{ background: 'rgba(74,108,247,0.05)', borderColor: 'rgba(74,108,247,0.2)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7090ff' }}>Admin Feedback</p>
              <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
                "{r.admin_comment || r.rejection_reason}"
              </p>
            </div>
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
            <button key={r.id} onClick={() => setSelected(r)} className="w-full glass-card p-4 text-left">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-semibold text-sm">{r.subjects?.subject_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.divisions?.division_name} - {formatDate(r.lecture_date)}</p>
                </div>
                <StatusBadge status={r.approval_status} />
              </div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{r.topic_covered}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span><Clock className="w-3 h-3 inline mr-1" />{formatTime(r.actual_start)}</span>
                <span><Users className="w-3 h-3 inline mr-1" />{r.present_count}/{r.total_students}</span>
                <span style={{ color: attendancePercent(r.present_count, r.total_students) >= 75 ? '#3fb950' : '#f85149' }}>
                  {attendancePercent(r.present_count, r.total_students)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
