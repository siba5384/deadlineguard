import type { Task, RiskTier } from '../../types'
import TaskCard from './TaskCard'

const tiers: RiskTier[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

interface Props {
  tasks: Task[]
  loading?: boolean
  completed?: boolean   // true → renders the greyed-out completed section
}

export default function TaskList({ tasks, loading, completed = false }: Props) {
  const stats = {
    CRITICAL: tasks.filter(t => t.riskTier === 'CRITICAL').length,
    HIGH:     tasks.filter(t => t.riskTier === 'HIGH').length,
    MEDIUM:   tasks.filter(t => t.riskTier === 'MEDIUM').length,
    LOW:      tasks.filter(t => t.riskTier === 'LOW').length,
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0 && !completed) {
    return (
      <div className="text-center py-20 text-text-secondary">
        <div className="text-4xl mb-4">🎉</div>
        <p className="font-medium text-text-primary">All clear!</p>
        <p className="text-sm mt-1">No active tasks. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Risk tier summary pills — only for active tasks */}
      {!completed && (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {tiers.map(tier =>
            stats[tier] > 0 ? (
              <div key={tier} className={`badge-${tier.toLowerCase()} flex items-center gap-1.5`}>
                <span className="font-bold">{stats[tier]}</span>
                <span>{tier.charAt(0) + tier.slice(1).toLowerCase()}</span>
              </div>
            ) : null
          )}
          <span className="text-text-muted text-sm ml-auto">{tasks.length} tasks</span>
        </div>
      )}

      {/* Card grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
        style={completed ? { opacity: 0.55, filter: 'grayscale(40%)' } : undefined}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} completed={completed} />
        ))}
      </div>
    </div>
  )
}
