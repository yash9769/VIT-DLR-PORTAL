import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Users, Check, X, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { cls } from '../../utils/helpers'

export default function AttendancePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { divisionId, returnTo, restoredForm, restoredStep, initialAttendance } = location.state || {}

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState(initialAttendance || {})
  const [search, setSearch] = useState('')
  const [division, setDivision] = useState(null)

  useEffect(() => {
    if (!divisionId) {
      navigate('/faculty')
      return
    }
    fetchStudents()
  }, [divisionId])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const [stdRes, divRes] = await Promise.all([
        supabase.from('students').select('*').eq('division_id', divisionId).eq('is_active', true).order('roll_number'),
        supabase.from('divisions').select('*').eq('id', divisionId).single()
      ])
      
      setStudents(stdRes.data || [])
      setDivision(divRes.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  const presentCount = students.filter(s => attendance[s.id] === true).length
  const totalMarked = students.filter(s => attendance[s.id] !== undefined).length
  const percent = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0

  const toggle = (id) => setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  const markAll = (present) => {
    const updated = {}
    students.forEach(s => { updated[s.id] = present })
    setAttendance(updated)
  }

  const handleSave = () => {
    if (returnTo) {
      navigate(returnTo, { 
        state: { 
          presentCount, 
          restoredForm: {
            ...restoredForm,
            attendanceDetails: attendance,
            present_count: presentCount
          },
          restoredStep 
        },
        replace: true
      })
    } else {
      window.history.back()
    }
  }

  if (loading) return <div className="p-8 text-center text-sm opacity-50">Loading students...</div>

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="px-4 pt-4 pb-3 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Roll Call</h1>
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-lg text-green-400">{presentCount}</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>/ {students.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: 'rgba(74,108,247,0.12)', color: '#7090ff' }}>
            {division?.division_name || 'Division'}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{students.length} Students</span>
        </div>

        <div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-300" style={{
              width: `${percent}%`,
              background: percent >= 75 ? 'linear-gradient(90deg,#3fb950,#2da040)' : 'linear-gradient(90deg,#f85149,#d73a3a)'
            }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-400 font-semibold">Present: {presentCount}</span>
            <span className="font-bold" style={{ color: percent >= 75 ? '#3fb950' : '#f85149' }}>{percent}%</span>
            <span className="text-red-400 font-semibold">Absent: {students.length - presentCount}</span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-10 text-sm" placeholder="Search name or roll no..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button onClick={() => markAll(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid rgba(63,185,80,0.3)', color: '#3fb950' }}>
            <Check className="w-4 h-4" /> All Present
          </button>
          <button onClick={() => markAll(false)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', color: '#f85149' }}>
            <X className="w-4 h-4" /> All Absent
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-32">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(student => {
            const isPresent = attendance[student.id] === true
            const isMarked = attendance[student.id] !== undefined
            return (
              <button key={student.id} onClick={() => toggle(student.id)}
                className={cls('attendance-chip text-left flex flex-col gap-0.5', isPresent ? 'present' : isMarked ? 'absent' : '')}
                style={!isMarked ? { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' } : {}}>
                <span className="text-xs font-mono" style={{ color: isPresent ? '#3fb950' : isMarked ? '#f85149' : 'var(--text-secondary)' }}>
                  {student.roll_number}
                </span>
                <span className="font-semibold text-sm leading-tight">{student.full_name}</span>
                <div className="mt-1">
                  {isPresent ? <span className="text-xs text-green-400 font-bold">P - Present</span>
                    : isMarked ? <span className="text-xs text-red-400 font-bold">A - Absent</span>
                    : <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tap to mark</span>}
                </div>
              </button>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No students found</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 py-3" style={{ background: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--text-secondary)' }}>Marked: <strong>{totalMarked}/{students.length}</strong></span>
          {totalMarked < students.length && <span className="text-xs text-yellow-400">{students.length - totalMarked} unmarked</span>}
        </div>
        <button onClick={handleSave} className="btn-success w-full min-h-[52px] flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Save Attendance ({presentCount} Present)
        </button>
      </div>
    </div>
  )
}
