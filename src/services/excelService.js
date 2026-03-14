import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { formatTime, attendancePercent } from '../utils/helpers'

export const exportDLRToExcel = (records, dateStr, department = 'Information Technology') => {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: DLR Summary ──────────────────────────────────────────
  const headerRows = [
    ['VIDYALANKAR INSTITUTE OF TECHNOLOGY', '', '', '', '', '', '', '', '', '', '', '', ''],
    [`Department of ${department}`, '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DAILY LECTURE RECORD', '', '', '', '', '', '', '', '', '', '', '', ''],
    [`Date: ${format(new Date(dateStr), 'EEEE, dd MMMM yyyy')}`, '', '', '', '', '', '', '', '', '', '', '', ''],
    [],
    [
      'Sr.No', 'Faculty Name', 'Emp.ID', 'Division', 'Subject Code', 'Subject Name',
      'Room', 'Sched. Start', 'Sched. End', 'Actual Start', 'Actual End',
      'Topic Covered', 'Present', 'Total', 'Attendance %', 'LCS Status',
      'SB PDF', 'Substitution', 'Remarks', 'Status', 'Approved By', 'Approved At'
    ],
  ]

  const dataRows = records.map((r, i) => [
    i + 1,
    r.faculty_name || r.users?.full_name || '—',
    r.users?.employee_id || '—',
    r.divisions?.division_name || '—',
    r.subjects?.subject_code || '—',
    r.subjects?.subject_name || '—',
    r.rooms?.room_number || '—',
    formatTime(r.scheduled_start),
    formatTime(r.scheduled_end),
    formatTime(r.actual_start),
    formatTime(r.actual_end),
    r.topic_covered || '—',
    r.present_count || 0,
    r.total_students || 0,
    `${attendancePercent(r.present_count, r.total_students)}%`,
    r.lcs_status === 'covered' ? 'Covered' : r.lcs_status === 'partially_covered' ? 'Partially Covered' : 'Not Covered',
    r.smartboard_pdf_uploaded ? 'Yes' : 'No',
    r.is_substitution ? 'Yes' : 'No',
    r.remarks || '',
    r.approval_status?.toUpperCase() || 'PENDING',
    r.approved_by_name || '—',
    r.approved_at ? format(new Date(r.approved_at), 'dd/MM/yyyy HH:mm') : '—',
  ])

  const allRows = [...headerRows, ...dataRows]
  const ws1 = XLSX.utils.aoa_to_sheet(allRows)

  // Column widths
  ws1['!cols'] = [
    { wch: 6 }, { wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 28 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 40 },
    { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 8 }, { wch: 12 },
    { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
  ]

  // Merge title rows
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 12 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws1, 'DLR Summary')

  // ── Sheet 2: Attendance Pivot ─────────────────────────────────────
  const divGroups = {}
  records.forEach(r => {
    const div = r.divisions?.division_name || 'Unknown'
    if (!divGroups[div]) divGroups[div] = []
    divGroups[div].push(r)
  })

  const pivotRows = [
    ['Division-wise Attendance Summary', '', '', ''],
    [`Date: ${dateStr}`, '', '', ''],
    [],
    ['Division', 'Subject', 'Present', 'Total', 'Attendance %'],
  ]
  Object.entries(divGroups).forEach(([div, recs]) => {
    recs.forEach(r => {
      pivotRows.push([
        div,
        r.subjects?.subject_name || '—',
        r.present_count,
        r.total_students,
        `${attendancePercent(r.present_count, r.total_students)}%`,
      ])
    })
  })
  const ws2 = XLSX.utils.aoa_to_sheet(pivotRows)
  ws2['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Attendance Pivot')

  // ── Sheet 3: LCS Status ───────────────────────────────────────────
  const lcsRows = [
    ['LCS & Smartboard Status Report', '', '', ''],
    [`Date: ${dateStr}`, '', '', ''],
    [],
    ['Faculty', 'Subject', 'Division', 'Topic', 'LCS Status', 'Smartboard PDF'],
  ]
  records.forEach(r => {
    lcsRows.push([
      r.users?.full_name || '—',
      r.subjects?.subject_name || '—',
      r.divisions?.division_name || '—',
      r.topic_covered || '—',
      r.lcs_status === 'covered' ? 'Covered' : r.lcs_status === 'partially_covered' ? 'Partially' : 'Not Covered',
      r.smartboard_pdf_uploaded ? 'Uploaded' : 'Pending',
    ])
  })
  const ws3 = XLSX.utils.aoa_to_sheet(lcsRows)
  ws3['!cols'] = [{ wch: 25 }, { wch: 28 }, { wch: 10 }, { wch: 40 }, { wch: 18 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'LCS Status')

  XLSX.writeFile(wb, `DLR_${department.replace(/ /g,'_')}_${dateStr}.xlsx`)
}

export const exportTimetableToExcel = (timetable, faculty, department) => {
  const wb = XLSX.utils.book_new()
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const slots = [...new Set(timetable.map(t => t.time_slots?.slot_label))].sort()

  const header = ['Faculty / Division', ...days]
  const rowMap = {}

  timetable.forEach(t => {
    const key = `${t.users?.full_name || t.faculty_id} — ${t.divisions?.division_name}`
    if (!rowMap[key]) rowMap[key] = { label: key }
    rowMap[key][t.day_of_week] = `${t.subjects?.short_name || '?'}\n${t.time_slots?.slot_label || ''}\n${t.rooms?.room_number || ''}`
  })

  const rows = [
    ['TIMETABLE', '', '', '', '', '', ''],
    [`Department of ${department}`, '', '', '', '', '', ''],
    [],
    header,
    ...Object.values(rowMap).map(r => [r.label, ...days.map(d => r[d] || '')]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 35 }, ...days.map(() => ({ wch: 28 }))]
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable')
  XLSX.writeFile(wb, `Timetable_${department.replace(/ /g,'_')}.xlsx`)
}
