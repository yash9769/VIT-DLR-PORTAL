import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Lock, Eye, Search, Filter, ChevronDown, Download, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, attendancePercent } from '../../utils/helpers'
import { SectionHeader, StatusBadge, Modal, toast, EmptyState } from '../../components/ui'
import { generateDLRPDF } from '../../services/reportService'
import { exportDLRToExcel } from '../../services/excelService'
import { today, cls } from '../../utils/helpers'

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [adminComment, setAdminComment] = useState('')
  const [studentAttendance, setStudentAttendance] = useState([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)

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
          subjects:subjects!subject_id (*),
          divisions:divisions!division_id (*),
          rooms:rooms!room_id (*),
          faculty:users!faculty_id (full_name),
          original_faculty:users!original_faculty_id (full_name)
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

  const updateStatus = async (ids, status, reason = null) => {
    try {
      const updates = ids.map(id => ({
        id,
        approval_status: status,
        rejection_reason: reason || (status === 'rejected' ? rejectReason : null),
        admin_comment: adminComment || null,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      }))

      const { error } = await supabase
        .from('lecture_records')
        .upsert(updates)
      
      if (error) throw error

      toast.success(`${ids.length} record(s) marked as ${status}`)
      setSelected(new Set())
      fetchRecords()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleOpenDetail = async (record) => {
    setViewing(record)
    setAdminComment(record.admin_comment || '')
    
    try {
      setLoadingAttendance(true)
      const { data, error } = await supabase
        .from('attendance')
        .select('*, students(full_name, roll_number)')
        .eq('lecture_record_id', record.id)
        .order('students(roll_number)')
      
      if (error) throw error
      setStudentAttendance(data || [])
    } catch (error) {
      console.error('Error fetching student attendance:', error)
    } finally {
      setLoadingAttendance(false)
    }
  }

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(r => r.id)))
  }

  const filtered = records.filter(r => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'substitutions' ? r.is_substitution === true :
      r.approval_status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || 
      r.subjects?.subject_name?.toLowerCase().includes(q) || 
      r.divisions?.division_name?.toLowerCase().includes(q) || 
      r.topic_covered?.toLowerCase().includes(q) ||
      r.faculty?.full_name?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const statusCounts = {
    all: records.length,
    pending: records.filter(r => r.approval_status === 'pending').length,
    approved: records.filter(r => r.approval_status === 'approved').length,
    rejected: records.filter(r => r.approval_status === 'rejected').length,
    substitutions: records.filter(r => r.is_substitution === true).length,
  }

  const filterLabels = {
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    substitutions: 'Substitutions',
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <SectionHeader
        title="Approval Workflow"
        subtitle="Review, approve, reject and lock daily lecture records"
        action={
          selected.size > 0 && (
            <div className="flex gap-2">
              <button onClick={() => exportDLRToExcel(records, today())} className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                <Download className="w-4 h-4" /> Excel
              </button>
              <button onClick={() => generateDLRPDF(records, today())} className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button onClick={() => updateStatus([...selected], 'approved')} className="btn-success flex items-center gap-2 py-2 px-4 text-sm">
                <CheckCircle className="w-4 h-4" /> Approve ({selected.size})
              </button>
              <button onClick={() => setRejectTarget([...selected])} className="btn-danger flex items-center gap-2 py-2 px-4 text-sm">
                <XCircle className="w-4 h-4" /> Reject ({selected.size})
              </button>
            </div>
          )
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === key ? (key === 'substitutions' ? 'bg-amber-500 text-white shadow-lg' : 'bg-brand-500 text-white shadow-brand') : ''
            }`}
            style={filter !== key ? { background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' } : {}}
          >
            <span className="capitalize">{filterLabels[key]}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === key ? 'bg-white/20' : ''}`}
              style={filter !== key ? { background: 'rgba(255,255,255,0.1)' } : {}}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + bulk actions */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-9 py-2" placeholder="Search topic, division, subject…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filter === 'pending' && filtered.length > 0 && (
          <button onClick={() => updateStatus(filtered.map(r => r.id), 'approved')} className="btn-success flex items-center gap-2 py-2 px-4 text-sm whitespace-nowrap">
            <CheckCircle className="w-4 h-4" /> Approve All Visible
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} className="rounded" />
                </th>
                <th>Faculty / Subject</th>
                <th>Division</th>
                <th>Date &amp; Time</th>
                <th>Topic</th>
                <th>Attendance</th>
                <th>LCS / SB</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 opacity-50">Loading records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9}>
                  <EmptyState icon={CheckCircle} title="No records" description={`No ${filter} records found.`} />
                </td></tr>
              ) : (
                filtered.map(r => (
                  <tr
                    key={r.id}
                    className={cls(
                      'cursor-pointer hover:bg-white/5 transition-colors',
                      selected.has(r.id) ? 'bg-brand-500/5' : ''
                    )}
                    style={r.is_substitution ? { borderLeft: '4px solid rgba(245,158,11,0.7)' } : {}}
                    onClick={() => handleOpenDetail(r)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded" />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{r.faculty?.full_name}</p>
                            {r.is_substitution && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                                style={{ background: 'rgba(245,158,11,0.2)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)' }}
                              >
                                SUB
                              </span>
                            )}
                          </div>
                          {r.is_substitution && r.original_faculty?.full_name && (
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                              ↳ sub. for {r.original_faculty.full_name}
                            </p>
                          )}
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.subjects?.subject_code} — {r.subjects?.short_name}</p>
                        </div>
                        {r.admin_comment && (
                           <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center" title={r.admin_comment}>
                             <Search className="w-3 h-3 text-blue-400" />
                           </div>
                        )}
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: 'rgba(74,108,247,0.12)', color: '#7090ff', border: '1px solid rgba(74,108,247,0.2)' }}>{r.divisions?.division_name}</span></td>
                    <td>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(r.lecture_date)}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{formatTime(r.actual_start)} – {formatTime(r.actual_end)}</p>
                    </td>
                    <td>
                      <p className="text-sm max-w-[200px] truncate" style={{ color: 'var(--text-primary)' }}>{r.topic_covered}</p>
                      {r.remarks && <p className="text-xs max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>Note: {r.remarks}</p>}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${attendancePercent(r.present_count, r.total_students)}%`, background: attendancePercent(r.present_count, r.total_students) >= 75 ? '#3fb950' : '#d29922' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: attendancePercent(r.present_count, r.total_students) >= 75 ? '#3fb950' : '#d29922' }}>
                          {r.present_count}/{r.total_students}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-semibold ${r.lcs_status === 'covered' ? 'text-green-400' : 'text-yellow-400'}`}>
                          LCS: {r.lcs_status === 'covered' ? '✓' : '~'}
                        </span>
                        <span className={`text-xs font-semibold ${r.smartboard_pdf_uploaded ? 'text-green-400' : 'text-red-400'}`}>
                          SB: {r.smartboard_pdf_uploaded ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>
                    <td><StatusBadge status={r.approval_status} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenDetail(r)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" title="View Details">
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        {r.approval_status === 'pending' && <>
                          <button onClick={() => updateStatus([r.id], 'approved')} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-500/20 transition-colors" title="Approve">
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          </button>
                          <button onClick={() => setRejectTarget([r.id])} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors" title="Reject">
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </>}
                        {r.approval_status === 'approved' && (
                          <button onClick={() => updateStatus([r.id], 'locked')} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" title="Lock">
                            <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
              )))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{filtered.length} records · {selected.size} selected</p>
        </div>
      </div>

      {/* Detail view modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Lecture Record Details" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Subject', viewing.subjects?.subject_name],
                ['Subject Code', viewing.subjects?.subject_code],
                ['Unit No.', viewing.unit_number],
                ['Subtopics', viewing.subtopics],
                ['Division', viewing.divisions?.division_name],
                ['Room', viewing.rooms?.room_number || '—'],
                ['Date', formatDate(viewing.lecture_date)],
                ['Scheduled', `${formatTime(viewing.scheduled_start)} – ${formatTime(viewing.scheduled_end)}`],
                ['Actual Time', `${formatTime(viewing.actual_start)} – ${formatTime(viewing.actual_end)}`],
                ['Attendance Summary', `${viewing.present_count} / ${viewing.total_students} (${attendancePercent(viewing.present_count, viewing.total_students)}%)`],
                ['LCS Status', viewing.lcs_status?.replace(/_/g,' ')],
                ['Smartboard PDF', viewing.smartboard_pdf_uploaded ? 'Uploaded ✓' : 'Not Uploaded'],
                ['Substitution', viewing.is_substitution ? 'Yes' : 'No'],
                ['Submitted', formatDate(viewing.submitted_at)],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="form-label">{k}</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
                </div>
              ))}
            </div>

            {/* Substitution Details Box */}
            {viewing.is_substitution && (
              <div
                className="p-4 rounded-2xl border space-y-3"
                style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.35)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#d97706' }} />
                  <p className="font-display font-bold text-sm" style={{ color: '#d97706' }}>Substitution Details</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="form-label text-[10px]">Absent Faculty</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {viewing.original_faculty?.full_name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="form-label text-[10px]">Proxy Faculty</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {viewing.faculty?.full_name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="form-label text-[10px]">Date</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(viewing.lecture_date)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="glass-card p-4 overflow-hidden">
               <p className="form-label mb-2 flex items-center justify-between">
                 <span>Individual Attendance List</span>
                 <span className="text-xs font-normal">Showing {studentAttendance.length} students</span>
               </p>
               {loadingAttendance ? (
                 <p className="text-xs opacity-50 text-center py-4">Fetching attendance list...</p>
               ) : studentAttendance.length === 0 ? (
                <div className="py-6 text-center">
                   <p className="text-xs opacity-50 mb-1">No individual attendance data available</p>
                   <p className="text-[10px] opacity-30 italic px-4 leading-relaxed">Faculty used "Quick Manual Entry".<br/>No student-wise records were generated.</p>
                 </div>
               ) : (
                 <div className="max-h-[200px] overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                   {studentAttendance.map(att => (
                     <div key={att.id} className="flex items-center gap-2 p-1.5 rounded-lg text-[11px]" style={{ background: att.is_present ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', border: `1px solid ${att.is_present ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)'}` }}>
                       <span className="font-mono text-gray-500">{att.students?.roll_number}</span>
                       <span className="truncate flex-1" title={att.students?.full_name}>{att.students?.full_name}</span>
                       <span className={att.is_present ? 'text-green-400' : 'text-red-400'}>{att.is_present ? 'P' : 'A'}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
            <div>
              <p className="form-label">Topic Covered</p>
              <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>{viewing.topic_covered}</p>
            </div>
            {viewing.remarks && <div>
              <p className="form-label">Remarks</p>
              <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>{viewing.remarks}</p>
            </div>}
            <div className="space-y-1.5">
              <label className="form-label">Internal Admin Feedback (Visible to Faculty)</label>
              <textarea 
                className="input-field min-h-[80px] text-sm" 
                placeholder="Good comprehensive topic coverage..." 
                value={adminComment} 
                onChange={e => setAdminComment(e.target.value)} 
              />
            </div>

            {viewing.approval_status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => { updateStatus([viewing.id], 'approved'); setViewing(null); setAdminComment('') }} className="btn-success flex-1 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => { setRejectTarget([viewing.id]); setViewing(null) }} className="btn-danger flex-1 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
            {viewing.approval_status !== 'pending' && (
              <button 
                onClick={() => { updateStatus([viewing.id], viewing.approval_status); setViewing(null); setAdminComment('') }} 
                className="btn-primary w-full py-2.5"
                disabled={!adminComment}
              >
                Update Feedback &amp; Close
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Reject reason modal */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Records" size="sm">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Provide a reason for rejecting {rejectTarget?.length} record(s).
          </p>
          <div>
            <label className="form-label">Rejection Reason</label>
            <textarea className="input-field resize-none" rows={4} placeholder="e.g., Attendance figures don't match the physical register…" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setRejectTarget(null)}>Cancel</button>
            <button className="btn-danger flex-1" disabled={!rejectReason} onClick={() => { updateStatus(rejectTarget, 'rejected', rejectReason); setRejectTarget(null); setRejectReason('') }}>
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
