import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, type Skill, type ContentStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Content block schema – linh hoạt theo loại
const ContentBlockSchema = z.object({
  order: z.number().int().min(0),
  type: z.enum(['text', 'image', 'video', 'audio', 'flashcard_set']),
  // Zod v4: z.record phải có 2 args (keyType, valueType)
  content: z.record(z.string(), z.unknown()),
})

const CreateLessonSchema = z.object({
  topicId: z.string().min(1, 'topicId là bắt buộc'),
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  description: z.string().optional(),
  // Zod v4: dùng z.enum([...]) thay vì z.nativeEnum()
  skill: z.enum(['READING', 'LISTENING', 'WRITING', 'SPEAKING', 'GRAMMAR', 'VOCABULARY']).default('READING'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  order: z.number().int().min(1).default(1),
  duration: z.number().int().min(1).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  blocks: z.array(ContentBlockSchema).default([]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateLessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { topicId, title, description, skill, difficulty, order, duration, status, blocks } = parsed.data

  // Kiểm tra topic tồn tại
  const topic = await prisma.topic.findUnique({ where: { id: topicId } })
  if (!topic) {
    return NextResponse.json({ error: 'Chủ đề không tồn tại' }, { status: 404 })
  }

  // Tạo lesson + content blocks trong một transaction
  const lesson = await prisma.$transaction(async (tx) => {
    const newLesson = await tx.lesson.create({
      data: {
        topicId,
        authorId: session.user.id,
        title,
        description,
        skill,
        difficulty,
        order,
        duration,
        status,
      },
    })

    if (blocks.length > 0) {
      await tx.lessonContent.createMany({
        data: blocks.map((b) => ({
          lessonId: newLesson.id,
          order: b.order,
          type: b.type,
          // Cast sang Prisma.JsonObject để thoả mãn InputJsonValue
          content: b.content as Prisma.JsonObject,
        })),
      })
    }

    return newLesson
  })

  return NextResponse.json(lesson, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topicId')
  const statusFilter = searchParams.get('status') as ContentStatus | null
  const skillFilter = searchParams.get('skill') as Skill | null

  const lessons = await prisma.lesson.findMany({
    where: {
      ...(topicId ? { topicId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(skillFilter ? { skill: skillFilter } : {}),
    },
    include: {
      topic: { select: { title: true, grade: true } },
      author: { select: { name: true } },
      _count: { select: { contents: true, vocabularies: true, examQuestions: true } },
    },
    orderBy: [{ topic: { order: 'asc' } }, { order: 'asc' }],
  })

  return NextResponse.json(lessons)
}
