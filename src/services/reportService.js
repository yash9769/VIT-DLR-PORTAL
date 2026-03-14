import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { formatTime, attendancePercent } from '../utils/helpers'

export const generateDLRPDF = (records, dateStr, department = 'Information Technology') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // Header
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

  // Date info
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)
  const formattedDate = format(new Date(dateStr), 'EEEE, dd MMMM yyyy')
  doc.text(`Date: ${formattedDate}`, 14, 34)
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageW - 14, 34, { align: 'right' })

  // Summary stats
  const totalLectures = records.length
  const approved = records.filter(r => r.approval_status === 'approved').length
  const pending = records.filter(r => r.approval_status === 'pending').length
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
    `Avg Attendance: ${avgAttendance}%`,
  ]
  stats.forEach((s, i) => {
    doc.text(s, 20 + i * 65, summaryY + 7)
  })

  // Main table
  const columns = [
    { header: '#',           dataKey: 'idx' },
    { header: 'Faculty',     dataKey: 'faculty' },
    { header: 'Division',    dataKey: 'division' },
    { header: 'Subject',     dataKey: 'subject' },
    { header: 'Room',        dataKey: 'room' },
    { header: 'Sched.',      dataKey: 'scheduled' },
    { header: 'Actual',      dataKey: 'actual' },
    { header: 'Topic Covered', dataKey: 'topic' },
    { header: 'P/T',         dataKey: 'attendance' },
    { header: '%',           dataKey: 'percent' },
    { header: 'LCS',         dataKey: 'lcs' },
    { header: 'SB PDF',      dataKey: 'sb' },
    { header: 'Status',      dataKey: 'status' },
  ]

  const rows = records.map((r, i) => ({
    idx: i + 1,
    faculty: r.faculty_name || r.users?.full_name || '—',
    division: r.divisions?.division_name || '—',
    subject: r.subjects?.short_name || '—',
    room: r.rooms?.room_number || (r.room_changed ? `${r.rooms?.room_number}*` : '—'),
    scheduled: `${formatTime(r.scheduled_start)}\n${formatTime(r.scheduled_end)}`,
    actual: `${formatTime(r.actual_start)}\n${formatTime(r.actual_end)}`,
    topic: r.topic_covered?.substring(0, 40) + (r.topic_covered?.length > 40 ? '…' : ''),
    attendance: `${r.present_count}/${r.total_students}`,
    percent: `${attendancePercent(r.present_count, r.total_students)}%`,
    lcs: r.lcs_status === 'covered' ? '✓' : r.lcs_status === 'partially_covered' ? '~' : '✗',
    sb: r.smartboard_pdf_uploaded ? '✓' : '✗',
    status: r.approval_status?.toUpperCase().substring(0, 4) || 'PEND',
  }))

  doc.autoTable({
    columns,
    body: rows,
    startY: summaryY + 16,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [200, 205, 220],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [18, 24, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      idx: { cellWidth: 8, halign: 'center' },
      faculty: { cellWidth: 32 },
      division: { cellWidth: 16, halign: 'center' },
      subject: { cellWidth: 14, halign: 'center' },
      room: { cellWidth: 18, halign: 'center' },
      scheduled: { cellWidth: 20, halign: 'center' },
      actual: { cellWidth: 20, halign: 'center' },
      topic: { cellWidth: 50 },
      attendance: { cellWidth: 14, halign: 'center' },
      percent: { cellWidth: 12, halign: 'center' },
      lcs: { cellWidth: 10, halign: 'center' },
      sb: { cellWidth: 12, halign: 'center' },
      status: { cellWidth: 16, halign: 'center' },
    },
    didDrawCell: (data) => {
      if (data.column.dataKey === 'status' && data.cell.section === 'body') {
        const status = data.cell.raw
        if (status === 'APPR') { doc.setTextColor(40, 167, 69) }
        else if (status === 'REJE') { doc.setTextColor(220, 53, 69) }
        else { doc.setTextColor(255, 140, 0) }
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(status, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' })
        doc.setTextColor(40, 40, 40)
        doc.setFont('helvetica', 'normal')
      }
    },
    alternateRowStyles: { fillColor: [248, 249, 255] },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const finalY = doc.lastAutoTable.finalY + 6
  doc.setFontSize(7)
  doc.setTextColor(130, 130, 130)
  doc.text('* Room changed from scheduled  |  LCS: Lecture Content Sheet  |  SB: Smartboard PDF', 14, finalY)

  // Signature boxes
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
