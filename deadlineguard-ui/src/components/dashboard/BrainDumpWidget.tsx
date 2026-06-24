import { useState } from 'react'
import { Brain, Send, X, Trash2 } from 'lucide-react'
import { api } from '../../api/client'

export default function BrainDumpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [items, setItems] = useState<{id: number, text: string, category: string}[]>([])
  const [loading, setLoading] = useState(false)
  
  const handleDump = async (e: any) => {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    setLoading(true)
    
    try {
      const res = await api.post('/ai/chat', { message: `Categorize this random thought into exactly one of these labels: [TODO, ERRAND, RANDOM, IDEA]. Reply with ONLY the exact label word. Thought: "${text}"` })
      let cat = res.data.reply.trim().replace(/[^A-Z]/g, '')
      if (!['TODO', 'ERRAND', 'RANDOM', 'IDEA'].includes(cat)) cat = 'RANDOM'
      setItems(prev => [...prev, { id: Date.now(), text, category: cat }])
    } catch {
      setItems(prev => [...prev, { id: Date.now(), text, category: 'TODO' }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-[260px] px-4 py-3 rounded-full flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 z-50 text-white font-medium text-sm"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        title="Open Brain Dump Drawer"
      >
        <Brain size={18} className="animate-pulse" /> Brain Dump
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 left-[260px] w-80 h-[400px] bg-bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-emerald-500/10">
        <div className="flex items-center gap-2 text-emerald-500">
          <Brain size={20} />
          <h3 className="font-semibold">Brain Dump Drawer</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 && <p className="text-text-muted text-sm text-center mt-10">Dump random distracting thoughts here!</p>}
        {items.map(item => (
          <div key={item.id} className="bg-bg-surface p-3 rounded-xl border border-border text-sm flex justify-between items-start group">
            <div>
               <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded mr-2 uppercase">{item.category}</span>
               <span className="text-text-primary mt-1 block">{item.text}</span>
            </div>
            <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleDump} className="p-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Get it out of your head..."
          className="flex-1 bg-bg-base border border-border rounded-full px-4 py-2 text-sm text-text-primary focus:border-emerald-500 transition-colors"
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading} className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
          <Send size={16} className="ml-0.5" />
        </button>
      </form>
    </div>
  )
}
