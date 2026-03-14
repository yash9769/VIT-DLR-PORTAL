import { format, parseISO, isToday, isYesterday, differenceInMinutes } from 'date-fns'

export const getDayName = (date = new Date()) =>
  ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()]

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'dd MMM yyyy')
  } catch { return dateStr }
}

export const formatTime = (t) => {
  if (!t) return '—'
  try {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`
  } catch { return t }
}

export const formatDateTime = (str) => {
  if (!str) return '—'
  try { return format(parseISO(str), 'dd MMM yyyy, hh:mm a') } catch { return str }
}

export const attendancePercent = (present, total) => {
  if (!total) return 0
  return Math.round((present / total) * 100)
}

export const getStatusColor = (status) => ({
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  locked: 'badge-locked',
}[status] ?? 'badge-pending')

export const cls = (...classes) => classes.filter(Boolean).join(' ')

export const today = () => new Date().toISOString().split('T')[0]
export const todayDate = () => new Date()

export const generateId = () => Math.random().toString(36).substring(2, 9)

// Conflict detection (client-side)
export const detectConflicts = (newEntry, existingEntries, excludeId = null) => {
  const conflicts = []
  const candidates = existingEntries.filter(e => 
    e.is_active !== false && e.id !== excludeId && e.day_of_week === newEntry.day_of_week
  )

  for (const e of candidates) {
    if (e.time_slot_id !== newEntry.time_slot_id) continue

    if (e.faculty_id === newEntry.faculty_id) {
      conflicts.push({ type: 'faculty', message: `Faculty already has a class at this time (${e.divisions?.division_name} - ${e.subjects?.short_name})` })
    }
    if (e.room_id && e.room_id === newEntry.room_id) {
      conflicts.push({ type: 'room', message: `Room ${e.rooms?.room_number} is already booked at this time` })
    }
    if (e.division_id === newEntry.division_id) {
      conflicts.push({ type: 'division', message: `${e.divisions?.division_name} already has a class at this time (${e.subjects?.short_name})` })
    }
  }

  return conflicts
}
