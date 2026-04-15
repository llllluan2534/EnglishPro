import { PrismaClient, Role, Skill, Difficulty, QuestionType, ExamType, ContentStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Tạo tài khoản admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@englishpro.vn' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@englishpro.vn',
      password: await hash('Admin@123', 10),
      role: Role.ADMIN,
    },
  })

  // 2. Tạo tài khoản giáo viên mẫu
  const teacher = await prisma.user.upsert({
    where: { email: 'giaovien@englishpro.vn' },
    update: {},
    create: {
      name: 'Cô Nguyễn',
      email: 'c',
      password: await hash('Teacher@123', 10),
      role: Role.TEACHER,
      bio: 'Giáo viên tiếng Anh với 10 năm kinh nghiệm',
    },
  })

  // 3. Tạo tài khoản học sinh mẫu
  const student = await prisma.user.upsert({
    where: { email: 'hocsinh@englishpro.vn' },
    update: {},
    create: {
      name: 'Nguyễn Văn An',
      email: 'hocsinh@englishpro.vn',
      password: await hash('Student@123', 10),
      role: Role.STUDENT,
      grade: 11,
    },
  })

  // 4. Khởi tạo XP và Streak cho học sinh
  await prisma.userXP.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id },
  })

  await prisma.streak.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id },
  })

  // 5. Tạo chủ đề mẫu
  const topic = await prisma.topic.create({
    data: {
      title: 'Unit 1 — Family and Friends',
      description: 'Từ vựng và ngữ pháp về gia đình, bạn bè',
      grade: 11,
      skill: null, // Chủ đề tổng hợp
      status: ContentStatus.PUBLISHED,
      order: 1,
    },
  })

  // 6. Tạo bài học mẫu
  const lesson = await prisma.lesson.create({
    data: {
      topicId: topic.id,
      authorId: teacher.id,
      title: 'Vocabulary: Describing People',
      description: 'Học từ vựng miêu tả ngoại hình và tính cách',
      skill: Skill.VOCABULARY,
      difficulty: Difficulty.EASY,
      duration: 20,
      status: ContentStatus.PUBLISHED,
      order: 1,
      contents: {
        create: [
          {
            order: 1,
            type: 'text',
            content: {
              html: '<h2>Adjectives for Appearance</h2><p>Learn words to describe how people look...</p>'
            },
          },
          {
            order: 2,
            type: 'flashcard_set',
            content: {
              cards: [
                { front: 'tall', back: 'cao', example: 'He is very tall.' },
                { front: 'slim', back: 'mảnh mai', example: 'She has a slim figure.' },
                { front: 'curly hair', back: 'tóc xoăn', example: 'My sister has curly hair.' },
              ],
            },
          },
        ],
      },
      vocabularies: {
        create: [
          { word: 'tall', definition: 'cao', example: 'He is very tall.', partOfSpeech: 'adj.' },
          { word: 'slim', definition: 'mảnh mai', example: 'She has a slim figure.', partOfSpeech: 'adj.' },
          { word: 'curly', definition: 'xoăn', example: 'My sister has curly hair.', partOfSpeech: 'adj.' },
          { word: 'cheerful', definition: 'vui vẻ', example: 'She is always cheerful.', partOfSpeech: 'adj.' },
          { word: 'generous', definition: 'hào phóng', example: 'He is very generous.', partOfSpeech: 'adj.' },
        ],
      },
    },
  })

  // 7. Tạo câu hỏi mẫu
  await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      content: { text: 'She ___ to school every day.' },
      explanation: '"Goes" là đúng vì chủ ngữ là "she" (ngôi thứ 3 số ít) và đây là thì hiện tại đơn.',
      tags: ['present-simple', 'unit-1'],
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'go', isCorrect: false, order: 0 },
          { text: 'goes', isCorrect: true, order: 1 },
          { text: 'going', isCorrect: false, order: 2 },
          { text: 'went', isCorrect: false, order: 3 },
        ],
      },
    },
  })

  // 8. Tạo huy hiệu mẫu
  await prisma.badge.createMany({
    skipDuplicates: true,
    data: [
      {
        name: '7-Day Streak',
        description: 'Học liên tục 7 ngày',
        imageUrl: '/badges/streak-7.png',
        type: 'STREAK',
        condition: { days: 7 },
        xpReward: 50,
      },
      {
        name: 'Topic Master',
        description: 'Hoàn thành một chủ đề',
        imageUrl: '/badges/master.png',
        type: 'MASTERY',
        condition: {},
        xpReward: 100,
      },
      {
        name: 'Perfect Score',
        description: 'Đạt 100% trong một bài thi',
        imageUrl: '/badges/perfect.png',
        type: 'SCORE',
        condition: { minScore: 100 },
        xpReward: 200,
      },
    ],
  })

  console.log('✅ Seed hoàn tất!')
  console.log('   Admin:    admin@englishpro.vn / Admin@123')
  console.log('   Giáo viên: giaovien@englishpro.vn / Teacher@123')
  console.log('   Học sinh:  hocsinh@englishpro.vn / Student@123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
