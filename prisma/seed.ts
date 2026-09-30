import { PrismaClient, Role, Skill, Difficulty, QuestionType, ExamType, ContentStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Xóa toàn bộ dữ liệu bài học cũ (phải xóa bảng con trước bảng cha để không dính Foreign Key)
  await prisma.lessonProgress.deleteMany({})
  await prisma.enrollment.deleteMany({})
  await prisma.flashcardReview.deleteMany({})
  await prisma.vocabulary.deleteMany({})
  await prisma.lessonContent.deleteMany({})
  await prisma.examQuestion.deleteMany({})
  await prisma.lesson.deleteMany({})
  await prisma.topic.deleteMany({})
  
  await prisma.userXP.deleteMany({})
  await prisma.streak.deleteMany({})
  await prisma.userBadge.deleteMany({})
  
  await prisma.attemptAnswer.deleteMany({})
  await prisma.examAttempt.deleteMany({})
  await prisma.examQuestion.deleteMany({})
  await prisma.examSection.deleteMany({})
  await prisma.examAssignment.deleteMany({})
  await prisma.exam.deleteMany({})
  
  await prisma.questionOption.deleteMany({})
  await prisma.question.deleteMany({})
  
  await prisma.user.deleteMany({})

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
      email: 'giaovien@englishpro.vn',
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
      title: 'Unit 1 — Family Life',
      description: 'Chủ đề gia đình, công việc nhà và sự gắn kết',
      grade: 10,
      skill: null, // Chủ đề tổng hợp
      status: ContentStatus.PUBLISHED,
      order: 1,
    },
  })

  // 6. Tạo các bài học theo cấu trúc SGK chuẩn
  const lessonTitles = [
    { title: 'Vocabulary', skill: Skill.VOCABULARY },
    { title: 'I. Getting Started', skill: Skill.LISTENING },
    { title: 'II. Language', skill: Skill.GRAMMAR },
    { title: 'III. Reading', skill: Skill.READING },
    { title: 'IV. Speaking', skill: Skill.SPEAKING },
    { title: 'V. Listening', skill: Skill.LISTENING },
    { title: 'VI. Writing', skill: Skill.WRITING },
    { title: 'VII. Communication and Culture', skill: Skill.READING },
    { title: 'VIII. Looking Back', skill: Skill.GRAMMAR },
    { title: 'IX. Project', skill: Skill.WRITING },
  ];

  for (let i = 0; i < lessonTitles.length; i++) {
    await prisma.lesson.create({
      data: {
        topicId: topic.id,
        authorId: teacher.id,
        title: lessonTitles[i].title,
        description: `Nội dung bài học ${lessonTitles[i].title}`,
        skill: lessonTitles[i].skill,
        difficulty: Difficulty.MEDIUM,
        duration: 45,
        status: ContentStatus.PUBLISHED,
        order: i + 1,
        contents: {
          create: [
            {
              order: 1,
              type: 'text',
              content: { 
                html: i === 1 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px;">I. Getting Started - Household chores</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">1. Listen and read</h3>
  <p style="color: #6B7A94; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">Đây là đoạn hội thoại giữa Nam và Minh về việc phân chia công việc nhà trong gia đình. Học sinh cần nghe và đọc để nắm được nội dung chính.</p>
  
  <div style="background: #FFFDF7; border: 2px solid #E7DEC9; padding: 16px; border-radius: 12px; margin-bottom: 32px; box-shadow: 4px 4px 0 #E7DEC9;">
    <audio controls style="width: 100%; margin-bottom: 12px;">
      <source src="https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3" type="audio/mpeg" />
      Trình duyệt không hỗ trợ thẻ audio.
    </audio>
    <div style="border-top: 1px dashed #E7DEC9; padding-top: 12px; font-size: 14px; color: #6B7A94; font-style: italic; font-family: serif;">
      <strong>Transcript:</strong> Nam: Hello, Minh!<br>Minh: Hi, Nam. How are you?<br>Nam: I am busy doing housework...
    </div>
  </div>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">2. Read the conversation again and decide whether the following statements are true (T) or false (F)</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <table style="width: 100%; border-collapse: collapse; border: 1px solid #E7DEC9; background: #FFFDF7;">
    <tbody>
      <tr>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-size: 14px;">1. Nam's mother is cooking now.</td>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-family: 'JetBrains Mono', monospace; text-align: center; width: 60px;">F</td>
      </tr>
      <tr>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-size: 14px; background: #FDF3EC;">2. Everybody in Nam's family does some of the housework.</td>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-family: 'JetBrains Mono', monospace; text-align: center; background: #FDF3EC;">T</td>
      </tr>
      <tr>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-size: 14px;">3. The children in Minh's family don't have to do any housework.</td>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-family: 'JetBrains Mono', monospace; text-align: center;">T</td>
      </tr>
    </tbody>
  </table>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">3. Write the verbs or phrasal verbs that are used with the nouns or noun phrases in the conversation</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2;">
    <li>1. put out - the rubbish</li>
    <li>2. do - the laundry</li>
    <li>3. shop for - groceries</li>
    <li>4. do - the heavy lifting</li>
    <li>5. do - the washing-up</li>
  </ul>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">4. Complete the sentences from the conversation with the correct forms of the verbs in brackets</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2;">
    <li>1. I'd love to, but I'm afraid I can't. I <strong>(am preparing)</strong> dinner.</li>
    <li>2. My mum usually <strong>(does)</strong> the cooking, but she <strong>(is working)</strong> late today.</li>
  </ul>
</div>
                ` : i === 2 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">II. Language</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">Pronunciation: /br/, /kr/, and /tr/</h3>
  
  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">1. Listen and repeat. Pay attention to the consonant blends /br/, /kr/, and /tr/</h4>
  <div style="background: #FFFDF7; border: 2px solid #E7DEC9; padding: 16px; border-radius: 12px; margin-bottom: 32px; box-shadow: 4px 4px 0 #E7DEC9;">
    <audio controls style="width: 100%; margin-bottom: 12px;">
      <source src="https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3" type="audio/mpeg" />
    </audio>
    <p style="font-size: 14px; color: #6B7A94; font-style: italic; margin-bottom: 12px;">Học sinh cần luyện tập phát âm các âm /br/, /kr/, /tr/ qua các từ như:</p>
    <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 0;">
      <li>• /br/: breadwinner, breakfast, brown</li>
      <li>• /kr/: crash, crane, cream</li>
      <li>• /tr/: track, tree, train</li>
    </ul>
  </div>

  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">2. Listen to the sentences and circle the words you hear</h4>
  <div style="background: #FFFDF7; border: 2px solid #E7DEC9; padding: 16px; border-radius: 12px; margin-bottom: 32px; box-shadow: 4px 4px 0 #E7DEC9;">
    <audio controls style="width: 100%; margin-bottom: 12px;">
      <source src="https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3" type="audio/mpeg" />
    </audio>
    <p style="font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
    <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 0;">
      <li>1. b. crash /kræʃ/</li>
      <li>2. c. train /treɪn/</li>
      <li>3. a. bread /bred/</li>
    </ul>
  </div>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">Vocabulary: Family life</h3>
  
  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">1. Match the words with their meanings</h4>
  <p style="font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. breadwinner - b (someone who earns money to support their family)</li>
    <li>2. housework - d (work around the house such as cooking, cleaning or washing clothes)</li>
    <li>3. groceries - e (food and other goods sold at a shop or a supermarket)</li>
    <li>4. homemaker - a (a person who manages a home and often raises children instead of earning money)</li>
    <li>5. heavy lifting - c (picking up and carrying heavy objects)</li>
  </ul>

  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">2. Complete the sentences using the words in 1</h4>
  <p style="font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. My mother is a <strong>homemaker</strong>. She doesn't go to work, but stays at home to look after the family.</li>
    <li>2. When I lived in this city, I used to shop for <strong>groceries</strong> at this supermarket.</li>
    <li>3. My eldest son is strong enough to do the <strong>heavy lifting</strong> for the family.</li>
  </ul>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">Grammar: Present simple vs. present continuous</h3>
  
  <div style="margin-bottom: 32px; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #E7DEC9; background: #FFFDF7; text-align: left; box-shadow: 4px 4px 0 #E7DEC9;">
      <thead>
        <tr>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif; width: 50%;">Present Simple (Hiện tại đơn)</th>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif; width: 50%;">Present Continuous (Hiện tại tiếp diễn)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-size: 14px; margin: 0 0 8px; font-family: 'JetBrains Mono', monospace;">(+) S + V(s/es)</p>
            <p style="font-size: 14px; margin: 0 0 8px; font-family: 'JetBrains Mono', monospace;">(-) S + do/does not + V</p>
            <p style="font-size: 14px; margin: 0 0 16px; font-family: 'JetBrains Mono', monospace;">(?) Do/Does + S + V?</p>
            <p style="font-size: 13px; color: #6B7A94; margin: 0; font-style: italic;">Dấu hiệu: usually, always, often, every day...</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-size: 14px; margin: 0 0 8px; font-family: 'JetBrains Mono', monospace;">(+) S + am/is/are + V-ing</p>
            <p style="font-size: 14px; margin: 0 0 8px; font-family: 'JetBrains Mono', monospace;">(-) S + am/is/are not + V-ing</p>
            <p style="font-size: 14px; margin: 0 0 16px; font-family: 'JetBrains Mono', monospace;">(?) Am/Is/Are + S + V-ing?</p>
            <p style="font-size: 13px; color: #6B7A94; margin: 0; font-style: italic;">Dấu hiệu: now, at the moment, today...</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">1. Choose the correct form of the verb in each sentence</h4>
  <p style="font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. Mrs Lan usually <strong>does</strong> the cooking in her family.</li>
    <li>2. I'm afraid he can't answer the phone now. He <strong>is putting out</strong> the rubbish.</li>
    <li>3. He <strong>cleans</strong> the house every day.</li>
    <li>4. My sister can't do any housework today. She <strong>is studying</strong> for her exams.</li>
    <li>5. My mother <strong>does</strong> the laundry twice a week.</li>
  </ul>

  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">2. Read the text and put the verbs in brackets in the present simple or present continuous</h4>
  <p style="font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <p style="font-size: 15px; line-height: 1.8;">Mrs Lam is a housewife. Every day, she <strong>(1. does)</strong> most of the housework. She cooks, washes the clothes, and cleans the house. But today is Mother's Day, so Mrs Lam <strong>(2. is not doing)</strong> any housework. At the moment, she <strong>(3. is watching)</strong> her favourite TV programme. Her children <strong>(4. are doing)</strong> the cooking and her husband <strong>(5. is tidying up)</strong> the house. Everybody <strong>(6. is trying)</strong> hard to make it a special day for Mrs Lam.</p>
</div>
                ` : i === 3 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">III. Reading - Benefits of doing housework</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">1. Work in pairs. Look at the picture and answer the questions</h3>
  <p style="font-weight: bold; font-size: 15px; margin-bottom: 12px;">Question 1. What is each person in the picture doing?</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 24px;">
    <li>• The mother is cooking.</li>
    <li>• The father is laying the table.</li>
    <li>• The daughter is washing vegetables/fruit.</li>
    <li>• The son is vacuuming/cleaning the floor.</li>
  </ul>
  <p style="font-weight: bold; font-size: 15px; margin-bottom: 12px;">Question 2. Do you think that they are happy? Why or why not?</p>
  <p style="font-size: 15px; margin-bottom: 12px;">Yes, I think they are happy because:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>• They are smiling and look comfortable.</li>
    <li>• They are working together as a family team.</li>
    <li>• Everyone is contributing to household tasks.</li>
    <li>• There's a positive, cooperative atmosphere in the family.</li>
  </ul>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">2. Read the text and tick (✓) the appropriate meanings of the highlighted words</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. responsibility - a. duty</li>
    <li>2. gratitude - b. the feeling of being grateful</li>
    <li>3. strengthen - a. make something stronger</li>
    <li>4. bonds - a. close connections</li>
    <li>5. character - b. qualities that make a person different from others</li>
  </ul>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">3. Read the text again and answer the questions</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. Most people think that housework is boring and is the responsibility of wives and mothers only.</li>
    <li>2. Many parents don't ask their children to do housework so that they have more time to play or study.</li>
    <li>3. Doing the laundry, cleaning the house, and taking care of others are among the important skills that children will need when they start their own families.</li>
    <li>4. They learn to appreciate all the hard work their parents do around the house for them.</li>
    <li>5. Because doing chores together helps strengthen family bonds, creating special moments between children and parents.</li>
  </ul>
</div>
                ` : i === 4 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">IV. Speaking - Why should/shouldn't children do housework?</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">1. Below are reasons why children should or shouldn't do housework. Put them in the correct column</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <div style="margin-bottom: 32px; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #E7DEC9; background: #FFFDF7; text-align: left; box-shadow: 4px 4px 0 #E7DEC9;">
      <thead>
        <tr>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif; width: 50%;">Should</th>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif; width: 50%;">Shouldn't</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-size: 15px; margin: 0 0 12px;">1. Doing housework helps them develop life skills</p>
            <p style="font-size: 15px; margin: 0 0 12px;">2. Doing housework teaches them to take responsibility</p>
            <p style="font-size: 15px; margin: 0;">5. Doing housework helps strengthen family bonds</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-size: 15px; margin: 0 0 12px;">3. Kids should be given plenty of playtime when they are young</p>
            <p style="font-size: 15px; margin: 0 0 12px;">4. They may break or damage things when doing housework</p>
            <p style="font-size: 15px; margin: 0;">6. They need more time to study and do homework</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">2. Work in pairs. Complete the conversation between Anna, Nam, and Minh using some ideas from 1</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <div style="background: #FFFDF7; border: 2px solid #E7DEC9; padding: 20px; border-radius: 12px; font-size: 15px; line-height: 1.8; box-shadow: 4px 4px 0 #E7DEC9;">
    <p><strong>Anna:</strong> Nam, why do you think children should do housework?</p>
    <p><strong>Nam:</strong> Because <strong>(1) doing housework helps them develop life skills</strong>.</p>
    <p><strong>Anna:</strong> It's true. Life skills such as cooking, cleaning or taking care of others are really necessary for kids when they grow up.</p>
    <p><strong>Nam:</strong> Yes, we should all have these basic life skills to be adults.</p>
    <p><strong>Anna:</strong> Now Minh, why do you think children shouldn't do housework?</p>
    <p><strong>Minh:</strong> I think kids are kids. <strong>(2) They should be given plenty of playtime when they are young.</strong></p>
    <p><strong>Nam:</strong> I don't agree with you. I'm afraid too much playtime isn't good for children.</p>
    <p><strong>Anna:</strong> Well, thank you both for sharing your ideas. They are very useful for my project.</p>
  </div>
</div>
                ` : i === 5 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">V. Listening - Family support</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">1. Work in pairs. Look at the picture and answer the questions</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Gợi ý trả lời:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. I can see two people, a host and a student, taking part in a talk show about Family life.</li>
    <li>2. Based on the name of the show "Family Life", I think the student is talking about his family and how they support him in his studies and personal life.</li>
  </ul>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">3. Listen to the talk show and decide whether the statements are true (T) or false (F)</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <table style="width: 100%; border-collapse: collapse; border: 1px solid #E7DEC9; background: #FFFDF7; margin-bottom: 32px;">
    <tbody>
      <tr>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-size: 14px;">1. There are three people in Hieu's family.</td>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-family: 'JetBrains Mono', monospace; text-align: center; width: 60px;">F</td>
      </tr>
      <tr>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-size: 14px; background: #FDF3EC;">2. Hieu's parents teach him physics.</td>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-family: 'JetBrains Mono', monospace; text-align: center; background: #FDF3EC;">F</td>
      </tr>
      <tr>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-size: 14px;">3. When Hieu needs help, his brother always helps him.</td>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-family: 'JetBrains Mono', monospace; text-align: center;">T</td>
      </tr>
      <tr>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-size: 14px; background: #FDF3EC;">4. Hieu's family routines help them spend some time together every week.</td>
        <td style="padding: 16px; border: 1px solid #E7DEC9; font-family: 'JetBrains Mono', monospace; text-align: center; background: #FDF3EC;">T</td>
      </tr>
    </tbody>
  </table>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">4. Listen again and complete each sentence with ONE word from the recording</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. difficulties</li>
    <li>2. love</li>
    <li>3. sad</li>
  </ul>
</div>
                ` : i === 6 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">VI. Writing - Writing about family routines</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">1. Work in groups. Which of the following activities in the pictures do you think can be family routines?</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Gợi ý trả lời:</p>
  <p style="font-size: 15px; margin-bottom: 32px;">All the activities in the pictures can be family routines.</p>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">2. Read Joey's email about his family routines and complete the table with the information from it</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <div style="margin-bottom: 32px; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #E7DEC9; background: #FFFDF7; text-align: left; box-shadow: 4px 4px 0 #E7DEC9;">
      <thead>
        <tr>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif;">Routines</th>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif;">When/How often</th>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif;">Things to do to strengthen family bonds</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">1. have dinner together</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">every day</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">
            - eat bread or noodles<br>- share their plans for the day
          </td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">2. watch TV together</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">every Friday evening</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">
            - watch a film and share snacks<br>- exchange opinions after the film
          </td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">3. clean the house</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">every two weeks, on Saturday</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">
            - make a list of chores<br>- choose tasks
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">3. Complete the email about Dong's family routines using the information in the box</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Gợi ý trả lời:</p>
  <div style="background: #FFFDF7; border: 2px solid #E7DEC9; padding: 20px; border-radius: 12px; font-size: 15px; line-height: 1.8; box-shadow: 4px 4px 0 #E7DEC9; font-style: italic;">
    <p>Subject: My family routines</p>
    <p>Hi Joey,</p>
    <p>How are you? We're all doing fine here. You asked me about my family routines. Well, we have a number of routines to help us learn life skills as well as build family bonds. Here are three main ones.</p>
    <p>First, we have breakfast together every day. During breakfast, we eat bread or noodles and share our plans for the day.</p>
    <p>Second, we watch TV together every Saturday evening. We usually watch a film and share snacks while enjoying the movie. After the film, we exchange opinions about what we watched.</p>
    <p>Third, we visit our grandparents on the second Sunday of every month. When we visit them, we do some housework for our grandparents and have lunch with them.</p>
    <p>What do you think about my family routines? Please write back soon and let me know.</p>
    <p>Best wishes,<br>Dong</p>
  </div>
</div>
                ` : i === 7 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">VII. Communication and Culture</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">Everyday English - Expressing opinions</h3>
  
  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">1. Listen and complete the conversation with the expressions in the box</h4>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. A</li>
    <li>2. C</li>
    <li>3. B</li>
  </ul>

  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">2. Work in groups. Have similar conversations exchanging opinions about whether family members should spend time together.</h4>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đoạn hội thoại gợi ý:</p>
  <div style="background: #FFFDF7; border: 2px solid #E7DEC9; padding: 20px; border-radius: 12px; font-size: 15px; line-height: 1.8; box-shadow: 4px 4px 0 #E7DEC9; margin-bottom: 40px;">
    <p><strong>A:</strong> Do you think family members should spend time together every day?</p>
    <p><strong>B:</strong> Absolutely! <strong>I strongly believe that</strong> spending quality time together strengthens family relationships. When families eat dinner together or do activities, they understand each other better.</p>
    <p><strong>C:</strong> <strong>I'm not sure about that</strong>. Modern families are very busy. Parents work long hours and children have many school activities. It's not always possible to spend time together every day.</p>
    <p><strong>B:</strong> Well, <strong>I have no doubt that</strong> even small moments together make a difference. Even 30 minutes of conversation can help family members stay connected.</p>
  </div>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">Culture - Family values in the UK</h3>
  <h4 style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">1. Read the text and list the five family values of British people in the 21st century</h4>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. Being truthful and honest</li>
    <li>2. Respecting older people</li>
    <li>3. Having good table manners</li>
    <li>4. Remembering to say please and thank you</li>
    <li>5. Helping with family chores</li>
  </ul>
</div>
                ` : i === 8 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">VIII. Looking Back</h2>
  
  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 12px;">Pronunciation</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. I like ice <strong>cream</strong> /kr/, but my <strong>brother</strong> /br/ likes <strong>bread</strong> /br/ pudding.</li>
    <li>2. <strong>Tracy</strong> /tr/ <strong>crashed</strong> /kr/ her car into a <strong>tree</strong> /tr/ and <strong>broke</strong> /br/ her leg.</li>
    <li>3. They often have <strong>crab</strong> /kr/ soup for <strong>breakfast</strong> /br/.</li>
  </ul>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">Vocabulary</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. does the cooking</li>
    <li>2. does the heavy lifting</li>
    <li>3. laundry</li>
    <li>4. cleaning the house</li>
    <li>5. does the washing-up</li>
  </ul>

  <h3 style="font-family: 'Fraunces', serif; font-size: 18px; margin-top: 40px; margin-bottom: 12px;">Grammar</h3>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 16px;">Đáp án:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>1. wanting → want</li>
    <li>2. look → am looking</li>
    <li>3. looking → looks</li>
    <li>4. cooks → is cooking</li>
    <li>5. do you read → are you reading</li>
    <li>6. are your family doing → does your family do</li>
  </ul>
</div>
                ` : i === 9 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #E7DEC9; padding-bottom: 16px;">IX. Project</h2>
  
  <p style="font-weight: bold; font-size: 15px; margin-bottom: 16px;">Work in groups. Do research on Family Day in Viet Nam or other countries in the world</p>
  <p style="font-weight: bold; font-size: 14px; margin-bottom: 12px;">Hướng dẫn thực hiện:</p>
  <p style="font-size: 15px; margin-bottom: 12px;">Học sinh cần nghiên cứu và trình bày về Ngày Gia đình ở Việt Nam hoặc các nước khác, bao gồm:</p>
  <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 2.2; margin-bottom: 32px;">
    <li>• Nơi tổ chức (where it is celebrated)</li>
    <li>• Thời gian tổ chức (when it is celebrated)</li>
    <li>• Lịch sử hình thành (when it was first celebrated)</li>
    <li>• Mục đích tổ chức (why it is celebrated)</li>
    <li>• Các hoạt động thường diễn ra (what people often do to celebrate the day)</li>
  </ul>
</div>
                ` : i === 0 ? `
<div style="font-family: 'Inter', sans-serif; color: #1D2B4F;">
  <h2 style="color: #C1432E; font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 24px;">Vocabulary: Family Life</h2>
  <div style="margin-bottom: 32px; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #E7DEC9; background: #FFFDF7; text-align: left; box-shadow: 4px 4px 0 #E7DEC9;">
      <thead>
        <tr>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif;">Từ vựng / Phát âm</th>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif;">Ý nghĩa</th>
          <th style="padding: 16px; border: 1px solid #E7DEC9; background: #FDF3EC; color: #C1432E; font-family: 'Fraunces', serif;">Ví dụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Benefit</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈbenɪfɪt/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Lợi ích</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Spending time with family brings many emotional benefits.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Bond</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/bɒnd/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Sự gắn bó, kết nối</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Family activities help strengthen the bond between parents and children.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Breadwinner</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈbredwɪnə/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Người trụ cột gia đình</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">My father is the breadwinner in your family.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Character</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈkærəktə/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Tính cách</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Doing housework helps children build good character.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Cheer up</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/tʃɪə ʌp/ (v)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Cổ vũ, làm cho ai đó vui lên</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">My parents always cheer me up when I feel sad.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Damage</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈdæmɪdʒ/ (v)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Phá hỏng, làm hỏng</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Children may damage things when doing housework.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Gratitude</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈgrætɪtjuːd/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Sự biết ơn, lòng biết ơn</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Children should show gratitude to their parents.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Grocery</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈgroʊsəri/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Thực phẩm và tạp hóa</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">My mother goes grocery shopping every weekend.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Heavy lifting</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˌhevi ˈlɪftɪŋ/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Mang vác nặng</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">My father does the heavy lifting in our house.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Homemaker</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈhoʊmmeɪkə/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Người nội trợ</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">My mother is a homemaker who takes care of our family.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Laundry</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈlɔːndri/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Quần áo, đồ giặt là</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">I help my mother with the laundry on Sundays.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Manner</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈmænə/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Tác phong, cách ứng xử</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Good table manners are important in family meals.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Responsibility</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/rɪˌspɑːnsəˈbɪləti/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Trách nhiệm</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Each family member has their own responsibility.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Routine</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ruːˈtiːn/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Lề thường, công việc hàng ngày</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Our family has a daily routine for housework.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Rubbish</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈrʌbɪʃ/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Rác rưởi</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Taking out the rubbish is my daily chore.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Spotlessly</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈspɒtləsli/ (adv)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Không tì vết</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">We all feel happy when we see our home spotlessly clean.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Strengthen</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈstreŋθən/ (v)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Củng cố, làm mạnh thêm</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Family meals strengthen our relationships.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Support</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/səˈpɔːt/ (n, v)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Ủng hộ, hỗ trợ</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Parents should support their children's education.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Truthful</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈtruːθfl/ (adj)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Trung thực</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Being truthful with family members is very important.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Value</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˈvæljuː/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Giá trị</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">Family values are passed down from generation to generation.</td>
        </tr>
        <tr>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top;">
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px;">Washing-up</p>
            <p style="font-size: 14px; color: #6B7A94; font-family: 'JetBrains Mono', monospace; margin: 0;">/ˌwɒʃɪŋ ˈʌp/ (n)</p>
          </td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px;">Rửa chén bát</td>
          <td style="padding: 16px; border: 1px solid #E7DEC9; vertical-align: top; font-size: 15px; font-style: italic;">After dinner, we take turns doing the washing-up.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
` : `<h2>${lessonTitles[i].title}</h2><p>Nội dung chi tiết sẽ được cập nhật sau.</p>`
              }
            },
            ...(i === 0 ? [{
              order: 2,
              type: 'flashcard_set',
              content: {
                cards: [
                  { front: 'Lợi ích', back: 'Benefit', example: 'Spending time with family brings many emotional benefits.' },
                  { front: 'Sự gắn bó, kết nối', back: 'Bond', example: 'Family activities help strengthen the bond between parents and children.' },
                  { front: 'Người trụ cột gia đình', back: 'Breadwinner', example: 'My father is the breadwinner in your family.' },
                  { front: 'Tính cách', back: 'Character', example: 'Doing housework helps children build good character.' },
                  { front: 'Cổ vũ, làm cho ai đó vui lên', back: 'Cheer up', example: 'My parents always cheer me up when I feel sad.' },
                  { front: 'Phá hỏng, làm hỏng', back: 'Damage', example: 'Children may damage things when doing housework.' },
                  { front: 'Sự biết ơn, lòng biết ơn', back: 'Gratitude', example: 'Children should show gratitude to their parents.' },
                  { front: 'Thực phẩm và tạp hóa', back: 'Grocery', example: 'My mother goes grocery shopping every weekend.' },
                  { front: 'Mang vác nặng', back: 'Heavy lifting', example: 'My father does the heavy lifting in our house.' },
                  { front: 'Người nội trợ', back: 'Homemaker', example: 'My mother is a homemaker who takes care of our family.' },
                  { front: 'Quần áo, đồ giặt là', back: 'Laundry', example: 'I help my mother with the laundry on Sundays.' },
                  { front: 'Tác phong, cách ứng xử', back: 'Manner', example: 'Good table manners are important in family meals.' },
                  { front: 'Trách nhiệm', back: 'Responsibility', example: 'Each family member has their own responsibility.' },
                  { front: 'Lề thường, công việc hàng ngày', back: 'Routine', example: 'Our family has a daily routine for housework.' },
                  { front: 'Rác rưởi', back: 'Rubbish', example: 'Taking out the rubbish is my daily chore.' },
                  { front: 'Không tì vết', back: 'Spotlessly', example: 'We all feel happy when we see our home spotlessly clean.' },
                  { front: 'Củng cố, làm mạnh thêm', back: 'Strengthen', example: 'Family meals strengthen our relationships.' },
                  { front: 'Ủng hộ, hỗ trợ', back: 'Support', example: 'Parents should support their children\'s education.' },
                  { front: 'Trung thực', back: 'Truthful', example: 'Being truthful with family members is very important.' },
                  { front: 'Giá trị', back: 'Value', example: 'Family values are passed down from generation to generation.' },
                  { front: 'Rửa chén bát', back: 'Washing-up', example: 'After dinner, we take turns doing the washing-up.' },
                ]
              }
            }] : [])
          ]
        },
        // Thêm từ vựng mẫu cho bài Vocabulary đầu tiên
        ...(i === 0 ? {
          vocabularies: {
            create: [
              { word: 'Benefit', pronunciation: '/ˈbenɪfɪt/', definition: 'Lợi ích', example: 'Spending time with family brings many emotional benefits.', partOfSpeech: 'n.' },
              { word: 'Bond', pronunciation: '/bɒnd/', definition: 'Sự gắn bó, kết nối', example: 'Family activities help strengthen the bond between parents and children.', partOfSpeech: 'n.' },
              { word: 'Breadwinner', pronunciation: '/ˈbredwɪnə/', definition: 'Người trụ cột gia đình', example: 'My father is the breadwinner in your family.', partOfSpeech: 'n.' },
              { word: 'Character', pronunciation: '/ˈkærəktə/', definition: 'Tính cách', example: 'Doing housework helps children build good character.', partOfSpeech: 'n.' },
              { word: 'Cheer up', pronunciation: '/tʃɪə ʌp/', definition: 'Cổ vũ, làm cho ai đó vui lên', example: 'My parents always cheer me up when I feel sad.', partOfSpeech: 'v.' },
              { word: 'Damage', pronunciation: '/ˈdæmɪdʒ/', definition: 'Phá hỏng, làm hỏng', example: 'Children may damage things when doing housework.', partOfSpeech: 'v.' },
              { word: 'Gratitude', pronunciation: '/ˈgrætɪtjuːd/', definition: 'Sự biết ơn, lòng biết ơn', example: 'Children should show gratitude to their parents.', partOfSpeech: 'n.' },
              { word: 'Grocery', pronunciation: '/ˈgroʊsəri/', definition: 'Thực phẩm và tạp hóa', example: 'My mother goes grocery shopping every weekend.', partOfSpeech: 'n.' },
              { word: 'Heavy lifting', pronunciation: '/ˌhevi ˈlɪftɪŋ/', definition: 'Mang vác nặng', example: 'My father does the heavy lifting in our house.', partOfSpeech: 'n.' },
              { word: 'Homemaker', pronunciation: '/ˈhoʊmmeɪkə/', definition: 'Người nội trợ', example: 'My mother is a homemaker who takes care of our family.', partOfSpeech: 'n.' },
              { word: 'Laundry', pronunciation: '/ˈlɔːndri/', definition: 'Quần áo, đồ giặt là', example: 'I help my mother with the laundry on Sundays.', partOfSpeech: 'n.' },
              { word: 'Manner', pronunciation: '/ˈmænə/', definition: 'Tác phong, cách ứng xử', example: 'Good table manners are important in family meals.', partOfSpeech: 'n.' },
              { word: 'Responsibility', pronunciation: '/rɪˌspɑːnsəˈbɪləti/', definition: 'Trách nhiệm', example: 'Each family member has their own responsibility.', partOfSpeech: 'n.' },
              { word: 'Routine', pronunciation: '/ruːˈtiːn/', definition: 'Lề thường, công việc hàng ngày', example: 'Our family has a daily routine for housework.', partOfSpeech: 'n.' },
              { word: 'Rubbish', pronunciation: '/ˈrʌbɪʃ/', definition: 'Rác rưởi', example: 'Taking out the rubbish is my daily chore.', partOfSpeech: 'n.' },
              { word: 'Spotlessly', pronunciation: '/ˈspɒtləsli/', definition: 'Không tì vết', example: 'We all feel happy when we see our home spotlessly clean.', partOfSpeech: 'adv.' },
              { word: 'Strengthen', pronunciation: '/ˈstreŋθən/', definition: 'Củng cố, làm mạnh thêm', example: 'Family meals strengthen our relationships.', partOfSpeech: 'v.' },
              { word: 'Support', pronunciation: '/səˈpɔːt/', definition: 'Ủng hộ, hỗ trợ', example: 'Parents should support their children\'s education.', partOfSpeech: 'n., v.' },
              { word: 'Truthful', pronunciation: '/ˈtruːθfl/', definition: 'Trung thực', example: 'Being truthful with family members is very important.', partOfSpeech: 'adj.' },
              { word: 'Value', pronunciation: '/ˈvæljuː/', definition: 'Giá trị', example: 'Family values are passed down from generation to generation.', partOfSpeech: 'n.' },
              { word: 'Washing-up', pronunciation: '/ˌwɒʃɪŋ ˈʌp/', definition: 'Rửa chén bát', example: 'After dinner, we take turns doing the washing-up.', partOfSpeech: 'n.' },
            ],
          }
        } : {})
      }
    });
  }

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
