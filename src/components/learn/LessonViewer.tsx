'use client'

import { useState } from 'react'
import { LessonContent } from '@prisma/client'
import MultipleChoice from './MultipleChoice'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'

interface LessonViewerProps {
  contents: LessonContent[]
  onComplete: () => void
}

export default function LessonViewer({ contents, onComplete }: LessonViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  const currentBlock = contents[currentPage]
  const isLastPage = currentPage === contents.length - 1

  const handleNext = () => {
    if (currentPage < contents.length - 1) {
      setCurrentPage(c => c + 1)
      window.scrollTo(0, 0)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(c => c - 1)
      window.scrollTo(0, 0)
    }
  }

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
      default:
        return <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 font-medium">Định dạng nội dung [{block.type}] chưa hỗ trợ.</div>
    }
  }

  const progress = ((currentPage + 1) / contents.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Progress Bar */}
      <div className="sticky top-6 z-10 px-4">
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-xl shadow-blue-900/5">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 mb-2">
             <span>Bài học: Trang {currentPage + 1}/{contents.length}</span>
             <span>{Math.round(progress)}% hoàn thành</span>
           </div>
           <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
               style={{ width: `${progress}%` }}
             />
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/50 rounded-[3rem] p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentBlock && renderContent(currentBlock)}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-3xl border border-white/50 shadow-2xl z-20">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="w-14 h-14 flex items-center justify-center rounded-2xl border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-white hover:border-blue-100 disabled:opacity-20 transition-all font-bold"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className={cn(
             "h-14 px-8 flex items-center gap-3 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]",
             isLastPage 
                ? "bg-green-500 text-white shadow-green-200 hover:bg-green-600" 
                : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
          )}
        >
          {isLastPage ? (
            <>
              <CheckCircle2 size={20} />
              Hoàn thành bài học
            </>
          ) : (
            <>
              Trang tiếp theo
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
