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

  // Proxy search & filter — exclude absent faculty from options
  const filteredProxyFaculty = facultyList.filter(f => {
    if (f.id === absentFaculty?.id) return false
    const matchDept = !deptFilter || f.department === deptFilter
    const name = (f.full_name || '').toLowerCase()
    const dept = (f.department || '').toLowerCase()
    const init = (f.initials || '').toLowerCase()
    const search = (proxySearch || '').toLowerCase()

    const matchSearch = !search ||
      name.includes(search) ||
      dept.includes(search) ||
      init.includes(search)
    return matchDept && matchSearch
  })

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
        const proxy = lectureProxies[entry.id]
        if (!proxy) throw new Error(`Missing proxy for lecture: ${entry.subjects?.subject_name}`)
        
        return {
          substitution_date: todayStr,
          absent_faculty_id: absentFaculty.id,
          proxy_faculty_id: proxy.id,
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

      const { error } = await supabase.from('substitutions').insert(records)
      if (error) throw error

      // Notify absent faculty
      try {
        await sendNotification(supabase, absentFaculty.id, 'Proxy Assigned', 
          `${records.length} of your lecture(s) on ${formatDate(todayStr)} have been covered by proxy faculty.`, 'info')

        // Notify each proxy faculty
        const proxyNotifs = Object.entries(lectureProxies).map(([tid, fac]) => {
          const entry = absentSchedule.find(e => e.id === tid)
          return sendNotification(supabase, fac.id, 'New Proxy Assignment', 
            `You have been assigned to cover ${entry?.subjects?.subject_name} for ${absentFaculty.full_name} on ${formatDate(todayStr)}.`, 'info')
        })
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
    allAssigned && !assigningFor,
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
          ) : (step === 2 && assigningFor) ? (
            <button onClick={() => { setAssigningFor(null); setProxySearch('') }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to List
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
                if (assigningFor) return; 
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

      <div className="min-h-[400px] max-h-[65vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
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

            <div className="relative h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50/20">
              <div className="absolute inset-x-0 top-0 h-1 bg-slate-100/50 z-10" />
              <div className="h-full overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {facultyList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <Users className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4">No Faculty Loaded</p>
                    <button 
                      onClick={fetchFaculty}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : filteredAbsentFaculty.length > 0 ? (
                  filteredAbsentFaculty.map(fac => {
                    const isSelected = absentFaculty?.id === fac.id
                    return (
                      <button 
                        key={fac.id} 
                        onClick={() => handleSelectAbsentFaculty(fac)}
                        className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-4 hover:bg-white hover:shadow-md border-2"
                        style={{
                          background: isSelected ? 'white' : 'transparent',
                          borderColor: isSelected ? 'var(--brand)' : 'transparent',
                          boxShadow: isSelected ? '0 8px 16px -4px rgba(74,108,247,0.12)' : 'none'
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                          style={{ background: isSelected ? 'var(--brand)' : 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
                          {fac.initials || getInitials(fac.full_name || '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate" style={{ color: isSelected ? 'var(--brand)' : 'inherit' }}>
                            {fac.full_name || 'Loading Name...'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-slate-400 uppercase tracking-wider">{fac.department || 'DEPT'}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Role: {fac.role?.toUpperCase()}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-brand-500" />
                          </div>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                    <User size={40} className="mb-2 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">No faculty found</p>
                  </div>
                )}
              </div>
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
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
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

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 pb-20 custom-scrollbar">
              {selectedLectureObjects.map(entry => {
                const proxy = lectureProxies[entry.id]
                const isPicking = assigningFor?.id === entry.id
                
                return (
                  <div key={entry.id} className="relative">
                    {/* Lecture Info Card */}
                    <div className="p-4 rounded-2xl border-2 transition-all group bg-white"
                      style={{
                        borderColor: isPicking ? 'var(--brand)' : proxy ? '#4ade80' : '#f1f5f9',
                        boxShadow: isPicking ? '0 10px 25px -5px rgba(74,108,247,0.1)' : 'none'
                      }}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{entry.subjects?.subject_name}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
                             {entry.time_slots?.start_time?.substring(0, 5)} - {entry.time_slots?.end_time?.substring(0, 5)}
                             <span className="mx-2 opacity-20">|</span>
                             {entry.divisions?.division_name}
                             {entry.rooms?.room_number && <><span className="mx-2 opacity-20">|</span> {entry.rooms.room_number}</>}
                          </p>
                        </div>

                        {/* Dropdown Trigger */}
                        <div className="relative group">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningFor(isPicking ? null : entry);
                              if (!isPicking) {
                                setProxySearch('');
                              }
                            }}
                            className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all bg-slate-50 hover:bg-white hover:border-brand-500/50 active:scale-95"
                            style={{ 
                              borderColor: proxy ? '#4ade80' : isPicking ? 'var(--brand)' : '#e2e8f0',
                            }}
                          >
                            {proxy ? (
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center text-[9px] text-white font-bold">
                                  {proxy.initials || getInitials(proxy.full_name || 'F')}
                                </div>
                                <span className="truncate max-w-[90px]">{proxy.full_name?.split(' ')[0] || 'Proxy'}</span>
                                <ChevronDown className={cls("w-4 h-4 ml-auto text-slate-400 transition-transform", isPicking && "rotate-180")} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <span className="text-slate-400 font-medium">Select Faculty</span>
                                <ChevronDown className={cls("w-4 h-4 ml-auto text-slate-400 transition-transform", isPicking && "rotate-180")} />
                              </div>
                            )}
                          </button>

                          {/* FLOATING DROPDOWN LIST */}
                          {isPicking && (
                            <div className="fixed inset-x-0 bottom-0 top-0 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-full sm:w-[320px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 z-[100] animate-slide-up flex flex-col max-h-[70vh] sm:max-h-[300px]">
                              {/* Header for mobile */}
                              <div className="sm:hidden flex items-center justify-between p-4 border-b border-slate-100">
                                <span className="font-bold text-sm">Assign Proxy for {entry.subjects?.subject_name}</span>
                                <button onClick={() => setAssigningFor(null)} className="p-2"><X className="w-5 h-5" /></button>
                              </div>

                              {/* Search Area */}
                              <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex gap-2">
                                <div className="relative flex-1">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input 
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-400" 
                                    placeholder="Search by name or initials..."
                                    value={proxySearch}
                                    onChange={e => setProxySearch(e.target.value)}
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
                                  />
                                </div>
                                <select 
                                  className="pl-2 pr-6 py-2.5 rounded-xl border border-slate-200 text-[10px] font-bold uppercase appearance-none focus:outline-none bg-white min-w-[80px]"
                                  value={deptFilter}
                                  onChange={e => setDeptFilter(e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <option value="">All</option>
                                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>

                              {/* Results List */}
                              <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar min-h-[200px]">
                                {filteredProxyFaculty.length > 0 ? (
                                  filteredProxyFaculty.slice(0, 50).map(fac => (
                                    <button 
                                      key={fac.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLectureProxies(prev => ({ ...prev, [entry.id]: fac }))
                                        setAssigningFor(null)
                                        setProxySearch('')
                                      }}
                                      className={cls(
                                        "w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all group/item mb-1",
                                        proxy?.id === fac.id ? "bg-brand-500 text-white" : "hover:bg-slate-50"
                                      )}
                                    >
                                      <div className={cls(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-sm",
                                        proxy?.id === fac.id ? "bg-white/20" : "bg-slate-400 group-hover/item:bg-brand-400"
                                      )}>
                                        {fac.initials || getInitials(fac.full_name || '')}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs truncate">{fac.full_name || 'Loading...'}</p>
                                        <p className={cls("text-[9px] font-bold uppercase tracking-widest truncate opacity-60", proxy?.id === fac.id ? "text-white" : "text-slate-400")}>
                                          {fac.department || 'IT'} · {fac.role?.toUpperCase()}
                                        </p>
                                      </div>
                                      {proxy?.id === fac.id && <CheckCircle className="w-4 h-4 text-white" />}
                                    </button>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                    <User className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] font-bold uppercase">No faculty found</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {!allAssigned && !assigningFor && (
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
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedLectureObjects.map(entry => {
                  const proxy = lectureProxies[entry.id]
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
