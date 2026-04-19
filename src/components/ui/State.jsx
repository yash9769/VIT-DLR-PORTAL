import { AlertTriangle } from 'lucide-react'

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
