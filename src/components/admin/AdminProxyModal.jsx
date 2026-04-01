import { useState, useEffect } from 'react'
import { Search, CheckCircle, AlertTriangle, ChevronRight, ChevronLeft, Clock, User, Filter } from 'lucide-react'
import { Modal, toast } from '../ui'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getDayName, today, sendNotification, formatDate, getInitials } from '../../utils/helpers'
import { DEMO_FACULTY_LIST, DEMO_TIMETABLE } from '../../lib/demoData'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL
const STEPS = ['Absent Faculty', 'Select Lectures', 'Assign Proxies', 'Confirm']

export default function AdminProxyModal({ open, onClose, onSuccess }) {
  const { profile } = useAuth()
  const [step, setStep] = useState(0)
  const [facultyList, setFacultyList] = useState([])
  const [departments, setDepartments] = useState([])

  // Step 0
  const [absentFaculty, setAbsentFaculty] = useState(null)
  const [absentSearch, setAbsentSearch] = useState('')

  // Step 1
  const [absentSchedule, setAbsentSchedule] = useState([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [selectedLectures, setSelectedLectures] = useState([])

  // Step 2 — per-lecture proxy map: { [timetable_id]: faculty_object }
  const [lectureProxies, setLectureProxies] = useState({})
  const [assigningFor, setAssigningFor] = useState(null) // which lecture currently picking for
  const [proxySearch, setProxySearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('') // department filter for proxy picker

  // Step 3
  const [reason, setReason] = useState('Faculty Absent')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(0)
      setAbsentFaculty(null)
      setAbsentSearch('')
      setAbsentSchedule([])
      setSelectedLectures([])
      setLectureProxies({})
      setAssigningFor(null)
      setProxySearch('')
      setDeptFilter('')
      setReason('Faculty Absent')
      fetchFaculty()
    }
  }, [open])

  const fetchFaculty = async () => {
    if (DEMO_MODE) {
      setFacultyList(DEMO_FACULTY_LIST)
      setDepartments([...new Set(DEMO_FACULTY_LIST.map(f => f.department).filter(Boolean))])
      return
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, department, role, employee_id, initials')
        .in('role', ['faculty', 'admin', 'hod'])
        .eq('is_active', true)
        .order('full_name')
      if (error) throw error
      setFacultyList(data || [])
      setDepartments([...new Set((data || []).map(f => f.department).filter(Boolean))].sort())
    } catch (err) {
      console.error('Error fetching faculty:', err)
    }
  }

  const handleSelectAbsentFaculty = async (fac) => {
    setAbsentFaculty(fac)
    setLoadingSchedule(true)
    setAbsentSchedule([])
    setSelectedLectures([])
    const dayName = getDayName()
    try {
      if (DEMO_MODE) {
        const schedule = DEMO_TIMETABLE.filter(t => t.faculty_id === fac.id && t.day_of_week === dayName)
        setAbsentSchedule(schedule)
        setSelectedLectures(schedule.map(t => t.id))
        setLoadingSchedule(false)
        return
      }
      const { data, error } = await supabase
        .from('timetable')
        .select(`*, subjects(*), divisions(*), rooms(*), time_slots(*)`)
        .eq('faculty_id', fac.id)
        .eq('day_of_week', dayName)
        .eq('is_active', true)
      if (error) throw error
      setAbsentSchedule(data || [])
      setSelectedLectures((data || []).map(t => t.id))
    } catch (err) {
      console.error('Error fetching schedule:', err)
      toast.error('Failed to load timetable')
    } finally {
      setLoadingSchedule(false)
    }
  }

  const toggleLecture = (id) => {
    setSelectedLectures(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAll = () => {
    if (selectedLectures.length === absentSchedule.length) {
      setSelectedLectures([])
    } else {
      setSelectedLectures(absentSchedule.map(t => t.id))
    }
  }

  const selectedLectureObjects = absentSchedule.filter(t => selectedLectures.includes(t.id))
  const allAssigned = selectedLectureObjects.length > 0 && selectedLectureObjects.every(e => lectureProxies[e.id])

  // Proxy search & filter — exclude absent faculty from options
  const filteredProxyFaculty = facultyList.filter(f => {
    if (f.id === absentFaculty?.id) return false
    const matchDept = !deptFilter || f.department === deptFilter
    const matchSearch = !proxySearch ||
      f.full_name?.toLowerCase().includes(proxySearch.toLowerCase()) ||
      f.department?.toLowerCase().includes(proxySearch.toLowerCase()) ||
      f.employee_id?.toLowerCase?.()?.includes(proxySearch.toLowerCase())
    return matchDept && matchSearch
  })

  const filteredAbsentFaculty = facultyList.filter(f =>
    f.full_name?.toLowerCase().includes(absentSearch.toLowerCase()) ||
    f.department?.toLowerCase().includes(absentSearch.toLowerCase()) ||
    f.employee_id?.toLowerCase?.()?.includes(absentSearch.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!absentFaculty || !allAssigned) return
    setSubmitting(true)
    try {
      const todayStr = today()
      const records = selectedLectureObjects.map(entry => ({
        substitution_date: todayStr,
        absent_faculty_id: absentFaculty.id,
        proxy_faculty_id: lectureProxies[entry.id].id,
        timetable_id: entry.id,
        reason: reason || 'Faculty Absent',
        status: 'active',
        created_by: profile?.id,
      }))

      if (DEMO_MODE) {
        setTimeout(() => {
          toast.success('Proxy assigned successfully')
          onSuccess?.()
          setSubmitting(false)
        }, 600)
        return
      }

      const { error } = await supabase.from('substitutions').insert(records)
      if (error) throw error

      // Notify absent faculty
      await sendNotification(supabase, absentFaculty.id, 'Proxy Assigned',
        `${records.length} of your lecture(s) on ${formatDate(todayStr)} have been covered by proxy faculty.`, 'info')

      // Notify each proxy faculty
      const proxyNotifs = Object.entries(lectureProxies).map(([tid, fac]) => {
        const entry = absentSchedule.find(e => e.id === tid)
        return sendNotification(supabase, fac.id, 'New Proxy Assignment',
          `You have been assigned to cover ${entry?.subjects?.subject_name} for ${absentFaculty.full_name} on ${formatDate(todayStr)}.`, 'info')
      })
      await Promise.all(proxyNotifs)

      toast.success('Proxy assigned successfully')
      onSuccess?.()
    } catch (err) {
      console.error('Error assigning proxy:', err)
      toast.error('Failed to assign proxy')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = [
    !!absentFaculty,
    selectedLectures.length > 0,
    allAssigned && !assigningFor,
    true,
  ][step]

  return (
    <Modal open={open} onClose={onClose} title="Assign Proxy Faculty" size="lg">
      {/* Step indicator */}
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1 rounded-full transition-all duration-300 mb-1"
              style={{ background: i <= step ? 'var(--brand)' : 'rgba(255,255,255,0.1)' }} />
            <span className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: i === step ? 'var(--brand)' : 'var(--text-secondary)', opacity: i === step ? 1 : 0.5 }}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* ── STEP 0: Absent Faculty ── */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select the faculty member who is absent today.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input className="input-field pl-9 w-full" placeholder="Search by name, ID, or department…"
              value={absentSearch} onChange={e => setAbsentSearch(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredAbsentFaculty.map(fac => {
              const isSelected = absentFaculty?.id === fac.id
              return (
                <button key={fac.id} onClick={() => handleSelectAbsentFaculty(fac)}
                  className="w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3"
                  style={{
                    background: isSelected ? 'rgba(74,108,247,0.1)' : 'rgba(255,255,255,0.04)',
                    borderColor: isSelected ? 'rgba(74,108,247,0.5)' : 'rgba(255,255,255,0.08)',
                  }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: isSelected ? 'var(--brand)' : 'rgba(100,100,120,0.4)' }}>
                    {fac.initials || getInitials(fac.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{fac.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {fac.employee_id ? `${fac.employee_id} · ` : ''}{fac.department}
                      {fac.role !== 'faculty' && <span className="ml-1 text-[10px] uppercase font-bold opacity-60">({fac.role})</span>}
                    </p>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--brand)' }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEP 1: Select Lectures ── */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Lectures for <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{absentFaculty?.full_name}</span> today
            </p>
            <button onClick={toggleAll} className="text-xs font-semibold px-3 py-1 rounded-lg"
              style={{ color: 'var(--brand)', background: 'rgba(74,108,247,0.1)' }}>
              {selectedLectures.length === absentSchedule.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {loadingSchedule ? (
            <div className="text-center py-8 opacity-50 text-sm">Loading schedule…</div>
          ) : absentSchedule.length === 0 ? (
            <div className="text-center py-8 glass-card">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No lectures scheduled today for this faculty.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {absentSchedule.map(entry => {
                const isChecked = selectedLectures.includes(entry.id)
                return (
                  <label key={entry.id} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    style={{
                      background: isChecked ? 'rgba(74,108,247,0.08)' : 'rgba(255,255,255,0.04)',
                      borderColor: isChecked ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)',
                    }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleLecture(entry.id)} className="rounded w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{entry.subjects?.subject_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(74,108,247,0.15)', color: '#7090ff' }}>
                          {entry.divisions?.division_name}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          <Clock className="w-3 h-3" />
                          {entry.time_slots?.start_time?.substring(0, 5)} – {entry.time_slots?.end_time?.substring(0, 5)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{entry.rooms?.room_number}</span>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Assign Proxy Per Lecture ── */}
      {step === 2 && (
        assigningFor ? (
          /* Faculty picker for one lecture */
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => { setAssigningFor(null); setProxySearch('') }}
                className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Pick proxy for:</p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {assigningFor.subjects?.subject_name} · {assigningFor.divisions?.division_name} · {assigningFor.time_slots?.start_time?.substring(0, 5)}
                </p>
              </div>
            </div>

            {/* Department filter dropdown */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <input className="input-field pl-9 py-2.5 w-full" placeholder="Search faculty…"
                  value={proxySearch} onChange={e => setProxySearch(e.target.value)} autoFocus />
              </div>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="input-field pl-8 pr-2 py-2.5 text-xs appearance-none min-w-[130px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <option value="">All Depts</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {filteredProxyFaculty.length === 0 ? (
                <p className="text-center text-sm py-6" style={{ color: 'var(--text-secondary)' }}>No faculty found</p>
              ) : filteredProxyFaculty.map(fac => {
                const current = lectureProxies[assigningFor.id]
                const isSelected = current?.id === fac.id
                return (
                  <button key={fac.id}
                    onClick={() => {
                      setLectureProxies(prev => ({ ...prev, [assigningFor.id]: fac }))
                      setAssigningFor(null)
                      setProxySearch('')
                    }}
                    className="w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3"
                    style={{
                      background: isSelected ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.04)',
                      borderColor: isSelected ? 'rgba(63,185,80,0.5)' : 'rgba(255,255,255,0.08)',
                    }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: isSelected ? '#3fb950' : 'rgba(100,100,120,0.4)' }}>
                      {fac.initials || getInitials(fac.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{fac.full_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {fac.department}
                        {fac.role !== 'faculty' && <span className="ml-1 text-[10px] uppercase font-bold opacity-60">({fac.role})</span>}
                      </p>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Lecture list — tap each to assign */
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Tap each lecture to assign a proxy faculty member.
            </p>
            {selectedLectureObjects.map(entry => {
              const proxy = lectureProxies[entry.id]
              return (
                <button key={entry.id} onClick={() => setAssigningFor(entry)}
                  className="w-full text-left p-4 rounded-2xl border transition-all"
                  style={{
                    background: proxy ? 'rgba(63,185,80,0.08)' : 'rgba(255,255,255,0.04)',
                    borderColor: proxy ? 'rgba(63,185,80,0.4)' : 'rgba(74,108,247,0.35)',
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{entry.subjects?.subject_name}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                        <span className="px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(74,108,247,0.15)', color: '#7090ff' }}>{entry.divisions?.division_name}</span>
                        <span>{entry.time_slots?.start_time?.substring(0, 5)} – {entry.time_slots?.end_time?.substring(0, 5)}</span>
                        <span>{entry.rooms?.room_number}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {proxy ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-green-400">Assigned</p>
                            <p className="text-xs font-semibold truncate max-w-[80px]" style={{ color: 'var(--text-primary)' }}>{proxy.full_name.split(' ')[0]}</p>
                          </div>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
                            {proxy.initials || getInitials(proxy.full_name)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                          <User className="w-3.5 h-3.5" /> Assign
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
            {!allAssigned && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(74,108,247,0.08)', color: 'var(--brand)' }}>
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{selectedLectureObjects.length - Object.keys(lectureProxies).filter(k => selectedLectures.includes(k)).length} lecture(s) still need a proxy assigned.</span>
              </div>
            )}
          </div>
        )
      )}

      {/* ── STEP 3: Confirm ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border" style={{ background: 'rgba(74,108,247,0.08)', borderColor: 'rgba(74,108,247,0.3)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Assignment Summary</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Absent: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{absentFaculty?.full_name}</span>
            </p>
          </div>

          <div>
            <p className="form-label mb-2">Lecture → Proxy Assignments ({selectedLectureObjects.length})</p>
            <div className="space-y-2">
              {selectedLectureObjects.map(entry => {
                const proxy = lectureProxies[entry.id]
                return (
                  <div key={entry.id} className="p-3 rounded-xl flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.subjects?.subject_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {entry.divisions?.division_name} · {entry.time_slots?.start_time?.substring(0, 5)} · {entry.rooms?.room_number}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" style={{ color: 'var(--text-secondary)' }} />
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-green-400">{proxy?.full_name?.split(' ')[0]}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{proxy?.department}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Reason</label>
            <input className="input-field w-full" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Reason for absence…" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {step === 0 ? (
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[48px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
        ) : (step === 2 && assigningFor) ? (
          <button onClick={() => { setAssigningFor(null); setProxySearch('') }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[48px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[48px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={() => { if (assigningFor) return; setStep(s => s + 1) }}
            disabled={!canProceed || (step === 1 && loadingSchedule)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold btn-primary disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px]">
            {submitting ? 'Saving…' : 'Save Proxy Assignment'}
          </button>
        )}
      </div>
    </Modal>
  )
}
