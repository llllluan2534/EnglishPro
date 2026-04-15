import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Play, CheckCircle2, Lock, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getTopicWithLessons(topicId: string, userId: string) {
  const [topic, lessonProgress] = await Promise.all([
    prisma.topic.findUnique({
      where: { id: topicId, status: 'PUBLISHED' },
      include: {
        lessons: {
          where: { status: 'PUBLISHED' },
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, lesson: { topicId } },
    }),
  ])

  if (!topic) return null

  // Map progress to lessons
  const lessonsWithProgress = topic.lessons.map((lesson) => {
    const progress = lessonProgress.find((p) => p.lessonId === lesson.id)
    return {
      ...lesson,
      isCompleted: progress?.isCompleted ?? false,
    }
  })

  return { ...topic, lessons: lessonsWithProgress }
}

export default async function TopicPage({
  params,
}: {
  params: { topicId: string }
}) {
  const session = await auth()
  if (!session) return null

  const topicId = params.topicId
  const topic = await getTopicWithLessons(topicId, session.user.id)

  if (!topic) {
    notFound()
  }

  const completedCount = topic.lessons.filter((l) => l.isCompleted).length
  const progressPercent = topic.lessons.length > 0
    ? Math.round((completedCount / topic.lessons.length) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Back Button & Header */}
      <div className="space-y-6">
        <Link 
          href="/learn" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 px-4 py-2 rounded-xl border border-gray-100"
        >
          <ChevronLeft size={16} />
          Quay lại lộ trình
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 font-outfit">{topic.title}</h1>
            <p className="text-gray-500 text-lg max-w-2xl">{topic.description}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm min-w-[200px]">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              <span>Tiến độ</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 px-2">Danh sách bài học</h2>
        <div className="grid gap-4">
          {topic.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/learn/${topicId}/${lesson.id}`}
              className={cn(
                "group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300",
                lesson.isCompleted 
                  ? "bg-white border-blue-100 shadow-sm" 
                  : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              )}
            >
              {/* index badge */}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 transition-colors",
                lesson.isCompleted
                  ? "bg-blue-50 text-blue-600"
                  : "bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white"
              )}>
                {index + 1}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {lesson.skill}
                  </span>
                  {lesson.isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-500">
                      <CheckCircle2 size={10} />
                      Hoàn thành
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 truncate font-outfit">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Clock size={14} />
                      <span>{lesson.duration || 15} phút</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <BookOpen size={14} />
                      <span>{lesson.difficulty}</span>
                   </div>
                </div>
              </div>

              {/* action button */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                lesson.isCompleted
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600"
              )}>
                {lesson.isCompleted ? (
                   <CheckCircle2 size={24} />
                ) : (
                   <Play size={24} fill="currentColor" className="ml-1" />
                )}
              </div>
            </Link>
          ))}

          {topic.lessons.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
               <p className="text-gray-400 font-bold">Chưa có bài học nào trong chủ đề này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
