import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import LessonClient from './LessonClient'

async function getLessonData(topicId: string, lessonId: string) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId, status: 'PUBLISHED' },
    include: {
      lessons: {
        where: { status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
      }
    }
  })

  if (!topic) return null

  const currentLesson = await prisma.lesson.findUnique({
    where: { id: lessonId, status: 'PUBLISHED' },
    include: {
      contents: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return { topic, currentLesson }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ topicId: string; lessonId: string }> | { topicId: string; lessonId: string }
}) {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const resolvedParams = await Promise.resolve(params)
  const data = await getLessonData(resolvedParams.topicId, resolvedParams.lessonId)

  if (!data || !data.currentLesson || data.currentLesson.topicId !== resolvedParams.topicId) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#FBF6EC]">
      <LessonClient 
        topic={data.topic} 
        currentLesson={data.currentLesson} 
        userId={session.user.id} 
      />
    </div>
  )
}
