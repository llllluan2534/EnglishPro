'use client'

import { useState, useRef } from 'react'
import { Question } from '@prisma/client'
import { Mic, Square, Play, Loader2, Award } from 'lucide-react'

interface Props {
  question: Question
  onComplete: (points: number) => void
}

export default function AudioResponseViewer({ question, onComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content
  const targetText = content?.targetText || 'The quick brown fox jumps over the lazy dog'
  const promptText = content?.prompt || 'Đọc to câu tiếng Anh dưới đây'

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        chunksRef.current = []
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setAudioBlob(null)
      setResult(null)
    } catch (err) {
      alert("Cần cấp quyền Microphone để làm bài tập này.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleEvaluate = async () => {
    if (!audioBlob) return
    setIsEvaluating(true)
    
    const formData = new FormData()
    formData.append('audio', audioBlob)
    formData.append('targetText', targetText)

    try {
      const res = await fetch('/api/evaluate/speaking', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-2 text-center">Luyện phát âm</h3>
      <p className="text-[#6B7A94] mb-8 font-mono text-sm">{promptText}</p>

      <div className="bg-[#E1E9F2] border-2 border-[#1D2B4F] p-8 w-full text-center mb-8 shadow-inner relative">
        <span className="absolute top-2 left-2 text-[#C1432E] font-serif text-4xl opacity-50">"</span>
        <p className="font-serif text-2xl font-bold text-[#1D2B4F] px-4 flex flex-wrap justify-center gap-x-[0.35rem]">
          {result?.wordResults ? (
            result.wordResults.map((w: any, i: number) => (
              <span key={i} className={w.isCorrect ? "text-[#4C7A6B]" : "text-[#C1432E] underline decoration-wavy decoration-[#C1432E]/30"}>
                {w.word}
              </span>
            ))
          ) : (
            targetText
          )}
        </p>
      </div>

      {!result && (
        <div className="flex flex-col items-center gap-6">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="w-20 h-20 bg-[#C1432E] rounded-full border-4 border-[#1D2B4F] flex items-center justify-center text-[#FBF6EC] shadow-[4px_4px_0_#1D2B4F] hover:scale-105 transition-transform"
            >
              <Mic size={32} />
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="w-20 h-20 bg-[#1D2B4F] rounded-full border-4 border-[#C1432E] flex items-center justify-center text-[#C1432E] animate-pulse"
            >
              <Square size={24} fill="currentColor" />
            </button>
          )}

          {audioBlob && !isRecording && (
            <div className="flex flex-col items-center gap-4 w-full">
              <audio 
                controls 
                src={URL.createObjectURL(audioBlob)} 
                className="w-full max-w-sm h-12 border-2 border-[#1D2B4F] shadow-[2px_2px_0_#E7DEC9]"
              />
              <button 
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="px-6 py-3 bg-[#4C7A6B] text-white font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] disabled:opacity-50 flex items-center gap-2"
              >
                {isEvaluating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                {isEvaluating ? 'Đang chấm AI...' : 'Gửi chấm điểm'}
              </button>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="w-full bg-white border-2 border-[#1D2B4F] p-6 text-center animate-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-[#F3DAD3] rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-[#C1432E]">
            <Award className="text-[#C1432E]" size={32} />
          </div>
          <h4 className="font-serif font-bold text-2xl text-[#1D2B4F] mb-2">{result.pronunciationScore}%</h4>
          <p className="font-mono text-sm text-[#6B7A94] mb-6">{result.feedback}</p>
          
          <button 
            onClick={() => onComplete(result.pronunciationScore > 80 ? 20 : 10)}
            className="w-full py-3 bg-[#1D2B4F] text-[#FBF6EC] font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#E7DEC9]"
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  )
}
