import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedSpeakingQuestions() {
  const author = await prisma.user.findFirst({ where: { role: 'TEACHER' } }) || await prisma.user.findFirst()
  if (!author) {
    console.error("No user found")
    return
  }

  // Delete previous speaking practice questions to avoid duplicates
  await prisma.question.deleteMany({
    where: { skill: 'SPEAKING', type: 'AUDIO_RESPONSE' }
  })

  const sentences = [
    {
      prompt: "Luyện phát âm câu sau:",
      targetText: "Learning English is very important for my future career.",
      difficulty: "EASY"
    },
    {
      prompt: "Luyện phát âm câu sau:",
      targetText: "Technology has completely transformed the way students acquire knowledge.",
      difficulty: "MEDIUM"
    },
    {
      prompt: "Luyện phát âm câu sau:",
      targetText: "Developing consistent daily study habits will prevent burnout.",
      difficulty: "MEDIUM"
    },
    {
      prompt: "Luyện phát âm câu sau:",
      targetText: "Clear communication and mutual respect are essential in every family.",
      difficulty: "EASY"
    },
    {
      prompt: "Luyện phát âm câu sau:",
      targetText: "Practice makes perfect when it comes to mastering a foreign language.",
      difficulty: "HARD"
    }
  ]

  for (const s of sentences) {
    await prisma.question.create({
      data: {
        authorId: author.id,
        skill: 'SPEAKING',
        type: 'AUDIO_RESPONSE',
        difficulty: s.difficulty as any,
        content: {
          prompt: s.prompt,
          targetText: s.targetText
        },
        status: 'PUBLISHED',
        points: 10,
      }
    })
  }

  console.log(`✅ Seeded ${sentences.length} speaking questions successfully!`)
}

seedSpeakingQuestions().catch(console.error).finally(() => prisma.$disconnect())
