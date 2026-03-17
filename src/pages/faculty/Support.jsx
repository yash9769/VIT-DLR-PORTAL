import { useState, useEffect } from 'react'
import { LifeBuoy, Send, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast, Spinner } from '../../components/ui'
import { format } from 'date-fns'

const CATEGORIES = [
  { id: 'dlr_issue', label: 'DLR Submission Issue', icon: AlertCircle },
  { id: 'bug', label: 'System Bug', icon: LifeBuoy },
  { id: 'maintenance', label: 'Maintenance Request', icon: Clock },
  { id: 'feature_request', label: 'Feature Request', icon: MessageSquare },
  { id: 'other', label: 'Other', icon: MessageSquare },
]

const PRIORITIES = [
  { id: 'low', label: 'Low', color: 'bg-blue-500' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { id: 'high', label: 'High', color: 'bg-orange-500' },
  { id: 'critical', label: 'Critical', color: 'bg-red-500' },
]

export default function SupportPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [reports, setReports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    category: 'dlr_issue',
    priority: 'medium',
    subject: '',
    description: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setFetching(true)
      const { data, error } = await supabase
        .from('system_reports')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load your reports')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject || !form.description) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('system_reports')
        .insert([{
          user_id: profile.id,
          category: form.category,
          priority: form.priority,
          subject: form.subject,
          description: form.description,
          status: 'open'
        }])

      if (error) throw error
      
      toast.success('Report submitted successfully')
      setForm({
        category: 'dlr_issue',
        priority: 'medium',
        subject: '',
        description: ''
      })
      setShowForm(false)
      fetchReports()
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-5 pb-24 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>System Support</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Report technical issues or request help</p>
      </div>

      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full btn-primary h-14 flex items-center justify-center gap-3"
        >
          <LifeBuoy className="w-5 h-5" />
          Report New Issue
        </button>
      ) : (
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold">New Issue Report</h2>
            <button onClick={() => setShowForm(false)} className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Category</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                      form.category === cat.id 
                        ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                        : 'border-white/10 bg-white/5 opacity-60'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Priority</label>
                <select 
                  className="input-field mt-2"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITIES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Subject</label>
              <input 
                type="text"
                className="input-field mt-2"
                placeholder="Brief summary of the issue"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea 
                className="input-field mt-2 min-h-[120px]"
                placeholder="Provide details about the issue..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-12 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Spinner className="text-white" /> : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Your Recent Reports</h2>
        
        {fetching ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-card p-10 text-center opacity-60">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No issues reported yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className="glass-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-500">
                         {report.category?.replace('_', ' ')}
                       </span>
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${
                         PRIORITIES.find(p => p.id === report.priority)?.color || 'bg-gray-500'
                       }`}>
                         {report.priority}
                       </span>
                    </div>
                    <h3 className="font-bold text-sm mt-2">{report.subject}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase ${
                      report.status === 'open' ? 'text-blue-500' :
                      report.status === 'investigating' ? 'text-yellow-500' :
                      report.status === 'resolved' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {report.status}
                    </span>
                    <p className="text-[10px] opacity-40 mt-1">{format(new Date(report.created_at), 'dd MMM')}</p>
                  </div>
                </div>
                
                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{report.description}</p>
                
                {report.admin_remarks && (
                  <div className="p-3 bg-brand-500/5 rounded-xl border border-brand-500/10">
                    <p className="text-[10px] font-bold text-brand-500 uppercase flex items-center gap-1.5 mb-1">
                      <CheckCircle className="w-3 h-3" /> Admin Response
                    </p>
                    <p className="text-xs italic" style={{ color: 'var(--text-primary)' }}>{report.admin_remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
