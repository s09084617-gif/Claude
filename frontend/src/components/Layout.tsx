import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  Play,
  Utensils,
  TrendingUp,
  BarChart2,
  LogOut,
  Zap,
  UserCircle,
  Menu,
  X,
  QrCode,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard',  path: '/',          icon: <LayoutDashboard size={18} /> },
  { label: 'Assessment', path: '/assessment', icon: <ClipboardList size={18} /> },
  { label: 'Workouts',   path: '/workouts',   icon: <Dumbbell size={18} /> },
  { label: 'Episodes',   path: '/episodes',   icon: <Play size={18} /> },
  { label: 'Nutrition',  path: '/nutrition',  icon: <Utensils size={18} /> },
  { label: 'Progress',   path: '/progress',   icon: <TrendingUp size={18} /> },
  { label: 'Analytics',  path: '/analytics',  icon: <BarChart2 size={18} /> },
  { label: 'QR Code',    path: '/qr',         icon: <QrCode size={18} /> },
  { label: 'Profile',    path: '/profile',    icon: <UserCircle size={18} /> },
]

function SidebarContent({ onNavClick, user, logout }: {
  onNavClick: () => void
  user: { username?: string; email?: string } | null
  logout: () => void
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700 shrink-0">
        <Zap size={24} className="text-brand-500" />
        <span className="text-white text-xl font-bold tracking-tight">iBlitz</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-4 border-t border-gray-700 shrink-0">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
          <p className="text-sm text-white font-medium truncate">{user?.username}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close mobile sidebar whenever route changes
  React.useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop sidebar (always visible ≥ lg) ─────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-gray-900 flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent onNavClick={() => {}} user={user} logout={logout} />
      </aside>

      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile sidebar (slides in) ─────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <SidebarContent onNavClick={() => setOpen(false)} user={user} logout={logout} />
      </aside>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-1.5">
            <Zap size={18} className="text-brand-600" />
            <span className="text-base font-bold text-gray-900 tracking-tight">iBlitz</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
