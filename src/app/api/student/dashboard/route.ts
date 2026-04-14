import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [userXP, streak, dueCount, recentProgress] = await Promise.all([
    // XP và level
    prisma.userXP.findUnique({ where: { userId } }),

    // Streak ngày học
    prisma.streak.findUnique({ where: { userId } }),

    // Số flashcard cần ôn hôm nay
    prisma.flashcardReview.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    }),

    // Bài học đã học gần đây
    prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: { lastAccessedAt: 'desc' },
      take: 5,
      include: {
        lesson: {
          select: {
            title: true, skill: true, difficulty: true,
            topic: { select: { title: true } },
          },
        },
      },
    }),
  ])

  // Tính toán level (giả định tuyến tính để đơn giản hơn hoặc theo log cơ số)
  // EF: Level = floor(sqrt(totalXP / 50)) + 1 -> Level 10 @ 5000 XP
  const totalXP = userXP?.totalXP ?? 0
  const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 50)))
  
  // XP tính theo nấc thang để lên level tiếp theo
  const currentLevelXPThreshold = Math.pow(level, 2) * 50
  const nextLevelXPThreshold = Math.pow(level + 1, 2) * 50
  const progress = totalXP - currentLevelXPThreshold
  const needed = nextLevelXPThreshold - currentLevelXPThreshold

  return NextResponse.json({
    xp: { total: totalXP, level, progress, needed },
    streak: { current: streak?.currentStreak ?? 0, longest: streak?.longestStreak ?? 0 },
    dueFlashcards: dueCount,
    recentLessons: recentProgress,
  })
}
