import { Plus, RefreshCw, Mic, Loader2, ShieldAlert, Kanban, List as ListIcon } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllTasks, triggerRiskEngine, processCheckIn } from '../api/client'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useNudges } from '../hooks/useNudges'
import { useAppStore } from '../store/appStore'
import TopBar from '../components/layout/TopBar'
import TaskList from '../components/dashboard/TaskList'
import TaskCard from '../components/dashboard/TaskCard'
import TaskDetailPanel from '../components/task/TaskDetailPanel'
import TaskCreateModal from '../components/task/TaskCreateModal'
import TaskEditModal from '../components/task/TaskEditModal'
import NudgeToast from '../components/nudge/NudgeToast'
import BurnoutShieldModal from '../components/dashboard/BurnoutShieldModal'
import type { Task } from '../types'

export default function Dashboard() {
  const qc = useQueryClient()
  const { activeTaskId, isCreateModalOpen, openCreateModal, editingTask, userId } = useAppStore()
  const [showBurnoutShield, setShowBurnoutShield] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')

  const { data: allTasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ['tasks-all', userId],
    queryFn: () => fetchAllTasks(userId),
    refetchInterval: 60_000,
  })
  useNudges()

  const processVoiceCheckIn = useMutation({
    mutationFn: (transcript: string) => processCheckIn({ userId, type: 'MIDDAY', transcript }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
      alert('Task successfully created via Voice Quick Add!')
    },
    onError: () => alert('Failed to create task via voice. Please try again.')
  })

  const { listening, isSupported, startListening, stopListening } = useVoiceInput((transcript) => {
    if (transcript.trim()) {
      processVoiceCheckIn.mutate(transcript)
    }
  })

  const activeTasks    = allTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'MISSED')
  const completedTasks = allTasks.filter(t => t.status === 'COMPLETED' || t.status === 'MISSED')
  const activeTask     = allTasks.find(t => t.id === activeTaskId)

  const handleTriggerEngine = async () => {
    await triggerRiskEngine()
    refetch()
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Dashboard"
        subtitle={`${activeTasks.length} active · ${completedTasks.length} completed`}
      />

      <div className="flex-1 p-8">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            {viewMode === 'list' ? 'Active Tasks' : 'Board View'}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-bg-card border border-border rounded-lg p-0.5 mr-2">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-bg-hover text-text-primary' : 'text-text-muted hover:text-text-primary'}`} title="List View"><ListIcon size={14} /></button>
              <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'board' ? 'bg-bg-hover text-text-primary' : 'text-text-muted hover:text-text-primary'}`} title="Board View"><Kanban size={14} /></button>
            </div>
            <button
              onClick={() => setShowBurnoutShield(true)}
              title="Activate Burnout Shield"
              className="btn-secondary flex items-center gap-2 text-xs text-red-400 border-red-500/30 hover:border-red-500"
            >
              <ShieldAlert size={13} />
              Burnout Shield
            </button>
            <button
              onClick={handleTriggerEngine}
              title="Recalculate risk scores now"
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              <RefreshCw size={13} />
              Run Risk Engine
            </button>
            {isSupported && (
              <button
                onClick={listening ? stopListening : startListening}
                className={`btn-secondary flex items-center gap-2 text-xs ${listening ? 'border-red-500 text-red-400' : ''}`}
                title="Quick Add via Voice"
              >
                {processVoiceCheckIn.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Mic size={13} className={listening ? 'animate-pulse' : ''} />
                )}
                {listening ? 'Listening...' : processVoiceCheckIn.isPending ? 'Processing...' : 'Voice Quick Add'}
              </button>
            )}
            <button onClick={openCreateModal} id="create-task-btn" className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Active tasks */}
            <TaskList tasks={activeTasks} loading={isLoading} />

            {/* ── Completed Section ─────────────────────────────── */}
            {completedTasks.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(48,54,61,0.8), transparent)' }} />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-text-muted"
                       style={{ background: 'rgba(22,27,34,0.8)', border: '1px solid rgba(48,54,61,0.6)' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 opacity-70" />
                    {completedTasks.length} Completed
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(48,54,61,0.8), transparent)' }} />
                </div>
                <TaskList tasks={completedTasks} completed />
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-3 gap-6 items-start mt-6 animate-in fade-in">
            <BoardColumn title="On Track" tasks={activeTasks.filter(t => t.riskTier === 'LOW' || t.riskTier === 'MEDIUM')} border="border-border" />
            <BoardColumn title="At Risk" tasks={activeTasks.filter(t => t.riskTier === 'HIGH' || t.riskTier === 'CRITICAL')} border="border-red-500/30" />
            <BoardColumn title="Completed" tasks={completedTasks} border="border-emerald-500/30" completed />
          </div>
        )}
      </div>

      {/* Overlays */}
      {activeTask && <TaskDetailPanel task={activeTask} />}
      {isCreateModalOpen && <TaskCreateModal />}
      {editingTask && <TaskEditModal />}
      {showBurnoutShield && <BurnoutShieldModal onClose={() => setShowBurnoutShield(false)} />}
      <NudgeToast />
    </div>
  )
}

function BoardColumn({ title, tasks, border, completed = false }: any) {
  return (
    <div className={`bg-bg-surface border ${border} rounded-xl p-4 flex flex-col gap-3 min-h-[400px]`}>
      <h3 className="font-bold text-sm text-text-primary mb-3 flex justify-between items-center">
        {title} <span className="bg-bg-card border border-border px-2 py-0.5 rounded-full text-xs text-text-muted">{tasks.length}</span>
      </h3>
      <div className="flex flex-col gap-3">
        {tasks.map((t: any) => <TaskCard key={t.id} task={t} completed={completed} />)}
      </div>
    </div>
  )
}
