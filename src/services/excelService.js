import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { formatTime, attendancePercent } from '../utils/helpers'

// Rooms with Lecture Capture System - get yellow highlight
const LCS_ROOMS = ['E101', 'E201', 'E204', 'M202']

// ── Style helpers ─────────────────────────────────────────────────────────────
const S = {
  DARK:    '00172E',
  ACCENT:  '1E3A8A',
  YELLOW:  'FFFF00',
  RED:     'FF0000',
  RED_BG:  'FFE0E0',
  WHITE:   'FFFFFF',
  GREY:    'F5F5F5',
  BLACK:   '000000',
}

const border = () => ({
  top:    { style: 'thin', color: { rgb: 'AAAAAA' } },
  bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
  left:   { style: 'thin', color: { rgb: 'AAAAAA' } },
  right:  { style: 'thin', color: { rgb: 'AAAAAA' } },
})

// Title row (dark navy bg, white bold text, centered)
const titleC = (v, sz = 14) => ({ v, t: 's', s: {
  font: { name: 'Arial', sz, bold: true, color: { rgb: S.WHITE } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  fill: { fgColor: { rgb: S.DARK } },
}})

// Accent row (blue bg, white text)
const accentC = (v, sz = 10) => ({ v, t: 's', s: {
  font: { name: 'Arial', sz, bold: false, color: { rgb: S.WHITE } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  fill: { fgColor: { rgb: S.ACCENT } },
}})

// Column header (dark bg, white bold, centered, wrapped)
const hdrC = (v) => ({ v, t: 's', s: {
  font: { name: 'Arial', sz: 8, bold: true, color: { rgb: S.WHITE } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  fill: { fgColor: { rgb: S.DARK } },
  border: border(),
}})

// Data cell with configurable bg/fg/bold/align
const dc = (v, bg = S.WHITE, fg = S.BLACK, bold = false, align = 'center') => ({
  v: v ?? '',
  t: typeof v === 'number' ? 'n' : 's',
  s: {
    font: { name: 'Arial', sz: 9, bold, color: { rgb: fg } },
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    fill: { fgColor: { rgb: bg } },
    border: border(),
  }
})

// Blank filler for merged header rows
const blk = (bg = S.DARK) => ({ v: '', t: 's', s: { fill: { fgColor: { rgb: bg } } } })

// Write rows array into a worksheet
const makeWS = (rows, merges, cols) => {
  const ws = {}
  rows.forEach((row, r) => {
    if (!row) return
    row.forEach((cell, c) => {
      if (cell == null) return
      ws[XLSX.utils.encode_cell({ r, c })] = cell
    })
  })
  const maxR = rows.length
  const maxC = Math.max(...rows.filter(Boolean).map(r => r.length), 1)
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR - 1, c: maxC - 1 } })
  if (merges) ws['!merges'] = merges
  if (cols)   ws['!cols']   = cols
  return ws
}

const m = (r1,c1,r2,c2) => ({ s:{r:r1,c:c1}, e:{r:r2,c:c2} })

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 1 — DLR Excel (exact VIT DLR template)
// Columns exactly match the PDF:
//  SEM | DIV | Total Batch Strength | Sub. Owned/Offered by IT
//  | As Per Timetable: From | To | Prof | Highlight Room No with LC/SB
//  | Actual: From | To | Prof | Attendance
//  | Lecture Capture done Successfully (Y/N)
//  | Smart Board PDF uploaded on VREFER (Y/N)
//  | Assignments No. (of Last Week) Collected
//  | Assignments No. (for Coming week) Given
//  | Assignment No. of Previous week which is Graded and distributed
//  | Remarks
// ─────────────────────────────────────────────────────────────────────────────
export const exportDLRToExcel = (records, dateStr, department = 'Information Technology') => {
  const wb = XLSX.utils.book_new()
  const dayName    = format(new Date(dateStr), 'EEEE')
  const dateDisp   = format(new Date(dateStr), 'dd/MM/yyyy')
  const NC = 18  // exactly 18 columns

  // ── Build header rows ───────────────────────────────────────────────────────
  const rows = []

  // Row 0: VIT title
  rows.push([titleC('VIDYALANKAR INSTITUTE OF TECHNOLOGY', 14), ...Array(NC-1).fill(blk(S.DARK))])

  // Row 1: Dept name
  rows.push([accentC(`Department of ${department}`, 11), ...Array(NC-1).fill(blk(S.ACCENT))])

  // Row 2: Document title
  rows.push([accentC('[Schedule of Daily Lecture Record]', 11), ...Array(NC-1).fill(blk(S.ACCENT))])

  // Row 3: Date (left) + Day (right)
  rows.push([
    { v: `Date: -${dateDisp}`, t:'s', s:{ font:{name:'Arial',sz:10,bold:true}, alignment:{horizontal:'left',vertical:'center'} } },
    ...Array(9).fill(null),
    { v: `Day: ${dayName}`, t:'s', s:{ font:{name:'Arial',sz:10,bold:true}, alignment:{horizontal:'right',vertical:'center'} } },
    ...Array(NC-11).fill(null),
  ])

  // Row 4: Note line (yellow bg)
  rows.push([
    { v:'Note: (/) Indicates Practical Schedule, Yellow color indicates LCS classroom', t:'s', s:{
      font:{name:'Arial',sz:9,bold:true},
      alignment:{horizontal:'center',vertical:'center'},
      fill:{fgColor:{rgb:'FFFACD'}},
    }},
    ...Array(NC-1).fill({ v:'', t:'s', s:{ fill:{fgColor:{rgb:'FFFACD'}} } }),
  ])

  // NC = 18 total columns
  // Structure: 3-row header (Rows 5, 6, 7)

  // Row 5: Group Headers (Primary Groups)
  rows.push([
    hdrC('SEM'), hdrC('DIV'), hdrC('Total Batch Strength'), hdrC('Sub. Owned / Offered by IT'), // Col 0-3
    hdrC('As Per Timetable'), blk(S.DARK), blk(S.DARK), // Col 4-6 (covers 3 cols)
    hdrC('Highlight Room No. with Lecture Capture/ Smart Board'), // Col 7
    hdrC('Actual'), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), // Col 8-16 (covers 9 cols)
    hdrC('Remarks') // Col 17
  ])

  // Row 6: Sub-Group Headers (Secondary Groups)
  rows.push([
    blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), // Merged from top
    hdrC('Timing'), blk(S.DARK), hdrC('Prof'), // Under Timetable
    blk(S.DARK), // Merged from top (Room)
    hdrC('Timing'), blk(S.DARK), hdrC('Prof'), hdrC('Attendance'), 
    hdrC('Lecture Capture done Successfully: (Video and Audio) : Y/N'),
    hdrC('Smart Board PDF uploaded on VREFER (Y/N)'),
    hdrC('Assignments No. (of Last Week) Collected'),
    hdrC('Assignments No. (for Coming week) Given'),
    hdrC('Assignment No. of Previous week which is Graded and distributed'), // Under Actual
    blk(S.DARK) // Merged from top (Remarks)
  ])

  // Row 7: Field labels (The smallest components)
  rows.push([
    blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), // Merged from top
    hdrC('From'), hdrC('To'), blk(S.DARK), // Under Timetable -> Timing
    blk(S.DARK), // Merged from top (Room)
    hdrC('From'), hdrC('To'), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), blk(S.DARK), // Under Actual -> Timing/Other
    blk(S.DARK) // Merged from top (Remarks)
  ])

  const merges = [
    m(0,0,0,NC-1),  // VIT title
    m(1,0,1,NC-1),  // Dept
    m(2,0,2,NC-1),  // Doc title
    m(3,0,3,9), m(3,10,3,NC-1), // Date + Day
    m(4,0,4,NC-1),  // Note
    
    // VERTICAL MERGES (Rows 5-7)
    m(5,0,7,0),   // SEM
    m(5,1,7,1),   // DIV
    m(5,2,7,2),   // STR
    m(5,3,7,3),   // SUBJECT
    m(5,7,7,7),   // Highlight Room
    m(5,17,7,17), // Remarks

    // GROUP MERGES (Row 5 Horiz)
    m(5,4,5,6),   // As Per Timetable
    m(5,8,5,16),  // Actual

    // SUB-GROUP MERGES (Row 6)
    m(6,4,6,5),   // Timetable -> Timing
    m(6,6,7,6),   // Timetable -> Prof
    m(6,8,6,9),   // Actual -> Timing
    m(6,10,7,10), // Actual -> Prof
    m(6,11,7,11), // Actual -> Attendance
    m(6,12,7,12), // Actual -> LCS
    m(6,13,7,13), // Actual -> SB
    m(6,14,7,14), // Actual -> Assign Coll
    m(6,15,7,15), // Actual -> Assign Give
    m(6,16,7,16), // Actual -> Assign Grad
  ]

  // ── Data rows ──────────────────────────────────────────────────────────────
  // Group by SEM then DIV so we can merge SEM/DIV cells
  const groups = {}
  records.forEach(r => {
    const sem = r.divisions?.semester ?? '—'
    const div = r.divisions?.division_name ?? '—'
    const key = `${sem}|||${div}`
    if (!groups[key]) groups[key] = { sem, div, recs: [] }
    groups[key].recs.push(r)
  })

  const sortedGroups = Object.values(groups).sort((a,b) =>
    String(a.sem).localeCompare(String(b.sem)) || a.div.localeCompare(b.div)
  )

  sortedGroups.forEach(({ sem, div, recs }) => {
    const groupStart = rows.length

    recs.forEach((r, ri) => {
      const roomNum = r.rooms?.room_number || r.custom_room || ''
      const isLCS   = LCS_ROOMS.includes(roomNum)
      const isSub   = r.is_substitution === true
      const attPct  = attendancePercent(r.present_count, r.total_students)
      const isLow   = Number(attPct) < 50

      // Row bg: substitution = red tint, LCS = yellow, else white
      const rowBg = isSub ? S.RED_BG : isLCS ? S.YELLOW : S.WHITE

      // Faculty initials
      const facName  = r.faculty_name || r.users?.full_name || r.faculty?.full_name || ''
      const initials = facName.split(' ').filter(Boolean).map(w=>w[0]).join('') || '—'

      // Subject code
      const subCode = r.subjects?.subject_code || r.subjects?.short_name || r.subjects?.subject_name || '—'

      // Substitution cell helper — red bold text for sub rows
      const fc = (v, align='center') => dc(v, rowBg, isSub ? S.RED : S.BLACK, isSub, align)

      // LCS room cell — always yellow bg + bold
      const roomCell = isLCS
        ? { v: roomNum||'—', t:'s', s:{ font:{name:'Arial',sz:9,bold:true,color:{rgb:S.BLACK}}, alignment:{horizontal:'center',vertical:'center'}, fill:{fgColor:{rgb:S.YELLOW}}, border:border() }}
        : fc(roomNum||'—')

      // Attendance cell — red bg + white text if < 50%
      const attCell = { v: r.present_count ?? 0, t:'n', s:{
        font:{ name:'Arial', sz:9, bold: isLow, color:{rgb: isLow ? S.WHITE : S.BLACK} },
        alignment:{ horizontal:'center', vertical:'center' },
        fill:{ fgColor:{ rgb: isLow ? S.RED : rowBg } },
        border: border(),
      }}

      // SEM + DIV cells — only first row of group gets the label; rest are blank (merged later)
      const semCell = { v: ri===0 ? String(sem) : '', t:'s', s:{
        font:{name:'Arial',sz:10,bold:true,color:{rgb:S.BLACK}},
        alignment:{horizontal:'center',vertical:'center'},
        fill:{fgColor:{rgb:'E8F0FE'}},
        border:border(),
      }}
      const divCell = { v: ri===0 ? String(div) : '', t:'s', s:{
        font:{name:'Arial',sz:10,bold:true,color:{rgb:S.BLACK}},
        alignment:{horizontal:'center',vertical:'center'},
        fill:{fgColor:{rgb:'F0F4FF'}},
        border:border(),
      }}

      // Actual field mapping matching the new standard
      const lcsVal = r.lecture_capture_done === true ? 'Y' : 'N'
      const sbVal  = r.smart_board_uploaded === true ? 'Y' : 'N'
      const collected = r.assignments_last_week ?? r.assignments_collected ?? 0
      const given     = r.assignments_given ?? 0
      const graded    = r.assignments_graded ?? 0

      rows.push([
        semCell,
        divCell,
        fc(r.total_batch_strength ?? r.total_students ?? 60),
        fc(subCode),
        fc(formatTime(r.timetable_from || r.scheduled_start)),
        fc(formatTime(r.timetable_to || r.scheduled_end)),
        fc(initials),
        roomCell,
        fc(formatTime(r.actual_from || r.actual_start)),
        fc(formatTime(r.actual_to || r.actual_end)),
        fc(initials),
        attCell,
        fc(lcsVal),
        fc(sbVal),
        fc(collected),
        fc(given),
        fc(graded),
        dc(
          isSub
            ? `Substitution — ${facName}`
            : (r.remarks || r.topic_covered || '-'),
          rowBg, isSub ? S.RED : S.BLACK, isSub, 'left'
        ),
      ])
    })

    // Merge SEM + DIV cells across all rows in this group
    if (recs.length > 1) {
      merges.push(m(groupStart, 0, groupStart + recs.length - 1, 0)) // SEM
      merges.push(m(groupStart, 1, groupStart + recs.length - 1, 1)) // DIV
    }
  })

  // ── HOD signature section ──────────────────────────────────────────────────
  rows.push(Array(NC).fill(null))
  rows.push([{ v:'HOD Remark:', t:'s', s:{font:{name:'Arial',sz:10,bold:true}} }, ...Array(NC-1).fill(null)])
  rows.push([{ v:'➢ Second Year & Third Year lectures & practical conducted as per schedule.', t:'s', s:{font:{name:'Arial',sz:9}} }, ...Array(NC-1).fill(null)])
  rows.push([{ v:'➢ In Progress - Assignments/Experiments to be received, graded & distributed to the students is in process.', t:'s', s:{font:{name:'Arial',sz:9}} }, ...Array(NC-1).fill(null)])
  rows.push(Array(NC).fill(null))
  rows.push([{ v:'Dr. Vidya Chitre', t:'s', s:{font:{name:'Arial',sz:10,bold:true}} }, ...Array(NC-1).fill(null)])
  rows.push([{ v:'Professor & Head', t:'s', s:{font:{name:'Arial',sz:9}} }, ...Array(NC-1).fill(null)])
  rows.push([{ v:`Department of ${department}`, t:'s', s:{font:{name:'Arial',sz:9}} }, ...Array(NC-1).fill(null)])

  // Merge HOD rows across all cols
  const lastRows = rows.length
  merges.push(m(lastRows-7, 0, lastRows-7, NC-1))
  merges.push(m(lastRows-6, 0, lastRows-6, NC-1))
  merges.push(m(lastRows-5, 0, lastRows-5, NC-1))
  merges.push(m(lastRows-4, 0, lastRows-4, NC-1))
  merges.push(m(lastRows-3, 0, lastRows-3, NC-1))
  merges.push(m(lastRows-2, 0, lastRows-2, NC-1))
  merges.push(m(lastRows-1, 0, lastRows-1, NC-1))

  const cols = [
    {wch:5},{wch:5},{wch:8},{wch:14},
    {wch:6},{wch:6},{wch:6},{wch:11},
    {wch:6},{wch:6},{wch:6},{wch:9},
    {wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:28},
  ]

  const ws1 = makeWS(rows, merges, cols)
  // Row heights
  ws1['!rows'] = rows.map((_,i) => {
    if (i === 0) return { hpt: 24 }
    if (i <= 2)  return { hpt: 20 }
    if (i === 5) return { hpt: 80 } // tall header
    return { hpt: 18 }
  })
  XLSX.utils.book_append_sheet(wb, ws1, 'DLR Schedule')

  // ── Sheet 2: Lecture Capture Tracking ─────────────────────────────────────
  const lcRecs = records.filter(r => LCS_ROOMS.includes(r.rooms?.room_number || r.custom_room || ''))
  const NC2 = 10
  const lcRows = [
    [titleC('VIDYALANKAR INSTITUTE OF TECHNOLOGY', 13), ...Array(NC2-1).fill(blk(S.DARK))],
    [accentC(`Department of ${department}`, 10), ...Array(NC2-1).fill(blk(S.ACCENT))],
    [accentC('Daily Tracking of Lecture Capture for <VIT>', 10), ...Array(NC2-1).fill(blk(S.ACCENT))],
    Array(NC2).fill(null),
    // Info header
    [hdrC('College'), hdrC('Day'), hdrC('Date'), hdrC('Process Owner'), ...Array(NC2-4).fill(null)],
    [dc('VIT'), dc(dayName), dc(dateDisp), dc('—'), ...Array(NC2-4).fill(null)],
    Array(NC2).fill(null),
    // Table header
    [hdrC('Room No.\nwith LC'), hdrC('Lecture\nNo.'), hdrC('From'), hdrC('To'),
     hdrC('Course / Stream\n/ Program'), hdrC('Year'), hdrC('Sub.'), hdrC('Prof.'),
     hdrC('Mic used\nSuccessfully\nYes'), hdrC('No')],
    ...lcRecs.map((r, i) => {
      const room = r.rooms?.room_number || r.custom_room || '—'
      const facName = r.faculty_name || r.users?.full_name || r.faculty?.full_name || '—'
      const initials = facName.split(' ').filter(Boolean).map(w=>w[0]).join('')
      return [
        { v:room, t:'s', s:{ font:{name:'Arial',sz:10,bold:true}, alignment:{horizontal:'center',vertical:'center'}, fill:{fgColor:{rgb:S.YELLOW}}, border:border() }},
        dc(i+1),
        dc(formatTime(r.actual_start)),
        dc(formatTime(r.actual_end)),
        dc(r.divisions?.division_name || r.custom_division || '—'),
        dc(r.divisions?.year || '2025'),
        dc(r.subjects?.short_name || r.subjects?.subject_code || '—'),
        dc(initials),
        dc('Yes'),
        dc('-'),
      ]
    })
  ]
  const lcMerges = [
    m(0,0,0,NC2-1), m(1,0,1,NC2-1), m(2,0,2,NC2-1),
    m(4,0,4,3), m(4,4,4,NC2-1),
    m(5,0,5,3), m(5,4,5,NC2-1),
  ]
  const ws2 = makeWS(lcRows, lcMerges, [{wch:10},{wch:8},{wch:8},{wch:8},{wch:22},{wch:6},{wch:10},{wch:8},{wch:8},{wch:6}])
  XLSX.utils.book_append_sheet(wb, ws2, 'Lecture Capture Tracking')

  // ── Sheet 3: Faculty List ──────────────────────────────────────────────────
  const seen = new Set()
  const uniqFac = []
  records.forEach(r => {
    const n = r.faculty_name || r.users?.full_name || r.faculty?.full_name
    if (n && !seen.has(n)) { seen.add(n); uniqFac.push(n) }
  })
  const flRows = [
    [titleC('VIDYALANKAR INSTITUTE OF TECHNOLOGY', 13), blk(S.DARK), blk(S.DARK)],
    [accentC(`Department of ${department}`, 10), blk(S.ACCENT), blk(S.ACCENT)],
    [accentC('LIST OF THE FACULTY TAKING LECTURES IN DEPARTMENT OF INFORMATION TECHNOLOGY', 9), blk(S.ACCENT), blk(S.ACCENT)],
    Array(3).fill(null),
    [hdrC('Sr.No.'), hdrC('Faculty Name'), hdrC('Initial')],
    ...uniqFac.map((name, i) => {
      const bg = i%2===0 ? S.WHITE : S.GREY
      return [
        dc(i+1, bg), dc(name, bg, S.BLACK, false, 'left'), dc(name.split(' ').filter(Boolean).map(w=>w[0]).join(''), bg),
      ]
    })
  ]
  const ws3 = makeWS(flRows, [m(0,0,0,2),m(1,0,1,2),m(2,0,2,2)], [{wch:8},{wch:45},{wch:12}])
  XLSX.utils.book_append_sheet(wb, ws3, 'Faculty List')

  XLSX.writeFile(wb, `INFT_DLR_${dayName}_${dateDisp.replace(/\//g,'-')}.xlsx`)
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 2 — Attendance Analysis (Year / Div / Sem / Subject wise)
// ─────────────────────────────────────────────────────────────────────────────
export const exportAttendanceAnalysis = (records, department = 'Information Technology', dateFrom = '', dateTo = '') => {
  const wb = XLSX.utils.book_new()
  const label = (dateFrom && dateTo)
    ? `${format(new Date(dateFrom),'dd/MM/yyyy')} to ${format(new Date(dateTo),'dd/MM/yyyy')}`
    : 'All Dates'

  // ── Sheet A: Year / Division / Semester ───────────────────────────────────
  const divMap = {}
  records.forEach(r => {
    const k = `${r.divisions?.semester||'?'}|||${r.divisions?.division_name||'?'}`
    if (!divMap[k]) divMap[k] = { year:r.divisions?.year||'—', sem:r.divisions?.semester||'—', div:r.divisions?.division_name||'—', recs:[] }
    divMap[k].recs.push(r)
  })
  const NC_A = 6
  const sheetA = [
    [titleC('VIDYALANKAR INSTITUTE OF TECHNOLOGY',13), ...Array(NC_A-1).fill(blk(S.DARK))],
    [accentC(`Department of ${department}`,10), ...Array(NC_A-1).fill(blk(S.ACCENT))],
    [accentC('ATTENDANCE ANALYSIS — YEAR & DIVISION WISE',10), ...Array(NC_A-1).fill(blk(S.ACCENT))],
    [{ v:`Date Range: ${label}`, t:'s', s:{font:{name:'Arial',sz:9,bold:true},alignment:{horizontal:'center'},fill:{fgColor:{rgb:'FFFACD'}}} }, ...Array(NC_A-1).fill({v:'',t:'s',s:{fill:{fgColor:{rgb:'FFFACD'}}}})],
    Array(NC_A).fill(null),
    [hdrC('Year'),hdrC('Semester'),hdrC('Division'),hdrC('Total Lectures'),hdrC('Avg Attendance %'),hdrC('Status')],
    ...Object.values(divMap).sort((a,b)=>String(a.sem).localeCompare(String(b.sem))||a.div.localeCompare(b.div)).map((g,i)=>{
      const avg = g.recs.length>0 ? Math.round(g.recs.reduce((s,r)=>s+Number(attendancePercent(r.present_count,r.total_students)),0)/g.recs.length) : 0
      const low = avg < 75
      const bg = low ? S.RED_BG : i%2===0 ? S.WHITE : S.GREY
      const mk = v => dc(v, bg, low?S.RED:S.BLACK, low)
      return [mk(String(g.year)), mk(String(g.sem)), mk(g.div), mk(g.recs.length), mk(avg+'%'), mk(low?'⚠ BELOW 75%':'✓ OK')]
    })
  ]
  const wsA = makeWS(sheetA, [m(0,0,0,NC_A-1),m(1,0,1,NC_A-1),m(2,0,2,NC_A-1),m(3,0,3,NC_A-1)],
    [{wch:8},{wch:10},{wch:12},{wch:16},{wch:18},{wch:14}])
  XLSX.utils.book_append_sheet(wb, wsA, 'Year & Division Wise')

  // ── Sheet B: Subject wise ─────────────────────────────────────────────────
  const subMap = {}
  records.forEach(r => {
    const k = `${r.divisions?.semester||'?'}|||${r.divisions?.division_name||'?'}|||${r.subjects?.subject_code||r.subjects?.subject_name||'?'}`
    if (!subMap[k]) subMap[k] = { sem:r.divisions?.semester||'—', div:r.divisions?.division_name||'—', code:r.subjects?.subject_code||'—', name:r.subjects?.subject_name||'—', recs:[] }
    subMap[k].recs.push(r)
  })
  const NC_B = 7
  const sheetB = [
    [titleC('VIDYALANKAR INSTITUTE OF TECHNOLOGY',13), ...Array(NC_B-1).fill(blk(S.DARK))],
    [accentC(`Department of ${department}`,10), ...Array(NC_B-1).fill(blk(S.ACCENT))],
    [accentC('ATTENDANCE ANALYSIS — SUBJECT WISE',10), ...Array(NC_B-1).fill(blk(S.ACCENT))],
    [{ v:`Date Range: ${label}`, t:'s', s:{font:{name:'Arial',sz:9,bold:true},alignment:{horizontal:'center'},fill:{fgColor:{rgb:'FFFACD'}}} }, ...Array(NC_B-1).fill({v:'',t:'s',s:{fill:{fgColor:{rgb:'FFFACD'}}}})],
    Array(NC_B).fill(null),
    [hdrC('Sem'),hdrC('Division'),hdrC('Subject Code'),hdrC('Subject Name'),hdrC('Total Lectures'),hdrC('Avg Present / Total'),hdrC('Avg Att %')],
    ...Object.values(subMap).sort((a,b)=>String(a.sem).localeCompare(String(b.sem))||a.div.localeCompare(b.div)).map((g,i)=>{
      const totP = g.recs.reduce((s,r)=>s+(r.present_count||0),0)
      const totS = g.recs.reduce((s,r)=>s+(r.total_students||0),0)
      const avg  = totS>0 ? Math.round(totP/totS*100) : 0
      const avgP = g.recs.length>0 ? Math.round(totP/g.recs.length) : 0
      const avgT = g.recs.length>0 ? Math.round(totS/g.recs.length) : 0
      const low  = avg < 75
      const bg   = low ? S.RED_BG : i%2===0 ? S.WHITE : S.GREY
      const mk   = v => dc(v, bg, low?S.RED:S.BLACK, low)
      return [mk(String(g.sem)), mk(g.div), mk(g.code),
        dc(g.name, bg, low?S.RED:S.BLACK, low, 'left'),
        mk(g.recs.length), mk(`${avgP}/${avgT}`), mk(avg+'%')]
    })
  ]
  const wsB = makeWS(sheetB, [m(0,0,0,NC_B-1),m(1,0,1,NC_B-1),m(2,0,2,NC_B-1),m(3,0,3,NC_B-1)],
    [{wch:6},{wch:10},{wch:14},{wch:35},{wch:14},{wch:16},{wch:12}])
  XLSX.utils.book_append_sheet(wb, wsB, 'Subject Wise')

  XLSX.writeFile(wb, `VIT_Attendance_Analysis_${label.replace(/ /g,'_').replace(/\//g,'-')}.xlsx`)
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 3 — Timetable (VIT template)
// ─────────────────────────────────────────────────────────────────────────────
export const exportTimetableToExcel = (timetable, faculty, department = 'Information Technology') => {
  const wb = XLSX.utils.book_new()
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const NC = days.length + 1

  const rows = [
    [titleC('VIDYALANKAR INSTITUTE OF TECHNOLOGY',13), ...Array(NC-1).fill(blk(S.DARK))],
    [accentC(`Department of ${department}`,10), ...Array(NC-1).fill(blk(S.ACCENT))],
    [accentC('TIMETABLE',10), ...Array(NC-1).fill(blk(S.ACCENT))],
    Array(NC).fill(null),
    [hdrC('Faculty / Division'), ...days.map(d=>hdrC(d))],
  ]
  const merges = [m(0,0,0,NC-1), m(1,0,1,NC-1), m(2,0,2,NC-1)]

   const rowMap = {}
   timetable.forEach(t => {
     const facultyName = t.custom_faculty || t.faculty?.full_name || '—'
     const divisionName = t.custom_division || t.divisions?.division_name || '—'
     const key = `${facultyName} — ${divisionName}`
     if (!rowMap[key]) rowMap[key] = { label:key }
     const room = t.custom_room||t.rooms?.room_number||''
     rowMap[key][t.day_of_week] = `${t.custom_subject||t.subjects?.short_name||t.subjects?.subject_name||'?'}\n${t.custom_time_slot||t.time_slots?.slot_label||''}\n${room}`
   })

  Object.values(rowMap).forEach((r,i) => {
    const bg = i%2===0 ? S.WHITE : S.GREY
    rows.push([
      dc(r.label, bg, S.BLACK, true, 'left'),
      ...days.map(d => {
        const v = r[d]||''
        const isLCS = LCS_ROOMS.some(rm=>v.includes(rm))
        return dc(v, isLCS?S.YELLOW:bg, S.BLACK, false, 'center')
      })
    ])
  })

  const ws = makeWS(rows, merges, [{wch:35},...days.map(()=>({wch:25}))])
  ws['!rows'] = rows.map((_,i)=>i<3?{hpt:22}:{hpt:40})
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable')
  XLSX.writeFile(wb, `VIT_Timetable_${department.replace(/ /g,'_')}.xlsx`)
}
