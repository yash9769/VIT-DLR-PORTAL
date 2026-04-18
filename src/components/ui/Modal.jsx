import { cls } from '../../utils/helpers'
import { X } from 'lucide-react'
import { useEffect } from 'react'

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cls('glass-card w-full max-h-[90vh] animate-slide-up overflow-hidden bg-white shadow-2xl flex flex-col', sizes[size])}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-50">
            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
        {footer && (
          <div className="p-5 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
            {footer}
          </div>
        )}
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
