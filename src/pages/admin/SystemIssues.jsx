import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { toast, Spinner, StatusBadge, Modal } from '../../components/ui'
import { LifeBuoy, Filter, Search, MessageSquare, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORY_COLORS = {
  bug: 'bg-red-500/10 text-red-500',
  maintenance: 'bg-orange-500/10 text-orange-500',
  feature_request: 'bg-blue-500/10 text-blue-500',
  dlr_issue: 'bg-yellow-500/10 text-yellow-500',
  other: 'bg-gray-500/10 text-gray-500',
}

export default function SystemIssuesPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [adminRemarks, setAdminRemarks] = useState('')
  const [status, setStatus] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('system_reports')
        .select('*, users(full_name, email, role)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load system reports')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReport = async () => {
    if (!selectedReport) return

    try {
      const { error } = await supabase
        .from('system_reports')
        .update({
          status,
          admin_remarks: adminRemarks,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id)

      if (error) throw error
      
      toast.success('Report updated successfully')
      setSelectedReport(null)
      fetchReports()
    } catch (error) {
      console.error('Error updating report:', error)
      toast.error('Failed to update report')
    }
  }

  const filteredReports = reports.filter(r => filter === 'all' ? true : r.status === filter)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>System Issues & Support</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage maintenance requests and tech support tickets</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {['all', 'open', 'investigating', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f ? 'bg-brand-500 text-white' : 'hover:bg-white/5 opacity-60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tickets', value: reports.length, icon: MessageSquare, color: '#4A6CF7' },
            { label: 'Open', value: reports.filter(r => r.status === 'open').length, icon: AlertTriangle, color: '#f85149' },
            { label: 'Investigating', value: reports.filter(r => r.status === 'investigating').length, icon: Clock, color: '#d29922' },
            { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, icon: CheckCircle, color: '#3fb950' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.color + '18' }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{stat.label}</p>
                <p className="font-display font-bold text-xl">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tickets List */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="glass-card p-20 flex justify-center"><Spinner /></div>
          ) : filteredReports.length === 0 ? (
            <div className="glass-card p-20 text-center opacity-50">
              <p>No reports found with current filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map(report => (
                <div key={report.id} className="glass-card p-5 space-y-4 hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => {
                  setSelectedReport(report)
                  setAdminRemarks(report.admin_remarks || '')
                  setStatus(report.status)
                }}>
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${CATEGORY_COLORS[report.category]}`}>
                      {report.category?.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      report.priority === 'critical' ? 'text-red-500' :
                      report.priority === 'high' ? 'text-orange-500' : 'text-blue-500'
                    }`}>
                      {report.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm line-clamp-1">{report.subject}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                         <User className="w-3 h-3 text-brand-500" />
                       </div>
                       <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                         {report.users?.full_name}
                       </p>
                    </div>
                  </div>

                  <p className="text-xs line-clamp-2 opacity-70">{report.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                    <p className="text-[10px] opacity-40">{format(new Date(report.created_at), 'dd MMM yyyy, HH:mm')}</p>
                    <span className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                      report.status === 'open' ? 'text-blue-500' :
                      report.status === 'investigating' ? 'text-yellow-500' :
                      report.status === 'resolved' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        report.status === 'open' ? 'bg-blue-500' :
                        report.status === 'investigating' ? 'bg-yellow-500' :
                        report.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)} title="Update Support Ticket" size="lg">
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 bg-white/5 border-none">
                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Reporter</p>
                <p className="text-sm font-semibold">{selectedReport.users?.full_name}</p>
                <p className="text-xs opacity-60">{selectedReport.users?.email}</p>
              </div>
              <div className="glass-card p-3 bg-white/5 border-none">
                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Reported On</p>
                <p className="text-sm font-semibold">{format(new Date(selectedReport.created_at), 'dd MMM yyyy')}</p>
                <p className="text-xs opacity-60">{format(new Date(selectedReport.created_at), 'HH:mm')}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase opacity-50 mb-2">Issue Description</p>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="font-bold text-sm mb-2">{selectedReport.subject}</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.description}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
               <div>
                  <label className="form-label">Update Status</label>
                  <select 
                    className="input-field mt-2"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
               </div>

               <div>
                  <label className="form-label">Admin Remarks / Resolution</label>
                  <textarea 
                    className="input-field mt-2 min-h-[100px]"
                    placeholder="Describe actions taken or resolution..."
                    value={adminRemarks}
                    onChange={e => setAdminRemarks(e.target.value)}
                  />
                  <p className="text-[10px] opacity-40 mt-1 italic">The faculty member will be able to see these remarks.</p>
               </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSelectedReport(null)}
                className="btn-secondary flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateReport}
                className="btn-primary flex-1 py-3"
              >
                Update Ticket
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
