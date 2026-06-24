import { useState, useEffect, useRef } from 'react'
import { Search, Plus, ShieldAlert, Brain, Clock, Network } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../../store/appStore'
import { useNavigate } from 'react-router-dom'
import type { Task } from '../../types'

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()
  const { openCreateModal, setActiveTask, userId } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Fetch tasks from query cache
  const tasks = qc.getQueryData<Task[]>(['tasks-all', userId || 1]) || []

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5)

  const actions = [
    { name: 'Create new task', icon: Plus, action: () => openCreateModal() },
    { name: 'View Obsidian Knowledge Graph', icon: Network, action: () => navigate('/graph') },
    { name: 'Go to Insights & Forensics', icon: Brain, action: () => navigate('/insights') },
    { name: 'Start Deep Focus Session', icon: Clock, action: () => navigate('/focus') },
    { name: 'Trigger Burnout Shield', icon: ShieldAlert, action: () => { navigate('/'); setTimeout(() => alert('Click the Burnout Shield button on the dashboard!'), 100); } },
  ].filter(a => a.name.toLowerCase().includes(query.toLowerCase()))

  const handleAction = (cb: () => void) => {
    cb()
    setIsOpen(false)
  }

  const handleTask = (id: number) => {
    navigate('/')
    setTimeout(() => setActiveTask(id), 50)
    setIsOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4 animate-in fade-in" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-2xl bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search size={20} className="text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg text-text-primary placeholder:text-text-muted"
            placeholder="Search tasks or type a command..."
          />
          <div className="text-[10px] font-bold text-text-muted bg-bg-surface px-2 py-1 rounded border border-border uppercase tracking-widest">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {actions.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</div>
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleAction(action.action)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text-secondary hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left group"
                >
                  <action.icon size={16} className="text-text-muted group-hover:text-emerald-400" />
                  {action.name}
                </button>
              ))}
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Tasks</div>
              {filteredTasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTask(t.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-left"
                >
                  <span className="truncate pr-4">{t.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-bg-surface shrink-0 ${t.riskTier === 'CRITICAL' ? 'text-red-400 border-red-500/30 bg-red-500/10' : ''}`}>
                    {t.riskTier}
                  </span>
                </button>
              ))}
            </div>
          )}

          {actions.length === 0 && filteredTasks.length === 0 && (
            <div className="p-8 text-center text-text-muted text-sm flex flex-col items-center gap-2">
              <Search size={24} className="opacity-20" />
              No results found for "{query}".
            </div>
          )}
        </div>
        
        <div className="bg-bg-surface border-t border-border p-2 px-4 flex justify-between items-center text-[10px] text-text-muted uppercase font-bold tracking-wider">
           <span>Use ↑↓ to navigate</span>
           <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  )
}
