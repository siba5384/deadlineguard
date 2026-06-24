import { X } from 'lucide-react'
import { useDismissNudge } from '../../hooks/useNudges'
import { useAppStore } from '../../store/appStore'

export default function NudgeToast() {
  const nudges = useAppStore(s => s.nudgeQueue)
  const dismiss = useDismissNudge()

  const top = nudges[0]
  if (!top) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 animate-slide-in-up">
      <div className="glass-card p-4 border-l-4"
           style={{ borderLeftColor: '#ef4444', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-red-400 mb-1">DeadlineGuard Alert</div>
            <p className="text-sm text-text-primary leading-relaxed">{top.message}</p>
            {nudges.length > 1 && (
              <p className="text-xs text-text-muted mt-1">+{nudges.length - 1} more nudges</p>
            )}
          </div>
          <button onClick={() => dismiss.mutate(top.id)} className="btn-ghost p-1 shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => dismiss.mutate(top.id)}
            className="btn-secondary text-xs flex-1">Dismiss</button>
          <button 
            onClick={() => {
              if (top.taskId) {
                useAppStore.getState().setActiveTask(top.taskId)
              }
              dismiss.mutate(top.id)
            }}
            className="btn-primary text-xs flex-1">Start Now</button>
        </div>
      </div>
    </div>
  )
}
