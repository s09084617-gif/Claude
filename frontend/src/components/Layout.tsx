import React from 'react'
import { NavLink } from 'react-router-dom'
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
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
  { label: 'Assessment', path: '/assessment', icon: <ClipboardList size={18} /> },
  { label: 'Workouts', path: '/workouts', icon: <Dumbbell size={18} /> },
  { label: 'Episodes', path: '/episodes', icon: <Play size={18} /> },
  { label: 'Nutrition', path: '/nutrition', icon: <Utensils size={18} /> },
  { label: 'Progress', path: '/progress', icon: <TrendingUp size={18} /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart2 size={18} /> },
  { label: 'Profile', path: '/profile', icon: <UserCircle size={18} /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
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
        <div className="px-3 py-4 border-t border-gray-700">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
