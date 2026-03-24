import { useState, useEffect } from 'react'
import { Users, X, RefreshCw, UserX, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast, Modal } from '../ui'
import AdminProxyModal from './AdminProxyModal'
import { DEMO_SUBSTITUTIONS } from '../../lib/demoData'
import { today, formatTime } from '../../utils/helpers'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL

export default function ProxyManagementCard() {
  const [substitutions, setSubstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchSubstitutions()
  }, [])

  const fetchSubstitutions = async () => {
    setLoading(true)
    try {
      if (DEMO_MODE) {
        setSubstitutions(DEMO_SUBSTITUTIONS)
        setLoading(false)
        return
      }

      const todayStr = today()
      const { data, error } = await supabase
        .from('substitutions')
        .select(`
          *,
          absent_faculty:absent_faculty_id (id, full_name),
          proxy_faculty:proxy_faculty_id (id, full_name),
          timetable:timetable_id (
            *,
            subjects (*),
            divisions (*),
            rooms (*),
            time_slots (*)
          )
        `)
        .eq('substitution_date', todayStr)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubstitutions(data || [])
    } catch (err) {
      console.error('Error fetching substitutions:', err)
      toast.error('Failed to load proxy data')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    setCancelling(id)
    try {
      if (DEMO_MODE) {
        setSubstitutions(prev => prev.filter(s => s.id !== id))
        toast.success('Substitution cancelled')
        setCancelling(null)
        return
      }

      const { error } = await supabase
        .from('substitutions')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) throw error
      toast.success('Substitution cancelled')
      fetchSubstitutions()
    } catch (err) {
      console.error('Error cancelling substitution:', err)
      toast.error('Failed to cancel substitution')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,108,247,0.15)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            </div>
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Proxy Management
            </h2>
          </div>
          <button
            onClick={fetchSubstitutions}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm mb-4"
        >
          <UserX className="w-4 h-4" />
          Assign Proxy Faculty
        </button>

        {loading ? (
          <div className="text-center py-4">
            <p className="text-xs opacity-50" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          </div>
        ) : substitutions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No active substitutions today</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
              Today's Substitutions ({substitutions.length})
            </p>
            {substitutions.map(sub => (
              <div
                key={sub.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(74,108,247,0.06)', border: '1px solid rgba(74,108,247,0.15)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {sub.absent_faculty?.full_name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>→</span>
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--brand)' }}>
                      {sub.proxy_faculty?.full_name}
                    </span>
                  </div>
                  {sub.timetable?.subjects && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {sub.timetable.subjects.subject_name} · {sub.timetable.time_slots?.start_time?.substring(0, 5)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCancel(sub.id)}
                  disabled={cancelling === sub.id}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors flex-shrink-0"
                  title="Cancel substitution"
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminProxyModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          setShowAssignModal(false)
          fetchSubstitutions()
        }}
      />
    </>
  )
}
