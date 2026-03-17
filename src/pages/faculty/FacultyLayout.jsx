import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, History, Bell, LogOut, ChevronRight, LifeBuoy, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cls } from '../../utils/helpers'
import { DemoModeBanner, ThemeToggle } from '../../components/ui'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

const NAV_ITEMS = [
  { path: '/faculty', label: 'Home', icon: LayoutDashboard, exact: true },
  { path: '/faculty/submit', label: 'Submit', icon: FileText },
  { path: '/faculty/attendance', label: 'Roll Call', icon: Users },
  { path: '/faculty/history', label: 'History', icon: History },
  { path: '/faculty/support', label: 'Support', icon: LifeBuoy },
  { path: '/faculty/profile', label: 'Profile', icon: User },
]

export default function FacultyLayout() {
  const { profile, signOut, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAllAsRead } = useNotifications()

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {demoMode && <DemoModeBanner />}

      {/* Top header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/faculty/profile')}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
            <span className="text-white font-display font-bold text-sm">{profile?.full_name?.[0] || 'F'}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{profile?.full_name}</p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{profile?.department || 'Faculty'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Notification bell */}
          <button
            onClick={() => setShowNotifications(s => !s)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'var(--border-glass)' }}
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#4A6CF7' }}>
                {unreadCount}
              </span>
            )}
          </button>

          <button onClick={signOut} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: 'var(--border-glass)' }}>
            <LogOut className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </header>

      {/* Notification panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 z-40 w-80 glass-card animate-slide-up shadow-2xl" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div>
              <p className="font-display font-semibold text-sm">Notifications</p>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[9px] text-brand-400 font-bold uppercase tracking-wider hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-[10px] font-bold uppercase tracking-wider opacity-50 hover:opacity-100"
            >
              Close
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-8 text-center opacity-40">
              <Bell className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">No notifications</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={cls('p-4 border-b flex gap-3 hover:bg-white/[0.02] transition-colors', n.is_read ? 'opacity-50' : '')} style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className={cls('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', 
                  n.type === 'success' ? 'bg-green-400' : 
                  n.type === 'warning' ? 'bg-yellow-400' : 
                  n.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight">{n.title}</p>
                  <p className="text-xs mt-1 leading-normal" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                  <p className="text-[9px] mt-1.5 opacity-40 uppercase tracking-tighter">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 px-2 pb-safe" style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border-glass)', opacity: 0.97 }}>
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map(item => {
            const active = isActive(item)
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={cls('nav-item flex-1', active ? 'active' : '')}>
                <div className={cls('w-8 h-8 rounded-xl flex items-center justify-center transition-all', active ? 'scale-110 shadow-lg' : '')} style={active ? { background: 'var(--brand)', color: 'white' } : { color: 'var(--text-secondary)' }}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={cls('text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors', active ? 'text-brand-500' : '')} style={{ color: active ? 'var(--brand)' : 'var(--text-secondary)' }}>{item.label}</span>
              </button>
            )
          })}
        </div>
        {/* Safe area spacer */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* Tap to close overlay */}
      {showNotifications && <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />}
    </div>
  )
}
