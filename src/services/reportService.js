import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { formatTime, attendancePercent } from '../utils/helpers'
import vitLogoUrl from '../assets/vit-logo.png'

const LCS_ROOMS = ['E101', 'E201', 'E204', 'M202']

export const generateDLRPDF = (records, dateStr, department = 'Information Technology') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // Calculate statistics
  const totalLectures = records.length
  const approved = records.filter(r => r.approval_status === 'approved').length
  const pending = records.filter(r => r.approval_status === 'pending').length
  const substitutionCount = records.filter(r => r.is_substitution === true).length
  const avgAttendance = totalLectures > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.present_count / r.total_students * 100 || 0), 0) / totalLectures)
    : 0

  // ── Header ────────────────────────────────────────────────────────────────
  // ── VIT Header ─────────────────────────────────────────────────────────────
  // Dark navy bar
  doc.setFillColor(0, 23, 46)
  doc.rect(0, 0, pageW, 30, 'F')
  // Try to add logo
  try { doc.addImage(vitLogoUrl, 'PNG', 3, 2, 20, 14) } catch(_) {}
  // VIT title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('VIDYALANKAR INSTITUTE OF TECHNOLOGY', pageW / 2, 10, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Accredited A+ by NAAC', pageW / 2, 15, { align: 'center' })
  // Blue accent bar
  doc.setFillColor(30, 58, 138)
  doc.rect(0, 30, pageW, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Department of ' + department, pageW / 2, 36, { align: 'center' })
  // Yellow info bar
  doc.setFillColor(255, 250, 205)
  doc.rect(0, 39, pageW, 8, 'F')
  doc.setTextColor(0, 23, 46)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  const formattedDate = format(new Date(dateStr), 'EEEE, dd MMMM yyyy')
  doc.text('[Schedule of Daily Lecture Record]  |  Date: ' + formattedDate, pageW / 2, 44, { align: 'center' })
  doc.text('Note: Yellow = LCS room (E101/E201/E204/M202)  |  Red row = Substitution  |  Red cell = Attendance < 50%', pageW / 2, 49, { align: 'center' })
  const headerEndY = 53
  doc.setTextColor(100,100,100)
  doc.setFontSize(7)
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageW - 14, headerEndY - 2, { align: 'right' })

  // Summary position
  const summaryY = headerEndY + 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  const stats = [
    `Total Lectures: ${totalLectures}`,
    `Approved: ${approved}`,
    `Pending: ${pending}`,
    `Substitutions: ${substitutionCount}`,
    `Avg Attendance: ${avgAttendance}%`,
  ]
  stats.forEach((s, i) => {
    doc.text(s, 20 + i * 54, summaryY + 7)
  })

  // ── Legend box ───────────────────────────────────────────────────────────
  const legendY = summaryY + 16
  const legendH = 12

  doc.setDrawColor(200, 205, 220)
  doc.setLineWidth(0.3)
  doc.roundedRect(14, legendY, pageW - 28, legendH, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(60, 60, 60)
  doc.text('Report Legend:', 18, legendY + 4.5)

  // Legend items: [fillColor, label, xOffset from start]
  const legendItems = [
    { fill: [255, 255, 255], border: [200, 200, 200], label: 'Regular lecture', x: 50 },
    { fill: [255, 255, 200], border: [200, 200, 100], label: 'Live Capture room (E101/E201/E204/M202)', x: 105 },
    { fill: [255, 230, 230], border: [200, 150, 150], label: 'Faculty substitution', x: 190 },
    { fill: [255, 230, 200], border: [200, 170, 130], label: 'Substitution + Live Capture', x: 240 },
  ]

  doc.setFontSize(6.5)
  legendItems.forEach(item => {
    // Colour square
    doc.setFillColor(...item.fill)
    doc.setDrawColor(...item.border)
    doc.rect(item.x, legendY + 2.5, 5, 5, 'FD')
    // Label text
    doc.setTextColor(60, 60, 60)
    doc.text(item.label, item.x + 7, legendY + 6.5)
  })

  // ── Main table ────────────────────────────────────────────────────────────
  // Column order: #, Faculty, Division, Subject, Room, Sched., Actual, Topic, Remarks, P/T, %, LCS, SB, Status
  // ── Main table ────────────────────────────────────────────────────────────
  // OG DLR HEADER (Multi-row)
  // Row 1: Group headers
  // Row 2: Field headers
  const headerRow1 = [
    { content: 'SEM', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } },
    { content: 'DIV', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Total Batch Strength', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Sub. Owned / Offered by IT', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } },
    { content: 'As Per Timetable', colSpan: 3, styles: { halign: 'center' } },
    { content: 'Highlight Room No. with Lecture Capture/ Smart Board', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Actual', colSpan: 9, styles: { halign: 'center' } },
    { content: 'Remarks', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } }
  ]

  const headerRow2 = [
    { content: 'Timing', colSpan: 2, styles: { halign: 'center' } },
    { content: 'Prof', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Timing', colSpan: 2, styles: { halign: 'center' } },
    { content: 'Prof', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Attendance', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Lecture Capture done Successfully: (Video and Audio) : Y/N', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Smart Board PDF uploaded on VREFER (Y/N)', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Assignments No. (of Last Week) Collected', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Assignments No. (for Coming week) Given', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Assignment No. of Previous week which is Graded and distributed', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
  ]

  const headerRow3 = [
    'From', 'To', // under TT timing
    'From', 'To'  // under Actual timing
  ]

  const rows = records.map((r, i) => {
    const facultyInitials = (r.faculty?.full_name || r.users?.full_name || '').split(' ').filter(Boolean).map(w=>w[0]).join('')
    const actualProf = (r.actual_faculty?.full_name || r.faculty?.full_name || '—').split(' ').filter(Boolean).map(w=>w[0]).join('')
    const subCode = r.subjects?.short_name || r.subjects?.subject_code || '—'

    return [
      i + 1,
      r.divisions?.semester || '—',
      r.divisions?.division_name || '—',
      r.total_batch_strength || r.divisions?.strength || 60,
      subCode,

      formatTime(r.timetable_from || r.scheduled_start),
      formatTime(r.timetable_to || r.scheduled_end),
      facultyInitials || '—',

      formatTime(r.actual_from || r.actual_start),
      formatTime(r.actual_to || r.actual_end),
      actualProf || '—',
      r.attendance ?? r.present_count ?? 0,

      r.lecture_capture_done ? 'Y' : 'N',
      r.smart_board_uploaded ? 'Y' : 'N',

      r.assignments_last_week || r.assignments_collected || 0,
      r.assignments_given || 0,
      r.assignments_graded || 0,

      r.remarks || r.topic_covered || ''
    ]
  })

  doc.autoTable({
    head: [headerRow1, headerRow2, headerRow3],
    body: rows,
    startY: legendY + legendH + 2,
    theme: 'grid',
    styles: {
      fontSize: 6,
      cellPadding: 1,
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [150, 150, 150],
      lineWidth: 0.2,
      halign: 'center'
    },
    headStyles: {
      fillColor: [18, 24, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 7 },   // #
      1: { cellWidth: 8 },   // SEM
      2: { cellWidth: 9 },   // DIV
      3: { cellWidth: 8 },   // STR.
      4: { cellWidth: 15 },  // SUBJECT
      5: { cellWidth: 13 },  // FROM
      6: { cellWidth: 13 },  // TO
      7: { cellWidth: 15 },  // PROFESSOR
      8: { cellWidth: 13 },  // FROM
      9: { cellWidth: 13 },  // TO
      10: { cellWidth: 15 }, // PROF.
      11: { cellWidth: 9 },  // ATTN
      12: { cellWidth: 8 },  // LCS
      13: { cellWidth: 8 },  // SB
      14: { cellWidth: 10 }, // LAST
      15: { cellWidth: 10 }, // GIVE
      16: { cellWidth: 10 }, // GRAD
      17: { cellWidth: 'auto', halign: 'left' }, // REMARKS
    },

    didParseCell: function(data) {
      if (data.section !== 'body') return
      const record = records[data.row.index]
      if (!record) return

      const isSubstitution = record.is_substitution
      const roomNum = record.rooms?.room_number || ''
      const isLCS = LCS_ROOMS.includes(roomNum)

      // Highlight LCS rooms in YELLOW (1:1 requirement)
      if (isLCS) {
        data.cell.styles.fillColor = [255, 255, 200]
      }
      
      // Highlight substitution rows in RED
      if (isSubstitution) {
        data.cell.styles.fillColor = [255, 230, 230]
      }
    },
    margin: { left: 10, right: 10 },
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  // ── Footer (OG Style) ──────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 10
  
  // HOD Remarks Box
  doc.setDrawColor(180, 180, 200)
  doc.rect(10, finalY, pageW - 20, 15)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('HOD REMARKS:', 12, finalY + 5)
  
  // Legend / Notes
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.text('* LCS: Live Lecture Capture Done | SB: Smart Board Upload Success | Red Row: Substitution | Yellow Cell: LCS Room', 10, finalY + 20)

  // ── Signature boxes (OG Spec) ─────────────────────────────────────────────
  const sigY = pageH - 25
  const sigWidth = (pageW - 40) / 3
  
  const signatures = [
    { label: 'Faculty In-Charge', x: 10 },
    { label: 'HOD - IT', x: 10 + sigWidth + 10 },
    { label: 'Principal', x: 10 + (sigWidth + 10) * 2 }
  ]
  
  signatures.forEach(sig => {
    doc.setDrawColor(180, 180, 200)
    doc.setLineWidth(0.3)
    doc.line(sig.x, sigY, sig.x + sigWidth, sigY) // Signature line
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(sig.label, sig.x + sigWidth / 2, sigY + 5, { align: 'center' })
  })

  doc.save(`DLR_${department.replace(/ /g, '_')}_${dateStr}.pdf`)
}

export const generateAttendancePDF = (record, students, attendance) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFillColor(18, 24, 38)
  doc.rect(0, 0, pageW, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('ATTENDANCE SHEET', pageW / 2, 13, { align: 'center' })

  doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)
  const meta = [
    ['Subject', record.subjects?.subject_name || '—', 'Division', record.divisions?.division_name || '—'],
    ['Date', record.lecture_date || '—', 'Time', `${formatTime(record.actual_start)} - ${formatTime(record.actual_end)}`],
    ['Topic', record.topic_covered || '—', 'Room', record.rooms?.room_number || '—'],
    ['Present', `${record.present_count}/${record.total_students}`, 'Attendance', `${attendancePercent(record.present_count, record.total_students)}%`],
  ]

  doc.autoTable({
    body: meta.map(r => [r[0], r[1], r[2], r[3]]),
    startY: 26,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 24, textColor: [80, 80, 120] },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', cellWidth: 24, textColor: [80, 80, 120] },
      3: { cellWidth: 60 },
    },
    margin: { left: 14, right: 14 },
  })

  const attendanceMap = {}
  attendance.forEach(a => { attendanceMap[a.student_id] = a.is_present })

  const rows = students.map((s, i) => [
    i + 1,
    s.roll_number,
    s.full_name,
    attendanceMap[s.id] !== undefined ? (attendanceMap[s.id] ? 'P' : 'A') : '—'
  ])

  doc.autoTable({
    head: [['#', 'Roll No.', 'Student Name', 'Status']],
    body: rows,
    startY: doc.lastAutoTable.finalY + 6,
    theme: 'grid',
    headStyles: { fillColor: [18, 24, 38], textColor: [255, 255, 255], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 90 },
      3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      if (data.column.dataKey === 3 || (data.column.index === 3 && data.cell.section === 'body')) {
        const v = data.cell.raw
        if (v === 'P') doc.setTextColor(40, 167, 69)
        else if (v === 'A') doc.setTextColor(220, 53, 69)
      }
    },
    margin: { left: 14, right: 14 },
  })

  doc.save(`Attendance_${record.subjects?.short_name}_${record.divisions?.division_name}_${record.lecture_date}.pdf`)
}
