import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, answer } = await req.json()

    if (!questionId) {
      return NextResponse.json({ error: 'Missing questionId' }, { status: 400 })
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    let isCorrect = false
    let correctAnswerData: any = null

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'MULTIPLE_SELECT': {
        // answer could be a single ID or an array of IDs
        const correctOptions = question.options.filter(o => o.isCorrect)
        const correctIds = correctOptions.map(o => o.id)
        
        if (Array.isArray(answer)) {
          // Check if arrays match exactly
          isCorrect = answer.length === correctIds.length && 
                      answer.every(id => correctIds.includes(id))
        } else {
          isCorrect = correctIds.includes(answer)
        }
        
        correctAnswerData = correctIds
        break
      }
      
      case 'FILL_IN_BLANK': {
        // answer is string[]
        const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content as any
        const correctAnswers = content?.correctAnswers || []
        
        if (Array.isArray(answer) && Array.isArray(correctAnswers)) {
          // check if every blank matches (case-insensitive for now)
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
        // Fallback to checking options order if correctOrder not in content
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
        
      case 'MATCHING': {
        // Assume answer is array of { left: string, right: string }
        // For MATCHING, we usually match options using matchKey or order
        // This can be complex depending on how it's saved.
        // For now, let's assume it checks options where matchKey links to id or something.
        // Since we don't have a concrete seed for MATCHING yet, we'll implement a stub.
        isCorrect = false
        break
      }
        
      default:
        // Other types like SHORT_ANSWER or AUDIO_RESPONSE require manual/AI grading
        break
    }

    const pointsEarned = isCorrect ? question.points : 0

    return NextResponse.json({
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: isCorrect ? null : correctAnswerData
    })

  } catch (error) {
    console.error('Failed to check practice answer:', error)
    return NextResponse.json({ error: 'Failed to check answer' }, { status: 500 })
  }
}
