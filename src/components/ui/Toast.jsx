import { cls } from '../../utils/helpers'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

// ─── Toast ───────────────────────────────────────────────────────────────────
const toastIcons = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
}

export const Toast = ({ message, type = 'info', onClose }) => (
  <div className={cls(
    'flex items-start gap-3 p-4 rounded-2xl shadow-xl animate-slide-up max-w-sm w-full',
    'border border-slate-200'
  )} style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)' }}>
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
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </div>
  )
}
