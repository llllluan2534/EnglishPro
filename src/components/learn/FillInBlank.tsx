'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react'

interface FillInBlankProps {
  template: string
  correctAnswers: string[]
  explanation?: string | null
  onAnswer: (isCorrect: boolean) => void
}

export default function FillInBlank({
  template, correctAnswers, explanation, onAnswer,
}: FillInBlankProps) {
  const parts = template.split('[BLANK]')
  const [inputs, setInputs] = useState<string[]>(correctAnswers.map(() => ''))
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInput = (index: number, value: string) => {
    if (isSubmitted) return
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (index < correctAnswers.length - 1) {
        inputRefs.current[index + 1]?.focus()
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = () => {
    if (isSubmitted) return
    const res = correctAnswers.map((correct, i) =>
      inputs[i].trim().toLowerCase() === correct.toLowerCase()
    )
    setResults(res)
    setIsSubmitted(true)
    const allCorrect = res.every(Boolean)
    setTimeout(() => onAnswer(allCorrect), 1500)
  }

  const allFilled = inputs.every(v => v.trim().length > 0)

  return (
    <div className="flex flex-col gap-6 bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-50/50">
      <div className="flex items-center gap-2 text-indigo-500 mb-2">
        <Lightbulb size={20} />
        <span className="text-xs font-bold uppercase tracking-widest">Điền vào chỗ trống</span>
      </div>

      {/* Template sentence */}
      <h3 className="text-2xl font-semibold text-gray-900 leading-[2] flex flex-wrap items-center gap-x-2 gap-y-4 font-outfit">
        {parts.map((part, i) => (
          <span key={i} className="inline-flex items-center gap-2 flex-wrap">
            <span>{part}</span>
            {i < correctAnswers.length && (
              <span className="inline-flex items-center gap-1.5 relative group">
                <input
                  ref={el => { inputRefs.current[i] = el }}
                  value={inputs[i]}
                  onChange={e => handleInput(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={isSubmitted}
                  className={cn(
                    'inline-block px-3 py-1 bg-indigo-50/30 border-b-4 text-blue-700 font-bold outline-none text-xl transition-all rounded-t-lg text-center',
                    !isSubmitted && 'border-indigo-200 focus:border-indigo-600 focus:bg-indigo-50/50',
                    isSubmitted && results[i] && 'border-green-500 bg-green-50 text-green-700',
                    isSubmitted && !results[i] && 'border-red-400 bg-red-50 text-red-600',
                  )}
                  style={{ width: `${Math.max(100, (inputs[i].length || correctAnswers[i].length) * 16)}px` }}
                />
                
                {isSubmitted && !results[i] && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap animate-in fade-in zoom-in">
                    {correctAnswers[i]}
                  </div>
                )}

                {isSubmitted && (
                  <div className="shrink-0">
                    {results[i] 
                      ? <CheckCircle2 size={24} className="text-green-500 animate-in zoom-in" />
                      : <XCircle size={24} className="text-red-400 animate-in zoom-in" />
                    }
                  </div>
                )}
              </span>
            )}
          </span>
        ))}
      </h3>

      {/* Explanation */}
      {isSubmitted && explanation && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-[0.95rem] text-gray-700 italic border-l-4 border-l-blue-500 animate-in slide-in-from-left-2">
          "{explanation}"
        </div>
      )}

      {/* Action */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-base font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] mt-4"
        >
          Kiểm tra kết quả
        </button>
      )}
    </div>
  )
}
