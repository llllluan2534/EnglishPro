import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { calculateNextReview } from '@/lib/spaced-repetition'
import { redis } from '@/lib/redis'
import { z } from 'zod'

const reviewSchema = z.object({
  vocabularyId: z.string(),
  quality: z.number().int().min(0).max(5),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { vocabularyId, quality } = parsed.data
  const userId = session.user.id

  const existing = await prisma.flashcardReview.findUnique({
    where: { userId_vocabularyId: { userId, vocabularyId } },
  })

  const currentCard = existing ? {
    easeFactor: existing.easeFactor,
    interval: existing.interval,
    repetitions: existing.repetitions,
    nextReviewAt: existing.nextReviewAt,
  } : {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewAt: new Date(),
  }

  const updated = calculateNextReview(currentCard, quality)

  const saved = await prisma.flashcardReview.upsert({
    where: { userId_vocabularyId: { userId, vocabularyId } },
    update: {
      ...updated,
      lastQuality: quality,
      reviewCount: { increment: 1 },
    },
    create: {
      userId,
      vocabularyId,
      ...updated,
      lastQuality: quality,
      reviewCount: 1,
    },
  })

  if (quality >= 3) {
    const xpAmount = quality >= 4 ? 5 : 3
    await Promise.all([
      prisma.userXP.upsert({
        where: { userId },
        update: {
          totalXP: { increment: xpAmount },
          weeklyXP: { increment: xpAmount },
          monthlyXP: { increment: xpAmount },
        },
        create: { userId, totalXP: xpAmount, weeklyXP: xpAmount, monthlyXP: xpAmount },
      }),
      updateStreak(userId),
      redis.zincrby('leaderboard:weekly', xpAmount, userId),
    ])
  }

  return NextResponse.json({ card: saved, nextReviewAt: updated.nextReviewAt })
}

async function updateStreak(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const streak = await prisma.streak.findUnique({ where: { userId } })
  if (!streak) return

  const lastStudy = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null

  if (lastStudy) {
    lastStudy.setHours(0, 0, 0, 0)
    const diffDays = Math.round((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return
    if (diffDays === 1) {
      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: { increment: 1 },
          longestStreak: { increment: streak.currentStreak + 1 > streak.longestStreak ? 1 : 0 },
          lastStudyDate: new Date(),
        },
      })
    } else {
      await prisma.streak.update({
        where: { userId },
        data: { currentStreak: 1, lastStudyDate: new Date() },
      })
    }
  } else {
    await prisma.streak.update({
      where: { userId },
      data: { currentStreak: 1, lastStudyDate: new Date() },
    })
  }
}
