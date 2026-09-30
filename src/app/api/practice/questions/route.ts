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
    const rawTopicId = searchParams.get('topicId')
    const topicId = (rawTopicId === 'all' || !rawTopicId) ? null : rawTopicId
    const limit = parseInt(searchParams.get('limit') || '5', 10)

    if (!skillParam || !(skillParam in Skill)) {
      return NextResponse.json({ error: 'Invalid skill parameter' }, { status: 400 })
    }

    // Fetch questions for this skill
    // In a real app, we'd use raw SQL for ORDER BY RANDOM() to get random questions
    // Prisma doesn't support random out of the box, so we'll fetch a batch and shuffle in JS for now
    const questions = await prisma.question.findMany({
      where: {
        skill: skillParam as Skill,
        status: 'PUBLISHED',
        ...(topicId ? { topicId } : {})
      },
      include: {
        options: true
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 50 // Fetch up to 50
    })

    // Fallback if no published questions: fetch any status for testing
    let finalQuestions = questions;
    if (finalQuestions.length === 0) {
       finalQuestions = await prisma.question.findMany({
          where: { 
            skill: skillParam as Skill,
            ...(topicId ? { topicId } : {})
          },
          include: { options: true },
          orderBy: { createdAt: 'asc' },
          take: 50
       })
    }

    // Shuffle only if not practicing a specific topic
    let selected = finalQuestions
    if (!topicId) {
      selected = finalQuestions.sort(() => 0.5 - Math.random())
    }
    selected = selected.slice(0, limit)

    // Sanitize data before sending to frontend
    const sanitizedQuestions = selected.map(q => {
      // 1. Remove isCorrect from options
      const safeOptions = q.options.map(opt => {
        const { isCorrect, matchKey, ...restOpt } = opt
        return restOpt
      })
      
      // 2. Remove correctAnswers or other sensitive info from content JSON
      let safeContent = q.content
      if (typeof q.content === 'object' && q.content !== null) {
        const { correctAnswers, correctOrder, ...restContent } = q.content as any
        safeContent = restContent
      } else if (typeof q.content === 'string') {
        try {
          const parsed = JSON.parse(q.content)
          const { correctAnswers, correctOrder, ...restContent } = parsed
          safeContent = restContent
        } catch(e) {}
      }

      return {
        ...q,
        options: safeOptions,
        content: safeContent
      }
    })

    return NextResponse.json({
      success: true,
      questions: sanitizedQuestions,
      totalCount: sanitizedQuestions.length
    })

  } catch (error) {
    console.error('Failed to fetch practice questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}
