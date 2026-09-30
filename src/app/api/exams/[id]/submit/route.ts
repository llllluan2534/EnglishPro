import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { addXP, updateStreak } from '@/lib/gamification'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để nộp bài.' }, { status: 401 })
    }

    const userId = session.user.id
    const { id: examId } = await params
    const body = await req.json()
    const { answers = {}, timeSpent = 0, isAutoSubmit = false } = body

    // 1. Fetch exam along with questions and options (including isCorrect)
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    options: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!exam || exam.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Đề thi không tồn tại hoặc đã bị đóng.' }, { status: 404 })
    }

    // 2. Chấm điểm từng câu hỏi
    let totalScore = 0
    let maxScore = 0
    const attemptAnswersToCreate: any[] = []

    for (const section of exam.sections) {
      for (const eq of section.questions) {
        const q = eq.question
        const points = eq.points || 1
        maxScore += points

        const studentAnswer = answers[q.id]
        let isCorrect = false
        let pointsEarned = 0

        if (q.type === 'MULTIPLE_CHOICE') {
          const correctOption = q.options.find(o => o.isCorrect)
          if (studentAnswer && correctOption && studentAnswer === correctOption.id) {
            isCorrect = true
            pointsEarned = points
          }
        } else if (q.type === 'MULTIPLE_SELECT') {
          const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id).sort()
          const studentIds = Array.isArray(studentAnswer) ? [...studentAnswer].sort() : []
          if (JSON.stringify(correctIds) === JSON.stringify(studentIds)) {
            isCorrect = true
            pointsEarned = points
          }
        } else if (q.type === 'FILL_IN_BLANK') {
          // Simple fill in blank comparison
          const content = typeof q.content === 'string' ? JSON.parse(q.content) : q.content
          const expected = (content?.expected || '').trim().toLowerCase()
          if (typeof studentAnswer === 'string' && studentAnswer.trim().toLowerCase() === expected) {
            isCorrect = true
            pointsEarned = points
          }
        }

        totalScore += pointsEarned

        attemptAnswersToCreate.push({
          questionId: q.id,
          answer: typeof studentAnswer === 'object' ? studentAnswer : { selectedOptionId: studentAnswer || null },
          isCorrect,
          score: pointsEarned,
          feedback: isCorrect ? 'Chính xác' : 'Chưa chính xác'
        })
      }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
    // Quy đổi điểm hệ 10
    const scoreOnScale10 = maxScore > 0 ? Math.round(((totalScore / maxScore) * 10) * 10) / 10 : 0
    const passingScore = exam.passingScore ?? 50
    const isPassed = percentage >= passingScore

    // 3. Tạo record ExamAttempt và AttemptAnswer trong transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.examAttempt.create({
        data: {
          userId,
          examId,
          score: scoreOnScale10,
          maxScore: 10,
          percentage,
          isPassed,
          timeSpent,
          isAutoSubmit,
          submittedAt: new Date(),
          answers: {
            create: attemptAnswersToCreate
          }
        }
      })

      return createdAttempt
    })

    // 4. Cộng XP và cập nhật chuỗi học
    let xpGained = 0
    try {
      const xpAction = isPassed ? (percentage === 100 ? 'EXAM_PERFECT' : 'EXAM_PASS') : 'LESSON_COMPLETE'
      const xpRes = await addXP(userId, xpAction, exam.id)
      xpGained = xpRes.addedXP
      await updateStreak(userId)
    } catch (err) {
      console.error('Lỗi cộng XP:', err)
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: scoreOnScale10,
      maxScore: 10,
      percentage,
      isPassed,
      timeSpent,
      xpGained,
    })
  } catch (error) {
    console.error('Error submitting exam:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra khi nộp bài thi.' }, { status: 500 })
  }
}
