'use client'

import { useState, useEffect, useMemo } from 'react'
import { Question, QuestionOption } from '@prisma/client'
import { Loader2, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'

import FillInBlankViewer from './FillInBlankViewer'
import MatchingViewer from './MatchingViewer'
import OrderingViewer from './OrderingViewer'
import ReadingComprehensionViewer from './ReadingComprehensionViewer'
import AudioResponseViewer from './AudioResponseViewer'
import ShortAnswerViewer from './ShortAnswerViewer'
import MultipleChoiceViewer from './MultipleChoiceViewer'
import MultipleSelectViewer from './MultipleSelectViewer'

type QuestionWithOptions = Question & { options: QuestionOption[] }

interface PracticeSessionProps {
  skill: string
  topicId: string
}

export default function PracticeSession({ skill, topicId }: PracticeSessionProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState(0)

  // New states for batch processing
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [results, setResults] = useState<Record<string, { isCorrect: boolean, correctAnswer?: any }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const limitParam = topicId ? 50 : 10
        const res = await fetch(`/api/practice/questions?skill=${skill}${topicId ? `&topicId=${topicId}` : ''}&limit=${limitParam}`)
        const data = await res.json()
        if (data.questions) {
          setQuestions(data.questions)
        } else {
          setError(data.error || 'Failed to load questions')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [skill, topicId])

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => {
      const next = { ...prev }
      if (answer === null || answer === undefined) {
        delete next[questionId]
      } else {
        next[questionId] = answer
      }
      return next
    })
  }

  const handleSubmitAll = async () => {
    if (isSubmitting || hasSubmitted) return
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/practice/check-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const data = await res.json()
      
      if (data.success) {
        setResults(data.results)
        setScore(data.totalPointsEarned)
        setHasSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    setIsFinished(true)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C1432E', '#E3A73B', '#4C7A6B', '#1D2B4F']
    })
  }

  interface QuestionGroup {
    audioUrl?: string
    questions: QuestionWithOptions[]
  }

  const groups = useMemo(() => {
    return questions.reduce((acc, q) => {
      const content = typeof q.content === 'string' ? JSON.parse(q.content) : q.content
      const audioUrl = content?.audioUrl
      
      if (acc.length === 0) {
        acc.push({ audioUrl, questions: [q] })
      } else {
        const lastGroup = acc[acc.length - 1]
        if (lastGroup.audioUrl === audioUrl) {
          lastGroup.questions.push(q)
        } else {
          acc.push({ audioUrl, questions: [q] })
        }
      }
      return acc
    }, [] as QuestionGroup[])
  }, [questions])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C1432E] mb-4" />
        <p className="font-mono text-[#6B7A94]">Đang tải dữ liệu luyện tập...</p>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="text-center py-20 bg-[#FFFDF7] border-2 border-[#1D2B4F] p-10 max-w-lg mx-auto mt-20 shadow-[8px_8px_0_#E7DEC9]">
        <h3 className="text-2xl font-bold text-[#1D2B4F] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Trống rỗng!</h3>
        <p className="text-[#C1432E] font-bold mb-8 font-mono">{error || 'Không tìm thấy câu hỏi nào cho kỹ năng này.'}</p>
        <button 
          onClick={() => router.push('/practice')} 
          className="px-8 py-3 bg-[#1D2B4F] text-[#FBF6EC] border-2 border-[#1D2B4F] font-bold font-mono shadow-[4px_4px_0_#C1432E] hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0_#C1432E] transition-all"
        >
          Quay lại Trạm
        </button>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-[#E3A73B] rounded-full border-2 border-[#1D2B4F] flex items-center justify-center mb-8 shadow-[4px_4px_0_#1D2B4F]">
          <CheckCircle size={40} className="text-[#1D2B4F]" />
        </div>
        <h2 className="text-3xl font-bold text-[#1D2B4F] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Hoàn thành phiên luyện tập!</h2>
        <p className="text-[#6B7A94] mb-8 text-lg">Bạn đã kiếm được <strong className="text-[#C1432E]">{score}</strong> điểm XP.</p>
        
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/practice')}
            className="px-8 py-3 bg-[#E7DEC9] text-[#1D2B4F] border-2 border-[#1D2B4F] font-bold font-mono shadow-[2px_2px_0_#1D2B4F] hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0_#1D2B4F] transition-all"
          >
            Về Menu chính
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-3 bg-[#C1432E] text-[#FBF6EC] border-2 border-[#1D2B4F] font-bold font-mono shadow-[2px_2px_0_#1D2B4F] hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0_#1D2B4F] transition-all"
          >
            <RotateCcw size={18} />
            Luyện tiếp
          </button>
        </div>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const correctCount = Object.values(results).filter(r => r.isCorrect).length

  return (
    <div className="max-w-4xl mx-auto py-10 relative pb-32">
      {/* Progress / Status Bar */}
      <div className="flex items-center gap-4 mb-8 sticky top-4 z-10 bg-[var(--paper)] p-4 border-2 border-[#1D2B4F] shadow-[4px_4px_0_#E7DEC9]">
        {!hasSubmitted ? (
          <>
            <span className="font-mono text-sm font-bold text-[#1D2B4F]">
              Đã làm: {String(answeredCount).padStart(2, '0')}/{String(questions.length).padStart(2, '0')}
            </span>
            <div className="flex-1 h-3 bg-[#E7DEC9] border-2 border-[#1D2B4F] overflow-hidden">
              <div 
                className="h-full bg-[#E3A73B] transition-all duration-500" 
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <span className="font-mono text-sm font-bold text-[#1D2B4F]">
              Điểm: {score} XP | Số câu đúng: {correctCount}/{questions.length}
            </span>
            <div className="flex-1 h-3 bg-[#E7DEC9] border-2 border-[#1D2B4F] overflow-hidden">
              <div 
                className="h-full bg-[#4C7A6B] transition-all duration-500" 
                style={{ width: `${(correctCount / questions.length) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-12">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[8px_8px_0_#E7DEC9]">
            {group.audioUrl && (
              <div className="p-4 bg-[#E1E9F2] border-b-2 border-[#1D2B4F] sticky top-[72px] z-20">
                <audio controls src={group.audioUrl} className="w-full h-10" />
              </div>
            )}
            
            <div className="p-8 space-y-10 divide-y-2 divide-dashed divide-[#D8CDAE]">
              {group.questions.map((currentQuestion) => {
                const qResult = results[currentQuestion.id]
                const commonProps = {
                  question: currentQuestion,
                  onAnswerChange: (ans: any) => handleAnswerChange(currentQuestion.id, ans),
                  isSubmitted: hasSubmitted,
                  result: qResult,
                  // Tạm thời giữ onComplete dummy để không làm vỡ các Component chưa sửa
                  onComplete: () => {} 
                }

                return (
                  <div key={currentQuestion.id} className="pt-10 first:pt-0">
                    {currentQuestion.type === 'FILL_IN_BLANK' && <FillInBlankViewer {...commonProps} hideAudio={!!group.audioUrl} />}
                    {currentQuestion.type === 'MATCHING' && <MatchingViewer {...commonProps} />}
                    {currentQuestion.type === 'ORDERING' && <OrderingViewer {...commonProps} />}
                    {currentQuestion.type === 'READING_COMPREHENSION' && <ReadingComprehensionViewer {...commonProps} />}
                    {currentQuestion.type === 'AUDIO_RESPONSE' && <AudioResponseViewer {...commonProps} />}
                    {currentQuestion.type === 'SHORT_ANSWER' && <ShortAnswerViewer {...commonProps} />}
                    {currentQuestion.type === 'MULTIPLE_CHOICE' && <MultipleChoiceViewer {...commonProps} hideAudio={!!group.audioUrl} />}
                    {currentQuestion.type === 'MULTIPLE_SELECT' && <MultipleSelectViewer {...commonProps} />}
                    
                    {['UNKNOWN_TYPE'].includes(currentQuestion.type) && (
                      <div className="text-center py-10">
                        <h3 className="text-xl font-bold text-[#1D2B4F] mb-4">Dạng câu hỏi chưa được hỗ trợ</h3>
                        <p className="text-[#6B7A94] mb-8">{JSON.parse(currentQuestion.content as string).text || 'Nội dung câu hỏi'}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Action Area */}
      <div className="mt-12 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[8px_8px_0_#E7DEC9] p-10 text-center flex flex-col items-center justify-center">
        <h3 className="text-2xl font-serif font-bold text-[#1D2B4F] mb-4">
          {!hasSubmitted ? 'Bạn đã làm xong?' : 'Tuyệt vời!'}
        </h3>
        <p className="text-[#6B7A94] mb-8 max-w-lg">
          {!hasSubmitted 
            ? 'Hãy chắc chắn rằng bạn đã điền hết các đáp án trước khi nộp bài nhé. Bạn có thể kiểm tra lại kết quả sau khi nộp.'
            : 'Bạn có thể xem lại các đáp án đúng ở trên hoặc hoàn tất phiên luyện tập để nhận điểm XP.'}
        </p>

        {!hasSubmitted ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting || answeredCount < questions.length}
              className="px-12 py-5 bg-[#C1432E] text-white font-bold font-mono text-xl border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F] disabled:opacity-50 hover:enabled:translate-y-1 hover:enabled:translate-x-1 hover:enabled:shadow-[2px_2px_0_#1D2B4F] transition-all"
            >
              {isSubmitting ? 'Đang nộp bài...' : 'Nộp Bài & Kiểm Tra'}
            </button>
            {answeredCount < questions.length && (
              <p className="text-[#C1432E] font-bold mt-2 font-mono text-sm animate-pulse">
                * Vui lòng hoàn thành tất cả các câu hỏi để nộp bài
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={handleFinish}
            className="px-12 py-5 bg-[#E3A73B] text-[#1D2B4F] font-bold font-mono text-xl border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_#1D2B4F] transition-all"
          >
            Hoàn Tất Luyện Tập
          </button>
        )}
      </div>
    </div>
  )
}
