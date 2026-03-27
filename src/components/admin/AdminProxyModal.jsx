import { useState, useEffect } from 'react'
import { Search, CheckCircle, AlertTriangle, ChevronRight, ChevronLeft, Clock } from 'lucide-react'
import { Modal, toast } from '../ui'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getDayName, today, sendNotification, formatDate } from '../../utils/helpers'
import { DEMO_FACULTY_LIST, DEMO_TIMETABLE } from '../../lib/demoData'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL
const STEPS = ['Absent Faculty', 'Select Lectures', 'Proxy Faculty', 'Confirm']

export default function AdminProxyModal({ open, onClose, onSuccess }) {
  const { profile } = useAuth()
  const [step, setStep] = useState(0)
  const [facultyList, setFacultyList] = useState([])
  const [absentFaculty, setAbsentFaculty] = useState(null)
  const [absentSearch, setAbsentSearch] = useState('')
  const [absentSchedule, setAbsentSchedule] = useState([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [selectedLectures, setSelectedLectures] = useState([])
  const [proxyFaculty, setProxyFaculty] = useState(null)
  const [proxySearch, setProxySearch] = useState('')
  const [conflicts, setConflicts] = useState([])
  const [reason, setReason] = useState('Faculty Absent')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(0)
      setAbsentFaculty(null)
      setAbsentSearch('')
      setAbsentSchedule([])
      setSelectedLectures([])
      setProxyFaculty(null)
      setProxySearch('')
      setConflicts([])
      setReason('Faculty Absent')
      fetchFaculty()
    }
  }, [open])

  const fetchFaculty = async () => {
    if (DEMO_MODE) {
      setFacultyList(DEMO_FACULTY_LIST)
      return
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, department, role, employee_id')
        .eq('role', 'faculty')
        .eq('is_active', true)
      if (error) throw error
      setFacultyList(data || [])
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
        const schedule = DEMO_TIMETABLE.filter(
          t => t.faculty_id === fac.id && t.day_of_week === dayName
        )
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

  const checkConflicts = async (proxy) => {
    if (!proxy || selectedLectures.length === 0) {
      setConflicts([])
      return
    }

    const selectedSlots = absentSchedule
      .filter(t => selectedLectures.includes(t.id))
      .map(t => t.time_slot_id)

    const dayName = getDayName()

    try {
      if (DEMO_MODE) {
        const proxySchedule = DEMO_TIMETABLE.filter(
          t => t.faculty_id === proxy.id && t.day_of_week === dayName
        )
        const conflictList = proxySchedule
          .filter(t => selectedSlots.includes(t.time_slot_id))
          .map(t => ({
            message: `${proxy.full_name} already has ${t.subjects?.subject_name} at ${t.time_slots?.start_time?.substring(0, 5)}`
          }))
        setConflicts(conflictList)
        return
      }

      const { data, error } = await supabase
        .from('timetable')
        .select(`*, subjects(*), time_slots(*)`)
        .eq('faculty_id', proxy.id)
        .eq('day_of_week', dayName)
        .eq('is_active', true)
        .in('time_slot_id', selectedSlots)

      if (error) throw error

      const conflictList = (data || []).map(t => ({
        message: `${proxy.full_name} already has ${t.subjects?.subject_name} at ${t.time_slots?.start_time?.substring(0, 5)}`
      }))
      setConflicts(conflictList)
    } catch (err) {
      console.error('Error checking conflicts:', err)
    }
  }

  const handleSelectProxy = async (fac) => {
    setProxyFaculty(fac)
    await checkConflicts(fac)
  }

  const toggleLecture = (id) => {
    setSelectedLectures(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedLectures.length === absentSchedule.length) {
      setSelectedLectures([])
    } else {
      setSelectedLectures(absentSchedule.map(t => t.id))
    }
  }

  const filteredAbsentFaculty = facultyList.filter(f =>
    f.full_name?.toLowerCase().includes(absentSearch.toLowerCase()) ||
    f.department?.toLowerCase().includes(absentSearch.toLowerCase()) ||
    f.employee_id?.toLowerCase?.()?.includes(absentSearch.toLowerCase())
  )

  const filteredProxyFaculty = facultyList.filter(f =>
    f.id !== absentFaculty?.id &&
    (f.full_name?.toLowerCase().includes(proxySearch.toLowerCase()) ||
    f.department?.toLowerCase().includes(proxySearch.toLowerCase()))
  )

  const selectedLectureObjects = absentSchedule.filter(t => selectedLectures.includes(t.id))

  const handleSubmit = async () => {
    if (!absentFaculty || !proxyFaculty || selectedLectures.length === 0) return
    setSubmitting(true)

    try {
      const todayStr = today()
      const records = selectedLectureObjects.map(entry => ({
        substitution_date: todayStr,
        absent_faculty_id: absentFaculty.id,
        proxy_faculty_id: proxyFaculty.id,
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

      // Notify both faculty
      await Promise.all([
        sendNotification(supabase, absentFaculty.id, 'Proxy Assigned', `${proxyFaculty.full_name} will cover your ${selectedLectures.length} lecture(s) on ${formatDate(todayStr)}.`, 'info'),
        sendNotification(supabase, proxyFaculty.id, 'New Proxy Assignment', `You have been assigned to cover ${selectedLectures.length} lecture(s) for ${absentFaculty.full_name} on ${formatDate(todayStr)}.`, 'info')
      ])

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
    !!proxyFaculty,
    true,
  ][step]

  return (
    <Modal open={open} onClose={onClose} title="Assign Proxy Faculty" size="lg">
      {/* Step indicator */}
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className="h-1 rounded-full transition-all duration-300 mb-1"
              style={{ background: i <= step ? 'var(--brand)' : 'rgba(255,255,255,0.1)' }}
            />
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: i === step ? 'var(--brand)' : 'var(--text-secondary)', opacity: i === step ? 1 : 0.5 }}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 0: Absent Faculty */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select the faculty member who is absent today.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input
              className="input-field pl-9 w-full"
              placeholder="Search by name, ID, or department…"
              value={absentSearch}
              onChange={e => setAbsentSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredAbsentFaculty.map(fac => {
              const isSelected = absentFaculty?.id === fac.id
              return (
                <button
                  key={fac.id}
                  onClick={() => handleSelectAbsentFaculty(fac)}
                  className="w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3"
                  style={{
                    background: isSelected ? 'rgba(74,108,247,0.1)' : 'rgba(255,255,255,0.04)',
                    borderColor: isSelected ? 'rgba(74,108,247,0.5)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: isSelected ? 'var(--brand)' : 'rgba(100,100,120,0.4)' }}
                  >
                    {fac.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{fac.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {fac.employee_id ? `${fac.employee_id} · ` : ''}{fac.department}
                    </p>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--brand)' }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 1: Select Lectures */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Lectures for <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{absentFaculty?.full_name}</span> today
            </p>
            <button
              onClick={toggleAll}
              className="text-xs font-semibold px-3 py-1 rounded-lg"
              style={{ color: 'var(--brand)', background: 'rgba(74,108,247,0.1)' }}
            >
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
                  <label
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    style={{
                      background: isChecked ? 'rgba(74,108,247,0.08)' : 'rgba(255,255,255,0.04)',
                      borderColor: isChecked ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLecture(entry.id)}
                      className="rounded w-4 h-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {entry.subjects?.subject_name}
                      </p>
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

      {/* STEP 2: Proxy Faculty */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select the proxy faculty to cover {selectedLectures.length} lecture(s).
          </p>

          {conflicts.length > 0 && (
            <div className="p-3 rounded-xl border" style={{ background: 'rgba(248,81,73,0.08)', borderColor: 'rgba(248,81,73,0.3)' }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Schedule Conflict</span>
              </div>
              {conflicts.map((c, i) => (
                <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {c.message}</p>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input
              className="input-field pl-9 w-full"
              placeholder="Search proxy faculty…"
              value={proxySearch}
              onChange={e => setProxySearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {filteredProxyFaculty.map(fac => {
              const isSelected = proxyFaculty?.id === fac.id
              return (
                <button
                  key={fac.id}
                  onClick={() => handleSelectProxy(fac)}
                  className="w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3"
                  style={{
                    background: isSelected ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.04)',
                    borderColor: isSelected ? 'rgba(63,185,80,0.5)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: isSelected ? '#3fb950' : 'rgba(100,100,120,0.4)' }}
                  >
                    {fac.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{fac.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{fac.department}</p>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border" style={{ background: 'rgba(74,108,247,0.08)', borderColor: 'rgba(74,108,247,0.3)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Assignment Summary</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="form-label">Absent Faculty</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{absentFaculty?.full_name}</p>
            </div>
            <div>
              <p className="form-label">Proxy Faculty</p>
              <p className="text-sm font-semibold text-green-400">{proxyFaculty?.full_name}</p>
            </div>
          </div>

          <div>
            <p className="form-label mb-2">Lectures to Cover ({selectedLectures.length})</p>
            <div className="space-y-2">
              {selectedLectureObjects.map(entry => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {entry.subjects?.subject_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {entry.divisions?.division_name} · {entry.time_slots?.start_time?.substring(0, 5)} · {entry.rooms?.room_number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Reason</label>
            <input
              className="input-field w-full"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for absence…"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[48px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[48px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed || (step === 1 && loadingSchedule)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold btn-primary disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px]"
          >
            {submitting ? 'Saving…' : 'Save Proxy Assignment'}
          </button>
        )}
      </div>
    </Modal>
  )
}
