import { useEffect, useState } from 'react'
import { useTasks } from '../../hooks/useTasks'

export default function GuardianPet() {
  const { data: tasks } = useTasks()
  const [state, setState] = useState<'HAPPY' | 'STRESSED' | 'SLEEPING'>('HAPPY')

  useEffect(() => {
    if (!tasks) return
    const activeTasks = tasks.filter(t => t.status !== 'COMPLETED')
    const hasCritical = activeTasks.some(t => t.riskTier === 'CRITICAL')
    const allDone = tasks.length > 0 && activeTasks.length === 0
    
    if (allDone) setState('SLEEPING')
    else if (hasCritical) setState('STRESSED')
    else setState('HAPPY')
  }, [tasks])

  return (
    <div className="flex flex-col items-center justify-center p-4 m-4 bg-bg-card border border-border rounded-2xl shadow-sm relative overflow-hidden group">
      {/* Background glow */}
      <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${
        state === 'STRESSED' ? 'bg-red-500' : 
        state === 'SLEEPING' ? 'bg-blue-500' : 
        'bg-green-500'
      }`} />
      
      <div className="relative text-4xl mb-2 transition-transform group-hover:scale-110 duration-300">
        {state === 'HAPPY' && <span className="animate-bounce inline-block">🦉</span>}
        {state === 'STRESSED' && <span className="animate-pulse inline-block" style={{ filter: 'drop-shadow(0 0 10px red)' }}>🔥🦉🔥</span>}
        {state === 'SLEEPING' && <span className="opacity-70 inline-block">💤🦉</span>}
      </div>
      
      <div className="relative z-10 text-xs font-bold text-text-primary">
        {state === 'HAPPY' && 'Ollie is happy!'}
        {state === 'STRESSED' && 'Ollie is stressed!'}
        {state === 'SLEEPING' && 'Ollie is resting.'}
      </div>
      <div className="relative z-10 text-[10px] text-text-muted text-center mt-1">
        {state === 'HAPPY' && 'Keep up the good work!'}
        {state === 'STRESSED' && 'Clear critical tasks!'}
        {state === 'SLEEPING' && 'All tasks completed.'}
      </div>
    </div>
  )
}
