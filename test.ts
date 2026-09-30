import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
  const q = await prisma.question.findFirst({
    where: {
      type: 'FILL_IN_BLANK'
    }
  })
  console.log("DB Content:", q?.content)
  console.log("Type of content:", typeof q?.content)
  
  if (typeof q?.content === 'string') {
    console.log("Parsed:", JSON.parse(q.content))
  }
}

check().catch(console.error).finally(() => prisma.$disconnect())
