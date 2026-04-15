import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import LessonClient from './LessonClient'

async function getLessonData(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, status: 'PUBLISHED' },
    include: {
      contents: {
        orderBy: { order: 'asc' },
      },
      topic: true,
    },
  })

  return lesson
}

export default async function LessonPage({
  params,
}: {
  params: { topicId: string; lessonId: string }
}) {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const lesson = await getLessonData(params.lessonId)

  if (!lesson || lesson.topicId !== params.topicId) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <LessonClient lesson={lesson} userId={session.user.id} />
    </div>
  )
}
