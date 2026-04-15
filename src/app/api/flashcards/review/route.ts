import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { calculateNextReview } from '@/lib/spaced-repetition'
import { addXP, updateStreak } from '@/lib/gamification'
import { z } from 'zod'

const reviewSchema = z.object({
  vocabularyId: z.string(),
  quality: z.number().int().min(0).max(5),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { vocabularyId, quality } = parsed.data
    const userId = session.user.id

    // 1. Lấy thông tin review hiện tại
    const existing = await prisma.flashcardReview.findUnique({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId,
        },
      },
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

    // 2. Tính toán lịch review tiếp theo theo SM-2
    const updated = calculateNextReview(currentCard, quality)

    // 3. Lưu vào DB
    const saved = await prisma.flashcardReview.upsert({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId,
        },
      },
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

    // 4. Cộng XP và cập nhật streak nếu nhớ được bài (quality >= 3)
    if (quality >= 3) {
      let xpAction: 'FLASHCARD_CORRECT' | 'FLASHCARD_EASY' | 'FLASHCARD_HARD' = 'FLASHCARD_CORRECT'
      
      if (quality === 5) xpAction = 'FLASHCARD_EASY'
      if (quality === 3) xpAction = 'FLASHCARD_HARD'

      await addXP(userId, xpAction, vocabularyId)
      await updateStreak(userId)
    }

    return NextResponse.json({ 
      card: saved, 
      nextReviewAt: updated.nextReviewAt 
    })
  } catch (error) {
    console.error('[FLASHCARD_REVIEW_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
