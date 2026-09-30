import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const qs = await prisma.question.findMany({
    where: { skill: 'LISTENING' },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  console.log(qs.map(q => JSON.parse(q.content as string).text))
}

main().catch(console.error).finally(() => prisma.$disconnect())
