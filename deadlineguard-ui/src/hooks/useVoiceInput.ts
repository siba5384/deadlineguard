import { useCallback, useRef, useState } from 'react'

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interimText, setInterimText] = useState('')
  const recogRef = useRef<SpeechRecognitionLike | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const startListening = useCallback(() => {
    if (!isSupported) { setError('Voice input not supported in this browser.'); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition!
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
      setInterimText(transcript)
    }
    recognition.onerror = (e) => { setError(`Voice error: ${e.error}`); setListening(false) }
    recognition.onend = () => {
      setListening(false)
      if (interimText) { onTranscript(interimText); setInterimText('') }
    }

    recogRef.current = recognition
    recognition.start()
    setListening(true)
    setError(null)
  }, [isSupported, interimText, onTranscript])

  const stopListening = useCallback(() => {
    recogRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, interimText, error, isSupported, startListening, stopListening }
}
