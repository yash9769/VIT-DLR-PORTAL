import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, FileText, Settings, ChevronLeft, ChevronRight, LogOut, Bell, Shield, Menu, Users, BookOpen, Building } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cls } from '../../utils/helpers'
import { DemoModeBanner } from '../../components/ui'

const NAV_GROUPS = [
  { label: 'Overview', items: [{ path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }] },
  { label: 'Academic', items: [{ path: '/admin/timetable', label: 'Timetable', icon: Calendar }, { path: '/admin/records', label: 'Lecture Records', icon: FileText }] },
  { label: 'Management', items: [{ path: '/admin/faculty', label: 'Faculty', icon: Users }, { path: '/admin/subjects', label: 'Subjects', icon: BookOpen }, { path: '/admin/rooms', label: 'Rooms', icon: Building }] },
  { label: 'Reports', items: [{ path: '/admin/reports', label: 'Reports', icon: Settings }] },
]

export default function AdminLayout() {
  const { profile, signOut, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)

  const SidebarContent = ({ mobile = false }) => (
    <aside className={cls('flex flex-col h-full transition-all duration-300', mobile ? 'w-64' : collapsed ? 'w-16' : 'w-60')}
      style={{ background: 'rgba(13,17,23,0.98)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      <div className={cls('flex items-center gap-3 p-4 border-b', collapsed && !mobile ? 'justify-center' : '')} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
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
            {(!collapsed || mobile) && <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1" style={{ color: 'rgba(139,148,158,0.5)' }}>{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false) }}
                  className={cls('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-medium', isActive(item) ? 'text-white' : '')}
                  style={isActive(item) ? { background: 'rgba(74,108,247,0.25)', border: '1px solid rgba(74,108,247,0.3)', color: 'white' } : { color: 'rgba(139,148,158,0.9)' }}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {(!collapsed || mobile) && item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
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
        <header className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Menu className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h1 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                {NAV_GROUPS.flatMap(g => g.items).find(i => isActive(i))?.label || 'Admin'}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Vidyalankar Institute of Technology</p>
            </div>
          </div>
          <button className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{ background: '#4A6CF7', fontSize: '10px' }}>2</span>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  )
}
