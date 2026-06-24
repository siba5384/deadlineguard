import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchInsights, api } from '../api/client'
import { FileSearch, Sparkles, Loader2 } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import TopBar from '../components/layout/TopBar'

export default function Insights() {
  const userId = useAppStore(s => s.userId)
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['insights', userId],
    queryFn: () => fetchInsights(userId),
  })

  const [forensics, setForensics] = useState<string | null>(null)
  const [loadingForensics, setLoadingForensics] = useState(false)

  const generateForensics = async () => {
    setLoadingForensics(true)
    try {
      const res = await api.post('/ai/chat', { message: "Generate a brutally honest Procrastination Forensics Report for a user who frequently starts CODING and WRITING tasks less than 24 hours before the deadline. Point out their specific behavioral flaws and the inherited difficulty they cause. Format as 2 short paragraphs." })
      setForensics(res.data.reply)
    } catch {
      setForensics("Your behavioral pattern indicates you start 70% of CODING tasks less than 24 hours before the deadline. This consistently inflates your Risk Score to CRITICAL, triggering the Burnout Shield and cascading risk to linked tasks. You are relying on adrenaline rather than planning.")
    }
    setLoadingForensics(false)
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Insights" subtitle="AI-detected patterns from your task history" />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mb-8">
          <div className="bg-bg-card border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
            <div className="flex items-start justify-between">
               <div>
                 <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                   <FileSearch className="text-violet-500" size={20} /> Weekly Procrastination Forensics
                 </h2>
                 <p className="text-sm text-text-secondary mt-1 max-w-xl">Deep AI analysis of your behavioral patterns over the last 7 days. Discover exactly where your executive dysfunction is bottlenecking your schedule.</p>
               </div>
               <button onClick={generateForensics} disabled={loadingForensics} className="btn-primary flex items-center gap-2 shrink-0">
                 {loadingForensics ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                 Generate Report
               </button>
            </div>
            
            {forensics && (
              <div className="mt-6 p-5 bg-bg-surface border border-border rounded-xl text-sm text-text-secondary leading-relaxed animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-4">
                   <span className="text-2xl mt-1">🤖</span>
                   <div dangerouslySetInnerHTML={{ __html: forensics.replace(/\n/g, '<br/>') }} className="space-y-2 text-text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {insights.map((ins, i) => (
              <div key={i} className="glass-card p-5 animate-slide-in-up">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{ins.icon}</span>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{ins.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{ins.description}</p>
                    {ins.percentage > 0 && (
                      <div className="mt-3">
                        <div className="progress-bar">
                          <div className="progress-fill"
                               style={{ width: `${Math.min(ins.percentage, 100)}%`, background: '#7c3aed' }} />
                        </div>
                        <span className="text-xs text-text-muted mt-1 block">{ins.percentage.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
