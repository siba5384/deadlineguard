import { useState } from 'react'
import { ShieldAlert, X, CalendarCheck, CheckCircle2 } from 'lucide-react'
import { useTasks, useUpdateTask } from '../../hooks/useTasks'

export default function BurnoutShieldModal({ onClose }: { onClose: () => void }) {
  const { data: tasks } = useTasks()
  const updateTask = useUpdateTask()
  const [loading, setLoading] = useState(false)

  const criticalTasks = tasks?.filter(t => t.riskTier === 'CRITICAL' && t.status !== 'COMPLETED') || []

  const handleReschedule = async () => {
    setLoading(true)
    for (const t of criticalTasks) {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      await updateTask.mutateAsync({ id: t.id, data: { deadline: nextWeek.toISOString().slice(0, 16) } })
    }
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500">
            <ShieldAlert size={24} className="animate-pulse" />
            <h2 className="text-lg font-bold">Burnout Shield Activated</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-text-secondary mb-6 text-sm leading-relaxed">
            Gemini has detected that you have <strong className="text-text-primary">{criticalTasks.length} critical tasks</strong> piling up.
            Your total task load exceeds healthy biological limits. Let's renegotiate your workload before burnout hits.
          </p>

          <div className="space-y-3">
            <button 
              onClick={handleReschedule}
              disabled={loading}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-bg-hover transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <CalendarCheck size={20} />
              </div>
              <div>
                <div className="font-semibold text-text-primary text-sm">Reschedule to Next Week</div>
                <div className="text-xs text-text-muted">Push all critical deadlines back by 7 days automatically.</div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                alert("Gemini is drafting an extension email... (To implement: Open Draft Modal)");
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-bg-hover transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="font-semibold text-text-primary text-sm">Draft Extension Email</div>
                <div className="text-xs text-text-muted">Have Gemini write a polite email asking your manager for an extension.</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
