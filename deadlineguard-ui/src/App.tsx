import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStatus } from './hooks/useAuth'
import { useAppStore } from './store/appStore'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import Insights from './pages/Insights'
import LoginPage from './pages/LoginPage'
import FocusSession from './pages/FocusSession'
import GraphView from './pages/GraphView'
import GeminiChatWidget from './components/chat/GeminiChatWidget'
import BrainDumpWidget from './components/dashboard/BrainDumpWidget'
import CommandPalette from './components/layout/CommandPalette'

/** Shows a full-screen spinner while we check auth status */
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse"
             style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>🛡️</div>
        <p className="text-text-secondary text-sm">Checking authentication…</p>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const { data: auth, isLoading } = useAuthStatus()

  useEffect(() => {
    if (auth?.loggedIn && auth.userId) {
      useAppStore.setState({ userId: auth.userId })
    }
  }, [auth])

  useEffect(() => {
    const theme = useAppStore.getState().theme
    if (theme === 'dark') document.documentElement.classList.add('dark')
  }, [])

  // Show spinner on first load
  if (isLoading) return <AuthLoading />

  // Not authenticated → show login page (or the error variant)
  if (!auth?.loggedIn) {
    const isLoginPage = location.pathname === '/login'
    const hasError    = new URLSearchParams(location.search).get('error') === 'true'
    return <LoginPage error={isLoginPage && hasError} />
  }

  // Authenticated → show full app
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar avatarUrl={auth.avatarUrl} githubLogin={auth.githubLogin} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/checkin"  element={<CheckIn />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/focus"    element={<FocusSession />} />
          <Route path="/graph"    element={<GraphView />} />
          {/* /login is only shown when logged out; redirect to home when logged in */}
          <Route path="/login"    element={<Navigate to="/" replace />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <GeminiChatWidget />
      <BrainDumpWidget />
      <CommandPalette />
    </div>
  )
}
