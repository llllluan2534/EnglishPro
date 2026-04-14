import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/flashcards/due?topicId=xxx&limit=20
// Lấy danh sách flashcard cần ôn hôm nay
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topicId')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const dueCards = await prisma.flashcardReview.findMany({
    where: {
      userId: session.user.id,
      nextReviewAt: { lte: new Date() },
      ...(topicId && {
        vocabulary: { lesson: { topicId } },
      }),
    },
    include: {
      vocabulary: {
        include: {
          lesson: { select: { title: true, topicId: true } },
        },
      },
    },
    orderBy: { nextReviewAt: 'asc' },
    take: limit,
  })

  return NextResponse.json({ cards: dueCards, total: dueCards.length })
}
