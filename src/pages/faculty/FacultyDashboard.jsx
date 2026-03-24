import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, AlertCircle, Clock, BookOpen, Users, CheckCircle, ChevronRight, TrendingUp, AlertTriangle, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDayName, formatTime, attendancePercent, today } from '../../utils/helpers'
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

const TimetableCard = ({ entry, submitted, onSubmit, isProxy = false, coveringFor = null }) => (
  <div
    className="glass-card p-4 flex items-center gap-4 transition-all active:scale-98"
    style={isProxy ? { borderLeft: '3px solid rgba(74,108,247,0.6)' } : {}}
  >
    {/* Time badge */}
    <div className="w-14 flex-shrink-0 text-center">
      <p className="font-display font-bold text-sm leading-tight" style={{ color: isProxy ? '#7090ff' : 'var(--brand)' }}>
        {entry.time_slots?.start_time?.substring(0, 5)}
      </p>
      <div className="w-0.5 h-3 mx-auto my-1 rounded-full opacity-40" style={{ background: isProxy ? '#7090ff' : 'var(--brand)' }} />
      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {entry.time_slots?.end_time?.substring(0, 5)}
      </p>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        {isProxy && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" style={{ background: 'rgba(74,108,247,0.2)', color: '#7090ff' }}>
            PROXY
          </span>
        )}
        <p className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {entry.subjects?.subject_name}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider" style={{ background: isProxy ? 'rgba(74,108,247,0.2)' : 'var(--brand)', color: isProxy ? '#7090ff' : 'white', opacity: isProxy ? 1 : 0.85 }}>
          {entry.divisions?.division_name}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {entry.rooms?.room_number}
        </span>
      </div>
      {coveringFor && (
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Covering for: <span className="font-semibold">{coveringFor}</span>
        </p>
      )}
    </div>

    {/* Submit button */}
    <div className="flex-shrink-0">
      {submitted ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(63,185,80,0.15)' }}>
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
      ) : (
        <button onClick={() => onSubmit(entry)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90" style={{ background: isProxy ? 'linear-gradient(135deg,#4A6CF7,#3355e8)' : 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
          <Plus className="w-4 h-4 text-white" />
        </button>
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
          absent_faculty:absent_faculty_id(id, full_name),
          proxy_faculty:proxy_faculty_id(id, full_name),
          timetable:timetable_id(
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
      const todayPending = (timetable || []).filter(t => !todaySubmittedIds.has(t.id)).length
      const awaitingApproval = records?.filter(r => r.approval_status === 'pending').length || 0
      const avgAtt = records?.length > 0
        ? Math.round(records.reduce((s, r) => s + attendancePercent(r.present_count, r.total_students), 0) / records.length)
        : 0

      setStats({ todayPending, awaitingApproval, avgAttendance: avgAtt, totalRecords: records?.length || 0 })
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

      {/* ── "Are you absent today?" card ── show only if schedule exists and not already absent */}
      {todaySchedule.length > 0 && !iAmAbsent && (
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

      {/* Today's timetable — only show if not absent */}
      {!iAmAbsent && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              Today's Schedule
            </h2>
            <span className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>{dayName}</span>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No classes today!</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Enjoy your free day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map(entry => (
                <TimetableCard
                  key={entry.id}
                  entry={entry}
                  submitted={submittedIds.has(entry.id)}
                  onSubmit={(e) => navigate('/faculty/submit', { state: { entry: e } })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proxy Lectures Assigned to You */}
      {proxyLectures.length > 0 && (
        <div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-3"
            style={{ background: 'rgba(74,108,247,0.1)', border: '1px solid rgba(74,108,247,0.25)' }}
          >
            <Shield className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--brand)' }}>
              Proxy Lectures Assigned to You
            </h2>
          </div>

          <div className="space-y-3">
            {proxyLectures.map(sub => {
              const entry = sub.timetable
              if (!entry) return null
              const isSubmitted = submittedIds.has(entry.id)
              return (
                <TimetableCard
                  key={sub.id}
                  entry={entry}
                  submitted={isSubmitted}
                  isProxy={true}
                  coveringFor={sub.absent_faculty?.full_name}
                  onSubmit={(e) => navigate('/faculty/submit', {
                    state: {
                      entry: e,
                      isSubstitution: true,
                      originalFacultyId: sub.absent_faculty_id,
                      substitutionRefId: sub.id,
                    }
                  })}
                />
              )
            })}
          </div>
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
        onClose={() => setShowProxyModal(false)}
        profile={profile}
        todaySchedule={todaySchedule}
        onSuccess={fetchDashboardData}
      />
    </div>
  )
}
