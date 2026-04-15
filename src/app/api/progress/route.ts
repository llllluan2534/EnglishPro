import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak } from '@/lib/gamification'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lessonId, isCompleted, timeSpent, score } = await req.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    const userId = session.user.id

    // 1. Cập nhật tiến độ bài học
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        isCompleted: isCompleted ?? undefined,
        completedAt: isCompleted ? new Date() : undefined,
        timeSpent: { increment: timeSpent ?? 0 },
        score: score ?? undefined,
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        isCompleted: isCompleted ?? false,
        completedAt: isCompleted ? new Date() : null,
        timeSpent: timeSpent ?? 0,
        score: score ?? null,
      },
    })

    // 2. Nếu bài học vừa hoàn thành, cộng XP và cập nhật streak
    if (isCompleted) {
      await addXP(userId, 'LESSON_COMPLETE', lessonId)
      await updateStreak(userId)
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('[PROGRESS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topicId')

  try {
    const userId = session.user.id

    if (topicId) {
      // Lấy tiến độ tất cả bài học trong một topic
      const progress = await prisma.lessonProgress.findMany({
        where: {
          userId,
          lesson: { topicId },
        },
      })
      return NextResponse.json(progress)
    }

    // Lấy toàn bộ tiến độ của user
    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('[PROGRESS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
