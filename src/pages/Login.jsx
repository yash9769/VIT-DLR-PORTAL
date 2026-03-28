import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Zap, FileSpreadsheet, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Spinner, toast, DemoModeBanner } from '../components/ui'
import vitLogo from '../assets/vit-logo.png'

export default function LoginPage() {
  const { signIn, demoMode } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn(form.email, form.password)

    if (result?.error) {
      setLoading(false)
      setError(result.error.message)
      return
    }

    // Success! We keep loading true because AuthGuard/App will 
    // soon redirect us once the profile state is updated.
    // If it takes too long (>10s), we stop loading so user can try again.
    setTimeout(() => {
      setLoading(false)
    }, 10000)
  }

  const fillDemo = (role) => {
    setForm({
      email: role === 'admin' ? 'admin@vit.edu.in' : 'faculty@vit.edu.in',
      password: 'demo123'
    })
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {demoMode && <DemoModeBanner />}
      
      <div className="absolute top-6 right-6 z-50">
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[120px]" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <img src={vitLogo} alt="VIT Logo" className="h-20 w-auto mx-auto mb-6" />
            <h1 className="text-3xl font-bold font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>VIT DLR Portal</h1>
            <p className="mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Academic Audit & Lecture Record System</p>
            <p className="text-xs text-brand-500/80 uppercase tracking-widest mt-1 font-bold">Vidyalankar Institute of Technology</p>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8 mb-8 border-white/[0.08]">
            {demoMode && (
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-70" style={{ color: 'var(--text-secondary)' }}>Quick Demo Login</p>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => fillDemo('faculty')}
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold"
                  >
                    Faculty Profile
                  </button>
                  <button 
                    type="button"
                    onClick={() => fillDemo('admin')}
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold"
                  >
                    Admin / HOD
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">Email Address <span className="opacity-50 font-normal text-xs">(name@vit.edu.in)</span></label>
                <input 
                  type="email"
                  required
                  className="input-field"
                  placeholder="name@vit.edu.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button type="button" onClick={async () => {
                    if (!form.email) { toast.error('Please enter your email first'); return }
                    const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/reset-password` })
                    if (error) toast.error(error.message)
                    else toast.success('Password reset link sent to your email!')
                  }} className="text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors">
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger animate-pulse-dot">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary h-14 flex items-center justify-center gap-3"
              >
                {loading ? <Spinner className="text-white" /> : "Sign In to Portal"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            For account access, contact your department admin.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 max-w-2xl px-6 opacity-60">
          {[
            { icon: ShieldCheck, label: "Role-based Access" },
            { icon: Zap, label: "Conflict Detection" },
            { icon: FileSpreadsheet, label: "PDF & Excel Reports" },
            { icon: History, label: "Digital Audit" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 glass-card rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              <feature.icon className="w-4 h-4 text-brand-500" />
              {feature.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
