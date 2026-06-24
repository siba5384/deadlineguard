import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, Loader2, Mic } from 'lucide-react'
import { api } from '../../api/client'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function GeminiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi! I am Gemini, your AI productivity assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  useEffect(() => {
    // Initialize Speech Recognition (Jarvis Mode)
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => prev + (prev ? ' ' : '') + transcript)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
  }, [])

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
      } else {
        alert("Your browser does not support voice input. Try Chrome!")
      }
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMsg = input.trim()
    setInput('')
    
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: userMsg }]
    setMessages(newMessages)
    setIsLoading(true)
    
    try {
      const { data } = await api.post('/ai/chat', { message: userMsg })
      setMessages([...newMessages, { id: Date.now().toString(), role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages([...newMessages, { id: Date.now().toString(), role: 'assistant', content: 'Oops, I had trouble connecting. Please try again later!' }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 z-50 text-white"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        title="Ask Gemini AI"
      >
        <MessageSquare size={24} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5"
         style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-violet-400" />
          <h3 className="font-semibold text-text-primary">Gemini Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
          <X size={20} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'text-white rounded-br-sm shadow-md' 
                : 'border text-text-primary rounded-bl-sm'
            }`}
            style={{ 
              background: msg.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'var(--color-bg-surface)',
              borderColor: msg.role === 'user' ? 'transparent' : 'var(--color-border)'
            }}>
              <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 rounded-bl-sm border"
                 style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
              <Loader2 size={16} className="text-violet-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t flex items-center gap-2" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
        <button
          type="button"
          onClick={toggleListen}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-bg-base border border-border text-text-muted hover:text-text-primary'}`}
          title="Jarvis Voice Mode"
        >
          <Mic size={16} />
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border rounded-full px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-violet-500 transition-colors placeholder:text-text-muted"
          style={{ background: 'var(--color-bg-base)', borderColor: 'var(--color-border)' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <Send size={16} className="ml-0.5" />
        </button>
      </form>
    </div>
  )
}
