import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, AlertCircle, Clock, BookOpen, Users, CheckCircle, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDayName, formatTime, attendancePercent, today } from '../../utils/helpers'
import { supabase } from '../../lib/supabase'

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

const TimetableCard = ({ entry, submitted, onSubmit }) => (
  <div className="glass-card p-4 flex items-center gap-4 transition-all active:scale-98">
    {/* Time badge */}
    <div className="w-14 flex-shrink-0 text-center">
      <p className="font-display font-bold text-sm leading-tight" style={{ color: 'var(--brand)' }}>
        {entry.time_slots?.start_time?.substring(0, 5)}
      </p>
      <div className="w-0.5 h-3 mx-auto my-1 rounded-full opacity-40" style={{ background: 'var(--brand)' }} />
      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {entry.time_slots?.end_time?.substring(0, 5)}
      </p>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
        {entry.subjects?.subject_name}
      </p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider" style={{ background: 'var(--brand)', color: 'white', opacity: 0.85 }}>
          {entry.divisions?.division_name}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {entry.rooms?.room_number}
        </span>
      </div>
    </div>

    {/* Submit button */}
    <div className="flex-shrink-0">
      {submitted ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(63,185,80,0.15)' }}>
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
      ) : (
        <button onClick={() => onSubmit(entry)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
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
      
      // 1. Fetch Today's Timetable
      const { data: timetable, error: ttError } = await supabase
        .from('timetable')
        .select(`
          *,
          subjects (*),
          divisions (*),
          rooms (*),
          time_slots (*)
        `)
        .eq('faculty_id', profile.id)
        .eq('day_of_week', dayName)
        .eq('is_active', true)

      if (ttError) throw ttError
      setTodaySchedule(timetable || [])

      // 2. Fetch Recent Lecture Records
      const { data: records, error: lrError } = await supabase
        .from('lecture_records')
        .select(`
          *,
          subjects (*),
          divisions (*),
          rooms:room_id (*)
        `)
        .eq('faculty_id', profile.id)
        .order('lecture_date', { ascending: false })
        .limit(20)

      if (lrError) throw lrError
      setLectureRecords(records || [])

      // 3. Calculate Stats
      const todaySubmittedIds = new Set(
        records
          ?.filter(r => r.lecture_date === todayStr)
          .map(r => r.timetable_id) || []
      )
      
      const todayPending = (timetable || []).filter(t => !todaySubmittedIds.has(t.id)).length
      const awaitingApproval = records?.filter(r => r.approval_status === 'pending').length || 0
      
      const avgAtt = records?.length > 0
        ? Math.round(records.reduce((s, r) => s + attendancePercent(r.present_count, r.total_students), 0) / records.length)
        : 0

      setStats({
        todayPending,
        awaitingApproval,
        avgAttendance: avgAtt,
        totalRecords: records?.length || 0
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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

      {/* Pending alert */}
      {(stats.todayPending > 0 || stats.awaitingApproval > 0) && (
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

      {/* Today's timetable */}
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
      <button onClick={() => navigate('/faculty/submit')} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[56px] text-base">
        <Plus className="w-5 h-5" />
        Submit New Lecture Record
      </button>
    </div>
  )
}
