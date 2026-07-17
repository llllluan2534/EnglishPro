import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, BookOpen, Music, Mic, Globe, CheckCircle2, Clock, 
  ChevronRight, FileVideo 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skill, ContentStatus } from '@prisma/client'

async function getLessons() {
  return prisma.lesson.findMany({
    include: {
      topic: { select: { id: true, title: true, grade: true } },
      author: { select: { name: true } },
      _count: { select: { contents: true, vocabularies: true, examQuestions: true } },
    },
    orderBy: [{ topic: { grade: 'asc' } }, { order: 'asc' }],
  })
}

const SKILL_META: Record<Skill, { label: string; icon: React.ReactNode; color: string }> = {
  READING:    { label: 'Đọc',     icon: <BookOpen size={13} />,  color: 'text-blue-600 bg-blue-50 border-blue-100' },
  LISTENING:  { label: 'Nghe',    icon: <Music size={13} />,     color: 'text-purple-600 bg-purple-50 border-purple-100' },
  SPEAKING:   { label: 'Nói',     icon: <Mic size={13} />,       color: 'text-orange-600 bg-orange-50 border-orange-100' },
  WRITING:    { label: 'Viết',    icon: <Globe size={13} />,     color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  GRAMMAR:    { label: 'Ngữ pháp',icon: <BookOpen size={13} />,  color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  VOCABULARY: { label: 'Từ vựng', icon: <FileVideo size={13} />, color: 'text-rose-600 bg-rose-50 border-rose-100' },
}

const STATUS_META: Record<ContentStatus, { label: string; icon: React.ReactNode; color: string }> = {
  DRAFT:     { label: 'Nháp',         icon: <Clock size={12} />,       color: 'text-slate-500 bg-slate-100' },
  PENDING:   { label: 'Chờ duyệt',    icon: <Clock size={12} />,       color: 'text-amber-600 bg-amber-50' },
  PUBLISHED: { label: 'Đã xuất bản',  icon: <CheckCircle2 size={12} />,color: 'text-emerald-600 bg-emerald-50' },
  ARCHIVED:  { label: 'Lưu trữ',      icon: <Clock size={12} />,       color: 'text-slate-400 bg-slate-50' },
}

export default async function LessonsPage() {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const lessons = await getLessons()

  // Nhóm theo chủ đề
  const grouped = lessons.reduce<Record<string, typeof lessons>>((acc, lesson) => {
    const key = lesson.topic.id
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Bài học</h1>
          <p className="text-slate-500 text-sm mt-1">
            {lessons.length} bài học trong {Object.keys(grouped).length} chủ đề
          </p>
        </div>
        <Link href="/teacher/lessons/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors shrink-0">
          <Plus size={18} /> Soạn bài học mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Đã xuất bản', value: lessons.filter(l => l.status === 'PUBLISHED').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Đang soạn',   value: lessons.filter(l => l.status === 'DRAFT').length,     color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
          { label: 'Tổng câu hỏi',value: lessons.reduce((s, l) => s + l._count.examQuestions, 0), color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-2xl border p-5 shadow-sm', s.bg)}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className={cn('text-3xl font-extrabold tracking-tight mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 text-center flex flex-col items-center gap-4">
          <BookOpen className="text-slate-300" size={48} />
          <div>
            <p className="text-slate-600 font-bold text-lg">Chưa có bài học nào</p>
            <p className="text-slate-400 text-sm mt-1">Nhấn "Soạn bài học mới" để bắt đầu.</p>
          </div>
          <Link href="/teacher/lessons/create"
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors mt-2 flex items-center gap-2">
            <Plus size={16} /> Soạn ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([topicId, topicLessons]) => {
            const topic = topicLessons[0].topic
            return (
              <section key={topicId}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-bold text-slate-700 text-lg">{topic.title}</h2>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold">Lớp {topic.grade}</span>
                  <span className="text-xs text-slate-400 font-medium">{topicLessons.length} bài</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {topicLessons.map((lesson) => {
                    const skillM = SKILL_META[lesson.skill]
                    const statusM = STATUS_META[lesson.status]
                    return (
                      <Link key={lesson.id} href={`/lessons/${lesson.id}`}
                        className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                        <div className="w-8 h-8 flex items-center justify-center text-slate-400 font-black text-sm shrink-0">
                          {lesson.order}
                        </div>
                        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0', skillM.color)}>
                          {skillM.icon} {skillM.label}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{lesson.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {lesson._count.contents} block nội dung · {lesson._count.examQuestions} câu hỏi
                          </p>
                        </div>
                        <div className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0', statusM.color)}>
                          {statusM.icon} {statusM.label}
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
