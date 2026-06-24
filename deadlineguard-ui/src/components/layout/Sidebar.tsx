import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Lightbulb, LogOut, Brain, Network } from 'lucide-react'
import { logout } from '../../hooks/useAuth'

const nav = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/checkin',  icon: MessageSquare,   label: 'Check-In' },
  { to: '/insights', icon: Lightbulb,       label: 'Insights' },
  { to: '/focus',    icon: Brain,           label: 'Deep Focus' },
  { to: '/graph',    icon: Network,         label: 'Graph View' },
]

interface Props {
  avatarUrl?: string
  githubLogin?: string
}

import { useState } from 'react'
import UserProfileModal from './UserProfileModal'
import GuardianPet from '../pet/GuardianPet'

export default function Sidebar({ avatarUrl, githubLogin }: Props) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-bg-surface h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
             style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
          🛡️
        </div>
        <div>
          <div className="text-sm font-bold text-text-primary">DeadlineGuard</div>
          <div className="text-xs text-text-muted">AI Productivity</div>
        </div>
      </div>

      <GuardianPet />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {/* User info */}
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors text-left"
          title="Edit Profile"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={githubLogin}
              className="w-8 h-8 rounded-full border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                 style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              {githubLogin?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-text-primary truncate">
              {githubLogin ?? 'Your Profile'}
            </div>
            <div className="text-xs text-text-muted">Settings</div>
          </div>
        </button>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={logout}
          className="nav-item w-full text-text-secondary hover:text-red-400 mt-1"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {isProfileOpen && <UserProfileModal onClose={() => setIsProfileOpen(false)} />}
    </aside>
  )
}
