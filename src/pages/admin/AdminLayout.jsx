import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, FileText, Settings, ChevronLeft, ChevronRight, LogOut, Bell, Shield, Menu, Users, LifeBuoy, GraduationCap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cls } from '../../utils/helpers'
import { DemoModeBanner, ThemeToggle } from '../../components/ui'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

const NAV_GROUPS = [
  { label: 'Overview', items: [{ path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }] },
  { label: 'Academic', items: [{ path: '/admin/timetable', label: 'Timetable', icon: Calendar }, { path: '/admin/records', label: 'Lecture Records', icon: FileText }] },
  { label: 'Management', items: [{ path: '/admin/faculty', label: 'Faculty', icon: Users }, { path: '/admin/students', label: 'Students', icon: GraduationCap }] },
  { label: 'Reports', items: [{ path: '/admin/reports', label: 'Reports', icon: Settings }] },
  { label: 'Support', items: [{ path: '/admin/issues', label: 'Support Center', icon: LifeBuoy }] },
  { label: 'Account', items: [{ path: '/admin/profile', label: 'My Profile', icon: Users }] },
]

export default function AdminLayout() {
  const { profile, signOut, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAllAsRead } = useNotifications()

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)

  const SidebarContent = ({ mobile = false }) => (
    <aside className={cls('flex flex-col h-full transition-all duration-300', mobile ? 'w-64' : collapsed ? 'w-16' : 'w-60')}
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-glass)' }}>
      <div className={cls('flex items-center gap-3 p-4 border-b', collapsed && !mobile ? 'justify-center' : '')} style={{ borderColor: 'var(--border-glass)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
          <Shield className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>VIT DLR</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Admin Portal</p>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(c => !c)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-2 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false) }}
                  className={cls('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-semibold', isActive(item) ? 'text-white' : '')}
                  style={isActive(item) ? { background: 'var(--brand)', boxShadow: '0 4px 12px var(--brand-glow)', color: 'white' } : { color: 'var(--text-secondary)' }}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {(!collapsed || mobile) && item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'var(--border-glass)' }}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#4A6CF7,#3355e8)' }}>
              {profile?.full_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{profile?.full_name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{profile?.role}</p>
            </div>
            <button onClick={signOut} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={signOut} className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{ color: 'var(--text-secondary)' }}>
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="hidden lg:flex h-full flex-shrink-0"><SidebarContent /></div>
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"><SidebarContent mobile /></div>
        </>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {demoMode && <DemoModeBanner />}
        <header className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ background: 'var(--bg-secondary)', opacity: 0.8, backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-glass)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--border-glass)' }}>
              <Menu className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h1 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                {NAV_GROUPS.flatMap(g => g.items).find(i => isActive(i))?.label || 'Admin'}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Vidyalankar Institute of Technology</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="!w-9 !h-9" />
            
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" 
              style={{ background: 'var(--border-glass)' }}
            >
              <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{ background: '#4A6CF7', fontSize: '10px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Notification panel */}
        {showNotifications && (
          <div className="fixed top-16 right-6 z-50 w-80 glass-card animate-slide-up shadow-2xl" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
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

        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
          {/* Overlay to close notifications when clicking outside */}
          {showNotifications && <div className="absolute inset-0 z-40" onClick={() => setShowNotifications(false)} />}
        </main>
      </div>
    </div>
  )
}
