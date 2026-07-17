import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import LessonCreateForm from '@/components/teacher/LessonCreateForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  searchParams: Promise<{ topicId?: string }>
}

export default async function CreateLessonPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const { topicId } = await searchParams

  // Nếu có topicId, hiện tên topic để giáo viên biết đang soạn cho unit nào
  const topic = topicId
    ? await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true, title: true, grade: true } })
    : null

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/teacher/lessons" className="flex items-center gap-1 hover:text-slate-800 transition-colors font-medium">
          <ChevronLeft size={16} /> Quản lý bài học
        </Link>
        {topic && (
          <>
            <span>/</span>
            <span className="font-semibold text-slate-700">{topic.title}</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold">Lớp {topic.grade}</span>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 font-bold">Bài học mới</span>
      </div>

      <LessonCreateForm topicId={topicId ?? ''} />
    </div>
  )
}
