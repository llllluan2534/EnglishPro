import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const grade = searchParams.get('grade')
    const type = searchParams.get('type')

    const where: any = {
      status: 'PUBLISHED',
    }

    if (grade && grade !== 'ALL') {
      where.grade = parseInt(grade)
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true }
        },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              select: { id: true, points: true }
            }
          }
        },
        ...(session?.user?.id ? {
          attempts: {
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              score: true,
              maxScore: true,
              percentage: true,
              isPassed: true,
              submittedAt: true,
              timeSpent: true,
            }
          }
        } : {})
      }
    })

    const formattedExams = exams.map(exam => {
      let totalQuestions = 0
      exam.sections.forEach(s => {
        totalQuestions += s.questions.length
      })

      const bestAttempt = exam.attempts?.length
        ? exam.attempts.reduce((prev, current) => ((current.score ?? 0) > (prev.score ?? 0) ? current : prev))
        : null

      const latestAttempt = exam.attempts?.[0] || null

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        grade: exam.grade,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        passingScore: exam.passingScore,
        authorName: exam.author.name,
        totalSections: exam.sections.length,
        totalQuestions,
        totalAttempts: exam.attempts?.length || 0,
        bestAttempt,
        latestAttempt,
      }
    })

    return NextResponse.json({ exams: formattedExams })
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}
