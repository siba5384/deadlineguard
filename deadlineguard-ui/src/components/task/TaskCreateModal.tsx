import { useState } from 'react'
import { X, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useCreateTask } from '../../hooks/useTasks'
import { useAppStore } from '../../store/appStore'

const taskTypes = [
  { value: 'GENERAL',      label: '📋 General' },
  { value: 'EMAIL',        label: '📧 Email' },
  { value: 'DOCUMENT',     label: '📄 Document' },
  { value: 'CODING',       label: '💻 Coding' },
  { value: 'STUDY',        label: '📚 Study' },
  { value: 'PRESENTATION', label: '📊 Presentation' },
]

export default function TaskCreateModal() {
  const { closeCreateModal, userId } = useAppStore()
  const createTask = useCreateTask()

  const [form, setForm] = useState({
    title: '', description: '', deadline: '', estimatedEffortMinutes: 60,
    importance: 3, taskType: 'GENERAL',
  })
  const [decomposing, setDecomposing] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.deadline) return
    setDecomposing(true)
    try {
      await createTask.mutateAsync({ ...form, userId })
      closeCreateModal()
    } finally {
      setDecomposing(false)
    }
  }

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-lg animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-text-primary">New Task</h2>
          <button onClick={closeCreateModal} className="btn-ghost p-1"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Task Title *</label>
            <input className="input" placeholder="e.g. Finish DSA assignment"
              value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
            <textarea className="input resize-none" rows={2}
              placeholder="What does this involve?"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Row: deadline + effort */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                <Calendar size={11} className="inline mr-1" /> Deadline *
              </label>
              <input type="datetime-local" className="input" required
                value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                <Clock size={11} className="inline mr-1" /> Est. Minutes
              </label>
              <input type="number" className="input" min={5} max={480}
                value={form.estimatedEffortMinutes}
                onChange={e => set('estimatedEffortMinutes', +e.target.value)} />
            </div>
          </div>

          {/* Row: type + importance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Task Type</label>
              <select className="input" value={form.taskType} onChange={e => set('taskType', e.target.value)}>
                {taskTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Importance ({form.importance}/5)
              </label>
              <input type="range" min={1} max={5} className="w-full mt-2 accent-violet-500"
                value={form.importance} onChange={e => set('importance', +e.target.value)} />
            </div>
          </div>

          {/* AI hint */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs text-violet-300"
               style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>AI will automatically break this task into timed subtasks after creation.</span>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeCreateModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={decomposing} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {decomposing ? <><Loader2 size={14} className="animate-spin" /> Decomposing...</> : '✨ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
