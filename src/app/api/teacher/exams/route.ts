import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { ExamType, ContentStatus } from '@prisma/client'

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
      questionIds = []
    } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Tiêu đề đề thi là bắt buộc' }, { status: 400 })
    }

    // Create exam and attach selected questions
    const exam = await prisma.exam.create({
      data: {
        authorId: session.user.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        type: type as ExamType,
        grade: Number(grade),
        duration: Number(duration),
        totalPoints: 10,
        passingScore: Number(passingScore),
        status: status as ContentStatus,
        isPublic: true,
        showResult: true,
        sections: {
          create: [
            {
              title: 'Phần I: Đề kiểm tra đánh giá năng lực',
              order: 1,
              questions: {
                create: questionIds.map((qId: string, idx: number) => ({
                  questionId: qId,
                  order: idx + 1,
                  points: 1,
                }))
              }
            }
          ]
        }
      },
      include: {
        sections: {
          include: {
            questions: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, exam }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating exam:', error)
    return NextResponse.json({ error: error.message || 'Lỗi hệ thống khi tạo đề thi' }, { status: 500 })
  }
}
