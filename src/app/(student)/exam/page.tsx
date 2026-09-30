import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Clock, BookOpen, Award, ArrowRight, CheckCircle2, History } from 'lucide-react'

const examTypeLabels: Record<string, string> = {
  MINI_TEST: 'Kiểm tra 15 phút',
  GRAMMAR_QUIZ: 'Kiểm tra ngữ pháp',
  SKILL_PRACTICE: 'Luyện kỹ năng',
  MID_TERM: 'Thi giữa kỳ',
  FINAL_EXAM: 'Thi cuối kỳ',
  NATIONAL_MOCK: 'Thi thử THPT Quốc gia',
}

export default async function ExamPage({
  searchParams
}: {
  searchParams: Promise<{ grade?: string; type?: string }>
}) {
  const session = await auth()
  const resolvedSearchParams = await searchParams
  const selectedGrade = resolvedSearchParams?.grade || 'ALL'
  const selectedType = resolvedSearchParams?.type || 'ALL'

  const userId = session?.user?.id

  // 1. Fetch published exams
  const whereClause: any = {
    status: 'PUBLISHED',
  }

  if (selectedGrade !== 'ALL') {
    whereClause.grade = parseInt(selectedGrade)
  }

  if (selectedType !== 'ALL') {
    whereClause.type = selectedType
  }

  const [exams, recentAttempts] = await Promise.all([
    prisma.exam.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          include: {
            questions: {
              select: { id: true }
            }
          }
        },
        ...(userId
          ? {
              attempts: {
                where: { userId },
                orderBy: { score: 'desc' },
                take: 1,
              }
            }
          : {})
      }
    }),
    userId
      ? prisma.examAttempt.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: {
            exam: {
              select: { id: true, title: true, type: true }
            }
          }
        })
      : []
  ])

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-exam {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-exam * { box-sizing:border-box; }
        
        .studio-exam .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-exam .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-exam .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-exam .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-exam .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-exam .page-head { padding-bottom:32px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-exam .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-exam .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-exam .page-head p { font-size:15px; color:var(--ink-soft); max-width:560px; line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-exam .page {padding-left:56px;} .studio-exam .margin-rule {left:24px;}
        }
        `
        }}
      />

      <div className="studio-exam">
        <div className="page">
          <div className="margin-rule"></div>

          {/* Header */}
          <div className="page-head">
            <div className="eyebrow">Phòng thi trực tuyến</div>
            <h1>
              Hệ thống <em>thi thử</em>
            </h1>
            <p>
              Đánh giá năng lực chuẩn xác với cấu trúc đề bám sát đề thi thật của Bộ GD&ĐT và chương trình THPT.
            </p>
          </div>

          {/* Grade Filter Tabs */}
          <div
            className="flex flex-wrap items-center gap-2 mb-8 font-mono text-xs font-bold"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="text-[#6B7A94] uppercase tracking-wider mr-2 text-[11px]">Khối lớp:</span>
            {[
              { label: 'Tất cả', val: 'ALL' },
              { label: 'Lớp 10', val: '10' },
              { label: 'Lớp 11', val: '11' },
              { label: 'Lớp 12', val: '12' },
            ].map((tab) => {
              const active = selectedGrade === tab.val
              return (
                <Link
                  key={tab.val}
                  href={`/exam?grade=${tab.val}${selectedType !== 'ALL' ? `&type=${selectedType}` : ''}`}
                  className={`px-3.5 py-1.5 border-2 transition-all ${
                    active
                      ? 'bg-[#1D2B4F] text-[#FFFDF7] border-[#1D2B4F] shadow-[2px_2px_0_#C1432E]'
                      : 'bg-[#FFFDF7] text-[#6B7A94] border-[#E7DEC9] hover:border-[#1D2B4F]'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>

          {/* 2 Columns: Exam List (Left) and Past Attempts (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* Left: Published Exams List */}
            <div className="space-y-6">
              {exams.length === 0 ? (
                <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-8 text-center shadow-[4px_4px_0_#E7DEC9]">
                  <p className="text-base text-[#6B7A94] mb-3">Chưa có đề thi nào phù hợp với bộ lọc hiện tại.</p>
                  <Link
                    href="/exam"
                    className="inline-block px-4 py-2 bg-[#1D2B4F] text-white font-mono text-xs font-bold"
                  >
                    Xem tất cả đề thi
                  </Link>
                </div>
              ) : (
                exams.map((exam) => {
                  let totalQuestions = 0
                  exam.sections.forEach((sec) => {
                    totalQuestions += sec.questions.length
                  })

                  const bestAttempt = (exam as any).attempts?.[0] || null

                  return (
                    <div
                      key={exam.id}
                      className="bg-[#1D2B4F] text-[#F3EFE2] p-7 md:p-8 relative border-l-6 border-[#E3A73B] shadow-[6px_6px_0_#E7DEC9] transition-transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="font-mono text-[11px] text-[#E3A73B] tracking-widest uppercase font-bold"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          ◆ {examTypeLabels[exam.type] || exam.type} &middot; LỚP {exam.grade}
                        </span>

                        {bestAttempt && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#4C7A6B]/30 border border-[#4C7A6B] text-[#DCE9E3] font-mono text-[11px] font-bold"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            <CheckCircle2 size={12} /> Cao nhất: {bestAttempt.score}/10
                          </span>
                        )}
                      </div>

                      <h2
                        className="text-xl md:text-2xl font-semibold mb-3 leading-snug"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {exam.title}
                      </h2>

                      {exam.description && (
                        <p className="text-sm text-[#B9BFCF] leading-relaxed mb-6 max-w-xl">
                          {exam.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div
                          className="font-mono text-xs font-bold border border-white/20 px-3 py-1.5 flex items-center gap-1.5 text-white/90"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <Clock size={14} className="text-[#E3A73B]" />
                          <span>{exam.duration} phút</span>
                        </div>

                        <div
                          className="font-mono text-xs font-bold border border-white/20 px-3 py-1.5 flex items-center gap-1.5 text-white/90"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <BookOpen size={14} className="text-[#E3A73B]" />
                          <span>{totalQuestions} câu hỏi</span>
                        </div>

                        <div
                          className="font-mono text-xs font-bold border border-white/20 px-3 py-1.5 flex items-center gap-1.5 text-white/90"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <Award size={14} className="text-[#E3A73B]" />
                          <span>Điểm đạt: {exam.passingScore ?? 50}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Link
                          href={`/exam/${exam.id}`}
                          className="flex-1 text-center py-3.5 px-6 bg-[#E3A73B] text-[#1D2B4F] font-bold text-sm tracking-wide hover:bg-[#f0b543] transition-colors border-none shadow-[2px_2px_0_#FFFDF7]"
                        >
                          {bestAttempt ? 'Làm lại bài thi →' : 'Bắt đầu làm bài →'}
                        </Link>

                        {bestAttempt && (
                          <Link
                            href={`/exam/${exam.id}/result?attemptId=${bestAttempt.id}`}
                            className="py-3.5 px-5 border border-white/30 text-white/90 font-mono text-xs font-bold hover:bg-white/10 transition-colors"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            Xem bài cũ
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Right: History & Performance Sidebar */}
            <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 shadow-[4px_4px_0_#E7DEC9]">
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#E7DEC9]">
                <h3
                  className="font-serif font-bold text-[#1D2B4F] text-lg flex items-center gap-2"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  <History size={18} className="text-[#C1432E]" />
                  <span>Lịch sử thi</span>
                </h3>
                <span className="font-mono text-xs text-[#6B7A94]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {recentAttempts.length} lượt
                </span>
              </div>

              {recentAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className="w-20 h-20 rounded-full border-3 border-dashed border-[#6B7A94] text-[#6B7A94] flex items-center justify-center mx-auto mb-4 font-mono text-[10px] tracking-widest -rotate-6"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    CHƯA CÓ<br />BÀI THI
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#1D2B4F] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    Bắt đầu thử sức
                  </h4>
                  <p className="text-xs text-[#6B7A94] leading-relaxed mb-4">
                    Bạn chưa hoàn thành bài kiểm tra nào. Chọn một đề thi bên cạnh để bắt đầu tính điểm và lưu lịch sử nhé!
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentAttempts.map((attempt) => {
                    const isPassed = attempt.isPassed ?? false
                    const dateStr = attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : 'Đang làm'

                    return (
                      <Link
                        key={attempt.id}
                        href={`/exam/${attempt.examId}/result?attemptId=${attempt.id}`}
                        className="block p-3.5 border border-[#E7DEC9] bg-[#FBF6EC] hover:bg-[#F3DAD3]/30 hover:border-[#C1432E] transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-semibold text-xs text-[#1D2B4F] line-clamp-1 group-hover:text-[#C1432E] transition-colors">
                            {attempt.exam.title}
                          </h4>
                          <span
                            className={`font-mono text-xs font-bold shrink-0 px-2 py-0.5 border ${
                              isPassed
                                ? 'bg-[#DCE9E3] text-[#4C7A6B] border-[#4C7A6B]'
                                : 'bg-[#F3DAD3] text-[#C1432E] border-[#C1432E]'
                            }`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {attempt.score ?? 0}/10
                          </span>
                        </div>

                        <div
                          className="flex items-center justify-between text-[11px] font-mono text-[#6B7A94]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <span>{dateStr}</span>
                          <span className="text-[#C1432E] group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                            Xem lại &rarr;
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
