import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, BookOpen, Music, Mic, Globe, CheckCircle2, Clock, 
  ChevronRight, FileVideo, Layers, ArrowRight, ExternalLink, Award 
} from 'lucide-react'
import { Skill, ContentStatus } from '@prisma/client'

const SKILL_META: Record<Skill, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  READING:    { label: 'Reading (Đọc)',       icon: <BookOpen size={13} />,  color: '#1D2B4F', bg: '#DCE9E3' },
  LISTENING:  { label: 'Listening (Nghe)',    icon: <Music size={13} />,     color: '#6B46C1', bg: '#EDE9FE' },
  SPEAKING:   { label: 'Speaking (Nói)',      icon: <Mic size={13} />,       color: '#059669', bg: '#D1FAE5' },
  WRITING:    { label: 'Writing (Viết)',      icon: <Globe size={13} />,     color: '#2563EB', bg: '#DBEAFE' },
  GRAMMAR:    { label: 'Grammar (Ngữ pháp)',  icon: <BookOpen size={13} />,  color: '#C1432E', bg: '#F3DAD3' },
  VOCABULARY: { label: 'Vocabulary (Từ vựng)',icon: <FileVideo size={13} />, color: '#D97706', bg: '#FEF3C7' },
}

const STATUS_META: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'BẢN NHÁP',     color: '#6B7A94', bg: '#FBF6EC' },
  PENDING:   { label: 'CHỜ DUYỆT',    color: '#D97706', bg: '#FEF3C7' },
  PUBLISHED: { label: 'ĐÃ XUẤT BẢN',  color: '#4C7A6B', bg: '#DCE9E3' },
  ARCHIVED:  { label: 'LƯU TRỮ',      color: '#6B7A94', bg: '#E2E8F0' },
}

export default async function TeacherLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; skill?: string }>
}) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams
  const selectedGrade = resolvedSearchParams?.grade || 'ALL'
  const selectedSkill = resolvedSearchParams?.skill || 'ALL'

  // Build filter query
  const whereClause: any = {}
  if (selectedGrade !== 'ALL') {
    whereClause.topic = { grade: parseInt(selectedGrade) }
  }
  if (selectedSkill !== 'ALL') {
    whereClause.skill = selectedSkill as Skill
  }

  const lessons = await prisma.lesson.findMany({
    where: whereClause,
    include: {
      topic: { select: { id: true, title: true, grade: true } },
      author: { select: { name: true } },
      _count: { select: { contents: true, vocabularies: true, examQuestions: true } },
    },
    orderBy: [{ topic: { grade: 'asc' } }, { order: 'asc' }],
  })

  // Quick Stats
  const totalLessons = lessons.length
  const publishedCount = lessons.filter(l => l.status === ContentStatus.PUBLISHED).length
  const draftCount = lessons.filter(l => l.status === ContentStatus.DRAFT).length
  const totalQuestions = lessons.reduce((acc, l) => acc + l._count.examQuestions, 0)

  // Group lessons by topic
  const grouped = lessons.reduce<Record<string, typeof lessons>>((acc, lesson) => {
    const key = lesson.topic.id
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {})

  const totalTopics = Object.keys(grouped).length

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-lessons {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-lessons * { box-sizing:border-box; }
        
        .studio-lessons .page {
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-lessons .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-lessons .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-lessons .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-lessons .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-lessons .page-head { padding-bottom:32px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-lessons .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-lessons .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-lessons .page-head p { font-size:15px; color:var(--ink-soft); max-width:680px; line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-lessons .page {padding-left:48px; padding-right:20px;} .studio-lessons .margin-rule {left:20px;}
        }
        @media (max-width:640px){
          .studio-lessons .page {padding:20px 14px 60px 26px !important;}
          .studio-lessons .margin-rule {left:10px !important; opacity:.35 !important;}
          .studio-lessons .page-head h1 {font-size:26px !important; line-height:1.25 !important;}
          .studio-lessons .page-head p {font-size:13px !important;}
        }
        `
        }}
      />

      <div className="studio-lessons">
        <div className="page">
          <div className="margin-rule" />

          {/* Header */}
          <div className="page-head flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Giáo trình & Soạn giảng</div>
              <h1>
                Quản lý <em>Bài giảng</em>
              </h1>
              <p>
                Xây dựng giáo trình tương tác đa phương tiện, tích hợp file âm thanh, từ vựng theo chủ đề và câu hỏi ôn luyện theo từng đơn vị bài học.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/teacher/lessons/create"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#C1432E] text-white font-bold text-sm border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] hover:bg-[#A83724] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Plus size={18} />
                SOẠN BÀI HỌC MỚI
              </Link>
            </div>
          </div>

          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Tổng bài học</span>
                <BookOpen size={16} className="text-[#1D2B4F]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalLessons}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">{totalTopics} Chủ đề / Units</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Đã xuất bản</span>
                <CheckCircle2 size={16} className="text-[#4C7A6B]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#4C7A6B]" style={{ fontFamily: "'Fraunces', serif" }}>
                {publishedCount}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Học sinh đang học</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Đang soạn</span>
                <Clock size={16} className="text-[#D97706]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#D97706]" style={{ fontFamily: "'Fraunces', serif" }}>
                {draftCount}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Bản nháp lưu tạm</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Câu hỏi đính kèm</span>
                <Layers size={16} className="text-[#C1432E]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#C1432E]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalQuestions}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Gắn trong bài học</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-4 shadow-[4px_4px_0_#1D2B4F] mb-8 space-y-4">
            {/* Grade Filter */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-[#6B7A94] uppercase tracking-wider mr-2 text-[11px]">Khối lớp:</span>
              {[
                { label: 'Tất cả', val: 'ALL' },
                { label: 'Khối 10', val: '10' },
                { label: 'Khối 11', val: '11' },
                { label: 'Khối 12', val: '12' },
              ].map((tab) => {
                const active = selectedGrade === tab.val
                return (
                  <Link
                    key={tab.val}
                    href={`/teacher/lessons?grade=${tab.val}${selectedSkill !== 'ALL' ? `&skill=${selectedSkill}` : ''}`}
                    className={`px-3.5 py-1.5 border-2 transition-all ${
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

            {/* Skill Filter */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold pt-3 border-t border-[#E7DEC9]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-[#6B7A94] uppercase tracking-wider mr-2 text-[11px]">Kỹ năng:</span>
              {[
                { label: 'Tất cả', val: 'ALL' },
                { label: 'Reading', val: 'READING' },
                { label: 'Listening', val: 'LISTENING' },
                { label: 'Grammar', val: 'GRAMMAR' },
                { label: 'Vocabulary', val: 'VOCABULARY' },
                { label: 'Speaking', val: 'SPEAKING' },
                { label: 'Writing', val: 'WRITING' },
              ].map((tab) => {
                const active = selectedSkill === tab.val
                return (
                  <Link
                    key={tab.val}
                    href={`/teacher/lessons?skill=${tab.val}${selectedGrade !== 'ALL' ? `&grade=${selectedGrade}` : ''}`}
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
          </div>

          {/* Lessons List Grouped by Topic */}
          {totalLessons === 0 ? (
            <div className="p-16 text-center bg-[#FFFDF7] border-2 border-dashed border-[#1D2B4F] shadow-[6px_6px_0_#E7DEC9]">
              <BookOpen size={48} className="mx-auto mb-3 opacity-40 text-[#1D2B4F]" />
              <h3 className="text-xl font-bold font-serif text-[#1D2B4F] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                Chưa có bài học nào trong danh mục này
              </h3>
              <p className="text-xs text-[#6B7A94] mb-6">
                Nhấn vào nút "Soạn bài học mới" để tạo bài giảng đầu tiên cho học sinh.
              </p>
              <Link
                href="/teacher/lessons/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C1432E] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F]"
              >
                <Plus size={16} /> Soạn bài học ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([topicId, topicLessons]) => {
                const topic = topicLessons[0].topic

                return (
                  <div key={topicId} className="space-y-3">
                    {/* Topic Header Bar */}
                    <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-[#D8CDAE]">
                      <div className="flex items-center gap-3">
                        <span
                          className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#1D2B4F] text-white"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          LỚP {topic.grade}
                        </span>
                        <h2
                          className="text-xl font-bold text-[#1D2B4F]"
                          style={{ fontFamily: "'Fraunces', serif" }}
                        >
                          {topic.title}
                        </h2>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#6B7A94]">
                        {topicLessons.length} bài học
                      </span>
                    </div>

                    {/* Lessons Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topicLessons.map((lesson) => {
                        const skillMeta = SKILL_META[lesson.skill] || {
                          label: lesson.skill,
                          icon: <BookOpen size={13} />,
                          color: '#1D2B4F',
                          bg: '#FBF6EC',
                        }
                        const statusMeta = STATUS_META[lesson.status] || {
                          label: lesson.status,
                          color: '#6B7A94',
                          bg: '#FBF6EC',
                        }

                        return (
                          <div
                            key={lesson.id}
                            className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                          >
                            <div className="space-y-3">
                              {/* Top Meta Badges */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-6 h-6 flex items-center justify-center font-mono font-bold text-xs bg-[#FBF6EC] border border-[#1D2B4F] text-[#1D2B4F]"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                  >
                                    #{lesson.order}
                                  </span>
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold border"
                                    style={{
                                      color: skillMeta.color,
                                      backgroundColor: skillMeta.bg,
                                      borderColor: skillMeta.color,
                                      fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                  >
                                    {skillMeta.icon}
                                    {skillMeta.label}
                                  </span>
                                </div>

                                <span
                                  className="px-2 py-0.5 text-[10px] font-mono font-bold border"
                                  style={{
                                    color: statusMeta.color,
                                    backgroundColor: statusMeta.bg,
                                    borderColor: statusMeta.color,
                                    fontFamily: "'JetBrains Mono', monospace",
                                  }}
                                >
                                  {statusMeta.label}
                                </span>
                              </div>

                              {/* Lesson Title */}
                              <h3
                                className="text-base font-bold text-[#1D2B4F] leading-snug"
                                style={{ fontFamily: "'Fraunces', serif" }}
                              >
                                {lesson.title}
                              </h3>

                              {/* Mini Specs */}
                              <div
                                className="flex items-center gap-4 text-xs font-mono text-[#6B7A94] pt-1"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                <span>{lesson._count.contents} khối nội dung</span>
                                <span>•</span>
                                <span>{lesson._count.vocabularies} từ vựng</span>
                                <span>•</span>
                                <span>{lesson._count.examQuestions} câu hỏi</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#E7DEC9]">
                              <Link
                                href={`/lessons/${lesson.id}`}
                                target="_blank"
                                className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#4C7A6B] hover:underline"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                <ExternalLink size={13} />
                                Xem góc nhìn học sinh
                              </Link>

                              <Link
                                href={`/teacher/lessons/${lesson.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1D2B4F] text-white text-xs font-mono font-bold border border-[#1D2B4F] shadow-[2px_2px_0_#C1432E] hover:bg-[#2A3C6B]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                <span>SOẠN THẢO</span>
                                <ArrowRight size={12} />
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
