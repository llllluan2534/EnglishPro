'use client'

import { useState, useEffect, use, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import ExamTimer from '@/components/exam/ExamTimer'
import ExamProgress from '@/components/exam/ExamProgress'
import ExamQuestion, { QuestionData } from '@/components/exam/ExamQuestion'

interface Props {
  params: Promise<{ examId: string }>
}

export default function ExamTakingPage({ params }: Props) {
  const router = useRouter()
  const resolvedParams = use(params)
  const examId = resolvedParams.examId

  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set())
  const startTimeRef = useRef<number>(Date.now())

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Flattened questions list with section info
  const [flatQuestions, setFlatQuestions] = useState<QuestionData[]>([])

  useEffect(() => {
    async function fetchExam() {
      try {
        const res = await fetch(`/api/exams/${examId}`)
        const data = await res.json()
        if (!res.ok || data.error) {
          setError(data.error || 'Không thể tải đề thi.')
          return
        }

        setExam(data.exam)

        // Flatten questions across all sections
        const flattened: QuestionData[] = []
        data.exam.sections.forEach((sec: any) => {
          sec.questions.forEach((q: any) => {
            flattened.push({
              ...q,
              sectionTitle: sec.title,
              sectionInstruction: sec.instruction,
            })
          })
        })

        setFlatQuestions(flattened)
        startTimeRef.current = Date.now()
      } catch (err) {
        console.error(err)
        setError('Lỗi kết nối khi tải đề thi.')
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [examId])

  const handleSelectAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleToggleFlag = (questionId: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const actualTimeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))

    try {
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeSpent: actualTimeSpent,
          isAutoSubmit,
        }),
      })

      const data = await res.json()

      if (res.ok && data.attemptId) {
        toast.success('Nộp bài thành công!')
        router.push(`/exam/${examId}/result?attemptId=${data.attemptId}`)
      } else {
        toast.error(data.error || 'Nộp bài thất bại.')
        setIsSubmitting(false)
        setShowSubmitModal(false)
      }
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi xảy ra khi nộp bài.')
      setIsSubmitting(false)
      setShowSubmitModal(false)
    }
  }, [examId, answers, isSubmitting, router])

  const handleTimeUp = useCallback(() => {
    toast.warning('Đã hết thời gian làm bài! Đang tự động nộp bài...')
    handleSubmit(true)
  }, [handleSubmit])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#C1432E]" />
        <p className="font-mono text-sm text-[#6B7A94]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Đang nạp đề thi...
        </p>
      </div>
    )
  }

  if (error || !exam || flatQuestions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F] text-center">
        <AlertCircle size={44} className="text-[#C1432E] mx-auto mb-4" />
        <h2 className="text-xl font-bold font-serif text-[#1D2B4F] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
          Không thể mở đề thi
        </h2>
        <p className="text-sm text-[#6B7A94] mb-6">{error || 'Đề thi này chưa có câu hỏi nào.'}</p>
        <Link
          href="/exam"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1D2B4F] text-white font-mono font-bold text-xs"
        >
          <ArrowLeft size={16} /> Quay lại danh sách đề thi
        </Link>
      </div>
    )
  }

  const currentQuestion = flatQuestions[currentIndex]
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== null).length
  const unansweredCount = flatQuestions.length - answeredCount

  return (
    <div className="min-h-screen bg-[#FBF6EC] pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7] border-b-2 border-[#1D2B4F] px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/exam"
              className="w-9 h-9 border-2 border-[#1D2B4F] bg-[#FBF6EC] flex items-center justify-center text-[#1D2B4F] hover:bg-[#E7DEC9] transition-colors shrink-0 shadow-[2px_2px_0_#1D2B4F]"
              title="Thoát ra danh sách"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C1432E] uppercase block">
                Phòng thi trực tuyến
              </span>
              <h1
                className="text-base md:text-lg font-bold text-[#1D2B4F] truncate max-w-sm md:max-w-md"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {exam.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <ExamTimer
              durationMinutes={exam.duration}
              onTimeUp={handleTimeUp}
              isPaused={isSubmitting}
            />

            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C1432E] text-white font-mono font-bold text-xs md:text-sm border-2 border-[#1D2B4F] hover:bg-[#A53826] transition-all shadow-[2px_2px_0_#1D2B4F] active:shadow-none cursor-pointer"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Send size={15} />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Left Column: Current Question */}
          <div>
            <ExamQuestion
              question={currentQuestion}
              totalQuestions={flatQuestions.length}
              selectedAnswer={answers[currentQuestion.questionId]}
              isFlagged={flaggedIds.has(currentQuestion.questionId)}
              onSelectAnswer={handleSelectAnswer}
              onToggleFlag={handleToggleFlag}
              onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentIndex((prev) => Math.min(flatQuestions.length - 1, prev + 1))}
            />
          </div>

          {/* Right Column: Question Palette */}
          <div className="sticky top-24">
            <ExamProgress
              questions={flatQuestions.map((q) => ({
                id: q.id,
                questionId: q.questionId,
                globalIndex: q.globalIndex,
              }))}
              currentIndex={currentIndex}
              answers={answers}
              flaggedIds={flaggedIds}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />
          </div>
        </div>
      </main>

      {/* Confirmation Modal before Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-[#1D2B4F]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-8 max-w-md w-full shadow-[8px_8px_0_#1D2B4F] animate-in zoom-in-95 duration-200">
            <h3
              className="text-2xl font-bold font-serif text-[#1D2B4F] mb-3"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Xác nhận nộp bài?
            </h3>

            <div className="space-y-3 font-mono text-xs text-[#1D2B4F] mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <div className="flex justify-between p-2.5 bg-[#FBF6EC] border border-[#E7DEC9]">
                <span>Tổng số câu hỏi:</span>
                <b>{flatQuestions.length} câu</b>
              </div>
              <div className="flex justify-between p-2.5 bg-[#FBF6EC] border border-[#E7DEC9]">
                <span>Số câu đã làm:</span>
                <b className="text-[#4C7A6B]">{answeredCount} câu</b>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between p-2.5 bg-[#F3DAD3] border border-[#C1432E] text-[#C1432E]">
                  <span>Số câu CHƯA LÀM:</span>
                  <b>{unansweredCount} câu</b>
                </div>
              )}
            </div>

            <p className="text-xs text-[#6B7A94] mb-6 leading-relaxed">
              Sau khi nộp, bạn sẽ không thể thay đổi đáp án. Hệ thống sẽ chấm điểm và hiển thị kết quả ngay lập tức.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 border-2 border-[#1D2B4F] bg-[#FFFDF7] text-[#1D2B4F] font-mono text-xs font-bold hover:bg-[#E7DEC9] transition-colors"
              >
                Tiếp tục làm bài
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#C1432E] text-white font-mono text-xs font-bold border-2 border-[#1D2B4F] hover:bg-[#A53826] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang chấm điểm...</span>
                  </>
                ) : (
                  <span>Nộp bài ngay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
