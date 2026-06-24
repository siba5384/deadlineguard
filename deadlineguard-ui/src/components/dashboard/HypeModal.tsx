import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Trophy, X, Loader2 } from 'lucide-react'

export default function HypeModal({ taskTitle, onClose }: { taskTitle: string, onClose: () => void }) {
  const [hypeMsg, setHypeMsg] = useState('')
  
  useEffect(() => {
    // Generate hype!
    api.post('/ai/chat', { message: `Generate a 2-sentence crazy enthusiastic hype message congratulating me for finally completing the task: '${taskTitle}'. Use all caps, emojis, and mention that Ollie the Owl is doing backflips!` })
       .then(res => setHypeMsg(res.data.reply))
       .catch(() => setHypeMsg("YOU DID IT! ABSOLUTELY INCREDIBLE WORK! OLLIE IS SO PROUD!"))
  }, [taskTitle])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      {/* CSS Confetti Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {Array.from({ length: 80 }).map((_, i) => (
           <div key={i} className="absolute w-3 h-3 animate-confetti" style={{
             left: Math.random() * 100 + '%',
             top: -20,
             backgroundColor: ['#fcd34d', '#ef4444', '#10b981', '#3b82f6', '#d946ef', '#06b6d4'][Math.floor(Math.random()*6)],
             animationDelay: Math.random() * 2 + 's',
             animationDuration: Math.random() * 2 + 2 + 's'
           }} />
         ))}
      </div>

      <div className="bg-bg-card border-2 border-yellow-500/50 rounded-2xl shadow-2xl p-8 max-w-lg text-center relative z-10 animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white"><X size={20}/></button>
        <Trophy size={64} className="mx-auto text-yellow-500 mb-4 animate-pulse" />
        <h2 className="text-3xl font-black text-white mb-4 drop-shadow-lg">TASK CRUSHED!</h2>
        {hypeMsg ? (
           <p className="text-lg text-yellow-300 font-bold leading-relaxed">{hypeMsg}</p>
        ) : (
           <Loader2 className="animate-spin text-yellow-500 mx-auto" size={32} />
        )}
      </div>
    </div>
  )
}
