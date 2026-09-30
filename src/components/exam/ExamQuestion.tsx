'use client'

import { Flag, ArrowLeft, ArrowRight } from 'lucide-react'

export interface QuestionData {
  id: string
  questionId: string
  globalIndex: number
  order: number
  points: number
  skill: string
  type: string
  difficulty: string
  content: any
  options: { id: string; text: string; order: number }[]
  sectionTitle?: string
  sectionInstruction?: string
}

interface ExamQuestionProps {
  question: QuestionData
  totalQuestions: number
  selectedAnswer: any
  isFlagged: boolean
  onSelectAnswer: (questionId: string, answer: any) => void
  onToggleFlag: (questionId: string) => void
  onPrev: () => void
  onNext: () => void
}

const skillLabels: Record<string, string> = {
  READING: 'Đọc hiểu',
  LISTENING: 'Luyện nghe',
  WRITING: 'Kỹ năng viết',
  SPEAKING: 'Ngữ âm & Nói',
  GRAMMAR: 'Ngữ pháp',
  VOCABULARY: 'Từ vựng',
}

const difficultyLabels: Record<string, string> = {
  EASY: 'Cơ bản',
  MEDIUM: 'Trung bình',
  HARD: 'Nâng cao',
}

export default function ExamQuestion({
  question,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onSelectAnswer,
  onToggleFlag,
  onPrev,
  onNext,
}: ExamQuestionProps) {
  const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content
  const passage = content?.passage || null
  const questionText = content?.text || ''

  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#E7DEC9] relative">
      {/* Section info if provided */}
      {question.sectionTitle && (
        <div className="mb-6 pb-4 border-b border-dashed border-[#E7DEC9]">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#C1432E] uppercase block mb-1">
            {question.sectionTitle}
          </span>
          {question.sectionInstruction && (
            <p className="text-xs text-[#6B7A94] italic leading-relaxed">
              {question.sectionInstruction}
            </p>
          )}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 bg-[#1D2B4F] text-[#FFFDF7] rounded-none flex items-center justify-center font-mono font-bold text-base"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {question.globalIndex}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#E1E9F2] text-[#3D5A80] text-[11px] font-mono font-bold">
                {skillLabels[question.skill] || question.skill}
              </span>
              <span className="px-2 py-0.5 bg-[#FBF6EC] border border-[#E7DEC9] text-[#6B7A94] text-[11px] font-mono">
                {difficultyLabels[question.difficulty] || question.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#6B7A94]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {question.points} điểm
          </span>
          <button
            onClick={() => onToggleFlag(question.questionId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono font-bold transition-all cursor-pointer ${
              isFlagged
                ? 'bg-[#F3DAD3] text-[#C1432E] border-[#C1432E]'
                : 'bg-[#FFFDF7] text-[#6B7A94] border-[#E7DEC9] hover:text-[#C1432E] hover:border-[#C1432E]'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Flag size={13} className={isFlagged ? 'fill-[#C1432E]' : ''} />
            <span>{isFlagged ? 'Đã đánh dấu' : 'Xem lại sau'}</span>
          </button>
        </div>
      </div>

      {/* Reading passage or text block if exists */}
      {passage && (
        <div className="mb-6 p-5 md:p-6 bg-[#FBF6EC] border-2 border-[#E7DEC9] shadow-inner max-h-80 overflow-y-auto">
          {content?.passageTitle && (
            <div className="text-center font-bold text-[#1D2B4F] text-base md:text-lg mb-3 tracking-wide" style={{ fontFamily: "'Fraunces', serif" }}>
              {content.passageTitle}
            </div>
          )}
          <div className="font-serif text-[#1D2B4F] text-[15px] leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Fraunces', serif" }}>
            {passage}
          </div>
        </div>
      )}

      {/* Dạng 2: Sentence ordering block if exists */}
      {content?.sentences && Array.isArray(content.sentences) && (
        <div className="mb-6 p-4 md:p-5 bg-[#FBF6EC] border border-[#E7DEC9] space-y-2">
          {content.sentences.map((s: { label: string; text: string }, sIdx: number) => (
            <div key={sIdx} className="flex items-start gap-2.5 text-sm text-[#1D2B4F] leading-relaxed">
              <span className="font-mono font-bold text-[#C1432E] shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {s.label}.
              </span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Question Text */}
      <div className="mb-6">
        <h3
          className="text-lg md:text-xl font-medium text-[#1D2B4F] leading-snug whitespace-pre-line"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {questionText}
        </h3>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((opt, idx) => {
          const letter = letters[idx] || String(idx + 1)
          const isSelected = selectedAnswer === opt.id

          return (
            <div
              key={opt.id}
              onClick={() => onSelectAnswer(question.questionId, opt.id)}
              className={`flex items-center gap-4 p-4 border-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#F3DAD3]/60 border-[#C1432E] shadow-[3px_3px_0_#C1432E]'
                  : 'bg-[#FFFDF7] border-[#E7DEC9] hover:border-[#1D2B4F] hover:bg-[#FDFBF7]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-none border-2 flex items-center justify-center font-mono font-bold text-sm shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#C1432E] text-white border-[#C1432E]'
                    : 'bg-[#FBF6EC] text-[#1D2B4F] border-[#1D2B4F]'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {letter}
              </div>
              <span className="text-[15px] text-[#1D2B4F] font-medium leading-relaxed">
                {opt.text}
              </span>
            </div>
          )
        })}
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between pt-6 border-t-2 border-dashed border-[#E7DEC9]">
        <button
          onClick={onPrev}
          disabled={question.globalIndex === 1}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#1D2B4F] bg-[#FFFDF7] text-[#1D2B4F] font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E7DEC9] transition-colors shadow-[2px_2px_0_#1D2B4F] active:shadow-none"
        >
          <ArrowLeft size={16} />
          <span>Câu trước</span>
        </button>

        <span className="text-xs font-mono text-[#6B7A94]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {question.globalIndex} / {totalQuestions}
        </span>

        <button
          onClick={onNext}
          disabled={question.globalIndex === totalQuestions}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#1D2B4F] bg-[#1D2B4F] text-[#FFFDF7] font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2A3C6D] transition-colors shadow-[2px_2px_0_#C1432E] active:shadow-none"
        >
          <span>Câu tiếp</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
