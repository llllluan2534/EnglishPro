import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedListeningQuestion() {
  try {
    // 1. Tìm người dùng có role ADMIN hoặc TEACHER để gán làm tác giả câu hỏi
    const author = await prisma.user.findFirst({ where: { role: 'ADMIN' } }) || await prisma.user.findFirst()
    
    if (!author) {
      console.log('Không tìm thấy user nào để làm author.')
      return
    }

    // 2. Tạo câu hỏi dạng LISTENING
    const question = await prisma.question.create({
      data: {
        authorId: author.id,
        skill: 'LISTENING',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        status: 'PUBLISHED',
        points: 10,
        tags: ['listening-test', 'demo'],
        content: JSON.stringify({
          text: 'What is the main purpose of this audio?',
          // Sử dụng một file âm thanh mẫu public
          audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg' 
        }),
        // 3. Tạo luôn các lựa chọn (options)
        options: {
          create: [
            { text: 'To demonstrate an audio player', isCorrect: true, order: 1 },
            { text: 'To teach English grammar', isCorrect: false, order: 2 },
            { text: 'To explain math concepts', isCorrect: false, order: 3 },
            { text: 'To test reading skills', isCorrect: false, order: 4 },
          ]
        }
      }
    })

    console.log('✅ Đã tạo thành công câu hỏi Listening!')
    console.log('Question ID:', question.id)
    
  } catch (error) {
    console.error('❌ Có lỗi khi tạo câu hỏi Listening:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedListeningQuestion()
