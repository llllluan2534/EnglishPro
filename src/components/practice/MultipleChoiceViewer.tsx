'use client'

import { useEffect, useState } from 'react'
import { Question, QuestionOption } from '@prisma/client'
import { Check, X } from 'lucide-react'

type QuestionWithOptions = Question & { options: QuestionOption[] }

interface Props {
  question: QuestionWithOptions
  onAnswerChange?: (answer: any) => void
  isSubmitted?: boolean
  result?: { isCorrect: boolean, correctAnswer?: any }
  onComplete?: (points: number) => void 
  isListView?: boolean
  hideAudio?: boolean
}

export default function MultipleChoiceViewer({ question, onAnswerChange, isSubmitted, result, isListView, hideAudio }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  
  const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content as any
  const text = content?.text || 'Nội dung câu hỏi'
  const audioUrl = content?.audioUrl

  useEffect(() => {
    if (onAnswerChange && selectedId !== null) {
      onAnswerChange(selectedId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const correctAnswersData = result?.correctAnswer // Array of correct IDs

  return (
    <div className={isListView ? '' : 'p-8 max-w-2xl mx-auto bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[8px_8px_0_#E7DEC9]'}>
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-6">Trắc nghiệm</h3>
      
      {audioUrl && !hideAudio && (
        <div className="mb-6 p-4 bg-[#E1E9F2] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      )}
      
      <p className="text-lg text-[#1D2B4F] font-serif mb-8 whitespace-pre-wrap">{text}</p>
      
      <div className="space-y-4 mb-8">
        {question.options.map((option) => {
          const isSelected = selectedId === option.id
          let optionClass = "w-full text-left p-4 border-2 font-mono font-bold transition-all "
          
          if (!isSubmitted) {
            if (isSelected) {
              optionClass += "bg-[#E1E9F2] border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] translate-y-[-2px] translate-x-[-2px]"
            } else {
              optionClass += "bg-white border-[#E7DEC9] text-[#6B7A94] hover:border-[#1D2B4F] hover:text-[#1D2B4F]"
            }
          } else {
            // Submitted state
            const isCorrectOption = correctAnswersData?.includes(option.id) || (result?.isCorrect && isSelected)

            if (isCorrectOption) {
              optionClass += "bg-[#E8F3EC] border-[#4C7A6B] text-[#4C7A6B] shadow-[4px_4px_0_#4C7A6B]"
            } else if (isSelected && !isCorrectOption) {
              optionClass += "bg-[#FDECE9] border-[#C1432E] text-[#C1432E] shadow-[4px_4px_0_#C1432E]"
            } else {
              optionClass += "bg-white border-[#E7DEC9] text-[#B9BFCF] opacity-60"
            }
          }

          return (
            <button
              key={option.id}
              disabled={isSubmitted}
              onClick={() => setSelectedId(option.id)}
              className={optionClass}
            >
              <div className="flex justify-between items-center">
                <span>{option.text}</span>
                {isSubmitted && (correctAnswersData?.includes(option.id) || (result?.isCorrect && isSelected)) && <Check size={20} className="text-[#4C7A6B]" />}
                {isSubmitted && isSelected && !(correctAnswersData?.includes(option.id) || (result?.isCorrect && isSelected)) && <X size={20} className="text-[#C1432E]" />}
              </div>
            </button>
          )
        })}
      </div>
      
      {result?.isCorrect === false && isSubmitted && !showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="mt-4 px-6 py-3 font-bold font-mono bg-[#E7DEC9] text-[#1D2B4F] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0_#1D2B4F] transition-all"
        >
          Xem đáp án
        </button>
      )}

      {result?.isCorrect === false && isSubmitted && showAnswer && correctAnswersData && (
        <div className="mt-6 p-4 bg-[#FDECE9] border-2 border-[#C1432E] shadow-[4px_4px_0_#C1432E] animate-in slide-in-from-top-2 duration-300">
          <h4 className="font-bold text-[#C1432E] mb-2 font-mono">Đáp án đúng:</h4>
          <div className="flex flex-col gap-2">
            {question.options
              .filter(o => correctAnswersData.includes(o.id))
              .map(o => (
                <div key={o.id} className="font-bold text-[#1D2B4F] border-l-4 border-[#C1432E] pl-3 py-1">
                  {o.text}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
