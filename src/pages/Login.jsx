import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Layers, Shield } from 'lucide-react'
import { Spinner } from '../components/ui'

export default function LoginPage() {
  const { signIn, demoMode } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const { error: err } = await signIn(form.email, form.password)
    
    if (err) {
      setLoading(false)
      setError(err.message)
      return
    }

    // Successfull sign-in, but check if profile was loaded
    // We wait a bit for AuthProvider state to update or just check the result if signIn was modified
    // but better to rely on the fact that if it succeeded but we didn't redirect, something is wrong.
    
    setTimeout(() => {
      setLoading(false)
      // If we are still on this page after 2 seconds, it means the AuthGuard probably didn't let us through
      setError('Authentication successful, but your faculty profile was not found. Please contact an admin.')
    }, 2000)
  }

  const fillDemo = (role) => {
    if (role === 'faculty') setForm({ email: 'faculty@vit.edu', password: 'demo123' })
    else setForm({ email: 'admin@vit.edu', password: 'demo123' })
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Glow effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(74,108,247,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)', boxShadow: '0 8px 32px rgba(74,108,247,0.4)' }}>
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>VIT DLR Portal</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Academic Audit & Lecture Record System</p>
          <p className="text-xs mt-1 font-semibold tracking-widest uppercase" style={{ color: 'rgba(74,108,247,0.8)' }}>Vidyalankar Institute of Technology</p>
        </div>

        {/* Demo mode quick login */}
        {demoMode && (
          <div className="glass-card p-4 mb-4">
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Demo Quick Login</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('faculty')} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: 'rgba(74,108,247,0.15)', border: '1px solid rgba(74,108,247,0.3)', color: '#7090ff' }}>
                <GraduationCap className="w-4 h-4" /> Faculty
              </button>
              <button onClick={() => fillDemo('admin')} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', color: '#3fb950' }}>
                <Shield className="w-4 h-4" /> Admin / HOD
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@vit.edu"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px]">
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              For account access, contact your department admin.
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Role-based Access', 'Conflict Detection', 'PDF & Excel Reports', 'Digital Audit'].map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
