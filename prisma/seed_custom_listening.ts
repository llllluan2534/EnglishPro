import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const BASE_URL = 'https://pub-ac64e01c539d491f9f1499164d394f95.r2.dev/EnglishPro'
const audioFiles = {
  1: 'english_listening_exercises_for_b1_%E2%80%93_eating_out_task1.mp3',
  2: 'english_listening_exercises_for_b1_%E2%80%93_eating_out_task2.mp3',
  3: 'english_listening_exercises_for_b1_%E2%80%93_eating_out_task3.mp3',
  4: 'english_listening_exercises_for_b1_%E2%80%93_eating_out_task4.mp3',
  5: 'english_listening_exercises_for_b1_%E2%80%93_eating_out_task5.mp3'
}

async function seed() {
  try {
    const author = await prisma.user.findFirst({ where: { role: 'TEACHER' } }) || await prisma.user.findFirst()
    if (!author) return

    console.log('0. Đang dọn dẹp dữ liệu cũ...')
    const oldTopic = await prisma.topic.findFirst({ 
      where: { title: 'B1 Listening: Eating Out' },
      include: { lessons: true }
    })
    if (oldTopic) {
      for (const lesson of oldTopic.lessons) {
        await prisma.lessonContent.deleteMany({ where: { lessonId: lesson.id } })
        await prisma.lesson.delete({ where: { id: lesson.id } })
      }
      await prisma.topic.delete({ where: { id: oldTopic.id } })
    }
    await prisma.question.deleteMany({
      where: { tags: { has: 'listening-b1' } }
    })

    console.log('1. Đang tạo Topic và Lesson...')
    const topic = await prisma.topic.create({
      data: {
        title: 'B1 Listening: Eating Out',
        description: 'Practice your listening skills with these conversations about eating out.',
        skill: 'LISTENING',
        status: 'PUBLISHED',
        grade: 11,
      }
    })

    const lesson = await prisma.lesson.create({
      data: {
        title: 'Eating out - All Tasks',
        order: 1,
        status: 'PUBLISHED',
        skill: 'LISTENING',
        topicId: topic.id,
        authorId: author.id
      }
    })

    console.log('2. Đang tạo các câu hỏi dạng Điền từ (Gộp từng Task)...')

    const createFillBlank = async (audioUrl: string, text: string, correctAnswers: string[] = []) => {
      await prisma.question.create({
        data: {
          authorId: author.id,
          skill: 'LISTENING',
          type: 'FILL_IN_BLANK',
          difficulty: 'MEDIUM',
          status: 'PUBLISHED',
          points: 10,
          topicId: topic.id,
          tags: ['listening-b1', 'eating-out'],
          content: JSON.stringify({ text, audioUrl, correctAnswers }),
        }
      })
    }

    // Task 1
    await createFillBlank(
      `${BASE_URL}/${audioFiles[1]}`, 
      "Task 1: Type the correct word in the blank.\n\na) shortly [BLANK] dinner (after / before)\nb) [BLANK] a restaurant (inside / outside)\nc) They might have the wrong [BLANK] (day / restaurant)\nd) a woman and her [BLANK] (father / son)",
      ['before', 'outside', 'restaurant', 'father']
    )

    // Task 2
    await createFillBlank(
      `${BASE_URL}/${audioFiles[2]}`, 
      "Task 2: Type a, b, or c in the blanks.\n\nDialogue 1\n1) Who is the woman talking to? [BLANK]\na) a waiter\nb) the man she’s having dinner with\nc) a man at the next table\n\n2) Why is the woman unhappy with her food? [BLANK]\na) It isn’t what she ordered.\nb) It doesn’t look very tasty.\nc) She can’t eat it.\n\nDialogue 2\n3) Where is the conversation taking place? [BLANK]\na) at home\nb) in a restaurant\nc) in the town centre\n\n4) What time is it, approximately? [BLANK]\na) 7 p.m.\nb) 9 p.m.\nc) 11 p.m.",
      ['b', 'c', 'a', 'a']
    )

    // Task 3
    await createFillBlank(
      `${BASE_URL}/${audioFiles[3]}`, 
      "Task 3: Complete the useful phrases with the words below: bit, nothing, pretty, real, up, world\n\n1) a [BLANK] special\n2) a [BLANK] let-down\n3) [BLANK] special\n4) [BLANK] average\n5) not [BLANK] to standard\n6) out of this [BLANK]",
      ['bit', 'real', 'nothing', 'pretty', 'up', 'world']
    )

    // Task 4 Part 1
    await createFillBlank(
      `${BASE_URL}/${audioFiles[3]}`, 
      "Task 4: Write the correct speaker: Tom (T) or Zoë (Z).\n\n1) is planning to book a restaurant? [BLANK]\n2) can’t remember last year’s meal? [BLANK]\n3) always checks online reviews for restaurants? [BLANK]\n4) recommended an Italian restaurant? [BLANK]\n5) is going to ask about a special diet? [BLANK]",
      ['Z', 'T', 'T', 'T', 'Z']
    )

    // Task 4 Part 2 & Task 5
    await createFillBlank(
      `${BASE_URL}/${audioFiles[3]}`, 
      "Task 5: Read the statements carefully before you listen, paying close attention to key words in order to predict what you are going to hear. Think about who might be speaking, and what feeling or idea they might be expressing.\n\n1) Jim’s [BLANK] were [BLANK] for [BLANK].\n2) Jim’s [BLANK] [BLANK] attended [BLANK].\n3) Jim’s [BLANK] [BLANK] her [BLANK].",
      ['grandparents', 'ambitious', 'their children', 'grandparents', 'both', 'university', 'mother', 'disappointed', 'parents']
    )

    // Task 6
    await createFillBlank(
      `${BASE_URL}/${audioFiles[5]}`, 
      "Task 6: Are the statements true (T) or false (F)?\n\n1) Lila has no memory of moving to the UK. [BLANK]\n2) Lila’s mother made the decision to move to the UK. [BLANK]\n3) Most of Tim’s family came to the UK from Norway. [BLANK]\n4) Tim’s father grew up in the countryside. [BLANK]\n5) Tim admires his father’s achievements. [BLANK]",
      ['T', 'F', 'F', 'T', 'T']
    )

    console.log('✅ Đã nạp thành công toàn bộ dữ liệu mẫu Listening!')
  } catch (e) {
    console.error('❌ Lỗi:', e)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
