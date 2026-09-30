import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  PenTool, Plus, BookOpen, Music, CheckCircle2, 
  HelpCircle, Search, Award, Tag, Sparkles, Filter 
} from 'lucide-react'
import { Skill, Difficulty } from '@prisma/client'

const SKILL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  READING:    { label: 'Reading (Đọc hiểu)',   color: '#1D2B4F', bg: '#DCE9E3' },
  LISTENING:  { label: 'Listening (Luyện nghe)', color: '#6B46C1', bg: '#EDE9FE' },
  GRAMMAR:    { label: 'Grammar (Ngữ pháp)',   color: '#C1432E', bg: '#F3DAD3' },
  VOCABULARY: { label: 'Vocabulary (Từ vựng)', color: '#D97706', bg: '#FEF3C7' },
  SPEAKING:   { label: 'Speaking (Phát âm AI)', color: '#059669', bg: '#D1FAE5' },
  WRITING:    { label: 'Writing (Viết luận)',  color: '#2563EB', bg: '#DBEAFE' },
}

export default async function TeacherQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; difficulty?: string; q?: string }>
}) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams
  const selectedSkill = resolvedSearchParams?.skill || 'ALL'
  const selectedDifficulty = resolvedSearchParams?.difficulty || 'ALL'
  const query = resolvedSearchParams?.q || ''

  // Build filter query
  const whereClause: any = {}

  if (selectedSkill !== 'ALL') {
    whereClause.skill = selectedSkill as Skill
  }

  if (selectedDifficulty !== 'ALL') {
    whereClause.difficulty = selectedDifficulty as Difficulty
  }

  // Fetch questions
  const questions = await prisma.question.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      options: {
        orderBy: { order: 'asc' },
      },
      author: {
        select: { name: true },
      },
      _count: {
        select: { examQuestions: true },
      },
    },
    take: 60,
  })

  // Quick stats
  const totalInDb = await prisma.question.count()
  const readingCount = await prisma.question.count({ where: { skill: Skill.READING } })
  const listeningCount = await prisma.question.count({ where: { skill: Skill.LISTENING } })
  const grammarCount = await prisma.question.count({ where: { skill: Skill.GRAMMAR } })
  const vocabCount = await prisma.question.count({ where: { skill: Skill.VOCABULARY } })

  // Client search filter (or applied if query exists)
  const filteredQuestions = query.trim()
    ? questions.filter(q => {
        const text = typeof q.content === 'string'
          ? q.content
          : JSON.stringify(q.content)
        return text.toLowerCase().includes(query.toLowerCase())
      })
    : questions

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-questions {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-questions * { box-sizing:border-box; }
        
        .studio-questions .page {
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-questions .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-questions .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-questions .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-questions .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-questions .page-head { padding-bottom:32px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-questions .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-questions .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-questions .page-head p { font-size:15px; color:var(--ink-soft); max-width:680px; line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-questions .page {padding-left:56px;} .studio-questions .margin-rule {left:24px;}
        }
        `
        }}
      />

      <div className="studio-questions">
        <div className="page">
          <div className="margin-rule" />

          {/* Header */}
          <div className="page-head flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Kho Học Liệu & Khảo Thí</div>
              <h1>
                Ngân hàng <em>Câu hỏi</em>
              </h1>
              <p>
                Quản lý kho câu hỏi chuẩn hóa đa kỹ năng (Nghe, Đọc, Ngữ pháp, Từ vựng), sẵn sàng đưa vào các đề thi thử và bài luyện tập.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/teacher/questions/create"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#C1432E] text-white font-bold text-sm border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] hover:bg-[#A83724] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Plus size={18} />
                SOẠN CÂU HỎI MỚI
              </Link>
            </div>
          </div>

          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Tổng câu hỏi</span>
                <PenTool size={16} className="text-[#1D2B4F]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalInDb}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Trong kho học liệu</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Reading (Đọc)</span>
                <BookOpen size={16} className="text-[#1D2B4F]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {readingCount}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Đọc hiểu & Điền từ</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Listening (Nghe)</span>
                <Music size={16} className="text-[#6B46C1]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#6B46C1]" style={{ fontFamily: "'Fraunces', serif" }}>
                {listeningCount}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Kèm audio chuẩn</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Grammar & Vocab</span>
                <Award size={16} className="text-[#C1432E]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#C1432E]" style={{ fontFamily: "'Fraunces', serif" }}>
                {grammarCount + vocabCount}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Ngữ pháp & Từ vựng</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-4 shadow-[4px_4px_0_#1D2B4F] mb-8 space-y-4">
            {/* Skill Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-[#6B7A94] uppercase tracking-wider mr-2 text-[11px]">Kỹ năng:</span>
              {[
                { label: 'Tất cả', val: 'ALL' },
                { label: 'Reading', val: 'READING' },
                { label: 'Listening', val: 'LISTENING' },
                { label: 'Grammar', val: 'GRAMMAR' },
                { label: 'Vocabulary', val: 'VOCABULARY' },
                { label: 'Speaking', val: 'SPEAKING' },
              ].map((tab) => {
                const active = selectedSkill === tab.val
                return (
                  <Link
                    key={tab.val}
                    href={`/teacher/questions?skill=${tab.val}${selectedDifficulty !== 'ALL' ? `&difficulty=${selectedDifficulty}` : ''}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                    className={`px-3 py-1.5 border-2 transition-all ${
                      active
                        ? 'bg-[#1D2B4F] text-white border-[#1D2B4F] shadow-[2px_2px_0_#C1432E]'
                        : 'bg-[#FFFDF7] text-[#1D2B4F] border-[#E7DEC9] hover:border-[#1D2B4F]'
                    }`}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </div>

            {/* Difficulty + Search form */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E7DEC9]">
              {/* Difficulty Tabs */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-[#6B7A94] uppercase tracking-wider mr-2 text-[11px]">Độ khó:</span>
                {[
                  { label: 'Tất cả', val: 'ALL' },
                  { label: 'Dễ (Easy)', val: 'EASY' },
                  { label: 'Trung bình (Medium)', val: 'MEDIUM' },
                  { label: 'Khó (Hard)', val: 'HARD' },
                ].map((tab) => {
                  const active = selectedDifficulty === tab.val
                  return (
                    <Link
                      key={tab.val}
                      href={`/teacher/questions?difficulty=${tab.val}${selectedSkill !== 'ALL' ? `&skill=${selectedSkill}` : ''}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                      className={`px-2.5 py-1 border text-[11px] transition-all ${
                        active
                          ? 'bg-[#C1432E] text-white border-[#1D2B4F]'
                          : 'bg-[#FBF6EC] text-[#6B7A94] border-[#E7DEC9] hover:border-[#1D2B4F] hover:text-[#1D2B4F]'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  )
                })}
              </div>

              {/* Search Form */}
              <form method="GET" action="/teacher/questions" className="flex items-center gap-2">
                <input type="hidden" name="skill" value={selectedSkill} />
                <input type="hidden" name="difficulty" value={selectedDifficulty} />
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Tìm từ khóa câu hỏi..."
                    className="px-3 py-1.5 pl-8 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs font-mono text-[#1D2B4F] focus:outline-none focus:bg-white shadow-[2px_2px_0_#1D2B4F] w-56"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B7A94]" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1D2B4F] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#C1432E] hover:bg-[#2A3C6B]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  TÌM
                </button>
              </form>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7DEC9]">
              <span className="text-xs font-mono font-bold uppercase text-[#6B7A94]">
                Hiển thị {filteredQuestions.length} câu hỏi
              </span>
              <span className="text-xs font-mono text-[#6B7A94]">
                Trang 1 / 1
              </span>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="p-16 text-center bg-[#FFFDF7] border-2 border-dashed border-[#1D2B4F]">
                <PenTool size={48} className="mx-auto mb-3 opacity-40 text-[#1D2B4F]" />
                <p className="text-lg font-bold font-serif text-[#1D2B4F]">Không tìm thấy câu hỏi phù hợp</p>
                <p className="text-xs text-[#6B7A94] mt-1 mb-4">Hãy thay đổi bộ lọc hoặc thêm câu hỏi mới vào ngân hàng.</p>
                <Link
                  href="/teacher/questions/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C1432E] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F]"
                >
                  <Plus size={14} /> Soạn câu hỏi mới
                </Link>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                let content: any = {}
                try {
                  content = typeof q.content === 'string' ? JSON.parse(q.content) : q.content
                } catch {
                  content = { text: String(q.content) }
                }

                const questionText = content?.text || content?.question || 'Nội dung câu hỏi'
                const passage = content?.passage || null
                const passageTitle = content?.passageTitle || null
                const sentences = content?.sentences || null
                const audioUrl = content?.audioUrl || null
                const letters = ['A', 'B', 'C', 'D', 'E', 'F']

                const skillMeta = SKILL_LABELS[q.skill] || { label: q.skill, color: '#1D2B4F', bg: '#FBF6EC' }

                return (
                  <div
                    key={q.id}
                    className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[4px_4px_0_#1D2B4F] space-y-4"
                  >
                    {/* Top Row: Meta Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7DEC9]">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 bg-[#1D2B4F] text-white flex items-center justify-center font-mono font-bold text-xs"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className="px-2.5 py-0.5 text-xs font-mono font-bold border"
                          style={{
                            color: skillMeta.color,
                            backgroundColor: skillMeta.bg,
                            borderColor: skillMeta.color,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {skillMeta.label}
                        </span>
                        <span
                          className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#FBF6EC] border border-[#E7DEC9] text-[#1D2B4F]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {q.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[11px] font-mono font-bold border ${
                            q.difficulty === 'EASY'
                              ? 'bg-[#DCE9E3] text-[#4C7A6B] border-[#4C7A6B]'
                              : q.difficulty === 'HARD'
                              ? 'bg-[#F3DAD3] text-[#C1432E] border-[#C1432E]'
                              : 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]'
                          }`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-[#6B7A94]">
                        <span>Dùng trong {q._count.examQuestions} đề thi</span>
                        <span>•</span>
                        <span className="font-bold text-[#1D2B4F]">{q.points} điểm</span>
                      </div>
                    </div>

                    {/* Passage if Reading */}
                    {passage && (
                      <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-xs font-serif text-[#1D2B4F] leading-relaxed">
                        {passageTitle && (
                          <div className="font-bold text-center mb-2 tracking-wide font-sans text-sm text-[#1D2B4F]">
                            {passageTitle}
                          </div>
                        )}
                        <div className="whitespace-pre-line max-h-48 overflow-y-auto pr-2">{passage}</div>
                      </div>
                    )}

                    {/* Audio Player if Listening */}
                    {audioUrl && (
                      <div className="p-3 bg-[#EDE9FE] border border-[#6B46C1] flex items-center gap-3">
                        <Music size={18} className="text-[#6B46C1]" />
                        <audio controls src={audioUrl} className="w-full h-8" />
                      </div>
                    )}

                    {/* Sentence Ordering if ordering question */}
                    {sentences && Array.isArray(sentences) && (
                      <div className="p-3.5 bg-[#FBF6EC] border border-[#E7DEC9] space-y-1.5 text-xs text-[#1D2B4F]">
                        {sentences.map((s: any, sIdx: number) => (
                          <div key={sIdx} className="flex items-start gap-2">
                            <span className="font-mono font-bold text-[#C1432E]">{s.label}.</span>
                            <span>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Question Text */}
                    <div
                      className="text-base md:text-lg font-medium text-[#1D2B4F] leading-snug whitespace-pre-line"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {questionText}
                    </div>

                    {/* Options Grid */}
                    {q.options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                        {q.options.map((opt, oIdx) => {
                          const letter = letters[oIdx] || String(oIdx + 1)
                          const isCorrect = opt.isCorrect

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 border-2 flex items-center justify-between text-xs ${
                                isCorrect
                                  ? 'bg-[#DCE9E3] border-[#4C7A6B] text-[#1D2B4F] font-semibold'
                                  : 'bg-[#FFFDF7] border-[#E7DEC9] text-[#1D2B4F]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-5 h-5 flex items-center justify-center font-mono font-bold text-xs border ${
                                    isCorrect
                                      ? 'bg-[#4C7A6B] text-white border-[#4C7A6B]'
                                      : 'bg-[#FBF6EC] text-[#1D2B4F] border-[#1D2B4F]'
                                  }`}
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                  {letter}
                                </span>
                                <span>{opt.text}</span>
                              </div>

                              {isCorrect && (
                                <span className="font-mono text-[11px] font-bold text-[#4C7A6B] flex items-center gap-1 shrink-0">
                                  <CheckCircle2 size={13} /> ĐÚNG
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Explanation Box if any */}
                    {q.explanation && (
                      <div className="p-3.5 bg-[#FBF6EC] border-l-4 border-[#1D2B4F] text-xs text-[#1D2B4F] leading-relaxed">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[#C1432E] uppercase text-[11px] mb-1">
                          <HelpCircle size={13} />
                          <span>Giải thích đáp án:</span>
                        </div>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
