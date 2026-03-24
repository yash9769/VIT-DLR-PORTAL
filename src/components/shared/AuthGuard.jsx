import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingScreen } from '../ui'

export const AuthGuard = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen text="Authenticating…" />
  if (!user || !profile) return <Navigate to="/login" replace />
  if (requireRole && profile.role !== requireRole && !(requireRole === 'admin' && profile.role === 'hod')) {
    return <Navigate to={profile.role === 'admin' || profile.role === 'hod' ? '/admin' : '/faculty'} replace />
  }
  return children
}

export const PublicGuard = ({ children }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user && profile) {
    return <Navigate to={profile.role === 'admin' || profile.role === 'hod' ? '/admin' : '/faculty'} replace />
  }
  return children
}
