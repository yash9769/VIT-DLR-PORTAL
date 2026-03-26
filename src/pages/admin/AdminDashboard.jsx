import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, CheckCircle, TrendingUp, AlertTriangle, Lock, Download, ChevronRight, LifeBuoy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { attendancePercent, formatDate, formatTime, today } from '../../utils/helpers'
import { StatusBadge, toast, Modal } from '../../components/ui'
import { Eye, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Search } from 'lucide-react'
import { generateDLRPDF } from '../../services/reportService'
import { exportDLRToExcel } from '../../services/excelService'
import ProxyManagementCard from '../../components/admin/ProxyManagementCard'

const StatCard = ({ label, value, icon: Icon, color, trend, onClick }) => (
  <button onClick={onClick} className="glass-card p-5 text-left w-full hover:scale-[1.01] transition-transform">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors shadow-sm" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: trend >= 0 ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: trend >= 0 ? '#3fb950' : '#f85149' }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="font-display font-bold text-2xl mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
  </button>
)

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    totalRecords: 0,
    avgAtt: 0,
    todaySchedule: 0,
    openIssues: 0
  })
  const [pendingRecords, setPendingRecords] = useState([])
  const [facultyStatus, setFacultyStatus] = useState([])
  const [allRecords, setAllRecords] = useState([])
  const [viewing, setViewing] = useState(null)
  const [studentAttendance, setStudentAttendance] = useState([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [adminComment, setAdminComment] = useState('')

  const todayStr = today()
  const dayName = format(new Date(), 'EEEE')
  const [lockedToday, setLockedToday] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 0. Check if today is locked
      const { data: lockData } = await supabase
        .from('locked_dates')
        .select('*')
        .eq('locked_date', todayStr)
        .single()
      
      setLockedToday(!!lockData)

      // 1. Fetch Basic Record Stats
      const { data: records, error: recError } = await supabase
        .from('lecture_records')
        .select(`
          *,
          subjects:subjects!subject_id (*),
          divisions:divisions!division_id (*),
          rooms:rooms!room_id (*),
          faculty:users!faculty_id (full_name)
        `)
        .order('created_at', { ascending: false })

      if (recError) throw recError

      const pending = records.filter(r => r.approval_status === 'pending')
      const approved = records.filter(r => r.approval_status === 'approved')
      const total = records.length
      const avg = total > 0
        ? Math.round(records.reduce((s, r) => s + (r.present_count / r.total_students * 100 || 0), 0) / total)
        : 0

      // 2. Fetch Today's Timetable Count
      const { count: ttCount, error: ttError } = await supabase
        .from('timetable')
        .select('*', { count: 'exact', head: true })
        .eq('day_of_week', dayName)
        .eq('is_active', true)

      if (ttError) throw ttError

      // 3. Fetch Faculty and their today's submission status
      const { data: faculty, error: facError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('role', 'faculty')
        .eq('is_active', true)

      if (facError) throw facError

      // 4. Fetch System Issues
      const { count: issueCount, error: issueError } = await supabase
        .from('system_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      if (issueError) throw issueError

      const facStatus = faculty.map(f => ({
        ...f,
        submittedToday: records.some(r => r.faculty_id === f.id && r.lecture_date === todayStr),
        recordCount: records.filter(r => r.faculty_id === f.id).length
      }))

      setStats({
        pending: pending.length,
        approved: approved.length,
        totalRecords: total,
        avgAtt: avg,
        todaySchedule: ttCount || 0,
        openIssues: issueCount || 0
      })
      setAllRecords(records)
      setPendingRecords(pending.slice(0, 5))
      setFacultyStatus(facStatus)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
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

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('lecture_records')
        .update({ 
          approval_status: 'approved',
          admin_comment: adminComment || null,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      toast.success('Record approved')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    try {
      const { error } = await supabase
        .from('lecture_records')
        .update({ 
          approval_status: 'rejected',
          rejection_reason: reason,
          admin_comment: adminComment || null
        })
        .eq('id', id)
      
      if (error) throw error
      toast.success('Record rejected')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to reject')
    }
  }

  const [selectedLockDate, setSelectedLockDate] = useState(today())
  const [isLocked, setIsLocked] = useState(false)

  const checkLockStatus = async (date) => {
    const { data: lockData } = await supabase
      .from('locked_dates')
      .select('*')
      .eq('locked_date', date)
      .maybeSingle()
    setIsLocked(!!lockData)
  }

  const toggleLock = async () => {
    try {
      if (isLocked) {
        // Unlock
        const { error } = await supabase
          .from('locked_dates')
          .delete()
          .eq('locked_date', selectedLockDate)
        
        if (error) throw error
        toast.success(`Date ${selectedLockDate} unlocked`)
      } else {
        // Lock
        const { error } = await supabase
          .from('locked_dates')
          .insert({
            locked_date: selectedLockDate,
            locked_by: (await supabase.auth.getUser()).data.user.id
          })
        
        if (error) throw error
        toast.success(`Date ${selectedLockDate} locked`)
      }
      checkLockStatus(selectedLockDate)
    } catch (error) {
      console.error('Error toggling lock:', error)
      toast.error('Failed to change lock status')
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80" style={{ color: 'var(--brand)' }}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Academic Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportDLRToExcel(allRecords, todayStr)} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={() => generateDLRPDF(allRecords, todayStr)} className="btn-primary flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Today's Schedule" value={stats.todaySchedule} icon={FileText} color="#4A6CF7" onClick={() => navigate('/admin/timetable')} />
        <StatCard label="Pending Review"   value={stats.pending}       icon={Clock}       color="#d29922" onClick={() => navigate('/admin/records')} />
        <StatCard label="Approved"         value={stats.approved}      icon={CheckCircle} color="#3fb950" onClick={() => navigate('/admin/records')} />
        <StatCard label="Total Records"    value={stats.totalRecords}  icon={TrendingUp}  color="#a855f7" onClick={() => navigate('/admin/records')} />
        <StatCard label="Open Issues"      value={stats.openIssues}    icon={LifeBuoy}    color="#f85149" onClick={() => navigate('/admin/issues')} />
        <StatCard label="Avg. Attendance"  value={stats.avgAtt + '%'}  icon={TrendingUp}  color="#8b5cf6" trend={3} />
      </div>

      {/* Main grid — 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Approvals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Pending Approvals</h2>
            <button onClick={() => navigate('/admin/records')} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--brand)' }}>View all <ChevronRight className="w-3 h-3" /></button>
          </div>
          {loading ? (
             <div className="glass-card p-10 text-center opacity-50">Loading records...</div>
          ) : stats.pending === 0 ? (
            <div className="glass-card p-10 text-center">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-400" />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>All records reviewed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRecords.map(r => (
                <div key={r.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-semibold text-sm">{r.subjects?.subject_name}</p>
                        <StatusBadge status={r.approval_status} />
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {r.faculty?.full_name} • {r.divisions?.division_name} - {formatDate(r.lecture_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: (r.present_count / r.total_students) >= 0.75 ? '#3fb950' : '#f85149' }}>
                        {Math.round(r.present_count / r.total_students * 100)}%
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.present_count}/{r.total_students}</p>
                    </div>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{r.topic_covered}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenDetail(r)} className="btn-secondary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5">
                      <Eye className="w-3 h-3" /> View Details
                    </button>
                    <button onClick={() => handleApprove(r.id)} className="btn-success flex-1 py-1.5 text-xs">Approve</button>
                    <button onClick={() => handleReject(r.id)} className="btn-danger flex-1 py-1.5 text-xs">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
           <div className="glass-card p-5">
             <h2 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Faculty Status</h2>
             <div className="space-y-3 max-h-[200px] overflow-y-auto">
               {facultyStatus.length === 0 ? (
                 <p className="text-xs opacity-50 text-center py-4">No data</p>
               ) : facultyStatus.map(f => (
                 <div key={f.id} className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     style={{ background: f.submittedToday ? 'var(--brand)' : 'rgba(255,255,255,0.12)' }}>
                     {f.initials || f.full_name[0]}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{f.full_name}</p>
                     <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f.recordCount} records</p>
                   </div>
                   <div className={`w-2 h-2 rounded-full flex-shrink-0 ${f.submittedToday ? 'bg-green-500' : 'bg-slate-500 opacity-40'}`} />
                 </div>
               ))}
             </div>
           </div>
          <div className="glass-card p-5">
            <h2 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Day Management</h2>
            <div className={`p-4 rounded-xl mb-4 border transition-colors ${isLocked ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLocked ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                  {isLocked ? <Lock className="w-5 h-5 text-red-500" /> : <TrendingUp className="w-5 h-5 text-emerald-500" />}
                </div>
                <div>
                  <p className="font-display font-bold text-sm" style={{ color: isLocked ? '#f85149' : '#3fb950' }}>
                    {isLocked ? 'Records Locked' : 'Records Open'}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {isLocked ? 'Faculty cannot edit records for this date.' : 'Faculty can edit and fix attendance.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 opacity-60">Manage Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-glow outline-none transition-colors"
                  value={selectedLockDate}
                  onChange={(e) => setSelectedLockDate(e.target.value)}
                />
              </div>
              <button 
                onClick={toggleLock} 
                className={`w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                  isLocked 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                } text-white`}
              >
                {isLocked ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {isLocked ? 'Unlock Date for Faculty' : 'Lock Records Permanently'}
              </button>
            </div>
            <p className="text-[11px] mt-4 opacity-70 leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
              Locking a date finalizes all records and attendance. Only unlock if a faculty correction is truly necessary.
            </p>
          </div>

          <ProxyManagementCard />
        </div>
      </div>

      {/* Review Modal — outside the grid */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Review Lecture Record" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Subject', viewing.subjects?.subject_name],
                ['Division', viewing.divisions?.division_name],
                ['Room', viewing.rooms?.room_number || '—'],
                ['Date', formatDate(viewing.lecture_date)],
                ['Actual Time', `${formatTime(viewing.actual_start)} – ${formatTime(viewing.actual_end)}`],
                ['Attendance', `${viewing.present_count} / ${viewing.total_students}`],
                ['Unit No.', viewing.unit_number || '—'],
                ['LCS', viewing.lcs_status?.replace(/_/g,' ')],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="form-label">{k}</p>
                  <p className="text-sm font-semibold">{v || '—'}</p>
                </div>
              ))}
            </div>
            <div className="glass-card p-4">
              <p className="form-label mb-2 flex items-center justify-between">
                <span>Individual Attendance</span>
                <span className="text-xs font-normal">{studentAttendance.length} students</span>
              </p>
              {loadingAttendance ? (
                <p className="text-xs opacity-50 text-center py-2">Fetching attendance...</p>
              ) : (
                <div className="max-h-[150px] overflow-y-auto pr-2 grid grid-cols-2 gap-2">
                  {studentAttendance.map(att => (
                    <div key={att.id} className="flex justify-between p-1.5 rounded-lg text-[11px] border" style={{ borderColor: 'var(--border-glass)' }}>
                      <span className="truncate" style={{ color: 'var(--text-primary)' }}>{att.students?.full_name}</span>
                      <span className={att.is_present ? 'text-green-500' : 'text-red-500'}>{att.is_present ? 'P' : 'A'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Admin Comment</label>
              <textarea className="input-field min-h-[80px] text-sm" value={adminComment}
                onChange={e => setAdminComment(e.target.value)} placeholder="Feedback for faculty..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { handleApprove(viewing.id); setViewing(null) }} className="btn-success flex-1 flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => { handleReject(viewing.id); setViewing(null) }} className="btn-danger flex-1 flex items-center justify-center gap-2">
                <XCircleIcon className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
