import { useState, useEffect } from 'react'
import { Search, Filter, CheckCircle, XCircle, Lock, Eye, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, attendancePercent, today } from '../../utils/helpers'
import { StatusBadge, Modal, toast } from '../../components/ui'
import { generateDLRPDF } from '../../services/reportService'
import { exportDLRToExcel } from '../../services/excelService'

export default function RecordsPage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lecture_records')
        .select(`
          *,
          subjects (*),
          divisions (*),
          rooms:room_id (*),
          faculty:faculty_id (id, full_name)
        `)
        .order('lecture_date', { ascending: false })
      
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
      toast.error('Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  const filtered = records.filter(r => {
    const matchStatus = statusFilter === 'all' || r.approval_status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || 
      r.subjects?.subject_name?.toLowerCase().includes(q) || 
      r.custom_subject?.toLowerCase().includes(q) ||
      r.divisions?.division_name?.toLowerCase().includes(q) || 
      r.custom_division?.toLowerCase().includes(q) ||
      r.topic_covered?.toLowerCase().includes(q) ||
      r.faculty?.full_name?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const approve = async (id) => {
    try {
      const { error } = await supabase
        .from('lecture_records')
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      toast.success('Record approved')
      fetchRecords()
    } catch (error) {
      toast.error('Failed to approve')
    }
  }

  const reject = async (id, reason) => {
    try {
      const { error } = await supabase
        .from('lecture_records')
        .update({ 
          approval_status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', id)
      
      if (error) throw error
      toast.success('Record rejected')
      setRejectId(null)
      setRejectReason('')
      fetchRecords()
    } catch (error) {
      toast.error('Failed to reject')
    }
  }

  const lockAll = async () => {
    try {
      const { error } = await supabase
        .from('lecture_records')
        .update({ is_locked: true })
        .eq('approval_status', 'approved')
      
      if (error) throw error
      toast.success('All approved records locked')
      fetchRecords()
    } catch (error) {
      toast.error('Failed to lock records')
    }
  }

  const counts = { 
    all: records.length, 
    pending: records.filter(r=>r.approval_status==='pending').length, 
    approved: records.filter(r=>r.approval_status==='approved').length, 
    rejected: records.filter(r=>r.approval_status==='rejected').length 
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Lecture Records</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{records.length} total · {counts.pending} pending review</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportDLRToExcel(records, today())} className="btn-secondary flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> Excel</button>
          <button onClick={() => generateDLRPDF(records, today())} className="btn-secondary flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> PDF</button>
          <button onClick={lockAll} className="btn-secondary flex items-center gap-2 text-sm"><Lock className="w-4 h-4" /> Lock All</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-10 text-sm" placeholder="Search subject, division, topic…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-2 text-sm font-medium capitalize transition-colors"
              style={statusFilter === s ? { background: 'rgba(74,108,247,0.2)', color: '#7090ff' } : { color: 'var(--text-secondary)' }}>
              {s} {counts[s] > 0 ? `(${counts[s]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th>Faculty</th><th>Division</th><th>Subject</th><th>Date</th>
                <th>Time (Actual)</th><th>Topic</th><th>Attendance</th>
                <th>LCS</th><th>SB PDF</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-10 opacity-50">Loading records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No records found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td className="text-sm font-medium">{r.faculty?.full_name?.split(' ').slice(-1)[0] || '—'}</td>
                  <td><span className="badge badge-pending text-xs">{r.custom_division || r.divisions?.division_name}</span></td>
                  <td className="text-sm">{r.custom_subject || r.subjects?.short_name || r.subjects?.subject_name}</td>
                  <td className="text-sm">{formatDate(r.lecture_date)}</td>
                  <td className="text-xs font-mono">{formatTime(r.actual_start)}–{formatTime(r.actual_end)}</td>
                  <td className="text-xs max-w-[160px]"><span className="line-clamp-2">{r.topic_covered}</span></td>
                  <td>
                    <span className="text-sm font-semibold" style={{ color: attendancePercent(r.present_count, r.total_students) >= 75 ? '#3fb950' : '#f85149' }}>
                      {attendancePercent(r.present_count, r.total_students)}%
                    </span>
                    <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>{r.present_count}/{r.total_students}</span>
                  </td>
                  <td><span style={{ color: r.lcs_status === 'covered' ? '#3fb950' : '#f85149' }}>{r.lcs_status === 'covered' ? '✓' : '✗'}</span></td>
                  <td><span style={{ color: r.smartboard_pdf_uploaded ? '#3fb950' : '#f85149' }}>{r.smartboard_pdf_uploaded ? '✓' : '✗'}</span></td>
                  <td><StatusBadge status={r.approval_status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(r)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}><Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} /></button>
                      {r.approval_status === 'pending' && !r.is_locked && (
                        <>
                          <button onClick={() => approve(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(63,185,80,0.15)' }}><CheckCircle className="w-3.5 h-3.5 text-green-400" /></button>
                          <button onClick={() => setRejectId(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248,81,73,0.1)' }}><XCircle className="w-3.5 h-3.5 text-red-400" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Record Details" size="lg">
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                ['Subject', selected.custom_subject || selected.subjects?.subject_name],
                ['Division', selected.custom_division || selected.divisions?.division_name],
                ['Room', selected.custom_room || selected.rooms?.room_number],
                ['Date', formatDate(selected.lecture_date)],
                ['Scheduled', formatTime(selected.scheduled_start) + ' to ' + formatTime(selected.scheduled_end)],
                ['Actual', formatTime(selected.actual_start) + ' to ' + formatTime(selected.actual_end)],
                ['Present', selected.present_count + '/' + selected.total_students],
                ['Attendance', attendancePercent(selected.present_count, selected.total_students) + '%'],
                ['LCS', selected.lcs_status],
                ['SB PDF', selected.smartboard_pdf_uploaded ? 'Uploaded' : 'No'],
                ['Status', selected.approval_status],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm border-b py-1.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Topic Covered</p>
              <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>{selected.topic_covered}</p>
            </div>
            {selected.approval_status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => { approve(selected.id); setSelected(null) }} className="btn-success flex-1">Approve</button>
                <button onClick={() => { setRejectId(selected.id); setSelected(null) }} className="btn-danger flex-1">Reject</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Reject Record" size="sm">
        <div className="space-y-4">
          <div>
            <label className="form-label">Reason for Rejection</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Enter reason…" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRejectId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => reject(rejectId, rejectReason)} className="btn-danger flex-1">Reject Record</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
