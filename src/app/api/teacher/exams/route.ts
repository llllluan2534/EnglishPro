import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { ExamType, ContentStatus, Skill, QuestionType, Difficulty } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Không có quyền thực hiện thao tác này' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      description,
      type = 'NATIONAL_MOCK',
      grade = 12,
      duration = 50,
      passingScore = 5,
      status = 'PUBLISHED',
      questionIds = [],
      newQuestions = [],
    } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Tiêu đề đề thi là bắt buộc' }, { status: 400 })
    }

    // 1. Tạo các câu hỏi mới vào DB nếu có
    const newlyCreatedQuestionIds: { id: string; points: number }[] = []

    if (Array.isArray(newQuestions) && newQuestions.length > 0) {
      for (const q of newQuestions) {
        if (!q.text || !q.text.trim()) continue

        const skillVal = (Object.values(Skill).includes(q.skill) ? q.skill : 'READING') as Skill
        const diffVal = (Object.values(Difficulty).includes(q.difficulty) ? q.difficulty : 'MEDIUM') as Difficulty
        const typeVal = (Object.values(QuestionType).includes(q.type) ? q.type : 'MULTIPLE_CHOICE') as QuestionType
        const qPoints = Number(q.points) > 0 ? Number(q.points) : 1

        const createdQuestion = await prisma.question.create({
          data: {
            authorId: session.user.id,
            skill: skillVal,
            type: typeVal,
            difficulty: diffVal,
            points: qPoints,
            status: ContentStatus.PUBLISHED,
            content: {
              text: q.text.trim(),
              ...(q.passage ? { passage: q.passage.trim() } : {}),
            },
            explanation: q.explanation ? q.explanation.trim() : null,
            options: {
              create: (q.options || []).map((opt: any, optIdx: number) => ({
                text: String(opt.text || '').trim(),
                isCorrect: Boolean(opt.isCorrect),
                order: typeof opt.order === 'number' ? opt.order : optIdx,
              })),
            },
          },
        })

        newlyCreatedQuestionIds.push({
          id: createdQuestion.id,
          points: createdQuestion.points,
        })
      }
    }

    // 2. Lấy thông tin các câu hỏi đã chọn từ ngân hàng
    let existingQuestions: { id: string; points: number }[] = []
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const dbQuestions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, points: true },
      })
      existingQuestions = dbQuestions
    }

    // 3. Hợp nhất danh sách tất cả các câu hỏi
    const allExamQuestions = [
      ...newlyCreatedQuestionIds,
      ...existingQuestions,
    ]

    if (allExamQuestions.length === 0) {
      return NextResponse.json({
        error: 'Đề thi phải có ít nhất 1 câu hỏi (tự soạn, quét từ file hoặc chọn từ ngân hàng câu hỏi)',
      }, { status: 400 })
    }

    const calculatedTotalPoints = allExamQuestions.reduce((acc, q) => acc + (q.points || 1), 0)

    // 4. Tạo đề thi
    const exam = await prisma.exam.create({
      data: {
        authorId: session.user.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        type: type as ExamType,
        grade: Number(grade),
        duration: Number(duration),
        totalPoints: calculatedTotalPoints,
        passingScore: Number(passingScore),
        status: status as ContentStatus,
        isPublic: true,
        showResult: true,
        sections: {
          create: [
            {
              title: 'Phần I: Toàn bộ câu hỏi đề thi',
              order: 1,
              questions: {
                create: allExamQuestions.map((q, idx) => ({
                  questionId: q.id,
                  order: idx + 1,
                  points: q.points || 1,
                })),
              },
            },
          ],
        },
      },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      examId: exam.id,
      totalQuestions: allExamQuestions.length,
      exam,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating exam:', error)
    return NextResponse.json({
      error: error.message || 'Lỗi hệ thống khi tạo đề thi',
    }, { status: 500 })
  }
}
