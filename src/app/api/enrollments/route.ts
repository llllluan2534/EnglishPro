import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { topicId } = await req.json()

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    const userId = session.user.id

    // Check if user actually exists in DB (to prevent foreign key errors with stale sessions)
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userExists) {
      return NextResponse.json({ error: 'User not found in DB. Please log in again.' }, { status: 401 })
    }

    // Kiểm tra xem Topic có tồn tại không
    const topic = await prisma.topic.findUnique({
      where: { id: topicId, status: 'PUBLISHED' },
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found or not published' }, { status: 404 })
    }

    // Đăng ký topic
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {}, // Nếu đã đăng ký thì không làm gì cả
      create: {
        userId,
        topicId,
      },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('[ENROLLMENT_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
