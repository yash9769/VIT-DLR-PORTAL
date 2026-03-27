import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEMO_USER_FACULTY, DEMO_USER_ADMIN } from '../lib/demoData'

const AuthContext = createContext(null)

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error fetching profile:', error)
      }
      
      setProfile(data)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    // Demo mode sign-in
    if (DEMO_MODE) {
      if (email === 'admin@vit.edu.in' && password === 'demo123') {
        setProfile(DEMO_USER_ADMIN)
        setUser({ id: DEMO_USER_ADMIN.id, email })
        return { error: null }
      } else if (email === 'faculty@vit.edu.in' && password === 'demo123') {
        setProfile(DEMO_USER_FACULTY)
        setUser({ id: DEMO_USER_FACULTY.id, email })
        return { error: null }
      }
      return { error: { message: 'Invalid credentials. Try faculty@vit.edu.in or admin@vit.edu.in with demo123' } }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isAdmin: profile?.role === 'admin' || profile?.role === 'hod', demoMode: DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
