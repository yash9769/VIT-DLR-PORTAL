import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, AlertCircle, Clock, BookOpen, Users, CheckCircle, ChevronRight, TrendingUp, AlertTriangle, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDayName, formatTime, attendancePercent, today, cls } from '../../utils/helpers'
import { supabase } from '../../lib/supabase'
import { toast } from '../../components/ui'
import ProxyAssignModal from '../../components/faculty/ProxyAssignModal'
import {
  DEMO_TIMETABLE, DEMO_LECTURE_RECORDS, DEMO_SUBSTITUTIONS
} from '../../lib/demoData'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="glass-card p-4 flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)' }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-80" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="font-display font-bold text-xl leading-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  </div>
)

const TimetableCard = ({ 
  entry, 
  submitted, 
  onSubmit, 
  isProxy = false, 
  coveringFor = null,
  onProxy,
  isSubstitutedOut,
  proxyFacultyName
}) => (
  <div
    className={cls(
      "glass-card p-4 flex items-center gap-4 transition-all active:scale-98 overflow-hidden relative",
      isProxy ? "border-l-4 border-amber-500 bg-amber-50/10 shadow-amber-500/5" : ""
    )}
  >
    {isProxy && (
      <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-gradient-to-l from-amber-500 to-orange-500 text-[8px] font-bold text-white uppercase tracking-widest shadow-sm">
        Substitution
      </div>
    )}

    {/* Time badge */}
    <div className="w-14 flex-shrink-0 text-center">
      <p className="font-display font-bold text-sm leading-tight" style={{ color: isProxy ? '#d97706' : 'var(--brand)' }}>
        {entry.time_slots?.start_time?.substring(0, 5)}
      </p>
      <div className="w-0.5 h-3 mx-auto my-1 rounded-full opacity-40" style={{ background: isProxy ? '#d97706' : 'var(--brand)' }} />
      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {entry.time_slots?.end_time?.substring(0, 5)}
      </p>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {entry.subjects?.subject_name || entry.custom_subject || 'Unknown Subject'}
          {entry.subjects?.lecture_type && (
            <span className="ml-1 opacity-50 text-[10px] font-medium uppercase tracking-tighter">
              ({entry.subjects.lecture_type === 'theory' ? 'Lec' : entry.subjects.lecture_type === 'practical' ? 'Lab' : 'Tut'})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className={cls(
          "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
          isProxy ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-brand-500 text-white"
        )}>
          {entry.divisions?.division_name}
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {entry.rooms?.room_number}
        </span>
      </div>
      {coveringFor && (
        <div className="flex items-center gap-1.5 mt-2 p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 w-fit">
          <Users className="w-3 h-3 text-amber-600" />
          <p className="text-[10px] font-bold uppercase tracking-tight text-amber-700">
            Covering for {coveringFor}
          </p>
        </div>
      )}
      {isSubstitutedOut && (
        <div className="flex items-center gap-1.5 mt-2 p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 w-fit">
          <Shield className="w-3 h-3 text-emerald-600" />
          <p className="text-[10px] font-bold uppercase tracking-tight text-emerald-700">
            Proxied to {proxyFacultyName || 'someone'}
          </p>
        </div>
      )}
    </div>

    {/* Action buttons */}
    <div className="flex flex-shrink-0 items-center gap-2">
      {!isProxy && onProxy && !submitted && !isSubstitutedOut && (
        <button 
          onClick={() => onProxy(entry)} 
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-brand-50 hover:bg-brand-100 border border-brand-200 active:scale-90"
          title="Assign Proxy"
        >
          <Users className="w-5 h-5 text-brand-600" />
        </button>
      )}
      
      {submitted ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10">
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
      ) : !isSubstitutedOut ? (
        <button 
          onClick={() => onSubmit(entry)} 
          className={cls(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md",
            isProxy ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20" : "bg-gradient-to-br from-brand-500 to-indigo-600 shadow-brand-500/20"
          )}
          title="Submit DLR"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10">
          <Shield className="w-4 h-4 text-emerald-500" />
        </div>
      )}
    </div>
  </div>
)

export default function FacultyDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const dayName = getDayName()
  const todayStr = today()

  const [loading, setLoading] = useState(true)
  const [todaySchedule, setTodaySchedule] = useState([])
  const [lectureRecords, setLectureRecords] = useState([])
  const [substitutions, setSubstitutions] = useState([])
  const [showProxyModal, setShowProxyModal] = useState(false)
  const [stats, setStats] = useState({
    todayPending: 0,
    awaitingApproval: 0,
    avgAttendance: 0,
    totalRecords: 0
  })
  const [selectedLecture, setSelectedLecture] = useState(null)

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData()
    }
  }, [profile?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      if (DEMO_MODE) {
        // Demo mode — use local demo data
        const schedule = DEMO_TIMETABLE.filter(
          t => t.faculty_id === profile.id && t.day_of_week === dayName
        )
        setTodaySchedule(schedule)
        setLectureRecords(DEMO_LECTURE_RECORDS)

        const activeSubs = DEMO_SUBSTITUTIONS.filter(
          s => s.substitution_date === todayStr &&
               s.status === 'active' &&
               (s.absent_faculty_id === profile.id || s.proxy_faculty_id === profile.id)
        )
        setSubstitutions(activeSubs)

        const submittedIds = new Set(
          DEMO_LECTURE_RECORDS.filter(r => r.lecture_date === todayStr).map(r => r.timetable_id)
        )
        const todayPending = schedule.filter(t => !submittedIds.has(t.id)).length
        const awaitingApproval = DEMO_LECTURE_RECORDS.filter(r => r.approval_status === 'pending').length
        const avgAtt = DEMO_LECTURE_RECORDS.length > 0
          ? Math.round(DEMO_LECTURE_RECORDS.reduce((s, r) => s + attendancePercent(r.present_count, r.total_students), 0) / DEMO_LECTURE_RECORDS.length)
          : 0

        setStats({ todayPending, awaitingApproval, avgAttendance: avgAtt, totalRecords: DEMO_LECTURE_RECORDS.length })
        setLoading(false)
        return
      }

      // 1. Fetch Today's Timetable
      const { data: timetable, error: ttError } = await supabase
        .from('timetable')
        .select(`*, subjects(*), divisions(*), rooms(*), time_slots(*)`)
        .eq('faculty_id', profile.id)
        .eq('day_of_week', dayName)
        .eq('is_active', true)

      if (ttError) throw ttError
      setTodaySchedule(timetable || [])

      // 2. Fetch Recent Lecture Records
      const { data: records, error: lrError } = await supabase
        .from('lecture_records')
        .select(`*, subjects(*), divisions(*), rooms:room_id(*)`)
        .eq('faculty_id', profile.id)
        .order('lecture_date', { ascending: false })
        .limit(20)

      if (lrError) throw lrError
      setLectureRecords(records || [])

      // 3. Fetch today's substitutions for this faculty
      const { data: subs, error: subErr } = await supabase
        .from('substitutions')
        .select(`
          *,
          absent_faculty:absent_faculty_id(id, full_name, role, department, initials),
          proxy_faculty:proxy_faculty_id(id, full_name, role, department, initials),
          timetable(
            *,
            subjects(*),
            divisions(*),
            rooms(*),
            time_slots(*)
          )
        `)
        .eq('substitution_date', todayStr)
        .eq('status', 'active')
        .or(`absent_faculty_id.eq.${profile.id},proxy_faculty_id.eq.${profile.id}`)

      if (subErr) throw subErr
      setSubstitutions(subs || [])

      // 4. Calculate Stats
      const todaySubmittedIds = new Set(
        records?.filter(r => r.lecture_date === todayStr).map(r => r.timetable_id) || []
      )
      const todayPendingCount = (timetable || []).filter(t => !todaySubmittedIds.has(t.id)).length
      const awaitingApproval = records?.filter(r => r.approval_status === 'pending').length || 0
      const rejectedCount = records?.filter(r => r.approval_status === 'rejected').length || 0
      const avgAtt = records?.length > 0
        ? Math.round(records.reduce((s, r) => s + attendancePercent(r.present_count, r.total_students), 0) / records.length)
        : 0
      
      setStats({ 
        todayPending: todayPendingCount, 
        awaitingApproval, 
        avgAttendance: avgAtt, 
        totalRecords: records?.length || 0,
        rejectedCount
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Determine current user's status from substitutions
  const iAmAbsent = substitutions.some(s => s.absent_faculty_id === profile?.id && s.status === 'active')
  const proxyLectures = substitutions.filter(s => s.proxy_faculty_id === profile?.id && s.status === 'active')

  const submittedIds = new Set(
    lectureRecords
      .filter(r => r.lecture_date === todayStr)
      .map(r => r.timetable_id)
  )

  const pendingLectures = todaySchedule.filter(t => !submittedIds.has(t.id))

  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const yesterdayRecords = lectureRecords.filter(r => r.lecture_date === yesterdayStr)

  if (loading) return <div className="p-8 text-center text-sm opacity-50">Loading your dashboard...</div>

  return (
    <div className="px-4 pt-5 pb-4 space-y-5 animate-fade-in">
      {/* Greeting */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80" style={{ color: 'var(--brand)' }}>
          {format(new Date(), 'EEEE, dd MMM yyyy')}
        </p>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {profile?.full_name}
        </p>
      </div>

      {/* ── "Are you absent today?" card ── show only if pending lectures exist and not already absent */}
      {stats.todayPending > 0 && !iAmAbsent && (
        <div
          className="p-4 rounded-2xl border"
          style={{
            background: 'rgba(245,158,11,0.08)',
            borderColor: 'rgba(245,158,11,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm" style={{ color: '#d97706' }}>Are you absent today?</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Assign a proxy faculty to cover your lectures
              </p>
              <button
                onClick={() => setShowProxyModal(true)}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white' }}
              >
                <Users className="w-4 h-4" />
                Assign Proxy for My Lectures
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Absent status card ── */}
      {iAmAbsent && (
        <div
          className="p-4 rounded-2xl border flex items-center gap-3"
          style={{ background: 'rgba(248,81,73,0.08)', borderColor: 'rgba(248,81,73,0.3)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(248,81,73,0.15)' }}>
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-red-400">You are marked absent today</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Your lectures are being covered by a proxy faculty.
            </p>
          </div>
        </div>
      )}

      {/* Rejected / Action Required Alert */}
      {stats.rejectedCount > 0 && !iAmAbsent && (
        <button 
          onClick={() => navigate('/faculty/history')} 
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-98" 
          style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.4)', boxShadow: '0 4px 20px rgba(248,81,73,0.1)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(248,81,73,0.15)' }}>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-bold text-sm text-red-500 uppercase tracking-wider">Action Required</p>
            <p className="font-semibold text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {stats.rejectedCount} Lecture Record{stats.rejectedCount > 1 ? 's' : ''} Rejected
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Tap to view reasons and edit records
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500 opacity-60" />
        </button>
      )}

      {/* Pending alert */}
      {(stats.todayPending > 0 || stats.awaitingApproval > 0) && !iAmAbsent && (
        <div className="space-y-2">
          {stats.todayPending > 0 && (
            <button onClick={() => navigate('/faculty/submit')} className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-98" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--brand)', boxShadow: '0 4px 20px var(--brand-glow)' }}>
              <AlertCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {stats.todayPending} Unsubmitted Lecture{stats.todayPending > 1 ? 's' : ''} Today
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Tap to submit today's lecture records
                </p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          )}
          {stats.awaitingApproval > 0 && (
            <button onClick={() => navigate('/faculty/history')} className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-98" style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(210,153,34,0.5)', boxShadow: '0 4px 20px rgba(210,153,34,0.1)' }}>
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {stats.awaitingApproval} Record{stats.awaitingApproval > 1 ? 's' : ''} Awaiting Admin Approval
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Tap to view your submission history
                </p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Today's Classes" value={todaySchedule.length} icon={BookOpen} color="#4A6CF7" />
        <StatCard label="Awaiting Approval" value={stats.awaitingApproval} icon={Clock} color="#d29922" />
        <StatCard label="Avg Attendance" value={`${stats.avgAttendance}%`} icon={TrendingUp} color="#3fb950" />
        <StatCard label="Total Records" value={stats.totalRecords} icon={CheckCircle} color="#8b5cf6" />
      </div>

      {/* Integrated Schedule (Own + Proxy) */}
      {!iAmAbsent && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Today's Schedule
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-1 bg-brand-500/10 text-brand-600 rounded-lg border border-brand-500/20 uppercase tracking-widest">{dayName}</span>
              {(todaySchedule.length > 0 || proxyLectures.length > 0) && (
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 uppercase tracking-widest">
                  {todaySchedule.length + proxyLectures.length} Lectures
                </span>
              )}
            </div>
          </div>

          {/* Integrated merged schedule */}
          {(() => {
            const merged = [
              ...todaySchedule.map(t => ({ ...t, isProxy: false })),
              ...proxyLectures.map(p => {
                if (!p.timetable) {
                  console.warn('Proxy record missing timetable data:', p);
                  return null;
                }
                return {
                  ...p.timetable,
                  isProxy: true,
                  substitutionId: p.id,
                  absentFacultyName: p.absent_faculty?.full_name,
                  absentFacultyId: p.absent_faculty_id
                }
              }).filter(Boolean)
            ].sort((a, b) => (a.time_slots?.start_time || '').localeCompare(b.time_slots?.start_time || ''));

            return merged.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-2 bg-slate-50/50">
                <div className="w-16 h-16 rounded-full bg-white mx-auto flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                  <Clock className="w-8 h-8 text-slate-200" />
                </div>
                <p className="font-bold text-slate-800">No classes scheduled today</p>
                <p className="text-xs text-slate-400 mt-1">You're all clear! Enjoy your free time.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {merged.map((entry, idx) => {
                  const isSubmitted = submittedIds.has(entry.id);
                  const isSubstitutedOut = substitutions.find(s => s.timetable_id === entry.id && s.absent_faculty_id === profile.id);
                  
                  return (
                    <TimetableCard 
                      key={entry.isProxy ? `proxy-${entry.id}-${entry.substitutionId}` : `own-${entry.id}`}
                      entry={entry}
                      isProxy={entry.isProxy}
                      coveringFor={entry.absentFacultyName}
                      isSubstitutedOut={!!isSubstitutedOut}
                      proxyFacultyName={isSubstitutedOut?.proxy_faculty?.full_name}
                      submitted={isSubmitted}
                      onProxy={(tt) => {
                        setSelectedLecture(tt);
                        setShowProxyModal(true);
                      }}
                      onSubmit={(e) => navigate('/faculty/submit', { 
                        state: { 
                          entry: e,
                          isSubstitution: entry.isProxy,
                          ...(entry.isProxy ? {
                            originalFacultyId: entry.absentFacultyId,
                            absentFacultyName: entry.absentFacultyName,
                            substitutionRefId: entry.substitutionId,
                          } : {})
                        } 
                      })}
                    />
                  )
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Yesterday reminder */}
      {yesterdayRecords.some(r => r.approval_status === 'pending') && (
        <div>
          <h2 className="font-display font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
            Yesterday's Status
          </h2>
          <div className="space-y-2">
            {yesterdayRecords.filter(r => r.approval_status === 'pending').map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)' }}>
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.subjects?.subject_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Pending admin review</p>
                </div>
                <span className="badge badge-pending">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick action */}
      {!iAmAbsent && (
        <button onClick={() => navigate('/faculty/submit')} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[56px] text-base">
          <Plus className="w-5 h-5" />
          Submit New Lecture Record
        </button>
      )}

      {/* Proxy Assign Modal */}
      <ProxyAssignModal
        open={showProxyModal}
        onClose={() => {
          setShowProxyModal(false);
          setSelectedLecture(null);
        }}
        profile={profile}
        todaySchedule={selectedLecture ? [selectedLecture] : pendingLectures}
        onSuccess={fetchDashboardData}
      />
    </div>
  )
}
