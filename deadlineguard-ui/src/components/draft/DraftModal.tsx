import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Props {
  title: string
  content: string
  onClose: () => void
}

export default function DraftModal({ title, content, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
      <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="text-xs text-violet-400 font-medium mb-1">✨ AI-Generated Draft</div>
            <h2 className="font-bold text-text-primary">{title}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X size={18} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap font-mono text-sm">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          <button onClick={copy} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy to Clipboard</>}
          </button>
        </div>
      </div>
    </div>
  )
}
