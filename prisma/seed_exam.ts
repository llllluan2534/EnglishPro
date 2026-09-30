import { PrismaClient, Skill, Difficulty, QuestionType, ExamType, ContentStatus } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedExams() {
  console.log('📝 Seeding authentic 2026 format THPT exam...')

  const teacher = await prisma.user.findFirst({
    where: { role: 'TEACHER' }
  })

  if (!teacher) {
    console.error('❌ Không tìm thấy tài khoản giáo viên. Hãy chạy "npm run db:seed" trước.')
    return
  }

  // Xóa các đề thi cũ để cập nhật đề thi chuẩn mới
  await prisma.attemptAnswer.deleteMany({})
  await prisma.examAttempt.deleteMany({})
  await prisma.examQuestion.deleteMany({})
  await prisma.examSection.deleteMany({})
  await prisma.exam.deleteMany({})

  // =========================================================================
  // ĐỀ THI THPT QUỐC GIA 2026 - CHUẨN CẤU TRÚC BỘ GD&ĐT
  // Thời gian: 50 phút
  // =========================================================================
  const examTHPT = await prisma.exam.create({
    data: {
      authorId: teacher.id,
      title: 'Đề minh họa Tốt nghiệp THPT 2026 môn Tiếng Anh',
      description: 'Đề thi chuẩn cấu trúc mới nhất theo Chương trình GDPT 2018 gồm 4 dạng bài: Điền từ ngắn (Quảng cáo/Tờ rơi), Sắp xếp câu thành đoạn văn/thư, Điền câu dài và Đọc hiểu chuyên sâu.',
      type: ExamType.NATIONAL_MOCK,
      grade: 12,
      duration: 50, // Chuẩn 50 phút
      totalPoints: 10,
      passingScore: 5,
      status: ContentStatus.PUBLISHED,
      isPublic: true,
      showResult: true,
    }
  })

  // -------------------------------------------------------------------------
  // DẠNG 1: ĐIỀN TỪ/CỤM TỪ NGẮN (12 CÂU: Q1 - Q12)
  // -------------------------------------------------------------------------
  const section1 = await prisma.examSection.create({
    data: {
      examId: examTHPT.id,
      title: 'Phần 1: Điền từ/cụm từ ngắn (Quảng cáo & Tờ rơi)',
      instruction: 'Read the following advertisement/leaflet and mark the letter A, B, C, or D on your answer sheet to indicate the option that best fits each of the numbered blanks.',
      order: 1,
      skill: Skill.READING,
    }
  })

  // Bài đọc 1: Quảng cáo Huong Pagoda Festival 2026 (Q1 - Q6)
  const passageHuongPagoda = `The Huong Pagoda Festival 2026 officially commenced in Hanoi, attracting thousands of pilgrims and tourists from across the country. As one of (1) _______ largest spiritual events in northern Viet Nam, the festival continues to draw widespread attention.

The Huong Pagoda complex includes more than twenty pagodas and temples (2) _______ along the scenic Yen Stream, forming a unique religious landscape that blends culture and nature.

To enhance service standards, the district council upgraded transport routes and parking areas. They then introduced (3) _______ initiatives, including digital ticketing systems and clearer visitor guidance.

Local authorities have (4) _______ security arrangements to ensure a safe and orderly festive season. Therefore, (5) _______ visitor is required to follow safety regulations for a smooth and respectful experience.

The festival is well-known for its religious rituals and vibrant cultural programs designed to highlight traditional music and community activities.

Over the years, the event has contributed significantly to promoting Hanoi as a (6) _______ in Vietnam.`

  const q1 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      content: {
        passageTitle: 'HUONG PAGODA FESTIVAL 2026',
        passage: passageHuongPagoda,
        text: 'Question 1: Mark the letter A, B, C, or D to indicate the best fit for blank (1).'
      },
      explanation: 'Kiến thức về mạo từ trong cấu trúc so sánh nhất: "one of the + so sánh nhất" -> Chọn "the" trước "largest spiritual events".',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'the', isCorrect: true, order: 0 },
          { text: 'a', isCorrect: false, order: 1 },
          { text: 'Ø (no article)', isCorrect: false, order: 2 },
          { text: 'an', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q2 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'HUONG PAGODA FESTIVAL 2026',
        passage: passageHuongPagoda,
        text: 'Question 2: Mark the letter A, B, C, or D to indicate the best fit for blank (2).'
      },
      explanation: 'Rút gọn mệnh đề quan hệ dạng bị động: "...pagodas and temples (which are) located along..." -> Rút gọn còn quá khứ phân từ "located".',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'which locates', isCorrect: false, order: 0 },
          { text: 'locating', isCorrect: false, order: 1 },
          { text: 'which is located', isCorrect: false, order: 2 },
          { text: 'located', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  const q3 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.VOCABULARY,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'HUONG PAGODA FESTIVAL 2026',
        passage: passageHuongPagoda,
        text: 'Question 3: Mark the letter A, B, C, or D to indicate the best fit for blank (3).'
      },
      explanation: 'Lượng từ đi với danh từ số nhiều đếm được: "other + plural noun" (other initiatives = các sáng kiến khác). "the others" và "others" đóng vai trò đại từ không đứng trực tiếp trước danh từ.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'the others', isCorrect: false, order: 0 },
          { text: 'others', isCorrect: false, order: 1 },
          { text: 'other', isCorrect: true, order: 2 },
          { text: 'another', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q4 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.VOCABULARY,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'HUONG PAGODA FESTIVAL 2026',
        passage: passageHuongPagoda,
        text: 'Question 4: Mark the letter A, B, C, or D to indicate the best fit for blank (4).'
      },
      explanation: 'Cụm động từ (Phrasal Verb): "step up" mang nghĩa tăng cường, đẩy mạnh (step up security arrangements = tăng cường các biện pháp thắt chặt an ninh).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'stepped up', isCorrect: true, order: 0 },
          { text: 'turned up', isCorrect: false, order: 1 },
          { text: 'ended up', isCorrect: false, order: 2 },
          { text: 'used up', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q5 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'HUONG PAGODA FESTIVAL 2026',
        passage: passageHuongPagoda,
        text: 'Question 5: Mark the letter A, B, C, or D to indicate the best fit for blank (5).'
      },
      explanation: '"each + singular noun + singular verb" (each visitor is required). Các từ "many", "some" đi với danh từ số nhiều, "much" đi với danh từ không đếm được.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'each', isCorrect: true, order: 0 },
          { text: 'many', isCorrect: false, order: 1 },
          { text: 'much', isCorrect: false, order: 2 },
          { text: 'some', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q6 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.VOCABULARY,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'HUONG PAGODA FESTIVAL 2026',
        passage: passageHuongPagoda,
        text: 'Question 6: Mark the letter A, B, C, or D to indicate the best fit for blank (6).'
      },
      explanation: 'Trật tự cụm danh từ tiếng Anh: "leading" (tính từ = hàng đầu) + "tourism" (danh từ đóng vai trò bổ ngữ = du lịch) + "destination" (danh từ chính = điểm đến) -> "leading tourism destination" (điểm đến du lịch hàng đầu).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'tourism leading destination', isCorrect: false, order: 0 },
          { text: 'leading destination tourism', isCorrect: false, order: 1 },
          { text: 'destination leading tourism', isCorrect: false, order: 2 },
          { text: 'leading tourism destination', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  // Bài đọc 2: Tờ rơi Eat That Frog! (Q7 - Q12)
  const passageEatThatFrog = `Imagine this scenario: You've taken up a new job or started a new course, (7) _______ you're already feeling overworked. You've got so many things to do. In his book Eat That Frog!, Brian Tracy explains how simple habits can help you reach your full potential and avoid burnout.

Below are four key strategies for improving productivity:
• Tackle your most difficult task first.
Your "frog" represents the task you are most likely to (8) _______ until later. Completing it early gives you a strong sense of achievement and builds motivation for the rest of the day.

• Write down clear goals.
Identify what you want to achieve in the next twelve months and focus on the objective that will have the greatest positive impact on your life. (9) _______ immediate action is essential for long-term success.

• Plan your day carefully.
Setting aside (10) _______ time for careful planning can also make a difference. Creating a to-do list allows you to organise tasks efficiently. Research suggests that systematic organisation can cause a noticeable increase in productivity, particularly when working towards a deadline.

• Develop consistent habits.
Observing successful people can improve your career prospects. When positive behaviours become second (11) _______, they require less effort and produce better long-term results.

Ultimately, consistent effort enhances long-term sustainability and personal (12) _______.`

  const q7 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      content: {
        passageTitle: 'EAT THAT FROG!',
        passage: passageEatThatFrog,
        text: 'Question 7: Mark the letter A, B, C, or D to indicate the best fit for blank (7).'
      },
      explanation: 'Liên từ chỉ quan hệ tương phản: "Vừa mới nhận việc mới... nhưng (but) bạn đã cảm thấy quá tải".',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'or', isCorrect: false, order: 0 },
          { text: 'as', isCorrect: false, order: 1 },
          { text: 'so', isCorrect: false, order: 2 },
          { text: 'but', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  const q8 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.VOCABULARY,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'EAT THAT FROG!',
        passage: passageEatThatFrog,
        text: 'Question 8: Mark the letter A, B, C, or D to indicate the best fit for blank (8).'
      },
      explanation: '"postpone until later" = trì hoãn lại cho tới sau này. Các từ "reject" (từ chối), "abandon" (bỏ rơi), "cancel" (hủy bỏ) không phù hợp ngữ cảnh.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'reject', isCorrect: false, order: 0 },
          { text: 'postpone', isCorrect: true, order: 1 },
          { text: 'abandon', isCorrect: false, order: 2 },
          { text: 'cancel', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q9 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.VOCABULARY,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'EAT THAT FROG!',
        passage: passageEatThatFrog,
        text: 'Question 9: Mark the letter A, B, C, or D to indicate the best fit for blank (9).'
      },
      explanation: 'Cụm cố định: "take action" = hành động. Ở đầu câu làm chủ ngữ cần dạng Gerund: "Taking immediate action is essential...".',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'Making', isCorrect: false, order: 0 },
          { text: 'Getting', isCorrect: false, order: 1 },
          { text: 'Taking', isCorrect: true, order: 2 },
          { text: 'Doing', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q10 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'EAT THAT FROG!',
        passage: passageEatThatFrog,
        text: 'Question 10: Mark the letter A, B, C, or D to indicate the best fit for blank (10).'
      },
      explanation: '"time" là danh từ không đếm được. "a little time" mang sắc thái tích cực (dành ra một chút thời gian để lên kế hoạch). "few / a few" chỉ dùng cho danh từ đếm được.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'a little', isCorrect: true, order: 0 },
          { text: 'little', isCorrect: false, order: 1 },
          { text: 'few', isCorrect: false, order: 2 },
          { text: 'a few', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q11 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.VOCABULARY,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'EAT THAT FROG!',
        passage: passageEatThatFrog,
        text: 'Question 11: Mark the letter A, B, C, or D to indicate the best fit for blank (11).'
      },
      explanation: 'Thành ngữ cố định (Idiom): "become second nature" (to someone) = trở thành bản năng thứ hai, thói quen tự nhiên ăn sâu mà không cần cố gắng nhiều.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'instinct', isCorrect: false, order: 0 },
          { text: 'habit', isCorrect: false, order: 1 },
          { text: 'routine', isCorrect: false, order: 2 },
          { text: 'nature', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  const q12 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.VOCABULARY,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'EAT THAT FROG!',
        passage: passageEatThatFrog,
        text: 'Question 12: Mark the letter A, B, C, or D to indicate the best fit for blank (12).'
      },
      explanation: 'Sau tính từ "personal" và liên từ "and" (song hành với danh từ "sustainability") cần một danh từ: "personal effectiveness" (hiệu quả / năng suất cá nhân).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'effect', isCorrect: false, order: 0 },
          { text: 'effectively', isCorrect: false, order: 1 },
          { text: 'effectiveness', isCorrect: true, order: 2 },
          { text: 'effective', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // -------------------------------------------------------------------------
  // DẠNG 2: SẮP XẾP CÂU ĐÚNG THỨ TỰ (5 CÂU: Q13 - Q17)
  // -------------------------------------------------------------------------
  const section2 = await prisma.examSection.create({
    data: {
      examId: examTHPT.id,
      title: 'Phần 2: Sắp xếp câu thành đoạn văn/thư hoàn chỉnh',
      instruction: 'Mark the letter A, B, C or D on your answer sheet to indicate the best arrangement of utterances or sentences to make a cohesive and coherent exchange or text in each of the following questions.',
      order: 2,
      skill: Skill.READING,
    }
  })

  const q13 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        text: 'Question 13: Choose the best arrangement of utterances to make a coherent dialogue.',
        sentences: [
          { label: 'a', text: "Mike: Not bad, thanks. I'm just glad it's over! How about you? How'd your presentation go?" },
          { label: 'b', text: 'Lucy: Sure thing! Come over around 10:00, after breakfast.' },
          { label: 'c', text: 'Lucy: Hey! How did your Pragmatics exam go?' },
          { label: 'd', text: 'Mike: No problem. So... do you feel like studying tomorrow for our English exam?' },
          { label: 'e', text: 'Lucy: Oh, it went really well. Thanks for helping me with it!' }
        ]
      },
      explanation: 'Trật tự hội thoại logic: c (Lucy hỏi về bài thi) -> a (Mike trả lời & hỏi lại) -> e (Lucy phản hồi tốt & cảm ơn) -> d (Mike rủ học nhóm) -> b (Lucy đồng ý & hẹn giờ).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'e - d - b - c - a', isCorrect: false, order: 0 },
          { text: 'c - a - e - d - b', isCorrect: true, order: 1 },
          { text: 'c - d - e - a - b', isCorrect: false, order: 2 },
          { text: 'e - a - c - d - b', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q14 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        text: 'Question 14: Choose the best arrangement of sentences to make a coherent report on population trends.',
        sentences: [
          { label: 'a', text: 'The upward trend continued and in 2020, more than half of its population lived in urban areas. In the next twenty years, the urban population is expected to reach 65 per cent of the total population.' },
          { label: 'b', text: "The line graph shows population trends in Fantasia's urban and rural areas over the 1950-2040 period." },
          { label: 'c', text: 'By contrast, the urban population grew throughout the same period. In 1950, the percentage of urban population was just around 6 per cent. It increased slightly to 15 per cent in 1980.' },
          { label: 'd', text: 'Overall, the urban population has increased and will continue to grow while the rural population has decreased and will continue to fall.' },
          { label: 'e', text: "In 1950, 94 per cent or most of Fantasia's population lived in rural areas; this figure remained stable until 1960 before falling to 48 per cent in 2020 and is expected to drop to 35 per cent in 2040." }
        ]
      },
      explanation: 'Bố cục bài phân tích biểu đồ chuẩn: Mở đầu giới thiệu (b) -> Tổng quan xu hướng (d) -> Chi tiết nông thôn giảm (e) -> Tương phản với đô thị tăng (c) -> Đô thị tiếp tục tăng trong tương lai (a) -> Trật tự: b - d - e - c - a.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'b - c - d - a - e', isCorrect: false, order: 0 },
          { text: 'b - a - d - c - e', isCorrect: false, order: 1 },
          { text: 'b - e - d - a - c', isCorrect: false, order: 2 },
          { text: 'b - d - e - c - a', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  const q15 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        text: 'Question 15: Choose the best arrangement of sentences to make a formal complaint letter from Laura Brown.',
        sentences: [
          { label: 'a', text: 'After bringing it home and installing it correctly, I found that it did not work properly.' },
          { label: 'b', text: 'Please advise me on how to return the faulty item. I look forward to your prompt response.' },
          { label: 'c', text: 'Whenever the power is on, the drum does not spin, and the machine makes a strange noise.' },
          { label: 'd', text: 'I am writing to complain about a washing machine I purchased from your store on 22 February 2026.' },
          { label: 'e', text: 'As this is a brand-new product and still under warranty, I would like to request a replacement or a full refund.' }
        ]
      },
      explanation: 'Thứ tự thư khiếu nại: Nêu mục đích phàn nàn và món hàng đã mua (d) -> Tình huống phát hiện lỗi sau khi lắp đặt (a) -> Chi tiết máy kêu và lồng giặt không quay (c) -> Yêu cầu đổi mới hoặc hoàn tiền theo bảo hành (e) -> Đề nghị phản hồi cách trả hàng (b) -> Trật tự: d - a - c - e - b.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'e - d - b - c - a', isCorrect: false, order: 0 },
          { text: 'c - a - d - b - e', isCorrect: false, order: 1 },
          { text: 'a - e - d - c - b', isCorrect: false, order: 2 },
          { text: 'd - a - c - e - b', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  const q16 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      content: {
        text: 'Question 16: Choose the best arrangement of utterances to make a coherent dialogue between Jane and Katy.',
        sentences: [
          { label: 'a', text: "Katy: Honestly, I'm not sure if I'll go. I don't know Sam that well." },
          { label: 'b', text: "Jane: Hi, Katy. Are you going to Sam's party at the weekend?" },
          { label: 'c', text: "Jane: Don't worry. He's very friendly, so I think you two will get along." }
        ]
      },
      explanation: 'Jane mở lời hỏi đi tiệc không (b) -> Katy e ngại vì chưa thân với Sam (a) -> Jane động viên Sam thân thiện (c) -> Trật tự: b - a - c.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'c - a - b', isCorrect: false, order: 0 },
          { text: 'b - a - c', isCorrect: true, order: 1 },
          { text: 'b - c - a', isCorrect: false, order: 2 },
          { text: 'a - b - c', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q17 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        text: 'Question 17: Choose the best arrangement of sentences to make a coherent paragraph on media literacy.',
        sentences: [
          { label: 'a', text: 'Firstly, it helps people distinguish between reliable sources and misleading or false content.' },
          { label: 'b', text: 'As a result, individuals are better equipped to make informed decisions and avoid being manipulated by misinformation.' },
          { label: 'c', text: 'Media literacy also encourages audiences to recognize bias, persuasive techniques, and hidden agendas in advertisements and news reports.' },
          { label: 'd', text: 'On a larger scale, integrating media literacy education into school curricula is crucial for developing responsible and critical thinkers.' },
          { label: 'e', text: 'Media literacy is an essential skill in the modern world because it enables individuals to critically evaluate the vast amount of information they encounter every day.' }
        ]
      },
      explanation: 'Câu chủ đề mở đầu nêu tầm quan trọng của media literacy (e) -> Lợi ích 1: phân biệt tin thật/giả (a) -> Lợi ích 2: nhận diện thiên kiến (c) -> Kết quả của 2 lợi ích trên (b) -> Mở rộng tầm vĩ mô vào trường học (d) -> Trật tự: e - a - c - b - d.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'e - c - a - d - b', isCorrect: false, order: 0 },
          { text: 'c - a - b - d - e', isCorrect: false, order: 1 },
          { text: 'e - a - c - b - d', isCorrect: true, order: 2 },
          { text: 'c - b - a - e - d', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // -------------------------------------------------------------------------
  // DẠNG 3: ĐIỀN CÂU/CỤM TỪ DÀI VÀO BÀI ĐỌC (5 CÂU: Q18 - Q22)
  // -------------------------------------------------------------------------
  const section3 = await prisma.examSection.create({
    data: {
      examId: examTHPT.id,
      title: 'Phần 3: Điền câu/cụm từ dài vào bài đọc',
      instruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks from 18 to 22.',
      order: 3,
      skill: Skill.READING,
    }
  })

  const passageMemorization = `Throughout history, scholars have recognised that memory plays a central role in cognitive development. It is therefore essential to understand which techniques can help us memorize more efficiently. One of the most effective ways (18) _______. Below are two simple techniques to help you remember everything, even a shopping list of eight items.

The first method involves creating a vivid and unusual story. For example, picture a giant loaf of bread with coffee suddenly spraying out like a fountain. The coffee turns into white yoghurt, (19) _______. Olives run across the bridge while large eggs chase them. The olives hide behind a carton of orange juice. When you try to eat one, it becomes a bitter-tasting onion. (20) _______.

The second technique is called the "memory palace". Visualize your home and mentally walk through each room. Place the items from your list in specific locations, such as bread on the doormat or coffee in front of the TV. (21) _______, you make the information easier to recall. Not only is this strategy useful for shopping lists (22) _______.`

  const q18 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'MEMORIZATION TECHNIQUES',
        passage: passageMemorization,
        text: 'Question 18: Mark the letter A, B, C, or D to indicate the best fit for blank (18).'
      },
      explanation: 'Chủ ngữ "One of the most effective ways" là số ít nên đi với to be "is" + to V -> "is to use imagination".',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'may be use imagination', isCorrect: false, order: 0 },
          { text: 'is to avoid using imagination', isCorrect: false, order: 1 },
          { text: 'is to use imagination', isCorrect: true, order: 2 },
          { text: 'are imagining effectively', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q19 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'MEMORIZATION TECHNIQUES',
        passage: passageMemorization,
        text: 'Question 19: Mark the letter A, B, C, or D to indicate the best fit for blank (19).'
      },
      explanation: 'Mệnh đề quan hệ không xác định có "which" làm chủ ngữ bổ nghĩa cho "white yoghurt" ở trước: "...which flows into a river passing under a bridge made of steak".',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'flowing into a river that passed under a bridge made from steak', isCorrect: false, order: 0 },
          { text: 'into which flows a river passing through a bridge made from steak', isCorrect: false, order: 1 },
          { text: 'which flows into a river passing under a bridge made of steak', isCorrect: true, order: 2 },
          { text: 'the river then flows and passes through a bridge made of steak', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q20 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'MEMORIZATION TECHNIQUES',
        passage: passageMemorization,
        text: 'Question 20: Mark the letter A, B, C, or D to indicate the best fit for blank (20).'
      },
      explanation: 'Câu kết đoạn tổng kết giá trị của phương pháp liên tưởng kỳ lạ: "These strange and colourful images help fix the items in your mind" (Những hình ảnh kỳ lạ và đầy màu sắc này giúp ghim chặt các món đồ vào tâm trí bạn).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'Such usual mental sequences immediately quell your curiosity', isCorrect: false, order: 0 },
          { text: 'These strange and colourful images help fix the items in your mind', isCorrect: true, order: 1 },
          { text: 'In this way, the stories appear more entertaining and engaging', isCorrect: false, order: 2 },
          { text: 'These strange and colourful images may confuse your memory', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q21 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'MEMORIZATION TECHNIQUES',
        passage: passageMemorization,
        text: 'Question 21: Mark the letter A, B, C, or D to indicate the best fit for blank (21).'
      },
      explanation: 'Cụm giới từ chỉ cách thức phù hợp logic: "By forming personal and clear associations" (Bằng cách hình thành các liên tưởng rõ ràng và mang tính cá nhân, bạn làm cho thông tin dễ nhớ lại hơn).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'By forming personal and clear associations', isCorrect: true, order: 0 },
          { text: 'If the information is defined several times', isCorrect: false, order: 1 },
          { text: 'When you create vivid yet impersonal images', isCorrect: false, order: 2 },
          { text: 'Despite the use of detailed mental pictures', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q22 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.GRAMMAR,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'MEMORIZATION TECHNIQUES',
        passage: passageMemorization,
        text: 'Question 22: Mark the letter A, B, C, or D to indicate the best fit for blank (22).'
      },
      explanation: 'Cấu trúc đảo ngữ kết hợp: "Not only is this strategy useful for... but it is also beneficial for some people to deliver speeches without notes" (Không chỉ chiến lược này hữu ích cho danh sách mua sắm, mà nó còn mang lại lợi ích cho một số người khi diễn thuyết không cần giấy ghi chú).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'although it is also helpful when some people give speeches without cues', isCorrect: false, order: 0 },
          { text: 'but it benefits all people who deliver speeches using prompts as well', isCorrect: false, order: 1 },
          { text: 'but also some people are beneficial from giving a speech without notes', isCorrect: false, order: 2 },
          { text: 'but it is also beneficial for some people to deliver speeches without notes', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  // -------------------------------------------------------------------------
  // DẠNG 4: ĐỌC HIỂU CHUYÊN SÂU (8 CÂU: Q23 - Q30)
  // -------------------------------------------------------------------------
  const section4 = await prisma.examSection.create({
    data: {
      examId: examTHPT.id,
      title: 'Phần 4: Đọc hiểu văn bản chuyên sâu',
      instruction: 'Read the following passage and mark the letter A, B, C, or D on your answer sheet to indicate the best answer to each of the following questions from 23 to 40.',
      order: 4,
      skill: Skill.READING,
    }
  })

  const passageBrainStress = `Although our brain accounts for just 2 percent of our body weight, the organ consumes half of our daily carbohydrate requirements — and glucose is its most important fuel. Under acute stress, the brain requires some 12 percent more energy, prompting many to gravitate towards sugary snacks.

Carbohydrates provide the body with the quickest source of energy. In fact, in cognitive tests subjects who were stressed performed poorly prior to eating. Their performance, however, went back to normal after consuming carbohydrates.

The regulation of hunger involves several brain regions that control metabolism and feeding behaviour. One key structure acts as a kind of gatekeeper. When this region registers that the brain lacks glucose, it limits signals from the rest of the body. As a result, people often turn to carbohydrates as soon as the brain signals a need for energy, even if the body still has sufficient reserves.

To explore the relationship between stress and eating behaviour, researchers conducted an experiment with 40 participants. In one session, the participants delivered a ten-minute speech in front of strangers. In another session, they did not have to speak. After each session, scientists measured levels of the stress hormones cortisol and adrenaline and then provided a food buffet. When the participants gave a speech before the buffet, they were more stressed, and on average consumed an additional 34 grams of carbohydrates, than when they did not give a speech.

In everyday life, cravings for sweet foods may also have a physiological explanation. When the brain lacks energy, it may increase the production of stress hormones, which over time can raise the risk of heart disease, stroke, or depression. Studies also suggest that people who experienced high levels of stress in childhood may develop stronger preferences for sweets later in life.

For some people, especially those under long-term stress, cravings for sweets may not be a lack of self-control. Instead, they may reflect the brain's need for energy. Reducing stress may be the key to healthier eating habits.`

  const q23 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: 'Question 23: Which of the following is NOT mentioned as a reason for sugary food cravings?'
      },
      explanation: 'Trong bài đoạn 3 có ghi: "...even if the body still has sufficient reserves" (ngay cả khi cơ thể vẫn còn đủ năng lượng dự trữ), vì vậy đáp án B ("The body may completely exhaust its internal energy reserves") là không được nhắc đến.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'The brain relies heavily on glucose as its primary fuel.', isCorrect: false, order: 0 },
          { text: 'The body may completely exhaust its internal energy reserves.', isCorrect: true, order: 1 },
          { text: 'The brain requires additional energy during periods of stress.', isCorrect: false, order: 2 },
          { text: 'Carbohydrates serve as a rapid source of energy for the body.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q24 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: 'Question 24: The phrase "gravitate towards" in paragraph 1 is OPPOSITE in meaning to _______.'
      },
      explanation: '"gravitate towards" có nghĩa là hướng về, bị thu hút về phía cái gì. Do đó từ TRÁI NGHĨA là "abstain from" (kiêng, tránh xa).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'abstain from', isCorrect: true, order: 0 },
          { text: 'derive from', isCorrect: false, order: 1 },
          { text: 'incline to', isCorrect: false, order: 2 },
          { text: 'predispose to', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q25 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: 'Question 25: The word "registers" in paragraph 3 can be best replaced by _______.'
      },
      explanation: '"When this region registers that the brain lacks glucose..." -> "registers" ở đây có nghĩa là ghi nhận, nhận biết được tín hiệu = "perceives" (hoặc detects).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'suppresses', isCorrect: false, order: 0 },
          { text: 'perceives', isCorrect: true, order: 1 },
          { text: 'monitors', isCorrect: false, order: 2 },
          { text: 'applies', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q26 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: 'Question 26: The word "they" in paragraph 6 refers to _______.'
      },
      explanation: 'Trong câu: "...cravings for sweets may not be a lack of self-control. Instead, they may reflect the brain\'s need for energy" -> đại từ "they" thay thế cho danh từ số nhiều đứng trước là "cravings".',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'sweets', isCorrect: false, order: 0 },
          { text: 'people', isCorrect: false, order: 1 },
          { text: 'cravings', isCorrect: true, order: 2 },
          { text: 'habits', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q27 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: `Question 27: Which of the following best paraphrases the underlined sentence in paragraph 5?
"When the brain lacks energy, it may increase the production of stress hormones, which over time can raise the risk of heart disease, stroke, or depression."`
      },
      explanation: 'Phương án B diễn giải chính xác: "Insufficient food intake may prompt the brain to increase stress hormone production, thereby raising long-term risks of cardiovascular and mental health disorders." (tim mạch = heart disease, stroke; tâm thần = depression).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'A sustained increase in stress hormones may arise when the brain lacks energy, eventually raising the risk of heart disease or depression.', isCorrect: false, order: 0 },
          { text: 'Insufficient food intake may prompt the brain to increase stress hormone production, thereby raising long-term risks of cardiovascular and mental health disorders.', isCorrect: true, order: 1 },
          { text: 'When people do not consume sufficient food, the body gradually struggles to regulate stress hormones, which may contribute to chronic illness.', isCorrect: false, order: 2 },
          { text: 'Skipping meals can unintentionally trigger serious conditions such as stroke or heart disease because the brain does not receive enough energy.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q28 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: 'Question 28: Which of the following is TRUE according to the passage?'
      },
      explanation: 'Dẫn chứng đoạn 3: "When this region registers that the brain lacks glucose, it limits signals from the rest of the body." -> Đúng với đáp án A: "When the brain senses a shortage of glucose, it may ignore signals from the rest of the body."',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'When the brain senses a shortage of glucose, it may ignore signals from the rest of the body.', isCorrect: true, order: 0 },
          { text: 'People experiencing stress usually lose their appetite because their brains require more energy.', isCorrect: false, order: 1 },
          { text: 'Eating sugary foods is the most effective way to reduce stress hormones in the body.', isCorrect: false, order: 2 },
          { text: 'The hypothalamus is the only part of the brain that is responsible for controlling hunger.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q29 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: 'Question 29: Which paragraph suggests that cravings for sweet foods may not indicate an individual\'s deficiency?'
      },
      explanation: 'Đoạn 6 viết: "For some people, especially those under long-term stress, cravings for sweets may not be a lack of self-control. Instead, they may reflect the brain\'s need for energy." (thèm ngọt không phải do thiếu khả năng tự chủ cá nhân).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'Paragraph 5', isCorrect: false, order: 0 },
          { text: 'Paragraph 6', isCorrect: true, order: 1 },
          { text: 'Paragraph 3', isCorrect: false, order: 2 },
          { text: 'Paragraph 4', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q30 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'THE BRAIN, STRESS AND CARBOHYDRATES',
        passage: passageBrainStress,
        text: 'Question 30: Which paragraph provides experimental evidence that eating carbohydrates can improve task performance?'
      },
      explanation: 'Dẫn chứng đoạn 2: "In fact, in cognitive tests subjects who were stressed performed poorly prior to eating. Their performance, however, went back to normal after consuming carbohydrates." -> Đoạn 2 cung cấp bằng chứng thực nghiệm về cải thiện hiệu suất công việc.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'Paragraph 2', isCorrect: true, order: 0 },
          { text: 'Paragraph 1', isCorrect: false, order: 1 },
          { text: 'Paragraph 3', isCorrect: false, order: 2 },
          { text: 'Paragraph 4', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  // -------------------------------------------------------------------------
  // Bài đọc 2: Celebrity Carbon Footprints & Private Jets (Q31 - Q40)
  // -------------------------------------------------------------------------
  const passageCelebrityEmissions = `In their article “Just Plane Wrong: Celebs with the Worst Private Jet CO2 Emissions,” YARD ranked Taylor Swift as the celebrity with the largest carbon footprint, attributing 138 tons of emissions to her private jet. Jay-Z and Floyd Mayweather followed closely behind. Swift’s recent attendance at Kansas City Chiefs games to support her partner, Travis Kelce, has intensified media scrutiny. Celebrities receiving public criticism for air travel is hardly a new phenomenon. Singling out one individual risks oversimplifying a broader issue that predates any particular headline. [I]

Carbon emissions are, to some extent, unavoidable for high-profile public figures who travel frequently. In “Rich Enough to Offset,” Laura Kiesel explores the ever-increasing carbon emissions of celebrities including Arnold Schwarzenegger and Leonardo DiCaprio, and how they have tried to account for them. One popular approach is carbon offsetting, a practice that allows individuals to compensate for emissions by funding environmental initiatives, including reforestation or renewable energy projects. [II] While such efforts may signal accountability, critics argue that they rarely neutralize emissions in any meaningful sense.

Professor Jon Erickson of the University of Vermont highlights concerns about the unintended consequences of certain offset projects, particularly in developing regions. Some initiatives, such as small-scale solar schemes established to counterbalance luxury emissions, may inadvertently limit resources available for essential services like healthcare and education. Furthermore, these efforts do little to address the root causes of excess carbon emissions. Erickson therefore calls for stronger legislative measures, including mandated caps on emissions that would directly address the source of the problem without displacing its impacts. [III]

Celebrity air travel remains under constant scrutiny, regardless of public sentiment. Although voluntary offset programmes may help restore celebrities’ reputations, they can also legitimise continued overconsumption. In “Don’t Bet on Offsets,” A.C. Thompson and Duane Moles question whether such mechanisms can realistically counteract emissions. Companies such as TerraPass offer affluent consumers the opportunity to calculate and compensate for their carbon footprints, yet these transactions often occur in loosely regulated markets lacking consistent standards. [IV]

While carbon offsetting provides limited mitigation opportunities, meaningful progress depends on systemic reforms that reduce overall emissions and confront the underlying causes of climate impact.`

  const q31 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 31: The author mentions Taylor Swift in paragraph 1 primarily to _______.'
      },
      explanation: 'Dẫn chứng cuối đoạn 1: "Singling out one individual risks oversimplifying a broader issue that predates any particular headline." (Việc nhắm vào một cá nhân có nguy cơ đơn giản hóa quá mức một vấn đề rộng lớn hơn). Tác giả nhắc đến Taylor Swift nhằm minh họa cách một trường hợp cá nhân có thể làm lu mờ vấn đề cơ cấu rộng lớn hơn.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'demonstrate that celebrities are unfairly targeted by environmental critics', isCorrect: false, order: 0 },
          { text: 'argue that public figures are the main contributors to climate change', isCorrect: false, order: 1 },
          { text: 'illustrate how individual cases can obscure a broader structural issue', isCorrect: true, order: 2 },
          { text: 'suggest that media attention exaggerates environmental concerns', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q32 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.EASY,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 32: The phrase "such efforts" in paragraph 2 refers to _______.'
      },
      explanation: 'Dẫn chứng đoạn 2: "...by funding environmental initiatives, including reforestation or renewable energy projects. While such efforts may signal accountability..." -> "such efforts" (những nỗ lực như vậy) quy chiếu đến "environmental initiatives" (các sáng kiến môi trường) ở câu liền trước.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'high-profile individuals', isCorrect: false, order: 0 },
          { text: 'environmental initiatives', isCorrect: true, order: 1 },
          { text: 'carbon emissions', isCorrect: false, order: 2 },
          { text: 'renewable energy projects', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q33 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 33: According to paragraph 2, how do some celebrities attempt to manage their environmental impact?'
      },
      explanation: 'Dẫn chứng đoạn 2: "One popular approach is carbon offsetting, a practice that allows individuals to compensate for emissions by funding environmental initiatives, including reforestation or renewable energy projects." (Tài trợ tài chính cho các dự án môi trường để bù đắp khí thải).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'By investing exclusively in large-scale renewable infrastructure', isCorrect: false, order: 0 },
          { text: 'By reducing the frequency of their international travel schedules', isCorrect: false, order: 1 },
          { text: 'By financially supporting environmental projects to offset emissions', isCorrect: true, order: 2 },
          { text: 'By complying with mandatory government carbon regulations', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q34 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 34: According to paragraph 3, some offset initiatives may be problematic because they _______.'
      },
      explanation: 'Dẫn chứng đoạn 3: "Some initiatives, such as small-scale solar schemes established to counterbalance luxury emissions, may inadvertently limit resources available for essential services like healthcare and education" (vô tình hạn chế nguồn lực cho các dịch vụ thiết yếu như y tế và giáo dục tại các cộng đồng thu nhập thấp/vùng đang phát triển).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'eliminate local employment opportunities in developing regions', isCorrect: false, order: 0 },
          { text: 'unintentionally limit essential services in lower-income communities', isCorrect: true, order: 1 },
          { text: 'increase the operational costs of small-scale solar installations', isCorrect: false, order: 2 },
          { text: 'reduce investment in global renewable energy schemes and markets', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q35 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: `Question 35: Which of the following best paraphrases the underlined sentence in paragraph 3?
"Furthermore, these efforts do little to address the root causes of excess carbon emissions."`
      },
      explanation: '"do little to address" = "make minimal progress in tackling" (đạt rất ít tiến triển trong việc giải quyết); "the root causes of excess carbon emissions" = "the underlying issue of excessive carbon emissions" (vấn đề gốc rễ căn bản của lượng khí thải quá mức).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'These initiatives make minimal progress in tackling the underlying issue of excessive carbon emissions.', isCorrect: true, order: 0 },
          { text: 'These efforts tend to focus on reducing visible emissions rather than their overall generated volume.', isCorrect: false, order: 1 },
          { text: 'These programmes shift responsibility for tackling carbon emissions to alternative environmental sectors.', isCorrect: false, order: 2 },
          { text: 'These initiatives are likely to eliminate the primary factors responsible for high carbon emissions.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q36 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 36: Which of the following is TRUE according to paragraph 4?'
      },
      explanation: 'Dẫn chứng cuối đoạn 4: "...yet these transactions often occur in loosely regulated markets lacking consistent standards." -> "loosely regulated" tương đương với "poorly regulated environments" (môi trường/thị trường quản lý lỏng lẻo).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'TerraPass has eliminated doubts about carbon neutrality claims.', isCorrect: false, order: 0 },
          { text: 'Offset programmes guarantee measurable reductions in emissions.', isCorrect: false, order: 1 },
          { text: 'Carbon offset markets operate under strict international regulation.', isCorrect: false, order: 2 },
          { text: 'Some offset transactions occur in poorly regulated environments.', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  const q37 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 37: The word "legitimise" in paragraph 4 is closest in meaning to _______.'
      },
      explanation: '"legitimise" (hợp thức hóa, biến thành chính đáng) đồng nghĩa với "justify" (biện minh, làm cho hợp lý).',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'conceal', isCorrect: false, order: 0 },
          { text: 'justify', isCorrect: true, order: 1 },
          { text: 'restrict', isCorrect: false, order: 2 },
          { text: 'calculate', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q38 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 38: Which of the following can be inferred from the passage?'
      },
      explanation: 'Bài viết nhấn mạnh việc bù trừ carbon có thể làm giảm bớt áp lực môi trường tạm thời nhưng không giải quyết tận gốc và không thay đổi hành vi xả thải ("do little to address the root causes", "rarely neutralize emissions in any meaningful sense").',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'Carbon offsetting may alleviate certain environmental pressures but does not fundamentally transform emission-producing behaviour.', isCorrect: true, order: 0 },
          { text: 'Carbon offsetting provides a comprehensive remedy capable of permanently eliminating luxury-related carbon emissions.', isCorrect: false, order: 1 },
          { text: 'Carbon offsetting functions primarily as a public relations strategy without individuals’ sense of accountability towards the environment.', isCorrect: false, order: 2 },
          { text: 'Carbon offsetting guarantees measurable climate benefits through market-based investment in renewable initiatives.', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q39 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: `Question 39: Where in the passage does the following sentence best fit?
"This environment creates space for exaggerated claims of carbon neutrality without verifiable outcomes."`
      },
      explanation: '"This environment" (môi trường này) tiếp nối trực tiếp cụm từ "loosely regulated markets lacking consistent standards" (thị trường quản lý lỏng lẻo và thiếu tiêu chuẩn nhất quán) ở câu cuối đoạn 4, ngay trước vị trí [IV].',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: '[III]', isCorrect: false, order: 0 },
          { text: '[I]', isCorrect: false, order: 1 },
          { text: '[IV]', isCorrect: true, order: 2 },
          { text: '[II]', isCorrect: false, order: 3 },
        ]
      }
    }
  })

  const q40 = await prisma.question.create({
    data: {
      authorId: teacher.id,
      skill: Skill.READING,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.HARD,
      content: {
        passageTitle: 'CELEBRITY CARBON FOOTPRINTS & PRIVATE JETS',
        passage: passageCelebrityEmissions,
        text: 'Question 40: Which of the following best summarises the passage?'
      },
      explanation: 'Phương án D tóm tắt chính xác luận điểm toàn bài: Mặc dù người nổi tiếng dùng bù trừ carbon để giải quyết phát thải từ máy bay cá nhân, các nhà phê bình cho rằng các biện pháp này là chưa thỏa đáng và hành động bảo vệ khí hậu thực sự đòi hỏi phải cải cách mang tính hệ thống.',
      status: ContentStatus.PUBLISHED,
      options: {
        create: [
          { text: 'Carbon offset markets provide a practical mechanism for reducing the environmental impact of luxury air travel among high-profile individuals in response to growing criticism.', isCorrect: false, order: 0 },
          { text: 'Although media scrutiny of celebrity jet use has intensified, public criticism tends to focus disproportionately on affluent individuals rather than the broader patterns of carbon consumption.', isCorrect: false, order: 1 },
          { text: 'Growing public concern about luxury air travel has prompted calls for stricter government regulation of private aviation and improved oversight of carbon offset markets.', isCorrect: false, order: 2 },
          { text: 'Although celebrities adopt carbon offsetting to address emissions from private air travel, critics argue that these measures are inadequate and effective climate action requires systemic reform.', isCorrect: true, order: 3 },
        ]
      }
    }
  })

  // Gán tất cả câu hỏi vào các Section của ExamTHPT
  const sec1Questions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12]
  for (let i = 0; i < sec1Questions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        sectionId: section1.id,
        questionId: sec1Questions[i].id,
        order: i + 1,
        points: 0.25,
      }
    })
  }

  const sec2Questions = [q13, q14, q15, q16, q17]
  for (let i = 0; i < sec2Questions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        sectionId: section2.id,
        questionId: sec2Questions[i].id,
        order: i + 1,
        points: 0.25,
      }
    })
  }

  const sec3Questions = [q18, q19, q20, q21, q22]
  for (let i = 0; i < sec3Questions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        sectionId: section3.id,
        questionId: sec3Questions[i].id,
        order: i + 1,
        points: 0.25,
      }
    })
  }

  const sec4Questions = [
    q23, q24, q25, q26, q27, q28, q29, q30,
    q31, q32, q33, q34, q35, q36, q37, q38, q39, q40
  ]
  for (let i = 0; i < sec4Questions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        sectionId: section4.id,
        questionId: sec4Questions[i].id,
        order: i + 1,
        points: 0.25,
      }
    })
  }

  console.log('✅ Đã nạp thành công bộ đề thi chuẩn mới 2026!')
  console.log(`   Tên đề: ${examTHPT.title}`)
  console.log(`   Thời gian: ${examTHPT.duration} phút`)
  console.log(`   Số lượng câu: 40 câu hỏi trắc nghiệm chuẩn 100% (Đủ cả 4 dạng bài)`)
}

seedExams()
  .catch((e) => {
    console.error('❌ Lỗi seed đề thi:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
