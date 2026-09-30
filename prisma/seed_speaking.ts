import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedSpeakingQuestion() {
  const author = await prisma.user.findFirst({ where: { role: 'ADMIN' } }) || await prisma.user.findFirst()
  if (!author) {
    console.error("No user found")
    return
  }

  await prisma.question.create({
    data: {
      authorId: author.id,
      skill: 'SPEAKING',
      type: 'AUDIO_RESPONSE',
      difficulty: 'MEDIUM',
      content: {
        prompt: "Please read the following sentence aloud:",
        targetText: "Learning English is very important for my future career."
      },
      status: 'PUBLISHED',
      points: 10,
    }
  })

  console.log("Speaking question seeded successfully!")
}

seedSpeakingQuestion().catch(console.error).finally(() => prisma.$disconnect())
