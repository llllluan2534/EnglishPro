'use client'

import { useState, useEffect } from 'react'
import { Lesson, LessonContent, Topic } from '@prisma/client'
import LessonViewer from '@/components/learn/LessonViewer'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Giả sử có sonner để thông báo
import { X, Trophy, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

interface LessonClientProps {
  lesson: Lesson & { contents: LessonContent[]; topic: Topic }
  userId: string
}

export default function LessonClient({ lesson, userId }: LessonClientProps) {
  const [isFinished, setIsFinished] = useState(false)
  const [startTime] = useState(Date.now())
  const router = useRouter()

  const handleComplete = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          isCompleted: true,
          timeSpent,
        }),
      })

      if (res.ok) {
        setIsFinished(true)
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#3b82f6', '#60a5fa']
        })
      } else {
        toast.error('Không thể lưu tiến độ. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      toast.error('Đã có lỗi xảy ra.')
    }
  }

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
          <div className="relative inline-block">
             <div className="w-32 h-32 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-yellow-200 animate-bounce">
               <Trophy size={60} />
             </div>
             <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg">
               +20
             </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 font-outfit">Tuyệt vời quá!</h2>
            <p className="text-gray-500 text-lg font-medium">Bạn đã hoàn thành bài học <br /><span className="text-blue-600">"{lesson.title}"</span></p>
          </div>

          <div className="bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100/50">
             <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">XP Nhận được</p>
                   <p className="text-2xl font-black text-blue-600">+20 XP</p>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Thời gian học</p>
                   <p className="text-2xl font-black text-blue-600">{Math.floor((Date.now() - startTime) / 60000)} phút</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <button 
               onClick={() => router.push(`/learn/${lesson.topicId}`)}
               className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
             >
               Tiếp tục lộ trình
               <ArrowRight size={20} />
             </button>
             <Link 
               href="/dashboard"
               className="w-full py-5 bg-gray-50 text-gray-500 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
             >
               <Home size={20} />
               Về trang chủ
             </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pt-24 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Link 
               href={`/learn/${lesson.topicId}`}
               className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold"
             >
               <X size={20} />
             </Link>
             <div className="h-8 w-[1px] bg-gray-100" />
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{lesson.topic.title}</p>
               <h1 className="text-sm font-bold text-gray-900 font-outfit truncate max-w-[200px] md:max-w-md">{lesson.title}</h1>
             </div>
           </div>

           <div className="flex items-center gap-3">
              <span className="hidden md:flex px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {lesson.skill}
              </span>
           </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <LessonViewer 
          contents={lesson.contents} 
          onComplete={handleComplete} 
        />
      </main>
    </div>
  )
}
