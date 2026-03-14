import { cls } from '../../utils/helpers'
import { Loader2, AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

// ─── Spinner ────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return <Loader2 className={cls('animate-spin text-brand-500', sizes[size], className)} />
}

// ─── Loading Screen ──────────────────────────────────────────────────────────
export const LoadingScreen = ({ text = 'Loading…' }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)', boxShadow: '0 8px 32px rgba(74,108,247,0.4)' }}>
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    </div>
    <Spinner size="lg" />
    <p className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>{text}</p>
  </div>
)

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(74,108,247,0.1)' }}>
      {Icon && <Icon className="w-8 h-8 text-brand-400" />}
    </div>
    <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    {description && <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
)

// ─── Toast ───────────────────────────────────────────────────────────────────
const toastIcons = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
}

export const Toast = ({ message, type = 'info', onClose }) => (
  <div className={cls(
    'flex items-start gap-3 p-4 rounded-2xl shadow-glass-lg animate-slide-up max-w-sm w-full',
    'border border-white/10'
  )} style={{ background: 'rgba(22,27,34,0.95)', backdropFilter: 'blur(16px)' }}>
    {toastIcons[type]}
    <p className="text-sm flex-1 font-body" style={{ color: 'var(--text-primary)' }}>{message}</p>
    <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
      <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
    </button>
  </div>
)

// ─── Toast Manager ───────────────────────────────────────────────────────────
let _addToast = null
export const toast = {
  success: (msg) => _addToast?.({ type: 'success', message: msg }),
  error: (msg) => _addToast?.({ type: 'error', message: msg }),
  warning: (msg) => _addToast?.({ type: 'warning', message: msg }),
  info: (msg) => _addToast?.({ type: 'info', message: msg }),
}

export const ToastProvider = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = (t) => {
      const id = Date.now()
      setToasts(prev => [...prev, { ...t, id }])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
    }
    return () => { _addToast = null }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cls('glass-card w-full animate-slide-up overflow-hidden', sizes[size])}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10">
            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) => (
  <Modal open={open} onClose={onCancel} title={title} size="sm">
    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    <div className="flex gap-3 justify-end">
      <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </Modal>
)

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
)

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    pending: { label: 'Pending', cls: 'badge-pending' },
    approved: { label: 'Approved', cls: 'badge-approved' },
    rejected: { label: 'Rejected', cls: 'badge-rejected' },
    locked: { label: 'Locked', cls: 'badge-locked' },
  }
  const s = map[status] || map.pending
  return <span className={cls('badge', s.cls)}>{s.label}</span>
}

// ─── Conflict Warning ─────────────────────────────────────────────────────────
export const ConflictWarning = ({ conflicts }) => {
  if (!conflicts?.length) return null
  return (
    <div className="rounded-xl p-4 border" style={{ background: 'rgba(248,81,73,0.08)', borderColor: 'rgba(248,81,73,0.3)' }}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="font-semibold text-sm text-red-400 font-display">Scheduling Conflicts Detected</span>
      </div>
      <ul className="space-y-1">
        {conflicts.map((c, i) => (
          <li key={i} className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
            {c.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Demo Mode Banner ─────────────────────────────────────────────────────────
export const DemoModeBanner = () => (
  <div className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold" style={{ background: 'rgba(210,153,34,0.15)', borderBottom: '1px solid rgba(210,153,34,0.3)', color: '#f0b429' }}>
    <AlertTriangle className="w-3.5 h-3.5" />
    DEMO MODE — Using mock data. Connect Supabase to enable live features.
  </div>
)

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────
export const CardSkeleton = ({ lines = 3 }) => (
  <div className="glass-card p-5 space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={cls('skeleton h-4', i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full')} style={{ height: i === 0 ? '1.25rem' : '0.875rem' }} />
    ))}
  </div>
)
