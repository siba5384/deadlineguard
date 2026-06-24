import { useState, useEffect, useRef } from 'react'
import { Brain, Play, Pause, Square, Volume2, VolumeX, Users } from 'lucide-react'
import TopBar from '../components/layout/TopBar'

// Synthesizes a beautiful meditation chime when the timer ends
export function playChime() {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return
  
  const ctx = new AudioContextClass()
  
  // A lush, shimmering chord (Tibetan bowl style)
  const freqs = [432.0, 544.29, 647.27, 864.0] 
  
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.value = freq
    
    // Envelope: quick attack, very long exponential release for a "ringing" effect
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.4 / freqs.length, ctx.currentTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4 + i * 0.5)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start()
    osc.stop(ctx.currentTime + 5 + i)
  })
}

// Custom hook to synthesize brown noise via Web Audio API
export function useBrownNoise() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const startNoise = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    
    // Synthesize brown noise (integration of white noise)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + (0.02 * white)) / 1.02
      lastOut = output[i]
      output[i] *= 3.5 // compensate for volume drop
    }
    
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true
    
    const gainNode = ctx.createGain()
    gainNode.gain.value = 0.5 

    // Lowpass filter to make it sound deeper and smoother
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400

    noiseSource.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    noiseSource.start()
    sourceRef.current = noiseSource
    gainRef.current = gainNode
    setIsPlaying(true)
  }

  const stopNoise = () => {
    if (sourceRef.current) {
      sourceRef.current.stop()
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    setIsPlaying(false)
  }

  const toggleNoise = () => {
    if (isPlaying) stopNoise()
    else startNoise()
  }

  useEffect(() => {
    return () => stopNoise() // Cleanup on unmount
  }, [])

  return { isPlaying, toggleNoise }
}

export default function FocusSession() {
  const [totalDuration, setTotalDuration] = useState(25 * 60)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  
  const { isPlaying: isNoisePlaying, toggleNoise } = useBrownNoise()

  const [coWorkerEnabled, setCoWorkerEnabled] = useState(false)
  const [coWorkerMessage, setCoWorkerMessage] = useState('')

  useEffect(() => {
    if (isActive && coWorkerEnabled) {
       setCoWorkerMessage("I'm settling in to work right beside you. Let's do this!")
       const intId = setInterval(() => {
         const msgs = [
           "Just finished a subtask! How are you doing?",
           "Keep it up, you are doing great!",
           "I'm deeply focused right now, typing away.",
           "Remember to breathe. You've got this.",
           "Focusing hard! Almost there!",
           "Water break! Just kidding, keep going!",
           "I see you making progress. Great job."
         ]
         setCoWorkerMessage(msgs[Math.floor(Math.random() * msgs.length)])
       }, 30000) // change message every 30 seconds for dopamine
       return () => clearInterval(intId)
    } else {
       setCoWorkerMessage('')
    }
  }, [isActive, coWorkerEnabled])

  useEffect(() => {
    let interval: any = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      playChime() // Play the chiming sound!
      if (isNoisePlaying) toggleNoise()
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, isNoisePlaying, toggleNoise])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(totalDuration)
  }

  const adjustTime = (deltaSec: number) => {
    if (isActive) return
    const newDuration = Math.max(5, totalDuration + deltaSec) // minimum 5 seconds
    setTotalDuration(newDuration)
    setTimeLeft(newDuration)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = isActive || timeLeft < totalDuration ? 1 - (timeLeft / totalDuration) : 0
  
  // Big Brain animation values
  const minScale = 1.0
  const maxScale = 1.8
  const currentScale = minScale + (progress * (maxScale - minScale))
  const isPulsing = isActive

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-base">
      <TopBar title="Deep Focus" subtitle="Grow your brain with uninterrupted work" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[600px] h-[600px] rounded-full bg-violet-600 blur-[150px] mix-blend-screen transition-opacity duration-1000" 
               style={{ opacity: isPulsing ? 0.4 : 0.1 }} />
        </div>

        {/* Virtual CoWorker Bubble */}
        {coWorkerMessage && (
          <div className="absolute top-10 right-10 max-w-sm bg-bg-card border border-border rounded-2xl shadow-2xl p-4 flex gap-4 animate-in fade-in slide-in-from-right-10 z-50">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-xl">
               👨‍💻
             </div>
             <div>
               <div className="text-xs font-bold text-text-primary mb-1">Virtual Partner</div>
               <div className="text-sm text-text-secondary leading-snug transition-all">{coWorkerMessage}</div>
             </div>
          </div>
        )}

        {/* Brain Visualizer (Extra Large) */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-16 z-10">
          <div className="absolute inset-0 rounded-full border border-violet-500/20" />
          <div className="absolute inset-6 rounded-full border border-violet-500/10" />
          
          {isPulsing && (
            <div className="absolute inset-0 rounded-full bg-violet-500/5 animate-ping" 
                 style={{ animationDuration: '4s' }} />
          )}

          <div className="relative z-10 transition-all duration-1000 ease-out"
               style={{ 
                 transform: `scale(${currentScale})`,
                 filter: `drop-shadow(0 0 ${20 + progress * 40}px rgba(124, 58, 237, ${0.5 + progress * 0.5}))` 
               }}>
            <Brain size={100} className="text-violet-400" strokeWidth={1.2} />
          </div>
          
          {/* Huge Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 scale-150">
            <circle cx="128" cy="128" r="120" fill="none" stroke="var(--color-border)" strokeWidth="2" />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={754} 
              strokeDashoffset={754 - (progress * 754)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>

        {/* Timer Display */}
        <div className="text-8xl font-extralight tracking-widest text-text-primary font-mono mb-8 z-10">
          {formatTime(timeLeft)}
        </div>

        {/* Controls Container */}
        <div className="flex flex-col items-center gap-6 z-10">
          
          {/* Main Play/Pause and Time Adjustments */}
          <div className="flex items-center gap-4">
            <button onClick={() => adjustTime(-60)} disabled={isActive} className="btn-secondary px-3 py-1.5 text-xs font-mono disabled:opacity-50">-1m</button>
            <button onClick={() => adjustTime(-15)} disabled={isActive} className="btn-secondary px-3 py-1.5 text-xs font-mono disabled:opacity-50">-15s</button>
            
            <button
              onClick={toggleTimer}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 mx-4"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
            </button>
            
            <button onClick={() => adjustTime(15)} disabled={isActive} className="btn-secondary px-3 py-1.5 text-xs font-mono disabled:opacity-50">+15s</button>
            <button onClick={() => adjustTime(60)} disabled={isActive} className="btn-secondary px-3 py-1.5 text-xs font-mono disabled:opacity-50">+1m</button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={resetTimer}
              className="btn-secondary px-6 py-2 rounded-full flex items-center gap-2"
            >
              <Square size={16} /> Reset
            </button>
            
            <button
              onClick={toggleNoise}
              className={`btn-secondary px-6 py-2 rounded-full flex items-center gap-2 ${isNoisePlaying ? 'border-violet-500 text-violet-400' : ''}`}
            >
              {isNoisePlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {isNoisePlaying ? 'Brown Noise On' : 'Brown Noise Off'}
            </button>
            
            <button
              onClick={() => setCoWorkerEnabled(!coWorkerEnabled)}
              className={`btn-secondary px-6 py-2 rounded-full flex items-center gap-2 ${coWorkerEnabled ? 'border-blue-500 text-blue-400' : ''}`}
            >
              <Users size={16} />
              {coWorkerEnabled ? 'Co-Worker On' : 'Co-Worker Off'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}
