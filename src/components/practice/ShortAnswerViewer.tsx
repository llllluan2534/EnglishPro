'use client'

import { useState } from 'react'
import { Question } from '@prisma/client'
import { Loader2 } from 'lucide-react'

interface Props {
  question: Question
  onComplete: (points: number) => void
}

export default function ShortAnswerViewer({ question, onComplete }: Props) {
  const [text, setText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleEvaluate = async () => {
    if (!text.trim()) return
    setIsEvaluating(true)
    
    try {
      const res = await fetch('/api/evaluate/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answerText: text,
          instruction: 'Write a short paragraph about your favorite hobby.'
        })
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsEvaluating(false)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-2">Viết luận ngắn</h3>
      <p className="text-[#6B7A94] mb-6 font-mono text-sm">Write a short paragraph about your favorite hobby. (At least 15 words)</p>

      {!result ? (
        <>
          <div className="relative mb-6">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={isEvaluating}
              placeholder="Start writing here..."
              className="w-full h-48 bg-white border-2 border-[#1D2B4F] p-4 font-serif text-lg text-[#1D2B4F] focus:outline-none focus:ring-2 focus:ring-[#C1432E] resize-none"
            />
            <div className="absolute bottom-4 right-4 font-mono text-sm text-[#6B7A94] font-bold">
              {wordCount} words
            </div>
          </div>

          <button 
            onClick={handleEvaluate}
            disabled={isEvaluating || wordCount < 5}
            className="w-full py-4 bg-[#1D2B4F] text-[#FBF6EC] font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#E7DEC9] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isEvaluating ? <Loader2 className="animate-spin" size={20} /> : null}
            {isEvaluating ? 'AI đang chấm bài...' : 'Nộp bài & Nhận nhận xét'}
          </button>
        </>
      ) : (
        <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-dashed border-[#E7DEC9]">
            <div>
              <h4 className="font-serif font-bold text-xl text-[#1D2B4F]">Kết quả đánh giá</h4>
              <p className="text-[#6B7A94] mt-1">{result.feedback}</p>
            </div>
            <div className="w-16 h-16 shrink-0 bg-[#E3A73B] rounded-full border-2 border-[#1D2B4F] flex items-center justify-center shadow-[2px_2px_0_#1D2B4F]">
              <span className="font-bold text-xl text-[#1D2B4F] font-mono">{result.score}</span>
            </div>
          </div>
          
          {result.corrections && result.corrections.length > 0 && (
            <div className="mb-8">
              <h5 className="font-bold text-[#1D2B4F] mb-3 font-mono text-sm">Gợi ý sửa lỗi:</h5>
              <ul className="space-y-3">
                {result.corrections.map((c: any, i: number) => (
                  <li key={i} className="bg-white p-3 border border-[#E7DEC9] text-sm">
                    <span className="line-through text-[#C1432E] mr-2">{c.original}</span>
                    <span className="text-[#4C7A6B] font-bold mr-2">&rarr; {c.suggestion}</span>
                    <span className="text-[#6B7A94] italic block mt-1">{c.explanation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={() => onComplete(result.score > 80 ? 20 : 10)}
            className="w-full py-3 bg-[#4C7A6B] text-white font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]"
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  )
}
