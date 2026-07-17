'use client'

import { useState } from 'react'
import { Lesson, LessonContent, Topic } from '@prisma/client'
import LessonViewer from '@/components/learn/LessonViewer'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trophy, ArrowRight, Home, CheckCircle2, Play } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

interface LessonClientProps {
  topic: Topic & { lessons: Lesson[] }
  currentLesson: Lesson & { contents: LessonContent[] }
  userId: string
}

export default function LessonClient({ topic, currentLesson, userId }: LessonClientProps) {
  const [isFinished, setIsFinished] = useState(false)
  const [startTime] = useState(Date.now())
  const router = useRouter()

  const currentIndex = topic.lessons.findIndex(l => l.id === currentLesson.id)
  const prevLesson = currentIndex > 0 ? topic.lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < topic.lessons.length - 1 ? topic.lessons[currentIndex + 1] : null

  const handleComplete = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
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
            <p className="text-gray-500 text-lg font-medium">Bạn đã hoàn thành bài học <br /><span className="text-blue-600">"{currentLesson.title}"</span></p>
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
              onClick={() => router.push(`/learn/${topic.id}`)}
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
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-lesson {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          min-height: 100vh;
          padding-bottom: 80px;
        }
        .studio-lesson * { box-sizing:border-box; }
        
        .studio-lesson .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-lesson .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-lesson .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-lesson .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-lesson .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-lesson .page-head { margin-bottom: 44px; }
        .studio-lesson .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }

        @media (max-width:860px){
          .studio-lesson .page {padding-left:56px;} .studio-lesson .margin-rule {left:24px;}
        }
        `
      }} />

      <div className="studio-lesson">
        <div className="page">
          <div className="margin-rule"></div>

          <div className="page-head">
            <Link
              href={`/learn/${topic.id}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7A94] hover:text-[#1D2B4F] hover:bg-[#E7DEC9]/30 transition-colors px-3 py-1.5 border border-[#6B7A94] mb-8 uppercase tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              &larr; Quay lại lộ trình
            </Link>

            <div className="eyebrow">{topic.title} &middot; {currentLesson.skill}</div>
            <h1>{currentLesson.title}</h1>
          </div>

          <div className="main-content relative z-10">
            <LessonViewer
              contents={currentLesson.contents}
              onComplete={handleComplete}
              prevLessonId={prevLesson?.id}
              nextLessonId={nextLesson?.id}
              topicId={topic.id}
            />
          </div>
        </div>
      </div>
    </>
  )
}
