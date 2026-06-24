import { Github, Shield, Zap, CheckCircle2, Clock } from 'lucide-react'
import { useState } from 'react'
import { loginWithPassword, registerUser } from '../api/client'
import axios from 'axios'

const features = [
  { icon: Zap,           text: 'AI-powered risk scoring for every task' },
  { icon: CheckCircle2,  text: 'Auto-decompose tasks into timed subtasks' },
  { icon: Clock,         text: 'Smart nudges before deadlines are missed' },
]

export default function LoginPage({ error }: { error?: boolean }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsLoading(true)
    
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setFormError('Passwords do not match. Please try again.')
          setIsLoading(false)
          return
        }
        await registerUser({ email, password })
      }
      
      const params = new URLSearchParams()
      params.append('email', email)
      params.append('password', password)
      
      await loginWithPassword(params)
      // Redirect to home which will re-fetch auth status
      window.location.href = '/'
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(124,58,237,0.15) 0%, var(--color-bg-base) 60%)' }}>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
               style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                        boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">DeadlineGuard</h1>
          <p className="text-sm text-text-secondary mt-1">Never miss a deadline again</p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-text-secondary">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(124,58,237,0.15)' }}>
                <Icon size={14} className="text-violet-400" />
              </div>
              {text}
            </div>
          ))}
        </div>

        {/* Login card */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-1">
            {isSignUp ? 'Create an account' : 'Sign in to continue'}
          </h2>
          <p className="text-xs text-text-secondary mb-5">
            Your tasks and progress are saved to your account.
          </p>

          {(error || formError) && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-sm text-red-400"
                 style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {formError || 'Login failed — please try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-6 space-y-3">
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-violet-500 transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-violet-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {isSignUp && (
              <div>
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-violet-500 transition-colors"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 flex justify-center"
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-center text-text-secondary mb-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setFormError(''); }} 
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-text-muted">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <button
            id="github-login-btn"
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/github'}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 mb-3"
            style={{ background: '#24292e', color: '#fff', border: '1px solid #444' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2f363d')}
            onMouseLeave={e => (e.currentTarget.style.background = '#24292e')}
          >
            <Github size={18} />
            Continue with GitHub
          </button>

          <button
            id="google-login-btn"
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200"
            style={{ background: '#fff', color: '#444', border: '1px solid #ddd' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            {/* Simple Google SVG Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            id="demo-login-btn"
            type="button"
            onClick={async () => {
              try {
                await axios.post('http://localhost:8080/api/auth/demo', {}, { withCredentials: true })
                window.location.href = '/'
              } catch (e) {
                alert('Demo login failed. Make sure backend is running.')
              }
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 mb-3"
            style={{ background: '#f8f9fa', color: '#333', border: '1px solid #ddd' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f8f9fa')}
          >
            👤 Continue as Demo User
          </button>

          <p className="text-xs text-text-muted mt-4 text-center">
            By signing in you agree to the{' '}
            <span className="text-violet-400">Terms of Service</span>.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 mt-6 text-xs text-text-muted">
          <Shield size={12} />
          <span>Your data stays safe in PostgreSQL</span>
        </div>
      </div>
    </div>
  )
}
