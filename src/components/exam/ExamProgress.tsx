'use client'

import { useState } from 'react'
import { Flag, CheckCircle2, CircleDashed } from 'lucide-react'

interface QuestionSummary {
  id: string
  questionId: string
  globalIndex: number
}

interface ExamProgressProps {
  questions: QuestionSummary[]
  currentIndex: number
  answers: Record<string, any>
  flaggedIds: Set<string>
  onSelectQuestion: (index: number) => void
}

export default function ExamProgress({
  questions,
  currentIndex,
  answers,
  flaggedIds,
  onSelectQuestion,
}: ExamProgressProps) {
  const [filter, setFilter] = useState<'ALL' | 'UNANSWERED' | 'FLAGGED'>('ALL')

  const total = questions.length
  const answeredCount = questions.filter(q => answers[q.questionId] !== undefined && answers[q.questionId] !== null && answers[q.questionId] !== '').length
  const unansweredCount = total - answeredCount
  const flaggedCount = flaggedIds.size

  const filteredQuestions = questions.filter(q => {
    const isAnswered = answers[q.questionId] !== undefined && answers[q.questionId] !== null && answers[q.questionId] !== ''
    if (filter === 'UNANSWERED') return !isAnswered
    if (filter === 'FLAGGED') return flaggedIds.has(q.questionId)
    return true
  })

  return (
    <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-5 shadow-[4px_4px_0_#E7DEC9]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E7DEC9]">
        <h3 className="font-serif font-bold text-[#1D2B4F] text-lg" style={{ fontFamily: "'Fraunces', serif" }}>
          Bảng câu hỏi
        </h3>
        <span className="font-mono text-xs font-bold text-[#6B7A94]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {answeredCount}/{total} câu
        </span>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="p-2 border border-[#E7DEC9] bg-[#FBF6EC]">
          <div className="text-[#4C7A6B] font-bold text-sm">{answeredCount}</div>
          <div className="text-[10px] text-[#6B7A94]">Đã làm</div>
        </div>
        <div className="p-2 border border-[#E7DEC9] bg-[#FBF6EC]">
          <div className="text-[#C1432E] font-bold text-sm">{unansweredCount}</div>
          <div className="text-[10px] text-[#6B7A94]">Chưa làm</div>
        </div>
        <div className="p-2 border border-[#E7DEC9] bg-[#FBF6EC]">
          <div className="text-[#E3A73B] font-bold text-sm">{flaggedCount}</div>
          <div className="text-[10px] text-[#6B7A94]">Đánh dấu</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 pb-2 border-b border-dashed border-[#E7DEC9] text-xs font-mono font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-2.5 py-1 text-[11px] transition-colors ${
            filter === 'ALL'
              ? 'bg-[#1D2B4F] text-white'
              : 'text-[#6B7A94] hover:text-[#1D2B4F] hover:bg-[#FBF6EC]'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('UNANSWERED')}
          className={`px-2.5 py-1 text-[11px] transition-colors ${
            filter === 'UNANSWERED'
              ? 'bg-[#1D2B4F] text-white'
              : 'text-[#6B7A94] hover:text-[#1D2B4F] hover:bg-[#FBF6EC]'
          }`}
        >
          Chưa làm ({unansweredCount})
        </button>
        <button
          onClick={() => setFilter('FLAGGED')}
          className={`px-2.5 py-1 text-[11px] transition-colors ${
            filter === 'FLAGGED'
              ? 'bg-[#1D2B4F] text-white'
              : 'text-[#6B7A94] hover:text-[#1D2B4F] hover:bg-[#FBF6EC]'
          }`}
        >
          Đánh dấu ({flaggedCount})
        </button>
      </div>

      {/* Questions Palette Grid */}
      <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
        {filteredQuestions.map((q) => {
          const index = q.globalIndex - 1
          const isAnswered = answers[q.questionId] !== undefined && answers[q.questionId] !== null && answers[q.questionId] !== ''
          const isCurrent = currentIndex === index
          const isFlagged = flaggedIds.has(q.questionId)

          return (
            <button
              key={q.questionId}
              onClick={() => onSelectQuestion(index)}
              className={`relative h-10 w-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all cursor-pointer ${
                isCurrent
                  ? 'border-[#C1432E] ring-2 ring-[#C1432E]/30 scale-105 z-10'
                  : 'border-[#1D2B4F]'
              } ${
                isAnswered
                  ? 'bg-[#1D2B4F] text-white hover:bg-[#2A3C6D]'
                  : 'bg-[#FFFDF7] text-[#1D2B4F] hover:bg-[#FBF6EC]'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {q.globalIndex}
              {isFlagged && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#C1432E] rounded-full border border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-3 border-t border-[#E7DEC9] text-[11px] font-mono text-[#6B7A94] flex flex-wrap gap-x-4 gap-y-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-[#1D2B4F] border border-[#1D2B4F] inline-block" /> Đã làm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-[#FFFDF7] border border-[#1D2B4F] inline-block" /> Chưa làm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-[#C1432E] inline-block" /> Đang chọn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C1432E] inline-block" /> Đánh dấu
        </span>
      </div>
    </div>
  )
}
