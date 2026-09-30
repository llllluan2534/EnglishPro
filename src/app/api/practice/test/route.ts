import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const q = await prisma.question.findFirst({
    where: {
      type: 'FILL_IN_BLANK'
    }
  })
  
  if (!q) return NextResponse.json({ error: 'No question found' })
  
  return NextResponse.json({
    content: q.content,
    typeOfContent: typeof q.content,
    parsed: typeof q.content === 'string' ? JSON.parse(q.content) : null
  })
}
