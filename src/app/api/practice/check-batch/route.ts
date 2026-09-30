import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers } = await req.json()
    // answers is an object: { [questionId: string]: any }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 })
    }

    const questionIds = Object.keys(answers)
    if (questionIds.length === 0) {
      return NextResponse.json({ success: true, results: {}, totalPointsEarned: 0 })
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { options: true }
    })

    const results: Record<string, any> = {}
    let totalPointsEarned = 0

    for (const question of questions) {
      const answer = answers[question.id]
      let isCorrect = false
      let correctAnswerData: any = null

      switch (question.type) {
        case 'MULTIPLE_CHOICE':
        case 'MULTIPLE_SELECT': {
          const correctOptions = question.options.filter(o => o.isCorrect)
          const correctIds = correctOptions.map(o => o.id)
          
          if (Array.isArray(answer)) {
            isCorrect = answer.length === correctIds.length && 
                        answer.every(id => correctIds.includes(id))
          } else {
            isCorrect = correctIds.includes(answer)
          }
          correctAnswerData = correctIds
          break
        }
        
        case 'FILL_IN_BLANK': {
          const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content as any
          const correctAnswers = content?.correctAnswers || []
          
          if (Array.isArray(answer) && Array.isArray(correctAnswers)) {
            isCorrect = answer.length === correctAnswers.length &&
                        answer.every((val, i) => {
                          const correct = correctAnswers[i]
                          if (typeof val !== 'string' || typeof correct !== 'string') return false
                          return val.trim().toLowerCase() === correct.trim().toLowerCase()
                        })
          }
          correctAnswerData = correctAnswers
          break
        }
        
        case 'ORDERING': {
          const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content as any
          const correctOrder = content?.correctOrder || []
          
          if (correctOrder.length === 0 && question.options.length > 0) {
            const sortedOptions = [...question.options].sort((a, b) => a.order - b.order)
            const sortedIds = sortedOptions.map(o => o.id)
            if (Array.isArray(answer)) {
              isCorrect = answer.length === sortedIds.length && answer.every((val, i) => val === sortedIds[i])
            }
            correctAnswerData = sortedIds
          } else if (Array.isArray(answer) && Array.isArray(correctOrder)) {
            isCorrect = answer.length === correctOrder.length && answer.every((val, i) => val === correctOrder[i])
            correctAnswerData = correctOrder
          }
          break
        }
          
        case 'MATCHING':
          isCorrect = false
          break
      }

      const pointsEarned = isCorrect ? question.points : 0
      totalPointsEarned += pointsEarned

      results[question.id] = {
        isCorrect,
        pointsEarned,
        correctAnswer: isCorrect ? null : correctAnswerData
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalPointsEarned
    })

  } catch (error) {
    console.error('Failed to batch check practice answers:', error)
    return NextResponse.json({ error: 'Failed to check answers' }, { status: 500 })
  }
}
