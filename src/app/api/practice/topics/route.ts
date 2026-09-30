import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Skill } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const skillParam = searchParams.get('skill')?.toUpperCase()

    if (!skillParam || !(skillParam in Skill)) {
      return NextResponse.json({ error: 'Invalid skill parameter' }, { status: 400 })
    }

    // Lấy các Topic có chứa Question với skill tương ứng
    const topics = await prisma.topic.findMany({
      where: {
        status: 'PUBLISHED',
        questions: {
          some: {
            skill: skillParam as Skill,
            status: 'PUBLISHED'
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        grade: true,
        _count: {
          select: {
            questions: {
              where: {
                skill: skillParam as Skill,
                status: 'PUBLISHED'
              }
            }
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      topics,
      totalCount: topics.length
    })

  } catch (error) {
    console.error('Failed to fetch practice topics:', error)
    return NextResponse.json({ error: 'Failed to fetch practice topics' }, { status: 500 })
  }
}
