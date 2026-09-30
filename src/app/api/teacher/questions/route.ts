import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Skill, QuestionType, Difficulty, ContentStatus } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Không có quyền thực hiện thao tác này' }, { status: 403 })
    }

    const body = await req.json()
    const {
      skill = 'READING',
      type = 'MULTIPLE_CHOICE',
      difficulty = 'MEDIUM',
      points = 1,
      content,
      options = [],
      explanation = null
    } = body

    if (!content || !content.text) {
      return NextResponse.json({ error: 'Nội dung câu hỏi là bắt buộc' }, { status: 400 })
    }

    if (!options || options.length < 2) {
      return NextResponse.json({ error: 'Cần ít nhất 2 phương án trả lời' }, { status: 400 })
    }

    // Create question and its options in database
    const question = await prisma.question.create({
      data: {
        authorId: session.user.id,
        skill: skill as Skill,
        type: type as QuestionType,
        difficulty: difficulty as Difficulty,
        content,
        explanation: explanation ? String(explanation).trim() : null,
        status: ContentStatus.PUBLISHED,
        points: Number(points) || 1,
        options: {
          create: options.map((opt: any, idx: number) => ({
            text: opt.text,
            isCorrect: Boolean(opt.isCorrect),
            order: idx,
          }))
        }
      },
      include: {
        options: true
      }
    })

    return NextResponse.json({ success: true, question }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: error.message || 'Lỗi hệ thống khi tạo câu hỏi' }, { status: 500 })
  }
}
