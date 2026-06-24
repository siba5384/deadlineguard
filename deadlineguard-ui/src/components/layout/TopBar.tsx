import { Bell, Zap, Moon, Sun } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useMutation } from '@tanstack/react-query'
import { triggerRiskEngine } from '../../api/client'
import { useQueryClient } from '@tanstack/react-query'

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const nudges = useAppStore(s => s.nudgeQueue)
  const { theme, toggleTheme } = useAppStore()
  const qc = useQueryClient()

  const trigger = useMutation({
    mutationFn: triggerRiskEngine,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['nudges'] })
    },
  })

  const activeCount = nudges.filter(n => !n.dismissed).length

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-border">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Demo: trigger risk engine */}
        <button
          onClick={() => trigger.mutate()}
          disabled={trigger.isPending}
          className="btn-secondary flex items-center gap-2 text-xs"
          title="Re-run risk engine (demo)"
        >
          <Zap size={14} className={trigger.isPending ? 'animate-pulse text-yellow-400' : ''} />
          {trigger.isPending ? 'Calculating...' : 'Run Risk Engine'}
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn-ghost p-2 text-text-secondary hover:text-text-primary"
          title="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Nudge bell */}
        <button className="relative btn-ghost p-2">
          <Bell size={18} />
          {activeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-red-500 text-white animate-pulse">
              {activeCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
