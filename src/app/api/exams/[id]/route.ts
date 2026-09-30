import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: { order: 'asc' },
                      select: {
                        id: true,
                        text: true,
                        order: true,
                        // DO NOT EXPOSE isCorrect TO CLIENT DURING EXAM!
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!exam || exam.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Đề thi không tồn tại hoặc chưa được công bố.' }, { status: 404 })
    }

    // Format safe exam object for taking exam
    let globalIndex = 0
    const safeSections = exam.sections.map(section => ({
      id: section.id,
      title: section.title,
      instruction: section.instruction,
      order: section.order,
      skill: section.skill,
      timeLimit: section.timeLimit,
      questions: section.questions.map(eq => {
        globalIndex++
        return {
          id: eq.id,
          questionId: eq.question.id,
          globalIndex,
          order: eq.order,
          points: eq.points,
          skill: eq.question.skill,
          type: eq.question.type,
          difficulty: eq.question.difficulty,
          content: eq.question.content,
          options: eq.question.options,
        }
      })
    }))

    const totalQuestions = safeSections.reduce((acc, s) => acc + s.questions.length, 0)

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        grade: exam.grade,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        passingScore: exam.passingScore,
        totalQuestions,
        sections: safeSections,
      }
    })
  } catch (error) {
    console.error('Error fetching exam by id:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ khi lấy dữ liệu đề thi' }, { status: 500 })
  }
}
