import { PrismaClient, Skill, QuestionType, Difficulty, ContentStatus } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedListeningCurriculum() {
  console.log('🎧 Bắt đầu nạp ngân hàng câu hỏi Luyện nghe (Listen In Series)...')

  const author = await prisma.user.findFirst({
    where: { role: 'TEACHER' }
  }) || await prisma.user.findFirst()

  if (!author) {
    console.error('❌ Không tìm thấy tài khoản tác giả (TEACHER/ADMIN).')
    return
  }

  // Xóa các câu hỏi listening demo cũ không có file audio nội bộ
  await prisma.questionOption.deleteMany({
    where: {
      question: {
        skill: Skill.LISTENING,
        tags: { has: 'demo' }
      }
    }
  })
  await prisma.question.deleteMany({
    where: {
      skill: Skill.LISTENING,
      tags: { has: 'demo' }
    }
  })

  // =========================================================================
  // UNIT 1: Pleased to meet you
  // =========================================================================
  const topic1 = await prisma.topic.upsert({
    where: { id: 'listenin-unit-01' },
    update: {},
    create: {
      id: 'listenin-unit-01',
      title: 'Listen In 1 — Unit 1: Pleased to Meet You',
      description: 'Chủ đề: Lời chào hỏi, giới thiệu bản thân & xác nhận tên người tại buổi tiệc.',
      grade: 10,
      skill: Skill.LISTENING,
      status: ContentStatus.PUBLISHED,
      order: 1,
    }
  })

  // Unit 1 - Câu 1: Số người được nhắc đến trong hội thoại mời tiệc
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic1.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['listenin', 'unit-1', 'greetings', 'names'],
      content: {
        text: 'Listen to the conversation between Leanne and John [from 01:02]. How many guest names do they decide to add to their invitation list?',
        audioUrl: '/audio/listening/listen-in-1/Unit01.wav'
      },
      explanation: 'Trong đoạn [01:02], Leanne và John chốt danh sách gồm 5 người: John and Tina Lowe, Alan Walker, Cathy Chan, Mike Perez và Yumiko Sato. Do đó đáp án đúng là 5 người.',
      options: {
        create: [
          { text: '3 people', isCorrect: false, order: 0 },
          { text: '4 people', isCorrect: false, order: 1 },
          { text: '5 people (John & Tina, Alan, Cathy, Mike, Yumiko)', isCorrect: true, order: 2 },
          { text: '7 people', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 1 - Câu 2: Nghề nghiệp của Cathy Chan
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic1.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['listenin', 'unit-1', 'occupations'],
      content: {
        text: 'What is Cathy Chan\'s job mentioned in the dialogue?',
        audioUrl: '/audio/listening/listen-in-1/Unit01.wav'
      },
      explanation: 'John nói: "What about Cathy Chan? She\'s the new financial accountant." (Còn Cathy Chan thì sao? Cô ấy là nhân viên kế toán tài chính mới).',
      options: {
        create: [
          { text: 'A professional tennis coach', isCorrect: false, order: 0 },
          { text: 'The new financial accountant', isCorrect: true, order: 1 },
          { text: 'A freelance photographer', isCorrect: false, order: 2 },
          { text: 'An apartment manager', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 1 - Câu 3: Trang phục của Tina Lowe
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic1.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['listenin', 'unit-1', 'descriptions'],
      content: {
        text: 'Listen to Task 5 [from 02:44]. Where is John\'s wife Tina, and what is she wearing?',
        audioUrl: '/audio/listening/listen-in-1/Unit01.wav'
      },
      explanation: 'John nói với Yumiko: "...that\'s my wife, Tina, in red over on the sofa." (kia là vợ tôi, Tina, mặc bộ đồ màu đỏ ngồi trên ghế sofa).',
      options: {
        create: [
          { text: 'She is wearing red over on the sofa.', isCorrect: true, order: 0 },
          { text: 'She is standing near the door in a blue jacket.', isCorrect: false, order: 1 },
          { text: 'She is talking to Paul in the kitchen.', isCorrect: false, order: 2 },
          { text: 'She is playing tennis outside.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 1 - Câu 4 (Self Study): Dạng hội thoại
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic1.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-1', 'telephone'],
      content: {
        text: 'Self Study Task 2 [from 01:06]: What kind of communication is this recording?',
        audioUrl: '/audio/listening/self-study/Unit01.wav'
      },
      explanation: 'Đây là cuộc gọi điện thoại trực tiếp giữa Tom và Judy ("Hi Judy, this is Tom..."): A telephone conversation.',
      options: {
        create: [
          { text: 'A face-to-face conversation', isCorrect: false, order: 0 },
          { text: 'An answering machine message', isCorrect: false, order: 1 },
          { text: 'A telephone conversation', isCorrect: true, order: 2 },
          { text: 'A radio advertisement', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 1 - Câu 5 (Self Study): Kế hoạch của Tom
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic1.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-1', 'plans'],
      content: {
        text: 'Self Study: Can Judy come to the party, and how will Tom invite other guests?',
        audioUrl: '/audio/listening/self-study/Unit01.wav'
      },
      explanation: 'Judy nói cô ấy có thể đến được buổi tiệc ("can come to the party") và Tom dự định gọi điện mời từng người ("plans to invite guests by phone").',
      options: {
        create: [
          { text: 'Judy can come to the party, and Tom plans to invite guests by phone.', isCorrect: true, order: 0 },
          { text: 'Judy cannot come, and Tom will send paper invitations.', isCorrect: false, order: 1 },
          { text: 'Judy is hosting the party, and Tom is just a guest.', isCorrect: false, order: 2 },
          { text: 'Judy can come, but Tom will invite people via social media.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // =========================================================================
  // UNIT 2: This is my family
  // =========================================================================
  const topic2 = await prisma.topic.upsert({
    where: { id: 'listenin-unit-02' },
    update: {},
    create: {
      id: 'listenin-unit-02',
      title: 'Listen In 1 — Unit 2: This Is My Family',
      description: 'Chủ đề: Nhận diện các thành viên trong gia đình, mối quan hệ họ hàng & gia phả.',
      grade: 10,
      skill: Skill.LISTENING,
      status: ContentStatus.PUBLISHED,
      order: 2,
    }
  })

  // Unit 2 - Câu 1: Quan hệ họ hàng của Jon
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic2.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['listenin', 'unit-2', 'family'],
      content: {
        text: 'Listen to Task 2 [from 00:04]: "Jon is our only boy. He has three sisters." How is Jon related to the speaker?',
        audioUrl: '/audio/listening/listen-in-1/Unit02.wav'
      },
      explanation: 'Jon là người con trai duy nhất ("our only boy") của người nói -> Jon là con trai (son) của người nói.',
      options: {
        create: [
          { text: 'Jon is the speaker\'s brother.', isCorrect: false, order: 0 },
          { text: 'Jon is the speaker\'s son.', isCorrect: true, order: 1 },
          { text: 'Jon is the speaker\'s nephew.', isCorrect: false, order: 2 },
          { text: 'Jon is the speaker\'s grandson.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 2 - Câu 2: Darren là ai
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic2.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['listenin', 'unit-2', 'family'],
      content: {
        text: 'Listen to statement 2 [from 00:10]: "That\'s Darren. He\'s my mother\'s brother." What is Darren\'s relationship to the speaker?',
        audioUrl: '/audio/listening/listen-in-1/Unit02.wav'
      },
      explanation: 'Darren là anh/em trai của mẹ người nói ("my mother\'s brother") -> Darren là bác/chú/cậu (uncle) của người nói.',
      options: {
        create: [
          { text: 'He is the speaker\'s father.', isCorrect: false, order: 0 },
          { text: 'He is the speaker\'s grandfather.', isCorrect: false, order: 1 },
          { text: 'He is the speaker\'s uncle.', isCorrect: true, order: 2 },
          { text: 'He is the speaker\'s cousin.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 2 - Câu 3: Sara là ai
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic2.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['listenin', 'unit-2', 'family'],
      content: {
        text: 'Listen to statement 3: "Her name\'s Sara. She\'s my son Mario\'s daughter." How is Sara related to the speaker?',
        audioUrl: '/audio/listening/listen-in-1/Unit02.wav'
      },
      explanation: 'Sara là con gái của con trai người nói ("my son Mario\'s daughter") -> Sara là cháu gái ruột gọi người nói là ông/bà (granddaughter).',
      options: {
        create: [
          { text: 'Sara is the speaker\'s niece.', isCorrect: false, order: 0 },
          { text: 'Sara is the speaker\'s granddaughter.', isCorrect: true, order: 1 },
          { text: 'Sara is the speaker\'s daughter.', isCorrect: false, order: 2 },
          { text: 'Sara is the speaker\'s sister.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 2 - Câu 4 (Self Study): True/False về gia đình Allie
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic2.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-2', 'family-tree'],
      content: {
        text: 'Self Study Task 2 [from 01:03]: According to Allie\'s description of her family tree, is Danny Allie\'s son?',
        audioUrl: '/audio/listening/self-study/Unit02.wav'
      },
      explanation: 'Trong bài nghe Allie nói về các thành viên gia đình, Danny là con trai của Allie (True).',
      options: {
        create: [
          { text: 'True', isCorrect: true, order: 0 },
          { text: 'False', isCorrect: false, order: 1 },
        ]
      }
    }
  })

  // =========================================================================
  // UNIT 3: He's the one in the blue shirt
  // =========================================================================
  const topic3 = await prisma.topic.upsert({
    where: { id: 'listenin-unit-03' },
    update: {},
    create: {
      id: 'listenin-unit-03',
      title: 'Listen In 1 — Unit 3: He\'s the One in the Blue Shirt',
      description: 'Chủ đề: Miêu tả đặc điểm ngoại hình, trang phục, chiều cao, màu tóc & kính mắt.',
      grade: 10,
      skill: Skill.LISTENING,
      status: ContentStatus.PUBLISHED,
      order: 3,
    }
  })

  // Unit 3 - Câu 1: Đạo diễn phim đang nói chuyện với ai
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic3.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-3', 'appearance'],
      content: {
        text: 'Self Study Task 2 [from 01:19]: Who is the movie director talking with?',
        audioUrl: '/audio/listening/self-study/Unit03.wav'
      },
      explanation: 'Đạo diễn đang trao đổi với một người môi giới diễn viên (talent agent) để tuyển diễn viên cho bộ phim mới: with an agent.',
      options: {
        create: [
          { text: 'with an actor', isCorrect: false, order: 0 },
          { text: 'with an agent', isCorrect: true, order: 1 },
          { text: 'with another director', isCorrect: false, order: 2 },
          { text: 'with a journalist', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 3 - Câu 2: Đạo diễn cần tìm ai
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic3.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-3', 'appearance'],
      content: {
        text: 'Self Study Task 2: What actors is the director looking for?',
        audioUrl: '/audio/listening/self-study/Unit03.wav'
      },
      explanation: 'Đạo diễn cần tìm 3 diễn viên: 2 nam và 1 nữ ("two men and a woman").',
      options: {
        create: [
          { text: 'three men', isCorrect: false, order: 0 },
          { text: 'two men and a woman', isCorrect: true, order: 1 },
          { text: 'two women and a man', isCorrect: false, order: 2 },
          { text: 'three famous Hollywood stars', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // =========================================================================
  // UNIT 4: Do you like rock?
  // =========================================================================
  const topic4 = await prisma.topic.upsert({
    where: { id: 'listenin-unit-04' },
    update: {},
    create: {
      id: 'listenin-unit-04',
      title: 'Listen In 1 — Unit 4: Do You Like Rock?',
      description: 'Chủ đề: Sở thích âm nhạc, các thể loại nhạc (Pop, Rock, Jazz, Classical) & nghệ sĩ yêu thích.',
      grade: 10,
      skill: Skill.LISTENING,
      status: ContentStatus.PUBLISHED,
      order: 4,
    }
  })

  // Unit 4 - Câu 1: Phản hồi tốt nhất
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic4.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-4', 'music'],
      content: {
        text: 'Self Study Task 1 [from 00:03]: When someone asks "What kind of music do you like?", what is the most appropriate response?',
        audioUrl: '/audio/listening/self-study/Unit04.wav'
      },
      explanation: '"Classical" (Nhạc cổ điển) là câu trả lời chỉ tên một thể loại nhạc cụ thể, phù hợp nhất khi được hỏi về thể loại nhạc yêu thích.',
      options: {
        create: [
          { text: 'Classical.', isCorrect: true, order: 0 },
          { text: 'I prefer music.', isCorrect: false, order: 1 },
          { text: 'No, she doesn\'t.', isCorrect: false, order: 2 },
          { text: 'I like some of his songs.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 4 - Câu 2: Thái độ với nhạc
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic4.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-4', 'preferences'],
      content: {
        text: 'Self Study Task 1: If someone says "Do you mind rock music?", what does "I don\'t mind it" mean?',
        audioUrl: '/audio/listening/self-study/Unit04.wav'
      },
      explanation: '"I don\'t mind it" nghĩa là không ghét cũng không quá cuồng nhiệt, thái độ trung lập/chấp nhận được (It\'s OK with me).',
      options: {
        create: [
          { text: 'I completely hate it.', isCorrect: false, order: 0 },
          { text: 'It\'s OK, I neither love nor hate it.', isCorrect: true, order: 1 },
          { text: 'It\'s my absolute favorite genre.', isCorrect: false, order: 2 },
          { text: 'I never listen to it.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // =========================================================================
  // UNIT 5: It's a really interesting place
  // =========================================================================
  const topic5 = await prisma.topic.upsert({
    where: { id: 'listenin-unit-05' },
    update: {},
    create: {
      id: 'listenin-unit-05',
      title: 'Listen In 1 — Unit 5: It\'s a Really Interesting Place',
      description: 'Chủ đề: Giới thiệu quê hương, miêu tả các thành phố (San Francisco, Boston, Salt Lake City).',
      grade: 10,
      skill: Skill.LISTENING,
      status: ContentStatus.PUBLISHED,
      order: 5,
    }
  })

  // Unit 5 - Câu 1: Kế hoạch của Min-hee
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic5.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-5', 'cities'],
      content: {
        text: 'Self Study Task 2 [from 01:14]: What is Min-hee planning according to the conversation with Evan?',
        audioUrl: '/audio/listening/self-study/Unit05.wav'
      },
      explanation: 'Min-hee đang lên kế hoạch đi nghỉ ở Mỹ: "Min-hee is thinking about taking a vacation in the United States." (True).',
      options: {
        create: [
          { text: 'She is thinking about taking a vacation in the United States.', isCorrect: true, order: 0 },
          { text: 'She is moving to Boston for a new job.', isCorrect: false, order: 1 },
          { text: 'She is buying a house in San Francisco.', isCorrect: false, order: 2 },
          { text: 'She wants to study in London.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // Unit 5 - Câu 2: Quê hương của Evan
  await prisma.question.create({
    data: {
      authorId: author.id,
      topicId: topic5.id,
      skill: Skill.LISTENING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      status: ContentStatus.PUBLISHED,
      points: 10,
      tags: ['self-study', 'unit-5', 'hometown'],
      content: {
        text: 'Self Study Task 2: What is Evan\'s hometown mentioned in the dialogue?',
        audioUrl: '/audio/listening/self-study/Unit05.wav'
      },
      explanation: 'Evan nói: "My hometown is Salt Lake City." (Quê của tôi là thành phố Salt Lake).',
      options: {
        create: [
          { text: 'San Francisco', isCorrect: false, order: 0 },
          { text: 'Salt Lake City', isCorrect: true, order: 1 },
          { text: 'Boston', isCorrect: false, order: 2 },
          { text: 'Taipei', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  console.log('✅ Đã nạp thành công 5 Units luyện nghe chuẩn Listen In 1!')
  console.log('   - Unit 1: Pleased to Meet You')
  console.log('   - Unit 2: This Is My Family')
  console.log('   - Unit 3: He\'s the One in the Blue Shirt')
  console.log('   - Unit 4: Do You Like Rock?')
  console.log('   - Unit 5: It\'s a Really Interesting Place')
}

seedListeningCurriculum()
  .catch((e) => {
    console.error('❌ Lỗi seed listening:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
