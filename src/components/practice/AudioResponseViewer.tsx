'use client'

import { useState, useRef } from 'react'
import { Question } from '@prisma/client'
import { Mic, Square, Play, Loader2, Award, Volume2, RotateCcw } from 'lucide-react'

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

  const playSampleAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(targetText)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

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

  const handleRetry = () => {
    setResult(null)
    setAudioBlob(null)
    setIsRecording(false)
  }

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-1 text-center" style={{ fontFamily: "'Fraunces', serif" }}>
        Luyện phát âm AI
      </h3>
      <p className="text-[#6B7A94] mb-6 font-mono text-xs">{promptText}</p>

      {/* Target sentence display */}
      <div className="bg-[#E1E9F2] border-2 border-[#1D2B4F] p-8 w-full text-center mb-6 shadow-inner relative">
        <span className="absolute top-2 left-2 text-[#C1432E] font-serif text-4xl opacity-50">"</span>
        <p className="font-serif text-2xl font-bold text-[#1D2B4F] px-4 flex flex-wrap justify-center gap-x-[0.35rem] leading-relaxed" style={{ fontFamily: "'Fraunces', serif" }}>
          {result?.wordResults ? (
            result.wordResults.map((w: any, i: number) => (
              <span
                key={i}
                className={
                  w.isCorrect
                    ? "text-[#4C7A6B]"
                    : "text-[#C1432E] underline decoration-wavy decoration-[#C1432E]/50 font-bold"
                }
              >
                {w.word}
              </span>
            ))
          ) : (
            targetText
          )}
        </p>

        {/* Native Speaker Audio Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={playSampleAudio}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFDF7] text-[#1D2B4F] border-2 border-[#1D2B4F] font-mono text-xs font-bold hover:bg-[#FBF6EC] transition-all shadow-[2px_2px_0_#1D2B4F] active:shadow-none cursor-pointer"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Volume2 size={16} className="text-[#C1432E]" />
            <span>Nghe phát âm mẫu (Native)</span>
          </button>
        </div>
      </div>

      {!result && (
        <div className="flex flex-col items-center gap-6 w-full">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="w-20 h-20 bg-[#C1432E] rounded-full border-4 border-[#1D2B4F] flex items-center justify-center text-[#FBF6EC] shadow-[4px_4px_0_#1D2B4F] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Bắt đầu thu âm"
            >
              <Mic size={32} />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={stopRecording}
                className="w-20 h-20 bg-[#1D2B4F] rounded-full border-4 border-[#C1432E] flex items-center justify-center text-[#C1432E] animate-pulse cursor-pointer shadow-[4px_4px_0_#C1432E]"
                title="Dừng thu âm"
              >
                <Square size={24} fill="currentColor" />
              </button>
              <span className="font-mono text-xs font-bold text-[#C1432E] animate-pulse">
                Đang thu âm... Bấm để dừng
              </span>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="flex flex-col items-center gap-4 w-full">
              <audio 
                controls 
                src={URL.createObjectURL(audioBlob)} 
                className="w-full max-w-sm h-12 border-2 border-[#1D2B4F] shadow-[2px_2px_0_#E7DEC9]"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2.5 bg-[#FFFDF7] text-[#1D2B4F] font-bold font-mono text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] flex items-center gap-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <RotateCcw size={14} />
                  <span>Thu lại</span>
                </button>
                <button 
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="px-6 py-2.5 bg-[#4C7A6B] text-white font-bold font-mono text-xs border-2 border-[#1D2B4F] shadow-[3px_3px_0_#1D2B4F] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {isEvaluating ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                  <span>{isEvaluating ? 'Đang chấm AI...' : 'Gửi chấm điểm'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div className="w-full bg-white border-2 border-[#1D2B4F] p-6 text-center shadow-[6px_6px_0_#E7DEC9] animate-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-[#F3DAD3] rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-[#C1432E]">
            <Award className="text-[#C1432E]" size={32} />
          </div>
          
          <div className="text-3xl font-bold text-[#1D2B4F] mb-1 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {result.pronunciationScore}%
          </div>
          <p className="font-mono text-xs font-bold text-[#6B7A94] mb-3 uppercase tracking-wider">
            {result.pronunciationScore >= 80 ? 'Xuất sắc! Phát âm rất chuẩn' : result.pronunciationScore >= 60 ? 'Khá tốt! Cần chú ý thêm một số từ' : 'Cần luyện thêm phát âm'}
          </p>
          <p className="text-sm text-[#1D2B4F] mb-6 leading-relaxed bg-[#FBF6EC] p-3 border border-[#E7DEC9]">
            {result.feedback}
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRetry}
              className="flex-1 py-3 bg-[#FFFDF7] text-[#1D2B4F] font-bold font-mono text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FBF6EC] transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <RotateCcw size={16} />
              <span>Thử đọc lại</span>
            </button>
            <button 
              onClick={() => onComplete(result.pronunciationScore > 80 ? 20 : 10)}
              className="flex-1 py-3 bg-[#1D2B4F] text-[#FBF6EC] font-bold font-mono text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#C1432E] cursor-pointer hover:bg-[#2A3C6D] transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span>Tiếp tục &rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
