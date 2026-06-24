import { formatDistanceToNow, isPast } from 'date-fns'
import { Clock, CheckCircle2, Circle, FileText, Code, Mail, BookOpen, Presentation, ChevronRight } from 'lucide-react'
import type { Task } from '../../types'
import RiskBadge from './RiskBadge'
import RiskScoreBar from './RiskScoreBar'
import { useRiskColor } from '../../hooks/useRiskColor'
import { useAppStore } from '../../store/appStore'

const typeIcon: Record<string, React.ReactNode> = {
  GENERAL: <Circle size={14} />,
  EMAIL: <Mail size={14} />,
  DOCUMENT: <FileText size={14} />,
  CODING: <Code size={14} />,
  STUDY: <BookOpen size={14} />,
  PRESENTATION: <Presentation size={14} />,
}

interface Props {
  task: Task
  completed?: boolean
}

export default function TaskCard({ task, completed = false }: Props) {
  const { glow } = useRiskColor(task.riskTier)
  const setActiveTask = useAppStore(s => s.setActiveTask)

  const doneCount = task.subtasks.filter(s => s.completed).length
  const total     = task.subtasks.length
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const overdue   = isPast(new Date(task.deadline)) && task.status !== 'COMPLETED'
  const timeLeft  = formatDistanceToNow(new Date(task.deadline), { addSuffix: true })

  return (
    <div
      className="glass-card p-5 cursor-pointer animate-slide-in-up"
      style={{
        borderColor: !completed && task.riskTier === 'CRITICAL' ? 'rgba(239,68,68,0.4)' : undefined,
        boxShadow:   !completed && task.riskTier === 'CRITICAL' ? `0 0 20px ${glow}` : undefined,
      }}
      onClick={() => setActiveTask(task.id)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-text-muted">{typeIcon[task.taskType] ?? typeIcon.GENERAL}</span>
          <h3 className={`font-semibold text-sm leading-snug truncate ${completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {task.title}
          </h3>
        </div>

        {/* Badge: checkmark for completed, risk badge for active */}
        {completed ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 shrink-0"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <CheckCircle2 size={12} />
            Done
          </span>
        ) : (
          <RiskBadge tier={task.riskTier} />
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Risk score bar — hidden for completed */}
      {!completed && (
        <div className="mb-3">
          <RiskScoreBar score={task.riskScore} tier={task.riskTier} />
        </div>
      )}

      {/* Subtask progress */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} /> {doneCount}/{total} subtasks
            </span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill"
                 style={{ width: `${pct}%`, background: completed ? '#34d399' : '#7c3aed' }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className={`flex items-center gap-1 text-xs ${overdue && !completed ? 'text-red-400' : 'text-text-muted'}`}>
          <Clock size={12} />
          {completed ? 'Completed ' : overdue ? 'Overdue — ' : ''}{timeLeft}
        </span>
        <button className="flex items-center gap-1 text-xs text-accent-light hover:text-accent transition-colors">
          Details <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
