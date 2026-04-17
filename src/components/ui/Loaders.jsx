import { cls } from '../../utils/helpers'
import { Loader2 } from 'lucide-react'
import vitLogo from '../../assets/vit-logo.png'

// ─── Spinner ────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return <Loader2 className={cls('animate-spin text-brand-500', sizes[size], className)} />
}

// ─── Loading Screen ──────────────────────────────────────────────────────────
export const LoadingScreen = ({ text = 'Loading…' }) => (
  <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
    <div className="w-24 h-24 flex items-center justify-center mb-4 relative">
      <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-2xl animate-pulse" />
      <img 
        src={vitLogo} 
        alt="VIT Logo" 
        className="w-20 h-20 object-contain relative z-10 animate-pulse-gentle"
      />
    </div>
    <Spinner size="lg" />
    <p className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>{text}</p>
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
