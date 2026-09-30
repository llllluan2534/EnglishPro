'use client'

import { useState } from 'react'
import { Question, QuestionOption } from '@prisma/client'
import { Check, X, Square, CheckSquare } from 'lucide-react'

type QuestionWithOptions = Question & { options: QuestionOption[] }

interface Props {
  question: QuestionWithOptions
  onComplete: (points: number) => void
}

export default function MultipleSelectViewer({ question, onComplete }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content
  const text = content?.text || 'Nội dung câu hỏi (Chọn nhiều đáp án)'
  const audioUrl = content?.audioUrl
  
  const toggleSelection = (id: string) => {
    if (isSubmitted) return
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleSubmit = () => {
    if (selectedIds.size === 0) return
    setIsSubmitted(true)
  }
  
  const handleNext = () => {
    // Check if all selected are correct, and all correct are selected
    const correctOptions = question.options.filter(o => o.isCorrect)
    const isAllCorrectSelected = correctOptions.every(o => selectedIds.has(o.id))
    const isNoIncorrectSelected = Array.from(selectedIds).every(id => 
      question.options.find(o => o.id === id)?.isCorrect
    )
    
    const isFullyCorrect = isAllCorrectSelected && isNoIncorrectSelected
    // Partial points could be implemented, but we'll do all-or-nothing for now
    onComplete(isFullyCorrect ? question.points : 0)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-2">Trắc nghiệm nhiều đáp án</h3>
      <p className="text-[#6B7A94] mb-6 font-mono text-sm">Chọn TẤT CẢ các đáp án đúng.</p>
      
      {audioUrl && (
        <div className="mb-6 p-4 bg-[#E1E9F2] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      )}

      <p className="text-lg text-[#1D2B4F] font-serif mb-8">{text}</p>
      
      <div className="space-y-4 mb-8">
        {question.options.map((option) => {
          const isSelected = selectedIds.has(option.id)
          let optionClass = "w-full text-left p-4 border-2 font-mono font-bold transition-all flex items-center gap-3 "
          
          if (!isSubmitted) {
            if (isSelected) {
              optionClass += "bg-[#E1E9F2] border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] translate-y-[-2px] translate-x-[-2px]"
            } else {
              optionClass += "bg-white border-[#E7DEC9] text-[#6B7A94] hover:border-[#1D2B4F] hover:text-[#1D2B4F]"
            }
          } else {
            // Submitted state
            if (option.isCorrect) {
              optionClass += "bg-[#E8F3EC] border-[#4C7A6B] text-[#4C7A6B] shadow-[4px_4px_0_#4C7A6B]"
            } else if (isSelected && !option.isCorrect) {
              optionClass += "bg-[#FDECE9] border-[#C1432E] text-[#C1432E] shadow-[4px_4px_0_#C1432E]"
            } else {
              optionClass += "bg-white border-[#E7DEC9] text-[#B9BFCF] opacity-60"
            }
          }

          return (
            <button
              key={option.id}
              disabled={isSubmitted}
              onClick={() => toggleSelection(option.id)}
              className={optionClass}
            >
              <div className="shrink-0">
                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span>{option.text}</span>
                {isSubmitted && option.isCorrect && <Check size={20} className="text-[#4C7A6B]" />}
                {isSubmitted && isSelected && !option.isCorrect && <X size={20} className="text-[#C1432E]" />}
              </div>
            </button>
          )
        })}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedIds.size === 0}
          className="w-full py-4 bg-[#1D2B4F] text-[#FBF6EC] font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#E7DEC9] disabled:opacity-50 transition-transform hover:enabled:translate-y-px hover:enabled:translate-x-px hover:enabled:shadow-[2px_2px_0_#E7DEC9]"
        >
          Kiểm tra đáp án
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-4 bg-[#E3A73B] text-[#1D2B4F] font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] transition-transform hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0_#1D2B4F]"
        >
          Tiếp tục
        </button>
      )}
    </div>
  )
}
