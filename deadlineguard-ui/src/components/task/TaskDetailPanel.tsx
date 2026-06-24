import { X, CheckCircle2, Circle, Clock, FileText, Loader2, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import type { Task } from '../../types'
import { useAppStore } from '../../store/appStore'
import { useCompleteSubtask } from '../../hooks/useTasks'
import { generateDraft, updateTask, syncToCalendar, deleteTask } from '../../api/client'
import { useQueryClient } from '@tanstack/react-query'
import RiskBadge from '../dashboard/RiskBadge'
import RiskScoreBar from '../dashboard/RiskScoreBar'
import DraftModal from '../draft/DraftModal'
import HypeModal from '../dashboard/HypeModal'
import BlockEditor from './BlockEditor'
import { api } from '../../api/client'

export default function TaskDetailPanel({ task }: { task: Task }) {
  const setActiveTask = useAppStore(s => s.setActiveTask)
  const openEditModal = useAppStore(s => s.openEditModal)
  const completeSubtask = useCompleteSubtask()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<{ content: string; title: string } | null>(null)
  
  const [showHype, setShowHype] = useState(false)
  const [microSteps, setMicroSteps] = useState<string[]>([])
  const [microLoading, setMicroLoading] = useState(false)
  const [timeTravel, setTimeTravel] = useState('')
  const [timeTravelLoading, setTimeTravelLoading] = useState(false)

  const isCompleted = task.status === 'COMPLETED'

  const toggleComplete = useMutation({
    mutationFn: () => updateTask(task.id, { status: isCompleted ? 'PENDING' : 'COMPLETED' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
      if (!isCompleted && task.riskTier === 'CRITICAL') {
        setShowHype(true)
      } else {
        setActiveTask(null)
      }
    },
  })

  const draftMutation = useMutation({
    mutationFn: () => generateDraft(task.id),
    onSuccess: (data) => setDraft({ content: data.draft, title: data.taskTitle }),
  })

  const handleUpdateNotes = (html: string) => {
    clearTimeout((window as any).notesTimeout)
    ;(window as any).notesTimeout = setTimeout(() => {
      updateTask(task.id, { description: html }).then(() => {
        qc.invalidateQueries({ queryKey: ['tasks-all'] })
      })
    }, 1000)
  }

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
      setActiveTask(null)
    },
  })

  const syncMutation = useMutation({
    mutationFn: () => syncToCalendar(task.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
      alert('Successfully synced to Google Calendar!')
    },
    onError: (err: any) => {
      if (err.response?.status === 403 || err.response?.status === 401) {
         alert('Please log in with Google to sync to Calendar (ensure you approved Calendar permissions).')
      } else {
         alert('Failed to sync. Please try again.')
      }
    }
  })

  const isDraftable = ['EMAIL', 'DOCUMENT'].includes(task.taskType)
  const completedCount = task.subtasks.filter(s => s.completed).length

  const handleMicroSteps = async () => {
    setMicroLoading(true)
    try {
      const res = await api.post('/ai/chat', { message: `Break down the task "${task.title}" into 3 ridiculously simple, 1-minute physical micro-steps to overcome executive dysfunction. Format as a bulleted list without any intro text.` })
      setMicroSteps(res.data.reply.split('\n').filter((s: string) => s.trim().length > 0))
    } catch {
      setMicroSteps(["1. Open a new window.", "2. Look at the task.", "3. Write one word."])
    }
    setMicroLoading(false)
  }

  const handleTimeTravel = async () => {
    setTimeTravelLoading(true)
    try {
      const res = await api.post('/ai/chat', { message: `Simulate the brutally honest future consequence of delaying the task "${task.title}" which is due ${task.deadline}. Calculate the stress and overlap. Keep it to 2 sentences.` })
      setTimeTravel(res.data.reply)
    } catch {
      setTimeTravel("If you delay this, it will overlap with everything else and cause massive stress!")
    }
    setTimeTravelLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setActiveTask(null)} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-bg-surface border-l border-border flex flex-col animate-slide-in-r overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2">
              <RiskBadge tier={task.riskTier} />
              <span className="text-xs text-text-muted">{task.taskType}</span>
            </div>
            <h2 className="font-bold text-text-primary leading-snug">{task.title}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => { setActiveTask(null); openEditModal(task); }} className="btn-ghost p-1.5 text-text-secondary hover:text-text-primary" title="Edit Task">
              <FileText size={16} />
            </button>
            <button onClick={() => { if(confirm('Are you sure you want to delete this task?')) deleteMutation.mutate() }} className="btn-ghost p-1.5 text-text-secondary hover:text-red-400" title="Delete Task">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-5">
          {/* Risk score */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Risk Analysis</h3>
            <RiskScoreBar score={task.riskScore} tier={task.riskTier} />
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-text-secondary">
              <div>⏰ Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</div>
              <div>⚡ {task.estimatedEffortMinutes} min estimated</div>
              <div>📊 Importance {task.importance}/5</div>
              <div>✅ {completedCount}/{task.subtasks.length} subtasks done</div>
            </div>
          </div>

          {/* Notes (Notion-style Editor) */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={14} /> Workspace Notes
            </h3>
            <BlockEditor 
              initialContent={task.description || ''} 
              onChange={handleUpdateNotes} 
            />
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                AI-Generated Subtasks
              </h3>
              <div className="space-y-2">
                {task.subtasks.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => completeSubtask.mutate({ id: sub.id, complete: !sub.completed })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      sub.completed
                        ? 'opacity-50 bg-bg-card'
                        : 'bg-bg-card hover:bg-bg-hover'
                    }`}
                  >
                    {sub.completed
                      ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      : <Circle size={16} className="text-text-muted shrink-0" />
                    }
                    <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {sub.title}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={11} />{sub.estimatedMinutes}m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto-draft button */}
          {isDraftable && (
            <button
              onClick={() => draftMutation.mutate()}
              disabled={draftMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {draftMutation.isPending
                ? <><Loader2 size={14} className="animate-spin" /> Generating draft...</>
                : <><FileText size={14} /> Generate AI Draft</>}
            </button>
          )}

          {/* Micro-steps Button */}
          {!isCompleted && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <button onClick={handleMicroSteps} disabled={microLoading} className="w-full flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-emerald-500 transition-colors mb-2 font-medium">
                {microLoading ? <Loader2 size={14} className="animate-spin" /> : "😭 This is too hard"}
              </button>
              {microSteps.length > 0 && (
                <ul className="text-sm text-text-secondary mt-3 space-y-2 border-t border-border pt-3">
                  {microSteps.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">•</span> {s}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Time-Travel Button */}
          {!isCompleted && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <button onClick={handleTimeTravel} disabled={timeTravelLoading} className="w-full flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-red-400 transition-colors mb-2 font-medium">
                {timeTravelLoading ? <Loader2 size={14} className="animate-spin" /> : "⏳ What if I delay?"}
              </button>
              {timeTravel && (
                <div className="text-sm text-red-400 mt-3 border-t border-red-500/20 pt-3 bg-red-500/5 p-3 rounded-lg leading-relaxed">
                  {timeTravel}
                </div>
              )}
            </div>
          )}

          {/* Sync to Calendar button */}
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || !!task.calendarEventId}
            className={`btn-secondary w-full flex items-center justify-center gap-2 ${task.calendarEventId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {syncMutation.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Syncing...</>
              : task.calendarEventId
                ? <><CheckCircle2 size={14} className="text-emerald-400" /> Synced to Calendar</>
                : <><Calendar size={14} /> Sync to Google Calendar</>}
          </button>

          {/* Mark complete / Reopen */}
          <button
            onClick={() => toggleComplete.mutate()}
            disabled={toggleComplete.isPending}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
              isCompleted
                ? 'border-violet-500 text-violet-400 hover:bg-violet-500/10'
                : 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
            }`}
            style={{ background: 'transparent' }}
          >
            {toggleComplete.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : isCompleted
                ? <><Circle size={14} /> Reopen Task</>
                : <><CheckCircle2 size={14} /> Mark as Complete</>}
          </button>
        </div>
      </div>

      {/* Draft modal */}
      {draft && (
        <DraftModal
          title={draft.title}
          content={draft.content}
          onClose={() => setDraft(null)}
        />
      )}

      {/* Hype Modal */}
      {showHype && (
        <HypeModal taskTitle={task.title} onClose={() => { setShowHype(false); setActiveTask(null); }} />
      )}
    </>
  )
}
