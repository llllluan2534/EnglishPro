'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface MultipleChoiceProps {
  questionText: string
  options: Option[]
  explanation?: string | null
  onAnswer: (isCorrect: boolean) => void
}

export default function MultipleChoice({
  questionText, options, explanation, onAnswer,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSelect = (optionId: string) => {
    if (isSubmitted) return
    setSelected(optionId)
  }

  const handleSubmit = () => {
    if (!selected || isSubmitted) return
    setIsSubmitted(true)
    const isCorrect = options.find(o => o.id === selected)?.isCorrect ?? false
    setTimeout(() => onAnswer(isCorrect), 1200)
  }

  return (
    <div className="flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-50/50">
      {/* Question */}
      <h3 className="text-xl font-bold text-gray-900 leading-snug font-outfit">{questionText}</h3>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => {
          const isSelected = selected === option.id
          const showSuccess = isSubmitted && option.isCorrect
          const showError = isSubmitted && isSelected && !option.isCorrect
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isSubmitted}
              className={cn(
                'group flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200',
                !isSubmitted && isSelected && 'border-blue-600 bg-blue-50/50 shadow-sm',
                !isSubmitted && !isSelected && 'border-gray-50 bg-gray-50 hover:border-blue-200 hover:bg-white',
                showSuccess && 'border-green-500 bg-green-50 text-green-900',
                showError && 'border-red-400 bg-red-50 text-red-900',
                isSubmitted && !isSelected && !option.isCorrect && 'opacity-60 border-gray-50'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                !isSubmitted && isSelected && 'bg-blue-600 text-white',
                !isSubmitted && !isSelected && 'bg-white text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50',
                showSuccess && 'bg-green-500 text-white',
                showError && 'bg-red-400 text-white',
              )}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1 font-medium text-[0.95rem]">{option.text}</span>
              
              {showSuccess && <CheckCircle2 size={24} className="text-green-500 animate-in zoom-in" />}
              {showError && <XCircle size={24} className="text-red-400 animate-in zoom-in" />}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {isSubmitted && explanation && (
        <div className="flex gap-3 bg-blue-50/80 border border-blue-100 rounded-2xl p-5 text-sm text-blue-900 animate-in slide-in-from-top-2">
          <Info size={20} className="shrink-0 text-blue-500" />
          <div>
            <span className="font-bold uppercase text-[0.7rem] tracking-wider block mb-1">Giải thích từ chuyên gia</span>
            {explanation}
          </div>
        </div>
      )}

      {/* Action */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl text-base font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 active:scale-[0.98] mt-2"
        >
          Xác nhận đáp án
        </button>
      )}
    </div>
  )
}
