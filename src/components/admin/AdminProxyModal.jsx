import { useState, useEffect } from 'react'
import { Search, CheckCircle, AlertTriangle, ChevronRight, ChevronLeft, Clock, User, Filter, ChevronDown, X, Users, Calendar } from 'lucide-react'
import { Modal, toast } from '../ui'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getDayName, today, sendNotification, formatDate, getInitials, cls } from '../../utils/helpers'
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

  // Step 2 — per-lecture proxy map: { [timetable_id]: faculty_id }
  const [lectureProxies, setLectureProxies] = useState({})

  // Step 3
  const [reason, setReason] = useState('Faculty Absent')
  const [submitting, setSubmitting] = useState(false)

  // Reset state and fetch faculty every time modal opens
  useEffect(() => {
    if (open) {
      setStep(0)
      setAbsentFaculty(null)
      setAbsentSearch('')
      setAbsentSchedule([])
      setSelectedLectures([])
      setLectureProxies({})
      setReason('Faculty Absent')
      setSubmitting(false)
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
        .select('id, full_name, department, role, initials') // Removed is_active if problematic
        .order('full_name')

      if (error) throw error
      
      // Filter roles client-side for better flexibility with enum vs string
      const filtered = (data || []).filter(u => 
        ['faculty', 'admin', 'hod', 'staff'].includes(u.role?.toLowerCase())
      )

      setFacultyList(filtered)
      setDepartments([...new Set(filtered.map(f => f.department).filter(Boolean))].sort())
    } catch (err) {
      console.error('Error fetching faculty:', err)
      toast.error('Failed to load faculty list. Please try again.')
      setFacultyList([]) // Ensure it's not undefined
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

  const filteredAbsentFaculty = facultyList.filter(f => {
    const name = (f.full_name || '').toLowerCase()
    const dept = (f.department || '').toLowerCase()
    const init = (f.initials || '').toLowerCase()
    const search = (absentSearch || '').toLowerCase()

    return name.includes(search) ||
      dept.includes(search) ||
      init.includes(search)
  }).slice(0, 50) // Limit to avoid performance issues if list is huge

  const handleSubmit = async () => {
    if (!absentFaculty || !allAssigned) {
      toast.error('Please assign proxies to all selected lectures')
      return
    }
    
    setSubmitting(true)
    try {
      const todayStr = today()
      
      // Construct and validate records
      const records = selectedLectureObjects.map(entry => {
        const proxyId = lectureProxies[entry.id]
        if (!proxyId) throw new Error(`Missing proxy for lecture: ${entry.subjects?.subject_name}`)
        
        return {
          substitution_date: todayStr,
          absent_faculty_id: absentFaculty.id,
          proxy_faculty_id: proxyId,
          timetable_id: entry.id,
          reason: reason || 'Faculty Absent',
          status: 'active',
          created_by: profile?.id || null,
        }
      })

      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 800))
        toast.success('Proxy assigned successfully')
        onSuccess?.()
        setSubmitting(false)
        return
      }

      // Upsert to handle cases where a substitution for the same slot already exists
      const { error } = await supabase
        .from('substitutions')
        .upsert(records, {
          onConflict: 'substitution_date,absent_faculty_id,timetable_id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Supabase substitution error:', error)
        const msg = error.code === '42501'
          ? 'Permission denied. Only admins can assign proxy for other faculty.'
          : error.message || 'Unknown error. Please try again.'
        toast.error(`Failed to assign proxy: ${msg}`)
        setSubmitting(false)
        return
      }

      // Notify absent faculty
      try {
        await sendNotification(supabase, absentFaculty.id, 'Proxy Assigned', 
          `${records.length} of your lecture(s) on ${formatDate(todayStr)} have been covered by proxy faculty.`, 'info')

        // Notify each proxy faculty
        const proxyNotifs = Object.entries(lectureProxies).map(([tid, proxyId]) => {
          const proxyFac = facultyList.find(f => f.id === proxyId)
          const entry = absentSchedule.find(e => e.id === tid)
          if (!proxyFac) return null;
          return sendNotification(supabase, proxyFac.id, 'New Proxy Assignment', 
            `You have been assigned to cover ${entry?.subjects?.subject_name} for ${absentFaculty.full_name} on ${formatDate(todayStr)}.`, 'info')
        }).filter(Boolean)
        await Promise.all(proxyNotifs)
      } catch (notifErr) {
        console.error('Notification error (ignoring):', notifErr)
      }

      toast.success('Proxy assigned successfully')
      
      // Delay closing slightly to ensure toast is seen and state is stable
      setTimeout(() => {
        onSuccess?.()
      }, 100)
      
    } catch (err) {
      console.error('Error assigning proxy:', err)
      toast.error(err.message || 'Failed to assign proxy. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = [
    !!absentFaculty,
    selectedLectures.length > 0,
    allAssigned,
    true,
  ][step]

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={`Adjust Proxy for ${absentFaculty?.full_name || '... '}`} 
      size="lg"
      footer={
        <div className="flex gap-3 w-full bg-slate-50 p-4 rounded-b-3xl border-t border-slate-100">
          {step === 0 ? (
            <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          ) : (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          <button
            onClick={() => {
              if (step < 3) {
                setStep(s => s + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={!canProceed || (step === 1 && loadingSchedule) || submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {step < 3 ? (
              <>Next Step <ChevronRight className="w-4 h-4" /></>
            ) : (
              submitting ? 'Creating Assignments...' : 'Save & Confirm Proxy'
            )}
          </button>
        </div>
      }
    >
      {/* Step indicator */}
      <div className="flex gap-1.5 mb-6 px-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1 rounded-full transition-all duration-300 mb-1"
              style={{ background: i <= step ? 'var(--brand)' : 'rgba(0,0,0,0.05)' }} />
            <span className="text-[9px] font-bold uppercase tracking-wider block"
              style={{ color: i === step ? 'var(--brand)' : 'var(--text-secondary)', opacity: i === step ? 1 : 0.5 }}>
              {s.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-6">

        {/* ── STEP 0: Absent Faculty Selection ── */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Select Absent Faculty</label>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Choose the teacher who is unable to conduct lectures today.</p>
            </div>

            <div className="relative group p-0.5 rounded-2xl bg-white shadow-sm border border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/5 transition-all">
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  className="w-full pl-12 pr-4 py-4 text-base border-none rounded-2xl bg-transparent font-medium focus:outline-none placeholder:text-slate-400" 
                  placeholder="Search by name, dept or initials..."
                  value={absentSearch} 
                  onChange={e => {
                    setAbsentSearch(e.target.value)
                    if (absentFaculty) setAbsentFaculty(null)
                  }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
              {facultyList.length === 0 ? (
                <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-400">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-bold opacity-50">No Faculty Loaded</p>
                  <button onClick={fetchFaculty} className="mt-2 text-xs text-brand hover:underline font-bold underline font-bold">Retry Loading</button>
                </div>
              ) : filteredAbsentFaculty.length > 0 ? (
                filteredAbsentFaculty.map(fac => {
                  const isSelected = absentFaculty?.id === fac.id
                  return (
                    <button 
                      key={fac.id} 
                      onClick={() => handleSelectAbsentFaculty(fac)}
                      className={cls(
                        "text-left p-4 rounded-2xl transition-all flex items-center gap-4 border-2 group shadow-sm",
                        isSelected 
                          ? "bg-brand-50/30 border-brand-500 ring-2 ring-brand-500/10" 
                          : "bg-white border-slate-100 hover:border-brand-200 hover:shadow-md"
                      )}
                    >
                      <div className={cls(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm",
                        isSelected ? "bg-brand-500" : "bg-slate-400 group-hover:bg-brand-400"
                      )}>
                        {fac.initials || getInitials(fac.full_name || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cls("font-bold text-sm truncate", isSelected ? "text-brand-600" : "text-slate-800")}>
                          {fac.full_name || 'Faculty Member'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            {fac.department || 'General'}
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
                    </button>
                  )
                })
              ) : (
                <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-400">
                  <Search className="w-10 h-10 mb-2 opacity-10" />
                  <p className="text-sm font-bold">No matches found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 1: Select Lectures ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Select Lectures to Adjust</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Coverage for <span className="text-brand-500 font-bold">{absentFaculty?.full_name}</span> today
                </p>
              </div>
              <button onClick={toggleAll} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 border border-brand-500/20"
                style={{ color: 'var(--brand)', background: 'rgba(74,108,247,0.05)' }}>
                {selectedLectures.length === absentSchedule.length ? 'Deselect All' : 'Select All Today'}
              </button>
            </div>

            {loadingSchedule ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin shadow-inner" />
                <p className="text-sm font-bold text-slate-400 animate-pulse">Syncing timetable...</p>
              </div>
            ) : absentSchedule.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-3xl">
                <Clock className="w-10 h-10 mx-auto mb-4 text-slate-200" />
                <p className="text-sm text-slate-400 font-bold">No lectures scheduled today for this faculty.</p>
              </div>
            ) : (
              <div className="space-y-2.5 pr-2">
                {absentSchedule.map(entry => {
                  const isChecked = selectedLectures.includes(entry.id)
                  return (
                    <label key={entry.id} className="flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-brand-500/30 group"
                      style={{
                        background: isChecked ? 'rgba(74,108,247,0.04)' : 'white',
                        borderColor: isChecked ? 'var(--brand)' : '#f1f5f9',
                      }}>
                      <div className="relative flex-shrink-0">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => toggleLecture(entry.id)} 
                          className="peer appearance-none w-6 h-6 rounded-lg border-2 border-slate-200 checked:bg-brand-500 checked:border-brand-500 transition-all cursor-pointer shadow-sm" 
                        />
                        <CheckCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white scale-0 peer-checked:scale-110 transition-all pointer-events-none" strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-brand-500 transition-colors uppercase tracking-tight">{entry.subjects?.subject_name}</p>
                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                          <span className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest">
                            {entry.divisions?.division_name}
                          </span>
                          <span className="text-[10px] flex items-center gap-1 font-bold text-slate-400">
                            <Clock className="w-3 h-3 text-brand-500/50" />
                            {entry.time_slots?.start_time?.substring(0, 5)} – {entry.time_slots?.end_time?.substring(0, 5)}
                          </span>
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
          <div className="space-y-4 animate-fade-in relative">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-slate-800">Assign Cover Faculty</p>
              <p className="text-xs text-slate-500">Pick a teacher for each selected lecture slot.</p>
            </div>

            <div className="space-y-3 pr-1 pb-4">
              {selectedLectureObjects.map(entry => {
                const proxyId = lectureProxies[entry.id]
                const proxy = facultyList.find(f => f.id === proxyId);
                
                return (
                  <div key={entry.id} className="relative">
                    <div className="p-4 rounded-2xl border-2 transition-all bg-white"
                      style={{ borderColor: proxy ? '#4ade80' : '#f1f5f9' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{entry.subjects?.subject_name}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
                             {entry.time_slots?.start_time?.substring(0, 5)} - {entry.time_slots?.end_time?.substring(0, 5)}
                             <span className="mx-2 opacity-20">|</span>
                             {entry.divisions?.division_name}
                             {entry.rooms?.room_number && <><span className="mx-2 opacity-20">|</span> {entry.rooms.room_number}</>}
                          </p>
                        </div>

                        <div className="w-full sm:w-64">
                          <select 
                            className="input-field w-full text-sm font-semibold bg-slate-50 border-slate-200"
                            value={proxyId || ''}
                            onChange={(e) => {
                              const facId = e.target.value;
                              if (facId) {
                                setLectureProxies(prev => ({ ...prev, [entry.id]: facId }));
                              } else {
                                setLectureProxies(prev => { const n = {...prev}; delete n[entry.id]; return n; });
                              }
                            }}
                          >
                            <option value="">Select Faculty...</option>
                            {facultyList.filter(f => f.id !== absentFaculty?.id).map(f => (
                              <option key={f.id} value={f.id}>
                                {f.full_name} ({f.department || 'General'})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {!allAssigned && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 animate-fade-in">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-tight">Please select proxy faculty for all marked lectures to continue.</p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-2xl border bg-slate-50/50 border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-brand-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Assignment Summary</p>
              </div>
              <p className="text-xs text-slate-500 flex justify-between items-center px-1">
                <span>Absent Faculty:</span>
                <span className="font-bold text-slate-900">{absentFaculty?.full_name}</span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1">Coverage Details ({selectedLectureObjects.length})</p>
              <div className="space-y-2 pr-1">
                {selectedLectureObjects.map(entry => {
                  const proxyId = lectureProxies[entry.id]
                  const proxy = facultyList.find(f => f.id === proxyId)
                  return (
                    <div key={entry.id} className="p-3.5 rounded-2xl flex items-center gap-3 border border-slate-100 bg-white shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{entry.subjects?.subject_name}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {entry.divisions?.division_name} · {entry.time_slots?.start_time?.substring(0, 5)} · {entry.rooms?.room_number}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      <div className="text-right flex-shrink-0 min-w-[100px]">
                        <p className="text-[11px] font-bold text-green-600 truncate">{proxy?.full_name}</p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase">{proxy?.department}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Reason for Absence</label>
              <input 
                className="input-field w-full py-3.5 border-slate-200 focus:border-brand-500" 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Medical emergency, Duty leave..." 
              />
            </div>
          </div>
        )}
      </div>

    </Modal>
  )
}
