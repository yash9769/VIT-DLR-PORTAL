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
      const fName = e.faculty?.full_name || 'Faculty'
      conflicts.push({ type: 'faculty', message: `${fName} already has a class at this time (${e.divisions?.division_name} - ${e.subjects?.subject_name || e.custom_subject || 'Class'})` })
    }
    if (e.room_id && e.room_id === newEntry.room_id && newEntry.room_id) {
      const fName = e.faculty?.full_name || e.custom_faculty || 'another faculty'
      conflicts.push({ type: 'room', message: `Room ${e.rooms?.room_number} is already booked at this time by ${fName} (${e.subjects?.subject_name || e.custom_subject || 'Class'})` })
    }
    // Division conflict: skip if BOTH entries have a valid batch_number (batch lab mode)
    const newBatch = newEntry.batch_number ? Number(newEntry.batch_number) : null
    const eBatch = e.batch_number ? Number(e.batch_number) : null
    if (e.division_id === newEntry.division_id) {
      if (newBatch && eBatch && newBatch !== eBatch) {
        // Same division, different batches → allowed for labs, no conflict
      } else {
        const fName = e.faculty?.full_name || e.custom_faculty || 'Faculty'
        conflicts.push({ type: 'division', message: `${e.divisions?.division_name} already has a class at this time: ${fName} (${e.subjects?.subject_name || e.custom_subject || 'Class'})${eBatch ? ` – Batch ${eBatch}` : ''}` })
      }
    }
  }

  return conflicts
}

// Division name formatter: INFT-4-A -> A (if sem is filtered/known)
export const formatDivName = (name, isSync = false) => {
  if (!name) return '—'
  // If sync'd (semester selected), strip the prefix like "INFT-4-"
  if (isSync) {
    // Matches patterns like "PREFIX-SEM-DIV" or any string with two dashes
    const match = name.match(/[^-]+-[^-]+-(.+)$/)
    return match ? match[1] : name
  }
  return name
}

export const sendNotification = async (supabase, userId, title, message, type = 'info') => {
  if (!userId) return
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false
      })
    if (error) console.error('Error sending notification:', error)
  } catch (err) {
    console.error('Catch error sending notification:', err)
  }
}
