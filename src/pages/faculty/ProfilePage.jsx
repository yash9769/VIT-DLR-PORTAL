<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { User, Mail, Shield, Building, Contact } from 'lucide-react'
import { Eye, EyeOff, Save, KeyRound, Award, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast, Spinner } from '../../components/ui'

export default function ProfilePage() {
  const { user, profile, demoMode } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [facultyDetails, setFacultyDetails] = useState(null)
  
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    if (profile?.id && !facultyDetails && !fetching) {
      fetchDetailedProfile()
    }
  }, [profile?.id, facultyDetails, fetching])

  const fetchDetailedProfile = async () => {
    if (fetching && facultyDetails) return // Prevent duplicate fetches if already have data
    
    try {
      setFetching(true)
      const { data, error } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle()
      
      if (error) throw error
      setFacultyDetails(data)
    } catch (error) {
      console.error('Error fetching detailed profile:', error)
      // Only toast on significant errors, not "no rows" which maybeSingle handles
    } finally {
      setFetching(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (demoMode) {
      toast.error('Password change is disabled in demo mode')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setUpdatingPassword(true)
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error
      
      toast.success('Password updated successfully')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="px-4 pt-5 pb-24 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
          {profile?.full_name?.[0] || 'U'}
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your personal and security settings</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
          <UserCheck className="w-5 h-5 text-brand-500" />
          <h2 className="font-bold">Account Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Full Name</p>
            <div className="flex items-center gap-2 font-semibold">
              <User className="w-4 h-4 text-brand-500" />
              <span>{profile?.full_name}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Email Address</p>
            <div className="flex items-center gap-2 font-semibold">
              <Mail className="w-4 h-4 text-brand-500" />
              <span>{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Role</p>
            <div className="flex items-center gap-2 font-semibold capitalize">
              <Shield className="w-4 h-4 text-brand-500" />
              <span>{profile?.role}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Department</p>
            <div className="flex items-center gap-2 font-semibold">
              <Building className="w-4 h-4 text-brand-500" />
              <span>{profile?.department || 'Not Assigned'}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Security - Password Change */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
          <KeyRound className="w-5 h-5 text-brand-500" />
          <h2 className="font-bold">Security Settings</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Update your password to keep your account secure.</p>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">New Password</label>
              <div className="relative mt-2">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="Minimum 6 characters"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  disabled={demoMode}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                className="input-field mt-2"
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                disabled={demoMode}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={updatingPassword || demoMode}
            className="w-full btn-primary h-12 flex items-center justify-center gap-2 mt-4"
          >
            {updatingPassword ? <Spinner className="text-white" /> : (
              <>
                <Save className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
          
          {demoMode && (
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider text-center">
              Password changes are disabled in demo mode
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
=======
import { useState, useEffect } from 'react'
import { User, Mail, Shield, Building, Contact } from 'lucide-react'
import { Eye, EyeOff, Save, KeyRound, Award, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast, Spinner } from '../../components/ui'

export default function ProfilePage() {
  const { user, profile, demoMode } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [facultyDetails, setFacultyDetails] = useState(null)
  
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    if (profile?.id && !facultyDetails && !fetching) {
      fetchDetailedProfile()
    }
  }, [profile?.id, facultyDetails, fetching])

  const fetchDetailedProfile = async () => {
    if (fetching && facultyDetails) return // Prevent duplicate fetches if already have data
    
    try {
      setFetching(true)
      const { data, error } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle()
      
      if (error) throw error
      setFacultyDetails(data)
    } catch (error) {
      console.error('Error fetching detailed profile:', error)
      // Only toast on significant errors, not "no rows" which maybeSingle handles
    } finally {
      setFetching(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (demoMode) {
      toast.error('Password change is disabled in demo mode')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setUpdatingPassword(true)
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error
      
      toast.success('Password updated successfully')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="px-4 pt-5 pb-24 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
          {profile?.full_name?.[0] || 'U'}
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your personal and security settings</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
          <UserCheck className="w-5 h-5 text-brand-500" />
          <h2 className="font-bold">Account Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Full Name</p>
            <div className="flex items-center gap-2 font-semibold">
              <User className="w-4 h-4 text-brand-500" />
              <span>{profile?.full_name}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Email Address</p>
            <div className="flex items-center gap-2 font-semibold">
              <Mail className="w-4 h-4 text-brand-500" />
              <span>{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Role</p>
            <div className="flex items-center gap-2 font-semibold capitalize">
              <Shield className="w-4 h-4 text-brand-500" />
              <span>{profile?.role}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Department</p>
            <div className="flex items-center gap-2 font-semibold">
              <Building className="w-4 h-4 text-brand-500" />
              <span>{profile?.department || 'Not Assigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Details (Only for Faculty) */}
      {profile?.role === 'faculty' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
            <Award className="w-5 h-5 text-brand-500" />
            <h2 className="font-bold">Professional Details</h2>
          </div>

          {fetching ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : facultyDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Designation</p>
                <p className="font-semibold">{facultyDetails.designation || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Qualifications</p>
                <p className="font-semibold">{facultyDetails.qualification || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Specialization</p>
                <p className="font-semibold">{facultyDetails.specialization || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Joining Date</p>
                <p className="font-semibold">{facultyDetails.joining_date || '—'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm opacity-50 italic text-center py-4">Detailed faculty profile data not available</p>
          )}
        </div>
      )}

      {/* Security - Password Change */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
          <KeyRound className="w-5 h-5 text-brand-500" />
          <h2 className="font-bold">Security Settings</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Update your password to keep your account secure.</p>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">New Password</label>
              <div className="relative mt-2">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="Minimum 6 characters"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  disabled={demoMode}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                className="input-field mt-2"
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                disabled={demoMode}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={updatingPassword || demoMode}
            className="w-full btn-primary h-12 flex items-center justify-center gap-2 mt-4"
          >
            {updatingPassword ? <Spinner className="text-white" /> : (
              <>
                <Save className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
          
          {demoMode && (
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider text-center">
              Password changes are disabled in demo mode
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
>>>>>>> 5661d6d4811369cc687fcf7d71d6d5fce20903f4
