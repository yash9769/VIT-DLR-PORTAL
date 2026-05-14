import { useState, useEffect } from 'react'
import { ShieldAlert, AlertTriangle, Fingerprint, Activity, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { SectionHeader, Spinner, EmptyState } from '../../components/ui'

export default function SecurityAudit() {
  const { demoMode, securityLogs: contextLogs } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [demoMode, contextLogs])

  const fetchLogs = async () => {
    setLoading(true)
    if (demoMode) {
      setLogs(contextLogs || [])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setLogs(data || [])
    } catch (err) {
      console.error('Failed to fetch security logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'RATE_LIMIT_EXCEEDED':
        return <AlertTriangle className="text-amber-500 w-5 h-5" />
      case 'UNAUTHORIZED_ACCESS_ATTEMPT':
        return <ShieldAlert className="text-danger w-5 h-5" />
      case 'FAILED_LOGIN':
        return <Fingerprint className="text-secondary w-5 h-5" />
      default:
        return <Activity className="text-brand-500 w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Security Audit & SIEM Dashboard" 
        subtitle="Monitor suspicious activities, failed authentications, and rate limit events."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 border-danger/20 bg-danger/5">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-danger w-6 h-6" />
            <h3 className="font-semibold text-danger">Threat Level</h3>
          </div>
          <p className="text-3xl font-bold">{logs.filter(l => l.event_type === 'RATE_LIMIT_EXCEEDED').length > 0 ? 'ELEVATED' : 'NORMAL'}</p>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2 text-secondary">
            <Fingerprint className="w-6 h-6" />
            <h3 className="font-semibold">Failed Logins (Recent)</h3>
          </div>
          <p className="text-3xl font-bold">{logs.filter(l => l.event_type === 'FAILED_LOGIN').length}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2 text-secondary">
            <Activity className="w-6 h-6" />
            <h3 className="font-semibold">Total Monitored Events</h3>
          </div>
          <p className="text-3xl font-bold">{logs.length}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" /> Real-time Security Log Feed
          </h3>
          <button onClick={fetchLogs} className="btn-secondary text-xs py-1 px-3">
            Refresh Feed
          </button>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center"><Spinner /></div>
          ) : logs.length === 0 ? (
            <EmptyState 
              icon={ShieldAlert}
              title="No Threats Detected"
              description="The application currently has no recorded security events."
            />
          ) : (
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4">
                  <div className="p-2 glass-card rounded-lg mt-1">
                    {getEventIcon(log.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm truncate">{log.event_type.replace(/_/g, ' ')}</p>
                      <span className="text-xs text-secondary whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-secondary space-y-1">
                      <p><span className="font-medium text-white/70">Target:</span> {log.user_email}</p>
                      <p><span className="font-medium text-white/70">Source IP:</span> {log.ip_address}</p>
                      {log.details && (
                        <div className="mt-2 p-2 bg-black/20 rounded font-mono text-[10px] break-all">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
