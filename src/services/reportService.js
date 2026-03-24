import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { formatTime, attendancePercent } from '../utils/helpers'

const LCS_ROOMS = ['E101', 'E201', 'E204', 'M202']

export const generateDLRPDF = (records, dateStr, department = 'Information Technology') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(18, 24, 38)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('VIDYALANKAR INSTITUTE OF TECHNOLOGY', pageW / 2, 10, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Department of ' + department, pageW / 2, 16, { align: 'center' })

  doc.setFontSize(10)
  doc.text('DAILY LECTURE RECORD (DLR)', pageW / 2, 22, { align: 'center' })

  // ── Date info ─────────────────────────────────────────────────────────────
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)
  const formattedDate = format(new Date(dateStr), 'EEEE, dd MMMM yyyy')
  doc.text(`Date: ${formattedDate}`, 14, 34)
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageW - 14, 34, { align: 'right' })

  // ── Summary stats bar ─────────────────────────────────────────────────────
  const totalLectures = records.length
  const approved = records.filter(r => r.approval_status === 'approved').length
  const pending = records.filter(r => r.approval_status === 'pending').length
  const substitutionCount = records.filter(r => r.is_substitution).length
  const avgAttendance = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + attendancePercent(r.present_count, r.total_students), 0) / records.length)
    : 0

  const summaryY = 38
  doc.setFillColor(245, 247, 255)
  doc.roundedRect(14, summaryY, pageW - 28, 12, 2, 2, 'F')

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
  const columns = [
    { header: '#',         dataKey: 'idx' },
    { header: 'Faculty',   dataKey: 'faculty' },
    { header: 'Division',  dataKey: 'division' },
    { header: 'Subject',   dataKey: 'subject' },
    { header: 'Room',      dataKey: 'room' },
    { header: 'Sched.',    dataKey: 'scheduled' },
    { header: 'Actual',    dataKey: 'actual' },
    { header: 'Topic',     dataKey: 'topic' },
    { header: 'Remarks',   dataKey: 'remarks' },
    { header: 'P/T',       dataKey: 'attendance' },
    { header: '%',         dataKey: 'percent' },
    { header: 'LCS',       dataKey: 'lcs' },
    { header: 'SB',        dataKey: 'sb' },
    { header: 'Status',    dataKey: 'status' },
  ]

  const rows = records.map((r, i) => {
    const isSubstitution = r.is_substitution === true
    const roomNum = r.rooms?.room_number || ''
    const isLCS = LCS_ROOMS.includes(roomNum)

    // Faculty cell with substitution note
    let facultyText = r.faculty_name || r.users?.full_name || r.faculty?.full_name || '—'
    if (isSubstitution) {
      const origName = r.original_faculty?.full_name || r.original_faculty_name || '?'
      facultyText = `${facultyText}\n(sub. for ${origName})`
    }

    // Room cell with LCS indicator
    let roomText = roomNum || '—'
    if (isLCS) roomText = `${roomText}\n● REC`

    // Remarks cell
    let remarksText = ''
    if (isSubstitution && isLCS) {
      remarksText = 'Sub + LCS Recorded'
    } else if (isSubstitution) {
      const origName = r.original_faculty?.full_name || r.original_faculty_name || '?'
      const proxyName = r.faculty_name || r.faculty?.full_name || '?'
      remarksText = `Lecture adjusted — original faculty absent. Covered by ${proxyName}`
    } else if (isLCS) {
      remarksText = 'LCS Recorded'
    } else {
      remarksText = r.remarks || ''
    }

    // Status cell
    const statusBase = r.approval_status?.toUpperCase().substring(0, 4) || 'PEND'
    const statusText = isSubstitution ? `${statusBase}\nSUBSTITUTED` : statusBase

    return {
      idx: i + 1,
      faculty: facultyText,
      division: r.divisions?.division_name || '—',
      subject: r.subjects?.short_name || '—',
      room: roomText,
      scheduled: `${formatTime(r.scheduled_start)}\n${formatTime(r.scheduled_end)}`,
      actual: `${formatTime(r.actual_start)}\n${formatTime(r.actual_end)}`,
      topic: r.topic_covered?.substring(0, 35) + (r.topic_covered?.length > 35 ? '…' : ''),
      remarks: remarksText,
      attendance: `${r.present_count}/${r.total_students}`,
      percent: `${attendancePercent(r.present_count, r.total_students)}%`,
      lcs: r.lcs_status === 'covered' ? '✓' : r.lcs_status === 'partially_covered' ? '~' : '✗',
      sb: r.smartboard_pdf_uploaded ? '✓' : '✗',
      status: statusText,
      // raw record for hooks
      _isSubstitution: isSubstitution,
      _isLCS: isLCS,
      _originalFaculty: r.original_faculty?.full_name || r.original_faculty_name,
      _proxyFaculty: r.faculty_name || r.faculty?.full_name,
    }
  })

  doc.autoTable({
    columns,
    body: rows,
    startY: legendY + legendH + 2,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [200, 205, 220],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [18, 24, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    columnStyles: {
      idx:        { cellWidth: 7,  halign: 'center' },
      faculty:    { cellWidth: 30 },
      division:   { cellWidth: 14, halign: 'center' },
      subject:    { cellWidth: 13, halign: 'center' },
      room:       { cellWidth: 16, halign: 'center' },
      scheduled:  { cellWidth: 16, halign: 'center' },
      actual:     { cellWidth: 16, halign: 'center' },
      topic:      { cellWidth: 38 },
      remarks:    { cellWidth: 35 },
      attendance: { cellWidth: 12, halign: 'center' },
      percent:    { cellWidth: 10, halign: 'center' },
      lcs:        { cellWidth: 9,  halign: 'center' },
      sb:         { cellWidth: 9,  halign: 'center' },
      status:     { cellWidth: 16, halign: 'center' },
    },

    // ── Row background colours (didParseCell) ──────────────────────────────
    didParseCell: function(data) {
      if (data.section !== 'body') return
      const row = rows[data.row.index]
      if (!row) return

      const isSubstitution = row._isSubstitution
      const isLCS = row._isLCS

      // Background
      if (isSubstitution && isLCS) {
        data.cell.styles.fillColor = [255, 230, 200] // orange
      } else if (isSubstitution) {
        data.cell.styles.fillColor = [255, 230, 230] // red
      } else if (isLCS) {
        data.cell.styles.fillColor = [255, 255, 200] // yellow
      }

      // Remarks column — red text for substitutions, amber for LCS
      if (data.column.dataKey === 'remarks') {
        if (isSubstitution && isLCS) {
          data.cell.styles.textColor = [180, 100, 0] // orange-red
        } else if (isSubstitution) {
          data.cell.styles.textColor = [180, 0, 0]   // red
        } else if (isLCS) {
          data.cell.styles.textColor = [140, 100, 0] // dark amber
        }
        data.cell.styles.fontStyle = 'italic'
      }

      // Room column: orange text for LCS marker
      if (data.column.dataKey === 'room' && isLCS) {
        data.cell.styles.textColor = [180, 100, 0]
      }

      // Status column: substituted tag in red italic
      if (data.column.dataKey === 'status' && isSubstitution) {
        data.cell.styles.fontStyle = 'bold'
      }
    },

    // ── Status colour drawing (didDrawCell) ──────────────────────────────────
    didDrawCell: (data) => {
      if (data.column.dataKey === 'status' && data.cell.section === 'body') {
        const row = rows[data.row.index]
        const isSubstitution = row?._isSubstitution
        const raw = String(data.cell.raw || '')
        const parts = raw.split('\n')
        const statusPart = parts[0]

        if (statusPart === 'APPR') { doc.setTextColor(40, 167, 69) }
        else if (statusPart === 'REJE') { doc.setTextColor(220, 53, 69) }
        else { doc.setTextColor(255, 140, 0) }

        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')

        if (isSubstitution) {
          doc.text(statusPart, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center' })
          doc.setTextColor(180, 0, 0)
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(5.5)
          doc.text('SUBSTITUTED', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 3.5, { align: 'center' })
        } else {
          doc.text(statusPart, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' })
        }

        doc.setTextColor(40, 40, 40)
        doc.setFont('helvetica', 'normal')
      }
    },
    alternateRowStyles: { fillColor: [248, 249, 255] },  // will be overridden by didParseCell for sub/LCS rows
    margin: { left: 14, right: 14 },
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 6
  doc.setFontSize(7)
  doc.setTextColor(130, 130, 130)
  doc.text('* Room changed from scheduled  |  LCS: Live Lecture Capture  |  SB: Smartboard PDF  |  ● REC: LCS room', 14, finalY)

  // ── Signature boxes ───────────────────────────────────────────────────────
  const sigY = pageH - 25
  const sigBoxes = ['Faculty In-Charge', 'HOD', 'Principal']
  sigBoxes.forEach((label, i) => {
    const x = 14 + i * 90
    doc.setDrawColor(180, 180, 200)
    doc.rect(x, sigY, 80, 18)
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 120)
    doc.text(label, x + 40, sigY + 14, { align: 'center' })
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
