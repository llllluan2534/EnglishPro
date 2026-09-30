import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { attemptId } = await params

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            totalPoints: true,
            passingScore: true,
            grade: true,
          }
        },
        answers: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Không tìm thấy kết quả bài thi.' }, { status: 404 })
    }

    // Security check: Only the student who took it, or teacher/admin can view
    if (attempt.userId !== session.user.id && session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Bạn không có quyền xem kết quả này.' }, { status: 403 })
    }

    const totalQuestions = attempt.answers.length
    const correctCount = attempt.answers.filter(a => a.isCorrect).length
    const wrongCount = totalQuestions - correctCount

    const formattedAnswers = attempt.answers.map((ans, idx) => {
      const q = ans.question
      const selectedOptionId = (ans.answer as any)?.selectedOptionId || null
      const selectedOption = q.options.find(o => o.id === selectedOptionId)
      const correctOption = q.options.find(o => o.isCorrect)

      return {
        id: ans.id,
        index: idx + 1,
        questionId: q.id,
        skill: q.skill,
        type: q.type,
        difficulty: q.difficulty,
        content: q.content,
        explanation: q.explanation,
        options: q.options,
        selectedOptionId,
        selectedOptionText: selectedOption?.text || null,
        correctOptionId: correctOption?.id || null,
        correctOptionText: correctOption?.text || null,
        isCorrect: ans.isCorrect,
        score: ans.score,
      }
    })

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        examId: attempt.examId,
        examTitle: attempt.exam.title,
        examDescription: attempt.exam.description,
        duration: attempt.exam.duration,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt,
        totalQuestions,
        correctCount,
        wrongCount,
        answers: formattedAnswers,
      }
    })
  } catch (error) {
    console.error('Error fetching exam attempt:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ khi lấy kết quả bài thi' }, { status: 500 })
  }
}
