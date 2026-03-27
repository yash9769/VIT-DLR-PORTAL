import { useState, useEffect, useMemo } from 'react'
import { Search, Calendar, MapPin, Users, Filter } from 'lucide-react'
import { formatTime } from '../../utils/helpers'
import { supabase } from '../../lib/supabase'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const BADGE_COLORS = ['rgba(74,108,247,0.25)','rgba(63,185,80,0.2)','rgba(245,158,11,0.2)','rgba(239,68,68,0.2)','rgba(168,85,247,0.2)','rgba(14,165,233,0.2)']
const TEXT_COLORS  = ['#7090ff','#3fb950','#f59e0b','#ef4444','#a855f7','#0ea5e9']

export default function TimetableView() {
  const [entries, setEntries] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedDay, setSelectedDay] = useState('All')
  const [filterSem, setFilterSem] = useState('')
  const [filterDiv, setFilterDiv] = useState('')
  const [filterBatch, setFilterBatch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const [ttRes, divRes] = await Promise.all([
        supabase.from('timetable')
          .select('*, subjects(*), divisions(*), rooms(*), time_slots(*), users!faculty_id(id,full_name,initials,department)')
          .eq('is_active', true),
        supabase.from('divisions').select('*').order('division_name')
      ])
      if (!ttRes.error) setEntries(ttRes.data || [])
      if (!divRes.error) setDivisions(divRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  // Unique semesters from divisions
  const semesters = useMemo(() => [...new Set(divisions.map(d => d.semester))].sort((a,b)=>a-b), [divisions])
  // Divisions filtered by selected semester
  const filteredDivisions = useMemo(() => filterSem ? divisions.filter(d => d.semester == filterSem) : divisions, [divisions, filterSem])
  // Unique batches from timetable entries
  const batches = useMemo(() => [...new Set(entries.map(e => e.batch_number).filter(Boolean))].sort(), [entries])

  // Faculty derived from entries
  const facultyList = useMemo(() => {
    const map = new Map()
    entries.forEach(e => { if (e.users) map.set(e.users.id, e.users) })
    return Array.from(map.values()).sort((a,b) => a.full_name.localeCompare(b.full_name))
  }, [entries])
  const facultyColor = useMemo(() => {
    const c = {}
    facultyList.forEach((f,i) => { c[f.id] = i % BADGE_COLORS.length })
    return c
  }, [facultyList])

  const filteredFacultyList = facultyList.filter(f =>
    f.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (f.initials||'').toLowerCase().includes(search.toLowerCase())
  )

  const filtered = useMemo(() => entries.filter(e => {
    const matchFaculty = !selectedFaculty || e.users?.id === selectedFaculty
    const matchDay     = selectedDay === 'All' || e.day_of_week === selectedDay
    const matchSem     = !filterSem  || e.divisions?.semester == filterSem
    const matchDiv     = !filterDiv  || e.division_id === filterDiv
    const matchBatch   = !filterBatch|| String(e.batch_number) === filterBatch
    return matchFaculty && matchDay && matchSem && matchDiv && matchBatch
  }), [entries, selectedFaculty, selectedDay, filterSem, filterDiv, filterBatch])

  const byDay = useMemo(() => {
    const g = {}
    DAYS.forEach(d => { g[d] = [] })
    filtered.forEach(e => { if (g[e.day_of_week]) g[e.day_of_week].push(e) })
    Object.keys(g).forEach(d => g[d].sort((a,b) => (a.time_slots?.start_time||'').localeCompare(b.time_slots?.start_time||'')))
    return g
  }, [filtered])

  const daysToShow = selectedDay === 'All' ? DAYS : [selectedDay]

  const hasFilters = selectedFaculty || (selectedDay !== 'All') || filterSem || filterDiv || filterBatch
  const clearAll = () => { setSelectedFaculty(null); setSelectedDay('All'); setFilterSem(''); setFilterDiv(''); setFilterBatch(''); setSearch('') }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Department Timetable</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>View-only · All IT Faculty Schedules</p>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149' }}>Clear Filters</button>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 pb-3 space-y-2 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-9 w-full py-2.5" placeholder="Search faculty…"
            value={search} onChange={e => { setSearch(e.target.value); setSelectedFaculty(null) }} />
        </div>

        {/* Row 1: Sem · Division · Batch */}
        <div className="flex gap-2">
          <select className="select-field flex-1 text-xs py-2" value={filterSem}
            onChange={e => { setFilterSem(e.target.value); setFilterDiv('') }}>
            <option value="">All Sems</option>
            {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
          <select className="select-field flex-1 text-xs py-2" value={filterDiv}
            onChange={e => {
              const v = e.target.value
              setFilterDiv(v)
              if (v) {
                const d = divisions.find(div => div.id === v)
                if (d) setFilterSem(String(d.semester))
              }
            }}>
            <option value="">All Divs</option>
            {filteredDivisions.map(d => <option key={d.id} value={d.id}>{d.division_name}</option>)}
          </select>
          <select className="select-field flex-1 text-xs py-2" value={filterBatch}
            onChange={e => setFilterBatch(e.target.value)}>
            <option value="">All Batches</option>
            {batches.map(b => <option key={b} value={b}>Batch {b}</option>)}
          </select>
        </div>

        {/* Faculty chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setSelectedFaculty(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: !selectedFaculty ? 'var(--brand)':'rgba(255,255,255,0.06)', color: !selectedFaculty ? 'white':'var(--text-secondary)' }}>
            All Faculty
          </button>
          {filteredFacultyList.map(f => (
            <button key={f.id} onClick={() => setSelectedFaculty(f.id === selectedFaculty ? null : f.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: selectedFaculty === f.id ? BADGE_COLORS[facultyColor[f.id]??0]:'rgba(255,255,255,0.06)',
                color: selectedFaculty === f.id ? TEXT_COLORS[facultyColor[f.id]??0]:'var(--text-secondary)',
                border: selectedFaculty === f.id ? `1px solid ${TEXT_COLORS[facultyColor[f.id]??0]}40`:'1px solid transparent',
              }}>
              {f.initials || f.full_name.split(' ').map(w=>w[0]).join('')}
            </button>
          ))}
        </div>

        {/* Day tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['All',...DAYS].map(d => (
            <button key={d} onClick={() => setSelectedDay(d)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ background: selectedDay===d ? 'linear-gradient(135deg,#4A6CF7,#3355e8)':'rgba(255,255,255,0.05)', color: selectedDay===d ? 'white':'var(--text-secondary)' }}>
              {d === 'All' ? 'All Days' : d.slice(0,3)}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 pb-2 flex-shrink-0">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length} slot{filtered.length !== 1 ? 's' : ''} matching filters
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
        {loading ? (
          <div className="text-center py-16"><p style={{ color: 'var(--text-secondary)' }}>Loading timetable…</p></div>
        ) : (
          daysToShow.map(day => {
            const dayEntries = byDay[day] || []
            if (dayEntries.length === 0) return null
            return (
              <div key={day}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{day}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background:'rgba(255,255,255,0.06)', color:'var(--text-secondary)' }}>
                    {dayEntries.length} slots
                  </span>
                </div>
                <div className="space-y-2">
                  {dayEntries.map(e => {
                    const ci = facultyColor[e.users?.id] ?? 0
                    const roomNum = e.rooms?.room_number || e.custom_room || ''
                    const isLCS = ['E101','E201','E204','M202'].includes(roomNum)
                    const isLab = (e.custom_subject || e.subjects?.subject_name || '').toLowerCase().includes('lab')
                    return (
                      <div key={e.id} className="glass-card p-3 flex gap-4 items-center"
                        style={{
                          background: isLCS ? 'rgba(255,255,0,0.07)' : isLab ? 'rgba(63,185,80,0.06)' : undefined,
                          border: isLCS ? '1px solid rgba(255,220,0,0.3)' : isLab ? '1px solid rgba(63,185,80,0.2)' : undefined,
                        }}>
                        {/* Time Column */}
                        <div className="w-14 flex-shrink-0 text-center border-r border-white/10 pr-3">
                          <p className="text-xs font-bold leading-tight" style={{ color: TEXT_COLORS[ci] }}>
                            {formatTime(e.time_slots?.start_time)}
                          </p>
                          <p className="text-[10px] mt-0.5 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                            {formatTime(e.time_slots?.end_time)}
                          </p>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {e.custom_subject || e.subjects?.short_name || e.subjects?.subject_name || '—'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {e.batch_number && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                                    style={{ background: BADGE_COLORS[ci], color: TEXT_COLORS[ci] }}>
                                    B{e.batch_number}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                                  <Users className="w-3 h-3 opacity-60" />
                                  {e.custom_division || e.divisions?.division_name || '—'}
                                </span>
                                <span className="flex items-center gap-1 text-[10px]" style={{ color: isLCS ? '#8a6d00' : 'var(--text-secondary)' }}>
                                  <MapPin className="w-3 h-3 opacity-60" />
                                  {roomNum || '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isLCS && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-yellow-400/20 text-yellow-600 border border-yellow-400/30">📹 LCS</span>}
                            <div className="px-3 py-1.5 rounded-xl text-xs font-black tracking-tight shadow-sm" style={{ background: BADGE_COLORS[ci], color: TEXT_COLORS[ci], border: `1px solid ${TEXT_COLORS[ci]}40` }}>
                              {e.users?.initials || e.users?.full_name?.split(' ').map(w=>w[0]).join('') || '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 glass-card">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color:'var(--text-secondary)' }} />
            <p style={{ color:'var(--text-secondary)' }}>No timetable entries match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
