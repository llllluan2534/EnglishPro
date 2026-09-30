'use client'

import { useState } from 'react'
import { LessonContent } from '@prisma/client'
import MultipleChoice from './MultipleChoice'
import FlashcardSetBlock from './FlashcardSetBlock'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'

interface LessonViewerProps {
  contents: LessonContent[]
  onComplete: (score?: number) => void
  prevLessonId?: string
  nextLessonId?: string
  topicId?: string
}

export default function LessonViewer({ contents, onComplete, prevLessonId, nextLessonId, topicId }: LessonViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  const currentBlock = contents[currentPage]
  const isLastPage = currentPage === contents.length - 1

  const handleNext = () => {
    if (currentPage < contents.length - 1) {
      setCurrentPage(c => c + 1)
      window.scrollTo(0, 0)
    } else {
      let score = undefined
      const answeredKeys = Object.keys(answers)
      if (answeredKeys.length > 0) {
        const correctAnswers = Object.values(answers).filter(Boolean).length
        score = (correctAnswers / answeredKeys.length) * 100
      }
      onComplete(score)
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(c => c - 1)
      window.scrollTo(0, 0)
    } else if (prevLessonId && topicId) {
      window.location.href = `/learn/${topicId}/${prevLessonId}`
    }
  }

  const handleNextLesson = () => {
    if (nextLessonId && topicId) {
      window.location.href = `/learn/${topicId}/${nextLessonId}`
    }
  }

  const canGoPrev = currentPage > 0 || !!prevLessonId
  const canGoNext = !isLastPage || !!nextLessonId

  const renderContent = (block: LessonContent) => {
    const data = block.content as any

    switch (block.type) {
      case 'text':
        return (
          <div
            className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        )
      case 'image':
        return (
          <div className="space-y-3">
            <img
              src={data.url}
              alt={data.caption || 'Lesson image'}
              className="rounded-[2rem] border-4 border-white shadow-xl w-full object-cover"
            />
            {data.caption && (
              <p className="text-center text-sm font-medium text-gray-400 italic">{data.caption}</p>
            )}
          </div>
        )
      case 'video':
        return (
          <div className="aspect-video rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-black">
            <iframe
              src={data.url}
              className="w-full h-full"
              allowFullScreen
              title="Lesson Video"
            />
          </div>
        )
      case 'audio':
        return (
          <div className="bg-[#FFFDF7] border-2 border-[#E7DEC9] shadow-[4px_4px_0_#E7DEC9] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-outfit font-bold text-[#1D2B4F] text-lg">🎧 Bài nghe (Audio)</h3>
            </div>
            <audio controls className="w-full mb-4">
              <source src={data.url} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ thẻ audio.
            </audio>
            {data.transcript && (
              <div className="mt-4 pt-4 border-t border-dashed border-[#E7DEC9] text-[15px] text-[#6B7A94] italic font-serif">
                <strong>Transcript: </strong> {data.transcript}
              </div>
            )}
          </div>
        )
      case 'multiple_choice':
        return (
          <MultipleChoice
            questionText={data.question}
            options={data.options}
            explanation={data.explanation}
            onAnswer={(isCorrect) => {
              setAnswers(prev => ({ ...prev, [block.id]: isCorrect }))
            }}
          />
        )
      case 'flashcard_set':
        return <FlashcardSetBlock cards={data.cards} />
      default:
        return <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 font-medium">Định dạng nội dung [{block.type}] chưa hỗ trợ.</div>
    }
  }

  const progress = ((currentPage + 1) / contents.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Progress Bar */}
      <div className="sticky top-6 z-10">
        <div className="bg-[#FFFDF7] p-4 border border-[#E7DEC9] shadow-sm">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[#C1432E] mb-3 font-mono">
            <span>Bài học: Trang {currentPage + 1}/{contents.length}</span>
            <span>{Math.round(progress)}% hoàn thành</span>
          </div>
          <div className="h-1.5 w-full bg-[#FBF6EC] overflow-hidden">
            <div
              className="h-full bg-[#1D2B4F] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentBlock && renderContent(currentBlock)}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-[34px]">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="h-[68px] px-8 flex items-center justify-center gap-2 border border-[#E7DEC9] text-[#6B7A94] bg-transparent hover:text-[#1D2B4F] hover:bg-[#E7DEC9]/30 disabled:text-[#CBD5E1] disabled:hover:bg-transparent disabled:pointer-events-none transition-colors font-bold uppercase text-sm tracking-widest font-mono"
          >
            <ChevronLeft size={16} />
            Trang trước
          </button>

          <button
            onClick={!isLastPage ? handleNext : handleNextLesson}
            disabled={!canGoNext}
            className="h-[68px] px-8 flex items-center justify-center gap-2 border border-[#E7DEC9] text-[#6B7A94] bg-transparent hover:text-[#1D2B4F] hover:bg-[#E7DEC9]/30 disabled:text-[#CBD5E1] disabled:hover:bg-transparent disabled:pointer-events-none transition-colors font-bold uppercase text-sm tracking-widest font-mono"
          >
            Trang sau
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isLastPage && (
            <button
              onClick={() => {
                let score = undefined
                const answeredKeys = Object.keys(answers)
                if (answeredKeys.length > 0) {
                  const correctAnswers = Object.values(answers).filter(Boolean).length
                  score = (correctAnswers / answeredKeys.length) * 100
                }
                onComplete(score)
              }}
              className="h-[68px] px-8 flex items-center justify-center gap-3 font-bold uppercase text-sm tracking-widest font-mono transition-colors border border-[#4C7A6B] bg-[#4C7A6B] text-[#FFFDF7] hover:bg-[#3d6356]"
            >
              <CheckCircle2 size={16} />
              Hoàn thành
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
