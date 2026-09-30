'use client'

import { useEffect, useState } from 'react'
import { Question } from '@prisma/client'

interface Props {
  question: Question
  onAnswerChange?: (answer: any) => void
  isSubmitted?: boolean
  result?: { isCorrect: boolean, correctAnswer?: any }
  onComplete: (points: number) => void // Kept for backwards compatibility if needed
  hideAudio?: boolean
}

export default function FillInBlankViewer({ question, onAnswerChange, isSubmitted, result, hideAudio }: Props) {
  const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content as any
  const text = content?.text || "The quick brown [BLANK] jumps over the lazy [BLANK]."
  const audioUrl = content?.audioUrl

  const parts = text.split('[BLANK]')
  const [answers, setAnswers] = useState<string[]>(Array(parts.length - 1).fill(''))
  const [showAnswer, setShowAnswer] = useState(false)

  // Only notify parent when answers actually change
  useEffect(() => {
    if (onAnswerChange) {
      // Check if user has filled all blanks
      const isFullyAnswered = answers.every(a => a.trim() !== '')
      if (isFullyAnswered) {
        onAnswerChange(answers)
      } else {
        // Signify that it's not fully answered
        onAnswerChange(null)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers])

  const isCorrect = result?.isCorrect ?? null
  const correctAnswersData = result?.correctAnswer

  return (
    <div>
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-6">Điền vào chỗ trống</h3>
      
      {audioUrl && !hideAudio && (
        <div className="mb-6 p-4 bg-[#E1E9F2] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      )}

      <div className="text-lg leading-loose text-[#1D2B4F] mb-8 font-serif whitespace-pre-wrap">
        {parts.map((part: string, i: number) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                value={answers[i]}
                onChange={e => {
                  const newAnswers = [...answers]
                  newAnswers[i] = e.target.value
                  setAnswers(newAnswers)
                }}
                disabled={isSubmitted}
                className={`mx-2 w-32 border-b-2 bg-transparent text-center font-bold focus:outline-none transition-colors ${
                  isCorrect === true ? 'border-[#4C7A6B] text-[#4C7A6B]' : 
                  isCorrect === false ? 'border-[#C1432E] text-[#C1432E]' : 
                  'border-[#1D2B4F] text-[#C1432E] focus:border-[#C1432E]'
                }`}
              />
            )}
          </span>
        ))}
      </div>
      
      {isCorrect === false && isSubmitted && !showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="mt-4 px-6 py-3 font-bold font-mono bg-[#E7DEC9] text-[#1D2B4F] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0_#1D2B4F] transition-all"
        >
          Xem đáp án
        </button>
      )}

      {isCorrect === false && isSubmitted && showAnswer && correctAnswersData && (
        <div className="mt-6 p-4 bg-[#FDECE9] border-2 border-[#C1432E] shadow-[4px_4px_0_#C1432E] animate-in slide-in-from-top-2 duration-300">
          <h4 className="font-bold text-[#C1432E] mb-2 font-mono">Đáp án đúng:</h4>
          <div className="flex flex-wrap gap-2">
            {correctAnswersData.map((ans: string, idx: number) => (
              <span key={idx} className="bg-white px-2 py-1 font-mono font-bold text-[#1D2B4F] border border-[#C1432E]">{idx + 1}. {ans}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
