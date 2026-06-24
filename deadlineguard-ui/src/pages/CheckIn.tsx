import { useState } from 'react'
import { Mic, MicOff, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { processCheckIn } from '../api/client'
import { useAppStore } from '../store/appStore'
import { useVoiceInput } from '../hooks/useVoiceInput'
import type { CheckInType, Task } from '../types'
import TopBar from '../components/layout/TopBar'
import TaskCard from '../components/dashboard/TaskCard'

const checkInTypes: { type: CheckInType; label: string; emoji: string; hint: string }[] = [
  { type: 'MORNING', emoji: '☀️', label: 'Morning Check-In', hint: "What's on your plate today? (e.g. \"I need to email my professor and finish my lab report\")" },
  { type: 'MIDDAY',  emoji: '⚡', label: 'Midday Check-In',  hint: "How's it going? Any blockers or new tasks?" },
  { type: 'EVENING', emoji: '🌙', label: 'Evening Review',   hint: "What did you get done? What needs rescheduling?" },
]

export default function CheckIn() {
  const userId = useAppStore(s => s.userId)
  const qc = useQueryClient()

  const [selected, setSelected] = useState<CheckInType>('MORNING')
  const [text, setText] = useState('')
  const [result, setResult] = useState<Task[] | null>(null)

  const ci = checkInTypes.find(c => c.type === selected)!

  const { listening, interimText, error: voiceError, isSupported, startListening, stopListening } =
    useVoiceInput((transcript) => setText(t => t ? `${t} ${transcript}` : transcript))

  const submit = useMutation({
    mutationFn: () => processCheckIn({ userId, type: selected, transcript: text }),
    onSuccess: (data) => {
      setResult(data.createdTasks)
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Daily Check-In" subtitle="Let AI parse your plans into structured tasks" />
      <div className="flex-1 p-8 max-w-2xl mx-auto w-full">

        {/* Type selector */}
        <div className="flex gap-3 mb-6">
          {checkInTypes.map(({ type, emoji, label }) => (
            <button key={type} onClick={() => { setSelected(type); setResult(null) }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                selected === type
                  ? 'border-violet-500 text-violet-300'
                  : 'border-border text-text-secondary hover:border-border-hover'
              }`}
              style={selected === type ? { background: 'rgba(124,58,237,0.12)' } : { background: 'var(--color-bg-card)' }}>
              <div className="text-xl mb-1">{emoji}</div>
              <div className="text-xs">{label}</div>
            </button>
          ))}
        </div>

        {!result ? (
          <div className="glass-card p-6 space-y-4">
            <p className="text-sm text-text-secondary">{ci.hint}</p>

            {/* Transcript area */}
            <div className="relative">
              <textarea
                className="input min-h-28 resize-none"
                placeholder="Type here or use voice input..."
                value={listening ? `${text} ${interimText}` : text}
                onChange={e => setText(e.target.value)}
              />
              {listening && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  Listening...
                </div>
              )}
            </div>

            {voiceError && <p className="text-xs text-red-400">{voiceError}</p>}

            {/* Actions */}
            <div className="flex gap-3">
              {isSupported && (
                <button onClick={listening ? stopListening : startListening}
                  className={`btn-secondary flex items-center gap-2 ${listening ? 'border-red-500 text-red-400' : ''}`}>
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  {listening ? 'Stop' : 'Voice'}
                </button>
              )}
              <button onClick={() => submit.mutate()} disabled={!text.trim() || submit.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {submit.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Parsing tasks...</>
                  : <><Send size={14} /> Submit Check-In</>}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={20} />
              <span className="font-semibold">
                {result.length > 0
                  ? `${result.length} task${result.length > 1 ? 's' : ''} extracted and added to your dashboard!`
                  : 'Check-in recorded. No new tasks detected.'}
              </span>
            </div>
            {result.map(task => <TaskCard key={task.id} task={task} />)}
            <button onClick={() => { setResult(null); setText('') }} className="btn-secondary w-full">
              New Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
