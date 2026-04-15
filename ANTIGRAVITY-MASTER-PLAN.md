# PROJECT BRIEF — EnglishPro: Nền Tảng Học Ôn Tiếng Anh THPT

> Dán file này vào Antigravity để agent hiểu toàn bộ context, tự generate code từng file, và track tiến độ.

---

## TỔNG QUAN DỰ ÁN

**Tên dự án:** EnglishPro  
**Mục tiêu:** Website học ôn tiếng Anh dành cho học sinh cấp 3 (lớp 10–12), hỗ trợ giáo viên soạn nội dung và admin quản trị hệ thống.  
**Framework:** Next.js 14 (App Router) · TypeScript · Tailwind CSS  
**Database:** PostgreSQL + Prisma ORM  
**Cache/Realtime:** Redis (ioredis)  
**Auth:** NextAuth v5 (JWT, role-based)  
**Storage:** Cloudflare R2 (audio, video, hình ảnh)  
**AI/Speech:** OpenAI Whisper API (chấm phát âm)  
**Deploy:** Vercel

---

## 3 ACTOR CHÍNH

| Actor | Role trong hệ thống |
|---|---|
| **Học sinh** | Học bài, ôn flashcard, làm bài tập, thi thử, xem tiến độ, nhận XP/huy hiệu |
| **Giáo viên** | Soạn bài học, tạo câu hỏi ngữ pháp, ra đề thi đa dạng cấu trúc, xem kết quả lớp |
| **Admin** | Quản lý tài khoản, phân quyền, duyệt nội dung, xem báo cáo toàn hệ thống |

---

## TECH STACK ĐẦY ĐỦ

```
Frontend:     Next.js 14 App Router, TypeScript, Tailwind CSS
State:        Zustand (client state), React Query (server state)
Forms:        React Hook Form + Zod validation
Auth:         NextAuth v5, bcryptjs, JWT + refresh token
ORM:          Prisma, PostgreSQL 16
Cache:        Redis (ioredis) — session, leaderboard real-time, streak
Storage:      Cloudflare R2 — audio/video/image upload
AI:           OpenAI Whisper API — speech-to-text, pronunciation scoring
Rich Text:    TipTap editor (bài học, nội dung CMS)
Audio:        Wavesurfer.js (waveform hiển thị), Web Speech API (recording)
Video:        React Player (embed YouTube hoặc upload R2)
Charts:       Recharts (dashboard, báo cáo)
Icons:        Lucide React
UI Primitive: Radix UI
Deploy:       Vercel (frontend), Neon.tech (PostgreSQL free tier), Upstash (Redis free tier)
```

---

## CẤU TRÚC THƯ MỤC (ĐẦY ĐỦ)

```
english-learning-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (student)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── learn/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [topicId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [lessonId]/page.tsx
│   │   │   ├── flashcards/page.tsx
│   │   │   ├── practice/
│   │   │   │   ├── reading/page.tsx
│   │   │   │   ├── listening/page.tsx
│   │   │   │   ├── writing/page.tsx
│   │   │   │   └── speaking/page.tsx
│   │   │   ├── exam/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [examId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── result/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   ├── leaderboard/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (teacher)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── lessons/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [lessonId]/edit/page.tsx
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── create/page.tsx
│   │   │   ├── exams/
│   │   │   │   ├── page.tsx
│   │   │   │   └── create/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── content/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── lessons/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── questions/route.ts
│   │   │   ├── exams/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── submit/route.ts
│   │   │   ├── flashcards/
│   │   │   │   ├── due/route.ts
│   │   │   │   └── review/route.ts
│   │   │   ├── progress/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── speech/assess/route.ts
│   │   │   └── leaderboard/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                        # Base components (Button, Input, Card, Dialog...)
│   │   ├── layout/
│   │   │   ├── StudentSidebar.tsx
│   │   │   ├── TeacherSidebar.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── learn/
│   │   │   ├── FlashCard.tsx          # Card lật 3D, nút đánh giá SM-2
│   │   │   ├── FlashCardDeck.tsx      # Session ôn tập, progress bar
│   │   │   ├── MultipleChoice.tsx     # Trắc nghiệm + giải thích
│   │   │   ├── FillInBlank.tsx        # Điền từ, nhiều chỗ trống
│   │   │   ├── MatchingPairs.tsx      # Kéo thả nối cặp
│   │   │   └── LessonViewer.tsx       # Render blocks nội dung bài học
│   │   ├── media/
│   │   │   ├── AudioPlayer.tsx        # Wavesurfer.js wrapper
│   │   │   ├── AudioRecorder.tsx      # Web Speech API
│   │   │   ├── VideoPlayer.tsx        # React Player wrapper
│   │   │   └── SpeechAssessment.tsx   # Record → Whisper → điểm phát âm
│   │   ├── exam/
│   │   │   ├── ExamTimer.tsx          # Đồng hồ đếm ngược, cảnh báo cuối giờ
│   │   │   ├── ExamQuestion.tsx       # Render câu hỏi theo QuestionType
│   │   │   ├── ExamProgress.tsx       # Thanh tiến độ + nhảy câu
│   │   │   └── ExamResult.tsx         # Tổng kết điểm, phân tích sai
│   │   ├── gamification/
│   │   │   ├── XPBar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── StreakCounter.tsx
│   │   ├── cms/
│   │   │   ├── RichTextEditor.tsx     # TipTap
│   │   │   ├── QuestionBuilder.tsx    # UI tạo câu hỏi theo type
│   │   │   ├── ExamBuilder.tsx        # Template engine đề thi
│   │   │   └── MediaUploader.tsx      # Upload audio/video lên R2
│   │   ├── charts/
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── SkillRadar.tsx
│   │   │   └── ClassReport.tsx
│   │   └── providers/
│   │       └── QueryProvider.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── auth.ts
│   │   ├── r2.ts
│   │   ├── whisper.ts
│   │   ├── spaced-repetition.ts       # SM-2 algorithm
│   │   ├── gamification.ts            # XP, level, badge logic
│   │   ├── validations/
│   │   │   ├── auth.schema.ts
│   │   │   ├── lesson.schema.ts
│   │   │   ├── question.schema.ts
│   │   │   └── exam.schema.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useCurrentUser.ts
│   │   ├── useFlashcards.ts
│   │   ├── useExamTimer.ts
│   │   ├── useAudioRecorder.ts
│   │   ├── useLeaderboard.ts
│   │   └── useProgress.ts
│   ├── store/
│   │   ├── examStore.ts
│   │   ├── learnStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── lesson.types.ts
│   │   ├── exam.types.ts
│   │   └── gamification.types.ts
│   └── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml
├── .env
└── package.json
```

---

## DATABASE SCHEMA (PRISMA — ĐẦY ĐỦ)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { STUDENT TEACHER ADMIN }
enum ContentStatus { DRAFT PENDING PUBLISHED ARCHIVED }
enum Skill { READING LISTENING WRITING SPEAKING GRAMMAR VOCABULARY }
enum QuestionType {
  MULTIPLE_CHOICE MULTIPLE_SELECT FILL_IN_BLANK
  MATCHING ORDERING SHORT_ANSWER AUDIO_RESPONSE READING_COMPREHENSION
}
enum Difficulty { EASY MEDIUM HARD }
enum ExamType { MINI_TEST GRAMMAR_QUIZ SKILL_PRACTICE MID_TERM FINAL_EXAM NATIONAL_MOCK CUSTOM }
enum BadgeType { STREAK MASTERY SCORE SPEED CONSISTENCY }

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(STUDENT)
  isActive      Boolean   @default(true)
  grade         Int?
  school        String?
  bio           String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts         Account[]
  sessions         Session[]
  enrollments      Enrollment[]
  lessonProgress   LessonProgress[]
  flashcardReviews FlashcardReview[]
  examAttempts     ExamAttempt[]
  userXP           UserXP?
  userBadges       UserBadge[]
  streak           Streak?
  createdLessons   Lesson[]   @relation("LessonAuthor")
  createdExams     Exam[]     @relation("ExamAuthor")
  createdQuestions Question[] @relation("QuestionAuthor")
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model Topic {
  id          String        @id @default(cuid())
  title       String
  description String?
  thumbnail   String?
  order       Int           @default(0)
  grade       Int
  skill       Skill?
  status      ContentStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  lessons     Lesson[]
  enrollments Enrollment[]
  @@map("topics")
}

model Lesson {
  id          String        @id @default(cuid())
  topicId     String
  authorId    String
  title       String
  description String?
  thumbnail   String?
  order       Int           @default(0)
  duration    Int?
  skill       Skill
  difficulty  Difficulty    @default(MEDIUM)
  status      ContentStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  topic         Topic           @relation(fields: [topicId], references: [id])
  author        User            @relation("LessonAuthor", fields: [authorId], references: [id])
  contents      LessonContent[]
  vocabularies  Vocabulary[]
  progress      LessonProgress[]
  examQuestions ExamQuestion[]
  @@index([topicId, status])
  @@index([skill, difficulty])
  @@map("lessons")
}

model LessonContent {
  id        String   @id @default(cuid())
  lessonId  String
  order     Int
  type      String   // "text" | "image" | "video" | "audio" | "flashcard_set"
  content   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@map("lesson_contents")
}

model Vocabulary {
  id            String   @id @default(cuid())
  lessonId      String
  word          String
  pronunciation String?
  partOfSpeech  String?
  definition    String
  example       String?
  imageUrl      String?
  audioUrl      String?
  createdAt     DateTime @default(now())
  lesson           Lesson            @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  flashcardReviews FlashcardReview[]
  @@map("vocabularies")
}

model Question {
  id          String        @id @default(cuid())
  authorId    String
  skill       Skill
  type        QuestionType
  difficulty  Difficulty    @default(MEDIUM)
  content     Json
  explanation String?
  tags        String[]
  status      ContentStatus @default(DRAFT)
  points      Int           @default(1)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  author        User             @relation("QuestionAuthor", fields: [authorId], references: [id])
  options       QuestionOption[]
  examQuestions ExamQuestion[]
  answers       AttemptAnswer[]
  @@index([skill, type, difficulty])
  @@index([status, authorId])
  @@map("questions")
}

model QuestionOption {
  id         String   @id @default(cuid())
  questionId String
  text       String
  imageUrl   String?
  isCorrect  Boolean  @default(false)
  order      Int      @default(0)
  matchKey   String?
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@map("question_options")
}

model Exam {
  id           String        @id @default(cuid())
  authorId     String
  title        String
  description  String?
  type         ExamType
  grade        Int
  duration     Int
  totalPoints  Int           @default(0)
  passingScore Int?
  status       ContentStatus @default(DRAFT)
  isPublic     Boolean       @default(false)
  startAt      DateTime?
  endAt        DateTime?
  maxAttempts  Int?
  showResult   Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  author     User             @relation("ExamAuthor", fields: [authorId], references: [id])
  sections   ExamSection[]
  attempts   ExamAttempt[]
  assignedTo ExamAssignment[]
  @@map("exams")
}

model ExamSection {
  id          String   @id @default(cuid())
  examId      String
  title       String
  instruction String?
  order       Int
  skill       Skill?
  timeLimit   Int?
  exam        Exam           @relation(fields: [examId], references: [id], onDelete: Cascade)
  questions   ExamQuestion[]
  @@map("exam_sections")
}

model ExamQuestion {
  id         String  @id @default(cuid())
  sectionId  String
  questionId String
  lessonId   String?
  order      Int
  points     Int     @default(1)
  section    ExamSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  question   Question    @relation(fields: [questionId], references: [id])
  lesson     Lesson?     @relation(fields: [lessonId], references: [id])
  @@unique([sectionId, questionId])
  @@map("exam_questions")
}

model ExamAssignment {
  id        String   @id @default(cuid())
  examId    String
  userId    String?
  grade     Int?
  createdAt DateTime @default(now())
  exam      Exam @relation(fields: [examId], references: [id], onDelete: Cascade)
  @@map("exam_assignments")
}

model Enrollment {
  id          String    @id @default(cuid())
  userId      String
  topicId     String
  enrolledAt  DateTime  @default(now())
  completedAt DateTime?
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic Topic @relation(fields: [topicId], references: [id])
  @@unique([userId, topicId])
  @@map("enrollments")
}

model LessonProgress {
  id             String    @id @default(cuid())
  userId         String
  lessonId       String
  isCompleted    Boolean   @default(false)
  completedAt    DateTime?
  timeSpent      Int       @default(0)
  score          Float?
  lastAccessedAt DateTime  @default(now())
  createdAt      DateTime  @default(now())
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id])
  @@unique([userId, lessonId])
  @@map("lesson_progress")
}

model FlashcardReview {
  id           String   @id @default(cuid())
  userId       String
  vocabularyId String
  easeFactor   Float    @default(2.5)
  interval     Int      @default(0)
  repetitions  Int      @default(0)
  nextReviewAt DateTime @default(now())
  lastQuality  Int?
  reviewCount  Int      @default(0)
  updatedAt    DateTime @updatedAt
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  vocabulary Vocabulary @relation(fields: [vocabularyId], references: [id])
  @@unique([userId, vocabularyId])
  @@index([userId, nextReviewAt])
  @@map("flashcard_reviews")
}

model ExamAttempt {
  id           String    @id @default(cuid())
  userId       String
  examId       String
  startedAt    DateTime  @default(now())
  submittedAt  DateTime?
  score        Float?
  maxScore     Float?
  percentage   Float?
  isPassed     Boolean?
  timeSpent    Int?
  isAutoSubmit Boolean   @default(false)
  createdAt    DateTime  @default(now())
  user    User            @relation(fields: [userId], references: [id])
  exam    Exam            @relation(fields: [examId], references: [id])
  answers AttemptAnswer[]
  @@index([userId, examId])
  @@index([examId, submittedAt])
  @@map("exam_attempts")
}

model AttemptAnswer {
  id         String   @id @default(cuid())
  attemptId  String
  questionId String
  answer     Json
  isCorrect  Boolean?
  score      Float    @default(0)
  feedback   String?
  answeredAt DateTime @default(now())
  attempt  ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id])
  @@unique([attemptId, questionId])
  @@map("attempt_answers")
}

model MediaFile {
  id         String   @id @default(cuid())
  uploadedBy String
  fileName   String
  fileType   String
  mimeType   String
  url        String
  r2Key      String
  sizeBytes  Int
  duration   Int?
  width      Int?
  height     Int?
  transcript String?  @db.Text
  createdAt  DateTime @default(now())
  @@map("media_files")
}

model UserXP {
  id        String   @id @default(cuid())
  userId    String   @unique
  totalXP   Int      @default(0)
  level     Int      @default(1)
  weeklyXP  Int      @default(0)
  monthlyXP Int      @default(0)
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("user_xp")
}

model XPHistory {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    String
  refId     String?
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
  @@map("xp_history")
}

model Badge {
  id          String    @id @default(cuid())
  name        String    @unique
  description String
  imageUrl    String
  type        BadgeType
  condition   Json
  xpReward    Int       @default(0)
  createdAt   DateTime  @default(now())
  userBadges  UserBadge[]
  @@map("badges")
}

model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  badgeId  String
  earnedAt DateTime @default(now())
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge Badge @relation(fields: [badgeId], references: [id])
  @@unique([userId, badgeId])
  @@map("user_badges")
}

model Streak {
  id            String    @id @default(cuid())
  userId        String    @unique
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastStudyDate DateTime?
  updatedAt     DateTime  @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("streaks")
}
```

---

## CÁC MODULE CẦN XÂY DỰNG

### Module 1: Học tập (Student)
- Flashcard với Spaced Repetition (thuật toán SM-2)
- Bài tập: Multiple Choice, Fill in Blank, Matching Pairs, Ordering
- Reading: đoạn văn + câu hỏi, highlight từ
- Listening: audio player (Wavesurfer.js) + câu hỏi nghe hiểu
- Speaking: ghi âm (Web Speech API) → Whisper chấm phát âm
- Writing: soạn đoạn văn ngắn
- Video bài giảng: embed YouTube hoặc upload

### Module 2: Kiểm tra (Exam)
- Đếm giờ, cảnh báo còn 5 phút
- Nhiều cấu trúc đề: mini test, grammar quiz, thi thử THPT, custom
- Tự động chấm điểm trắc nghiệm
- Hiển thị kết quả + phân tích sai theo kỹ năng

### Module 3: CMS (Teacher)
- Soạn bài học bằng block editor (text, image, video, audio, flashcard set)
- Tạo câu hỏi ngữ pháp theo bài học trên lớp, gắn tag chủ đề
- Template engine tạo đề thi (chọn cấu trúc, kéo câu hỏi vào từng section)
- Upload audio/video lên Cloudflare R2
- Xem kết quả học sinh, báo cáo lớp

### Module 4: Gamification
- XP + Level (mỗi action đúng cộng XP)
- Streak ngày học liên tiếp
- Huy hiệu thành tích (7-day streak, perfect score, topic master...)
- Bảng xếp hạng lớp real-time (Redis sorted set)

### Module 5: Quản trị (Admin)
- CRUD tài khoản, phân quyền
- Duyệt nội dung giáo viên soạn
- Báo cáo tổng thể hệ thống

---

## LOGIC QUAN TRỌNG

### Spaced Repetition (SM-2)
```typescript
// quality: 0-2 = sai, 3 = khó, 4 = đúng, 5 = rất dễ
function calculateNextReview(card, quality) {
  let { easeFactor, interval, repetitions } = card
  if (quality >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)
  return { easeFactor, interval, repetitions, nextReviewAt }
}
```

### XP System
```
Flashcard đúng (quality 4):   +5 XP
Flashcard dễ (quality 5):     +5 XP
Flashcard khó (quality 3):    +3 XP
Hoàn thành bài học:           +20 XP
Thi đạt (>=80%):              +50 XP
Thi đạt tuyệt đối (100%):     +100 XP
Streak bonus (mỗi 7 ngày):    +50 XP
```

### Level Formula
```typescript
// level = floor(sqrt(totalXP / 50))
// XP để lên level N = N^2 * 50
```

### Middleware Route Protection
```
/dashboard, /learn, /flashcards, /practice, /exam → yêu cầu STUDENT
/teacher/*  → yêu cầu TEACHER hoặc ADMIN
/admin/*    → yêu cầu ADMIN
```

### Chấm điểm phát âm (Whisper)
```
1. Thu âm học sinh (Web Speech API hoặc MediaRecorder)
2. Upload audio blob lên /api/speech/assess
3. Gửi sang OpenAI Whisper → nhận transcript
4. So sánh transcript với targetText (Levenshtein distance)
5. Tính pronunciationScore (0–100)
6. Lưu vào AttemptAnswer.answer.pronunciationScore
```

---

## BIẾN MÔI TRƯỜNG CẦN CÓ

```env
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
REDIS_URL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=EnglishPro
```

---

## TASK LIST THEO GIAI ĐOẠN

### PHASE 1 — Tuần 1–6: Foundation & MVP
```
[ ] Setup Next.js + Docker + Prisma + Redis
[ ] Cấu hình NextAuth v5 (Credentials, JWT, RBAC)
[ ] API đăng ký/đăng nhập
[ ] Trang login, register (React Hook Form + Zod)
[ ] Middleware bảo vệ routes theo role
[ ] Layout học sinh (sidebar, header)
[ ] API flashcards/due — lấy thẻ cần ôn hôm nay
[ ] API flashcards/review — SM-2 + XP + streak
[ ] Component FlashCard (animation lật 3D)
[ ] Component FlashCardDeck (session manager)
[ ] Component MultipleChoice
[ ] Component FillInBlank
[ ] Dashboard học sinh (XP, streak, số thẻ cần ôn)
[ ] Provider QueryProvider (React Query)
[ ] Seed data: admin, giáo viên, học sinh, topic, lesson mẫu
```

### PHASE 2 — Tuần 7–13: CMS + Kiểm tra
```
[ ] Layout giáo viên (sidebar riêng)
[ ] API CRUD lessons (GET, POST, PUT, DELETE)
[ ] API CRUD questions (ngân hàng câu hỏi)
[ ] Trang danh sách bài học (giáo viên)
[ ] TipTap rich text editor
[ ] Block editor cho LessonContent (text, image, video, flashcard_set)
[ ] QuestionBuilder — tạo câu hỏi theo QuestionType
[ ] Template engine đề thi (ExamBuilder)
[ ] API exams CRUD
[ ] API exams/[id]/submit — nộp bài, chấm tự động
[ ] ExamTimer component
[ ] ExamQuestion component (render theo type)
[ ] Trang làm bài thi học sinh
[ ] Trang kết quả thi (điểm, sai ở đâu)
[ ] Dashboard giáo viên (kết quả lớp)
[ ] Zustand examStore (state làm bài)
```

### PHASE 3 — Tuần 14–20: Media + Gamification
```
[ ] Upload lên Cloudflare R2 (API + component)
[ ] AudioPlayer (Wavesurfer.js)
[ ] AudioRecorder (Web Speech API)
[ ] VideoPlayer (React Player)
[ ] SpeechAssessment — ghi âm → Whisper → điểm
[ ] Trang luyện Listening
[ ] Trang luyện Speaking
[ ] Gamification: XPBar, StreakCounter
[ ] Badge system (định nghĩa + trao huy hiệu tự động)
[ ] Leaderboard (Redis ZSET + API)
[ ] Trang bảng xếp hạng
[ ] Zustand learnStore
```

### PHASE 4 — Tuần 21–26: Analytics + Admin + Production
```
[ ] Recharts: ProgressChart, SkillRadar
[ ] Dashboard tiến độ học sinh (progress page)
[ ] ClassReport cho giáo viên
[ ] Layout admin
[ ] Trang quản lý người dùng (admin)
[ ] Trang duyệt nội dung (admin)
[ ] Trang báo cáo tổng thể (admin)
[ ] Cấu hình Vercel deploy
[ ] Cấu hình Neon.tech (PostgreSQL production)
[ ] Cấu hình Upstash (Redis production)
[ ] Sentry error monitoring
[ ] Tối ưu performance (lazy load, image optimization)
[ ] Kiểm thử E2E
```

---

## QUY TẮC CODE CHO AGENT

1. **Mọi server component** phải dùng `await auth()` để lấy session, không dùng `useSession`
2. **Client component** dùng `useSession()` từ `next-auth/react` hoặc custom hook `useCurrentUser`
3. **API routes** luôn kiểm tra auth trước, trả về 401 nếu chưa đăng nhập
4. **Prisma queries** luôn dùng singleton từ `@/lib/prisma`
5. **Redis** luôn dùng singleton từ `@/lib/redis`
6. **Forms** luôn dùng React Hook Form + Zod, không dùng `useState` cho form fields
7. **Fetch** phía client luôn dùng React Query (`useQuery`, `useMutation`), không `useEffect + fetch`
8. **Tailwind** dùng `cn()` từ `@/lib/utils` để merge classes
9. **Error handling** API route luôn có try/catch, trả về message tiếng Việt
10. **TypeScript** không được dùng `any`, phải type rõ ràng hoặc dùng type từ Prisma client

---

## GHI CHÚ ĐẶC BIỆT

- **Giáo viên soạn câu hỏi ngữ pháp theo bài học**: dùng field `tags` trong `Question` để gắn tag bài học (VD: `["unit-3", "present-perfect"]`), và khi tạo `ExamQuestion` thì set `lessonId` để liên kết với bài học cụ thể trên lớp.
- **Đề thi đa dạng cấu trúc**: không lock vào một format — `ExamType.CUSTOM` cho phép giáo viên tự định nghĩa số phần, số câu, kỹ năng mỗi phần.
- **Audio thực hành**: mỗi `LessonContent` type `"audio"` có `{ url, transcript, duration }` — học sinh nghe rồi đọc lại transcript hoặc trả lời câu hỏi.
- **Video bài giảng**: `LessonContent` type `"video"` hỗ trợ cả YouTube embed (`youtubeId`) lẫn file upload (`url` trên R2).
- **Streak logic**: cập nhật mỗi khi học sinh hoàn thành ít nhất 1 action (review flashcard, hoàn thành bài học, nộp bài thi) trong ngày. Không reset nếu cùng ngày gọi nhiều lần.
- **Leaderboard**: dùng Redis `ZINCRBY leaderboard:weekly <xp> <userId>` để cập nhật real-time, reset mỗi thứ Hai bằng cron job (Vercel Cron hoặc `setInterval`).
