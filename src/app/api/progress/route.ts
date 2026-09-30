import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lấy XP History của 7 ngày gần nhất (từ thứ 2 đến chủ nhật tuần này)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() + diffToMonday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const history = await prisma.xPHistory.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    })

    // Khởi tạo mảng tuần
    const weekMap = {
      1: { day: 'T2', xp: 0 },
      2: { day: 'T3', xp: 0 },
      3: { day: 'T4', xp: 0 },
      4: { day: 'T5', xp: 0 },
      5: { day: 'T6', xp: 0 },
      6: { day: 'T7', xp: 0 },
      0: { day: 'CN', xp: 0 },
    }

    history.forEach(record => {
      const day = record.createdAt.getDay() as keyof typeof weekMap
      if (weekMap[day]) {
        weekMap[day].xp += record.amount
      }
    })

    const week = [
      weekMap[1],
      weekMap[2],
      weekMap[3],
      weekMap[4],
      weekMap[5],
      weekMap[6],
      weekMap[0]
    ]

    const todayStr = weekMap[now.getDay() as keyof typeof weekMap].day
    const maxXp = Math.max(100, ...week.map(d => d.xp))

    // Lấy Best skill tạm thời mock hoặc query thêm nếu cần. Ở đây query lesson progress để tìm skill tốt nhất:
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id, isCompleted: true },
      include: { lesson: true }
    })
    
    const skillScores: Record<string, { total: number, count: number }> = {}
    lessonProgress.forEach(lp => {
      if (lp.score !== null) {
        const skill = lp.lesson.skill
        if (!skillScores[skill]) skillScores[skill] = { total: 0, count: 0 }
        skillScores[skill].total += lp.score
        skillScores[skill].count += 1
      }
    })
    
    let bestSkill = 'Chưa có dữ liệu'
    let bestScore = 0
    for (const [skill, stats] of Object.entries(skillScores)) {
      const avg = stats.total / stats.count
      if (avg > bestScore) {
        bestScore = avg
        bestSkill = skill
      }
    }

    // Map enum to readable
    const skillNameMap: Record<string, string> = {
      'READING': 'Đọc hiểu',
      'LISTENING': 'Nghe hiểu',
      'WRITING': 'Viết luận',
      'SPEAKING': 'Phát âm',
      'GRAMMAR': 'Ngữ pháp',
      'VOCABULARY': 'Từ vựng'
    }

    return NextResponse.json({
      week,
      today: todayStr,
      maxXp,
      bestSkill: skillNameMap[bestSkill] || bestSkill,
      bestScore: Math.round(bestScore)
    })

  } catch (error) {
    console.error('Progress error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { lessonId, isCompleted, timeSpent, score } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Check if already completed previously to avoid duplicate XP
    const existing = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        }
      }
    })

    const wasAlreadyCompleted = existing?.isCompleted === true

    // Upsert LessonProgress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        }
      },
      update: {
        isCompleted: isCompleted ?? true,
        completedAt: isCompleted ? new Date() : existing?.completedAt,
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
        score: score !== undefined ? score : undefined,
        lastAccessedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId,
        isCompleted: isCompleted ?? true,
        completedAt: isCompleted ? new Date() : null,
        timeSpent: timeSpent || 0,
        score: score ?? null,
        lastAccessedAt: new Date(),
      }
    })

    // Award XP and update streak only if newly completed
    let xpAwarded = 0
    if (isCompleted && !wasAlreadyCompleted) {
      const { addXP, updateStreak } = await import('@/lib/gamification')
      await addXP(session.user.id, 'LESSON_COMPLETE', lessonId)
      await updateStreak(session.user.id)
      xpAwarded = 20
    }

    return NextResponse.json({
      success: true,
      progress,
      xpAwarded,
    })
  } catch (error) {
    console.error('Save progress error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}

