import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, BarChart2, FileSpreadsheet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { today, attendancePercent } from '../../utils/helpers'
import { generateDLRPDF } from '../../services/reportService'
import { exportDLRToExcel, exportTimetableToExcel, exportAttendanceAnalysis } from '../../services/excelService'

const ReportCard = ({ icon: Icon, title, description, color, actions }) => (
  <div className="glass-card p-6">
    <div className="flex items-start gap-4 mb-5">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '18' }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => (
        <button key={i} onClick={action.onClick} className={i === 0 ? 'btn-primary flex items-center gap-2 text-sm py-2' : 'btn-secondary flex items-center gap-2 text-sm py-2'}>
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      ))}
    </div>
  </div>
)

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [timetable, setTimetable] = useState([])
  const [faculty, setFaculty] = useState([])
  const [dateFrom, setDateFrom] = useState(today())
  const [dateTo, setDateTo] = useState(today())

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const [r, t, f] = await Promise.all([
        supabase.from('lecture_records').select('*, subjects(*), divisions(*), rooms:room_id(*), faculty:faculty_id(*)'),
        supabase.from('timetable').select('*, subjects(*), divisions(*), rooms:room_id(*), faculty:faculty_id(*), time_slots:time_slot_id(*)'),
        supabase.from('users').select('*').eq('role', 'faculty')
      ])
      setRecords(r.data || [])
      setTimetable(t.data || [])
      setFaculty(f.data || [])
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    { label: 'Total Lectures', value: records.length },
    { label: 'Approved', value: records.filter(r=>r.approval_status==='approved').length },
    { label: 'Pending', value: records.filter(r=>r.approval_status==='pending').length },
    { label: 'Avg Attendance', value: records.length > 0 ? Math.round(records.reduce((s,r)=>s+(r.present_count/r.total_students*100),0)/records.length) + '%' : '—' },
    { label: 'LCS Covered', value: records.filter(r=>r.lcs_status==='covered').length + '/' + records.length },
    { label: 'SB PDF Uploaded', value: records.filter(r=>r.smartboard_pdf_uploaded).length + '/' + records.length },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Reports & Export</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Generate official DLR reports and export data</p>
      </div>

      {/* Date range */}
      <div className="glass-card p-5">
        <h2 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Date Range</h2>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="form-label">From</label>
            <input type="date" className="input-field text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="form-label">To</label>
            <input type="date" className="input-field text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="glass-card p-5">
        <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Summary Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsData.map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportCard
          icon={FileText}
          title="Daily Lecture Record (PDF)"
          description="Official landscape-format DLR report with all lecture details, attendance, and approval status."
          color="#4A6CF7"
          actions={[
            { label: 'Download PDF', icon: Download, onClick: () => generateDLRPDF(records, dateFrom) },
          ]}
        />
        <ReportCard
          icon={FileSpreadsheet}
          title="DLR Excel Export"
          description="Multi-sheet Excel workbook with DLR summary, attendance pivot, and LCS status sheets."
          color="#3fb950"
          actions={[
            { label: 'Download Excel', icon: Download, onClick: () => exportDLRToExcel(records, dateFrom) },
          ]}
        />
        <ReportCard
          icon={Calendar}
          title="Timetable Export"
          description="Export the complete timetable in Excel format for institutional records."
          color="#d29922"
          actions={[
            { label: 'Export Timetable', icon: Download, onClick: () => exportTimetableToExcel(timetable, faculty, 'Information Technology') },
          ]}
        />
        <ReportCard
          icon={BarChart2}
          title="Attendance Analysis"
          description="Division-wise and subject-wise attendance breakdown with trend analysis."
          color="#8b5cf6"
          actions={[
            { label: 'Year & Division Wise (Excel)', icon: FileSpreadsheet, onClick: () => exportAttendanceAnalysis(records, 'Information Technology', dateFrom, dateTo) },
          ]}
        />
      </div>

      {/* Faculty-wise table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Faculty-wise Record Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead><tr>
              <th>Faculty</th><th>Employee ID</th><th>Records</th><th>Approved</th><th>Pending</th><th>Avg Attendance</th><th>LCS Covered</th>
            </tr></thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={7} className="text-center py-10 opacity-50">Loading faculty statistics...</td></tr>
              ) : faculty.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-10 opacity-50">No faculty records found</td></tr>
              ) : faculty.map(f => {
                const recs = records.filter(r => r.faculty_id === f.id)
                const avg = recs.length > 0 ? Math.round(recs.reduce((s,r)=>s+(r.present_count/r.total_students*100),0)/recs.length) : 0
                return (
                  <tr key={f.id}>
                    <td className="font-medium text-sm">{f.full_name}</td>

                    <td className="text-sm">{recs.length}</td>
                    <td className="text-sm text-green-400">{recs.filter(r=>r.approval_status==='approved').length}</td>
                    <td className="text-sm text-yellow-400">{recs.filter(r=>r.approval_status==='pending').length}</td>
                    <td><span className="font-semibold text-sm" style={{ color: avg >= 75 ? '#3fb950' : '#f85149' }}>{recs.length > 0 ? avg + '%' : '—'}</span></td>
                    <td className="text-sm">{recs.filter(r=>r.lcs_status==='covered').length}/{recs.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
