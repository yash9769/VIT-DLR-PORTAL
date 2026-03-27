import { useState, useEffect, useRef } from 'react'
import { X, Search, CheckCircle, ChevronRight, ChevronLeft, User, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from '../ui'
import { today, sendNotification, formatDate } from '../../utils/helpers'
import { DEMO_SUBSTITUTIONS, DEMO_FACULTY_LIST, DEMO_TIMETABLE } from '../../lib/demoData'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL
const STEPS = ['Select Lectures', 'Assign Proxies', 'Confirm']

export default function ProxyAssignModal({ open, onClose, profile, todaySchedule, onSuccess }) {
  const [step, setStep] = useState(0)
  const [selectedLectures, setSelectedLectures] = useState([])

  // per-lecture proxy map: { [lecture_id]: faculty_object }
  const [lectureProxies, setLectureProxies] = useState({})

  // which lecture is currently being assigned (for the faculty picker sub-panel)
  const [assigningFor, setAssigningFor] = useState(null)

  const [facultyList, setFacultyList] = useState([])
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('Faculty Absent')
  const [submitting, setSubmitting] = useState(false)
  const sheetRef = useRef(null)

  useEffect(() => {
    if (open) {
      setStep(0)
      setSelectedLectures(todaySchedule.map(e => e.id))
      setLectureProxies({})
      setAssigningFor(null)
      setSearch('')
      setReason('Faculty Absent')
      fetchFaculty()
    }
  }, [open, todaySchedule])

  const fetchFaculty = async () => {
    if (DEMO_MODE) { setFacultyList(DEMO_FACULTY_LIST.filter(f => f.id !== profile.id)); return }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, department, role, initials')
        .in('role', ['faculty', 'admin', 'hod'])
        .eq('is_active', true)
        .neq('id', profile.id)
        .order('full_name')
      if (error) throw error
      setFacultyList(data || [])
    } catch (err) { console.error('Error fetching faculty:', err) }
  }

  const toggleLecture = id => setSelectedLectures(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )
  const toggleAll = () => setSelectedLectures(
    selectedLectures.length === todaySchedule.length ? [] : todaySchedule.map(e => e.id)
  )

  const filteredFaculty = facultyList.filter(f =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.department?.toLowerCase().includes(search.toLowerCase()) ||
    (f.initials || '').toLowerCase().includes(search.toLowerCase())
  )

  const selectedLectureObjects = todaySchedule.filter(e => selectedLectures.includes(e.id))

  // All selected lectures must have a proxy assigned before we can proceed
  const allAssigned = selectedLectureObjects.length > 0 &&
    selectedLectureObjects.every(e => lectureProxies[e.id])

  const handleConfirm = async () => {
    if (!allAssigned) return
    setSubmitting(true)
    try {
      const todayStr = today()
      const records = selectedLectureObjects.map(entry => ({
        substitution_date: todayStr,
        absent_faculty_id: profile.id,
        proxy_faculty_id: lectureProxies[entry.id].id,
        timetable_id: entry.id,
        reason: reason || 'Faculty Absent',
        status: 'active',
        created_by: profile.id,
      }))

      if (DEMO_MODE) {
        setTimeout(() => {
          toast.success(`Proxy assigned for ${records.length} lecture(s).`)
          onSuccess?.(); onClose(); setSubmitting(false)
        }, 600)
        return
      }

      const { error } = await supabase.from('substitutions').insert(records)
      if (error) throw error

      // Notify all involved faculty
      const proxyNotifications = Object.entries(lectureProxies).map(([tid, fac]) => {
        const entry = todaySchedule.find(e => e.id === tid)
        return sendNotification(supabase, fac.id, 'New Proxy Assignment', `You have been assigned to cover ${entry?.subjects?.subject_name} for ${profile.full_name} on ${formatDate(todayStr)}.`, 'info')
      })

      await Promise.all([
        ...proxyNotifications,
        sendNotification(supabase, profile.id, 'Proxy Assigned', `You have assigned ${records.length} lecture(s) to proxy faculty on ${formatDate(todayStr)}.`, 'info')
      ])

      toast.success(`Proxy assigned for ${records.length} lecture(s).`)
      onSuccess?.(); onClose()
    } catch (err) {
      console.error('Error assigning proxy:', err)
      toast.error('Failed to assign proxy. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (!open) return null

  // ── Faculty picker panel (shown inline when assigningFor is set) ───────
  const FacultyPicker = ({ lectureId, lectureName, onPick, onCancel }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onCancel} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Pick proxy for:</p>
          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{lectureName}</p>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <input className="input-field pl-9 py-2.5 w-full" placeholder="Search faculty…"
          value={search} onChange={e => setSearch(e.target.value)} autoFocus />
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filteredFaculty.length === 0 ? (
          <p className="text-center text-sm py-6" style={{ color: 'var(--text-secondary)' }}>No faculty found</p>
        ) : filteredFaculty.map(fac => {
          const current = lectureProxies[lectureId]
          const isSelected = current?.id === fac.id
          return (
            <button key={fac.id} onClick={() => { onPick(fac); setSearch('') }}
              className="w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3"
              style={{
                background: isSelected ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.04)',
                borderColor: isSelected ? 'rgba(63,185,80,0.5)' : 'rgba(255,255,255,0.08)',
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: isSelected ? '#3fb950' : 'rgba(74,108,247,0.4)' }}>
                {fac.initials || fac.full_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{fac.full_name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{fac.department}</p>
              </div>
              {isSelected && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div ref={sheetRef} className="w-full rounded-t-3xl overflow-hidden flex flex-col animate-slide-up"
        style={{ 
          maxHeight: '94vh', 
          background: 'var(--bg-secondary)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Assign Proxy</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Step {step + 1} of 3 — {STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-5 py-3 flex-shrink-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col gap-1">
              <div className="h-1 rounded-full transition-all duration-300"
                style={{ background: i <= step ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
              <span className="text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: i === step ? '#f59e0b' : 'var(--text-secondary)', opacity: i === step ? 1 : 0.5 }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">

          {/* ── STEP 0: SELECT LECTURES ───────────── */}
          {step === 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Your lectures today ({todaySchedule.length})
                </p>
                <button onClick={toggleAll} className="text-xs font-semibold px-3 py-1 rounded-lg"
                  style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                  {selectedLectures.length === todaySchedule.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              {todaySchedule.length === 0 ? (
                <div className="text-center py-10 glass-card">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No lectures scheduled today.</p>
                </div>
              ) : todaySchedule.map(entry => {
                const isSelected = selectedLectures.includes(entry.id)
                return (
                  <button key={entry.id} onClick={() => toggleLecture(entry.id)}
                    className="w-full text-left p-4 rounded-2xl border transition-all"
                    style={{ background: isSelected ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', borderColor: isSelected ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ borderColor: isSelected ? '#f59e0b' : 'rgba(255,255,255,0.3)', background: isSelected ? '#f59e0b' : 'transparent' }}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{entry.subjects?.subject_name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(74,108,247,0.2)', color: '#7090ff' }}>{entry.divisions?.division_name}</span>
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <Clock className="w-3 h-3" />
                            {entry.time_slots?.start_time?.substring(0, 5)} – {entry.time_slots?.end_time?.substring(0, 5)}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{entry.rooms?.room_number}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ── STEP 1: ASSIGN PROXY PER LECTURE ─── */}
          {step === 1 && (
            assigningFor ? (
              // Faculty picker for the currently selected lecture
              <FacultyPicker
                lectureId={assigningFor.id}
                lectureName={`${assigningFor.subjects?.subject_name} · ${assigningFor.time_slots?.start_time?.substring(0,5)}`}
                onPick={fac => {
                  setLectureProxies(prev => ({ ...prev, [assigningFor.id]: fac }))
                  setAssigningFor(null)
                }}
                onCancel={() => { setAssigningFor(null); setSearch('') }}
              />
            ) : (
              // List of selected lectures with individual proxy assignment
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
                        borderColor: proxy ? 'rgba(63,185,80,0.4)' : 'rgba(245,158,11,0.35)',
                      }}>
                      <div className="flex items-center gap-3">
                        {/* Lecture info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{entry.subjects?.subject_name}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                            <span className="px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(74,108,247,0.15)', color: '#7090ff' }}>{entry.divisions?.division_name}</span>
                            <span>{entry.time_slots?.start_time?.substring(0,5)} – {entry.time_slots?.end_time?.substring(0,5)}</span>
                            <span>{entry.rooms?.room_number}</span>
                          </div>
                        </div>
                        {/* Proxy badge or tap hint */}
                        <div className="flex-shrink-0">
                          {proxy ? (
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-green-400">Assigned</p>
                                <p className="text-xs font-semibold truncate max-w-[80px]" style={{ color: 'var(--text-primary)' }}>{proxy.full_name.split(' ')[0]}</p>
                              </div>
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: '#3fb950' }}>
                                {proxy.initials || proxy.full_name[0]}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#f59e0b' }}>
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
                  <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(245,158,11,0.08)', color: '#d97706' }}>
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{selectedLectureObjects.length - Object.keys(lectureProxies).filter(k => selectedLectures.includes(k)).length} lecture(s) still need a proxy assigned.</span>
                  </div>
                )}
              </div>
            )
          )}

          {/* ── STEP 2: CONFIRM ──────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}>
                <p className="text-sm font-semibold" style={{ color: '#d97706' }}>
                  Assigning proxies for {selectedLectureObjects.length} lecture{selectedLectureObjects.length !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Lecture → Proxy</p>
                {selectedLectureObjects.map(entry => {
                  const proxy = lectureProxies[entry.id]
                  return (
                    <div key={entry.id} className="p-3 rounded-xl flex items-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {/* Subject */}
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'rgba(74,108,247,0.2)', color: '#7090ff' }}>
                        {entry.subjects?.short_name?.slice(0,4) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{entry.subjects?.subject_name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{entry.time_slots?.start_time?.substring(0,5)} · {entry.divisions?.division_name}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" style={{ color: 'var(--text-secondary)' }} />
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: '#3fb950' }}>
                          {proxy?.initials || proxy?.full_name?.[0]}
                        </div>
                        <p className="text-xs font-semibold max-w-[80px] truncate" style={{ color: '#3fb950' }}>{proxy?.full_name?.split(' ')[0]}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Reason (Optional)</label>
                <input className="input-field w-full" value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Medical emergency, personal leave…" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div className="flex gap-3 px-5 py-6 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', marginBottom: 'env(safe-area-inset-bottom)' }}>
          {/* Back / Cancel */}
          {step === 0 || (step === 1 && assigningFor) ? (
            <button onClick={step === 0 ? onClose : () => { setAssigningFor(null); setSearch('') }}
              className="px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
          ) : (
            <button onClick={() => { if (step === 1) setAssigningFor(null); setStep(s => s - 1) }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {/* Next / Confirm */}
          {step < 2 ? (
            <button
              onClick={() => { if (assigningFor) return; setStep(s => s + 1) }}
              disabled={step === 0 ? selectedLectures.length === 0 : !allAssigned || !!assigningFor}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white' }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white' }}>
              {submitting ? 'Assigning…' : 'Confirm Assignment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
