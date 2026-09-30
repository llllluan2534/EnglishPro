'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, CheckCircle, XCircle, Clock, RotateCcw, ArrowLeft, Award, HelpCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

export interface ExamResultData {
  id: string
  examId: string
  examTitle: string
  examDescription?: string
  duration: number
  score: number
  maxScore: number
  percentage: number
  isPassed: boolean
  timeSpent: number
  submittedAt: string
  totalQuestions: number
  correctCount: number
  wrongCount: number
  answers: {
    id: string
    index: number
    questionId: string
    skill: string
    type: string
    difficulty: string
    content: any
    explanation?: string
    options: { id: string; text: string; order: number; isCorrect?: boolean }[]
    selectedOptionId?: string | null
    selectedOptionText?: string | null
    correctOptionId?: string | null
    correctOptionText?: string | null
    isCorrect?: boolean | null
    score: number
  }[]
}

interface ExamResultProps {
  data: ExamResultData
}

export default function ExamResult({ data }: ExamResultProps) {
  const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'WRONG'>('ALL')

  useEffect(() => {
    if (data.isPassed) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [data.isPassed])

  const minutes = Math.floor(data.timeSpent / 60)
  const seconds = data.timeSpent % 60
  const formattedTime = `${minutes}m ${seconds}s`

  const filteredAnswers = data.answers.filter((ans) => {
    if (filter === 'CORRECT') return ans.isCorrect === true
    if (filter === 'WRONG') return ans.isCorrect === false
    return true
  })

  return (
    <div className="max-w-4xl mx-auto space-y-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Banner / Score Card */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-8 md:p-10 shadow-[8px_8px_0_#1D2B4F] relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b-2 border-dashed border-[#E7DEC9]">
          <div className="text-center md:text-left">
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest text-[#C1432E] block mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Kết quả bài thi
            </span>
            <h1
              className="text-2xl md:text-3xl font-bold text-[#1D2B4F] mb-2 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {data.examTitle}
            </h1>
            <p className="text-sm text-[#6B7A94]">
              Hoàn thành vào {new Date(data.submittedAt).toLocaleTimeString('vi-VN')} ngày{' '}
              {new Date(data.submittedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Stamp Badge */}
          <div
            className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center -rotate-6 shrink-0 transition-transform ${
              data.isPassed
                ? 'border-[#4C7A6B] bg-[#DCE9E3] text-[#4C7A6B]'
                : 'border-[#C1432E] bg-[#F3DAD3] text-[#C1432E]'
            }`}
          >
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
              {data.isPassed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
            </span>
            <span className="font-serif text-3xl font-black" style={{ fontFamily: "'Fraunces', serif" }}>
              {data.score}
            </span>
            <span className="font-mono text-[9px] text-[#6B7A94]">/ 10 ĐIỂM</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
            <div className="text-xs font-mono text-[#6B7A94] mb-1">Tỷ lệ chính xác</div>
            <div className="text-2xl font-mono font-bold text-[#1D2B4F]">{data.percentage}%</div>
          </div>
          <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
            <div className="text-xs font-mono text-[#6B7A94] mb-1">Câu trả lời đúng</div>
            <div className="text-2xl font-mono font-bold text-[#4C7A6B]">
              {data.correctCount}/{data.totalQuestions}
            </div>
          </div>
          <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
            <div className="text-xs font-mono text-[#6B7A94] mb-1">Thời gian làm</div>
            <div className="text-2xl font-mono font-bold text-[#1D2B4F]">{formattedTime}</div>
          </div>
          <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
            <div className="text-xs font-mono text-[#6B7A94] mb-1">XP nhận được</div>
            <div className="text-2xl font-mono font-bold text-[#C1432E]">
              +{data.isPassed ? (data.percentage === 100 ? 100 : 50) : 20} XP
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-[#E7DEC9]">
          <Link
            href="/exam"
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#1D2B4F] bg-[#FFFDF7] text-[#1D2B4F] font-bold text-sm hover:bg-[#E7DEC9] transition-all shadow-[2px_2px_0_#1D2B4F]"
          >
            <ArrowLeft size={16} />
            <span>Về danh sách đề thi</span>
          </Link>

          <Link
            href={`/exam/${data.examId}`}
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-[#1D2B4F] bg-[#C1432E] text-white font-bold text-sm hover:bg-[#A53826] transition-all shadow-[2px_2px_0_#1D2B4F]"
          >
            <RotateCcw size={16} />
            <span>Làm lại bài thi</span>
          </Link>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-[#D8CDAE]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
              Xem lại chi tiết bài làm
            </h2>
            <p className="text-sm text-[#6B7A94]">Đối chiếu câu trả lời và xem giải thích chi tiết</p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 font-mono text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 border-2 transition-all ${
                filter === 'ALL'
                  ? 'bg-[#1D2B4F] text-white border-[#1D2B4F]'
                  : 'bg-[#FFFDF7] text-[#6B7A94] border-[#E7DEC9] hover:border-[#1D2B4F]'
              }`}
            >
              Tất cả ({data.totalQuestions})
            </button>
            <button
              onClick={() => setFilter('CORRECT')}
              className={`px-3 py-1.5 border-2 transition-all ${
                filter === 'CORRECT'
                  ? 'bg-[#4C7A6B] text-white border-[#4C7A6B]'
                  : 'bg-[#FFFDF7] text-[#4C7A6B] border-[#E7DEC9] hover:border-[#4C7A6B]'
              }`}
            >
              Đúng ({data.correctCount})
            </button>
            <button
              onClick={() => setFilter('WRONG')}
              className={`px-3 py-1.5 border-2 transition-all ${
                filter === 'WRONG'
                  ? 'bg-[#C1432E] text-white border-[#C1432E]'
                  : 'bg-[#FFFDF7] text-[#C1432E] border-[#E7DEC9] hover:border-[#C1432E]'
              }`}
            >
              Sai ({data.wrongCount})
            </button>
          </div>
        </div>

        {/* List of Questions */}
        <div className="space-y-6">
          {filteredAnswers.map((ans) => {
            const content = typeof ans.content === 'string' ? JSON.parse(ans.content) : ans.content
            const passage = content?.passage || null
            const questionText = content?.text || ''
            const letters = ['A', 'B', 'C', 'D', 'E', 'F']

            return (
              <div
                key={ans.id}
                className={`bg-[#FFFDF7] border-2 p-6 md:p-8 shadow-[4px_4px_0_#E7DEC9] ${
                  ans.isCorrect ? 'border-[#4C7A6B]' : 'border-[#C1432E]'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7DEC9]">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-sm text-white ${
                        ans.isCorrect ? 'bg-[#4C7A6B]' : 'bg-[#C1432E]'
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {ans.index}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#6B7A94] uppercase tracking-wider">
                      {ans.skill}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ans.isCorrect ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#4C7A6B]">
                        <CheckCircle size={16} /> Chính xác (+{ans.score} điểm)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C1432E]">
                        <XCircle size={16} /> Chưa chính xác (0 điểm)
                      </span>
                    )}
                  </div>
                </div>

                {/* Passage if any */}
                {passage && (
                  <div className="mb-4 p-4 md:p-5 bg-[#FBF6EC] border border-[#E7DEC9] text-sm text-[#1D2B4F] font-serif leading-relaxed">
                    {content?.passageTitle && (
                      <div className="text-center font-bold text-[#1D2B4F] text-sm md:text-base mb-2 tracking-wide">
                        {content.passageTitle}
                      </div>
                    )}
                    <div className="whitespace-pre-line">{passage}</div>
                  </div>
                )}

                {/* Dạng 2: Sentence ordering block if exists */}
                {content?.sentences && Array.isArray(content.sentences) && (
                  <div className="mb-4 p-4 bg-[#FBF6EC] border border-[#E7DEC9] space-y-1.5">
                    {content.sentences.map((s: { label: string; text: string }, sIdx: number) => (
                      <div key={sIdx} className="flex items-start gap-2 text-xs md:text-sm text-[#1D2B4F] leading-relaxed">
                        <span className="font-mono font-bold text-[#C1432E] shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {s.label}.
                        </span>
                        <span>{s.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Question */}
                <h4
                  className="text-base md:text-lg font-medium text-[#1D2B4F] mb-6 leading-snug whitespace-pre-line"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {questionText}
                </h4>

                {/* Options List */}
                <div className="space-y-2.5 mb-6">
                  {ans.options.map((opt, oIdx) => {
                    const letter = letters[oIdx] || String(oIdx + 1)
                    const isUserChoice = ans.selectedOptionId === opt.id
                    const isTheCorrectOption = opt.isCorrect === true || ans.correctOptionId === opt.id

                    let optionStyle = 'border-[#E7DEC9] bg-[#FFFDF7] text-[#1D2B4F]'
                    if (isTheCorrectOption) {
                      optionStyle = 'border-[#4C7A6B] bg-[#DCE9E3] text-[#1D2B4F] font-semibold'
                    } else if (isUserChoice && !isTheCorrectOption) {
                      optionStyle = 'border-[#C1432E] bg-[#F3DAD3] text-[#1D2B4F]'
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center justify-between p-3.5 border-2 text-sm ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 flex items-center justify-center font-mono font-bold text-xs border ${
                              isTheCorrectOption
                                ? 'bg-[#4C7A6B] text-white border-[#4C7A6B]'
                                : isUserChoice
                                ? 'bg-[#C1432E] text-white border-[#C1432E]'
                                : 'bg-[#FBF6EC] text-[#1D2B4F] border-[#1D2B4F]'
                            }`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {letter}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs font-bold">
                          {isUserChoice && (
                            <span className="px-2 py-0.5 bg-white/70 border border-current text-[11px]">
                              Bạn chọn
                            </span>
                          )}
                          {isTheCorrectOption && (
                            <span className="text-[#4C7A6B] flex items-center gap-1">
                              <CheckCircle size={14} /> Đáp án đúng
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Explanation Box */}
                {ans.explanation && (
                  <div className="p-4 bg-[#FBF6EC] border-l-4 border-[#1D2B4F] text-xs leading-relaxed text-[#1D2B4F]">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[#C1432E] uppercase mb-1">
                      <HelpCircle size={14} />
                      <span>Giải thích chi tiết:</span>
                    </div>
                    <p>{ans.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
