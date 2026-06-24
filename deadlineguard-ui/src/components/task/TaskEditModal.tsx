import { useState, useEffect } from 'react'
import { X, Calendar, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTask } from '../../api/client'
import { useAppStore } from '../../store/appStore'

export default function TaskEditModal() {
  const { editingTask, closeEditModal } = useAppStore()
  const qc = useQueryClient()

  // Format date to YYYY-MM-DDThh:mm string for the input
  const initialDeadline = editingTask?.deadline 
    ? new Date(editingTask.deadline).toISOString().slice(0, 16) 
    : ''

  const [form, setForm] = useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    deadline: initialDeadline,
    importance: editingTask?.importance || 3,
  })

  // Synchronize state if editingTask changes
  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        deadline: editingTask.deadline ? new Date(editingTask.deadline).toISOString().slice(0, 16) : '',
        importance: editingTask.importance || 3,
      })
    }
  }, [editingTask])

  const editMutation = useMutation({
    mutationFn: (data: Partial<typeof form>) => updateTask(editingTask!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-all'] })
      closeEditModal()
    }
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.deadline || !editingTask) return
    editMutation.mutate(form)
  }

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  if (!editingTask) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-lg animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-text-primary">Edit Task</h2>
          <button onClick={closeEditModal} className="btn-ghost p-1"><X size={18} /></button>
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
                Importance ({form.importance}/5)
              </label>
              <input type="range" min={1} max={5} className="w-full mt-2 accent-violet-500"
                value={form.importance} onChange={e => set('importance', +e.target.value)} />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeEditModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={editMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {editMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
