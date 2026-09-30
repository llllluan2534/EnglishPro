import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Award, Clock, Plus, BarChart2, Eye, FileText, 
  CheckCircle2, AlertCircle, BookOpen, Users, ArrowUpRight 
} from 'lucide-react'
import { ExamType, ContentStatus } from '@prisma/client'

const examTypeLabels: Record<string, string> = {
  MINI_TEST: 'Kiểm tra 15 phút',
  GRAMMAR_QUIZ: 'Kiểm tra ngữ pháp',
  SKILL_PRACTICE: 'Luyện kỹ năng',
  MID_TERM: 'Thi giữa kỳ',
  FINAL_EXAM: 'Thi cuối kỳ',
  NATIONAL_MOCK: 'Thi thử THPT Quốc gia',
}

export default async function TeacherExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; type?: string }>
}) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams
  const selectedGrade = resolvedSearchParams?.grade || 'ALL'
  const selectedType = resolvedSearchParams?.type || 'ALL'

  // Build query
  const whereClause: any = {}
  if (selectedGrade !== 'ALL') {
    whereClause.grade = parseInt(selectedGrade)
  }
  if (selectedType !== 'ALL') {
    whereClause.type = selectedType
  }

  // Fetch all exams with sections, questions, and attempts
  const exams = await prisma.exam.findMany({
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
      attempts: {
        where: { submittedAt: { not: null } },
        select: {
          id: true,
          score: true,
          isPassed: true,
          timeSpent: true,
          submittedAt: true,
        }
      },
      author: {
        select: { name: true }
      }
    }
  })

  // Calculate overall teacher stats
  const totalExams = exams.length
  const publishedExams = exams.filter(e => e.status === ContentStatus.PUBLISHED).length
  const totalAttemptsCount = exams.reduce((acc, e) => acc + e.attempts.length, 0)
  
  const allScores = exams.flatMap(e => e.attempts.map(a => a.score ?? 0))
  const avgScore = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : '0.0'

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-teacher-exam {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-teacher-exam * { box-sizing:border-box; }
        
        .studio-teacher-exam .page {
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-teacher-exam .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-teacher-exam .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-teacher-exam .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-teacher-exam .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-teacher-exam .page-head { padding-bottom:32px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-teacher-exam .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-teacher-exam .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-teacher-exam .page-head p { font-size:15px; color:var(--ink-soft); max-width:680px; line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-teacher-exam .page {padding-left:56px;} .studio-teacher-exam .margin-rule {left:24px;}
        }
        `
        }}
      />

      <div className="studio-teacher-exam">
        <div className="page">
          <div className="margin-rule" />

          {/* Header Section */}
          <div className="page-head flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Phân hệ Giáo viên & Khảo thí</div>
              <h1>
                Quản lý <em>Đề thi & Khảo sát</em>
              </h1>
              <p>
                Soạn thảo đề thi chuẩn cấu trúc Bộ GD&ĐT, kiểm duyệt ngân hàng câu hỏi và theo dõi phổ điểm, kết quả chi tiết của học sinh.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/teacher/exams/create"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#C1432E] text-white font-bold text-sm border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] hover:bg-[#A83724] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Plus size={18} />
                SOẠN ĐỀ THI MỚI
              </Link>
            </div>
          </div>

          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Tổng số đề thi</span>
                <FileText size={16} className="text-[#1D2B4F]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalExams}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Đề đã khởi tạo</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Đã xuất bản</span>
                <CheckCircle2 size={16} className="text-[#4C7A6B]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#4C7A6B]" style={{ fontFamily: "'Fraunces', serif" }}>
                {publishedExams}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Học sinh đang có thể làm</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Lượt nộp bài</span>
                <Users size={16} className="text-[#C1432E]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#C1432E]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalAttemptsCount}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Lượt thi hoàn thành</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Điểm trung bình</span>
                <BarChart2 size={16} className="text-[#E3A73B]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {avgScore}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Thang điểm 10</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E7DEC9]">
            {/* Grade Tabs */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
                    href={`/teacher/exams?grade=${tab.val}${selectedType !== 'ALL' ? `&type=${selectedType}` : ''}`}
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

            {/* Type Tabs */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-[#6B7A94] uppercase tracking-wider mr-2 text-[11px]">Dạng đề:</span>
              {[
                { label: 'Tất cả', val: 'ALL' },
                { label: 'THPT 2026', val: 'NATIONAL_MOCK' },
                { label: 'Giữa kỳ', val: 'MID_TERM' },
                { label: 'Cuối kỳ', val: 'FINAL_EXAM' },
              ].map((tab) => {
                const active = selectedType === tab.val
                return (
                  <Link
                    key={tab.val}
                    href={`/teacher/exams?type=${tab.val}${selectedGrade !== 'ALL' ? `&grade=${selectedGrade}` : ''}`}
                    className={`px-3 py-1.5 border-2 transition-all ${
                      active
                        ? 'bg-[#C1432E] text-white border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F]'
                        : 'bg-[#FFFDF7] text-[#6B7A94] border-[#E7DEC9] hover:border-[#1D2B4F] hover:text-[#1D2B4F]'
                    }`}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Exam List */}
          {exams.length === 0 ? (
            <div className="p-16 text-center bg-[#FFFDF7] border-2 border-dashed border-[#1D2B4F] shadow-[6px_6px_0_#E7DEC9]">
              <FileText size={48} className="mx-auto text-[#6B7A94] mb-4 opacity-50" />
              <h3 className="text-xl font-bold font-serif text-[#1D2B4F] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                Chưa có đề thi nào trong danh mục này
              </h3>
              <p className="text-sm text-[#6B7A94] mb-6 max-w-md mx-auto">
                Hãy bắt đầu tạo đề thi mới để giao bài tập hoặc tổ chức thi thử cho học sinh của bạn.
              </p>
              <Link
                href="/teacher/exams/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C1432E] text-white font-bold text-sm border-2 border-[#1D2B4F] shadow-[3px_3px_0_#1D2B4F]"
              >
                <Plus size={16} /> Tạo đề thi ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam) => {
                const totalQuestions = exam.sections.reduce((acc, s) => acc + s.questions.length, 0)
                const attemptsCount = exam.attempts.length
                const examScores = exam.attempts.map(a => a.score ?? 0)
                const examAvg = attemptsCount > 0
                  ? (examScores.reduce((a, b) => a + b, 0) / attemptsCount).toFixed(1)
                  : '--'
                const examMax = attemptsCount > 0 ? Math.max(...examScores).toFixed(1) : '--'
                const passCount = exam.attempts.filter(a => a.isPassed === true).length
                const passRate = attemptsCount > 0 ? Math.round((passCount / attemptsCount) * 100) : 0

                const isPublished = exam.status === ContentStatus.PUBLISHED

                return (
                  <div
                    key={exam.id}
                    className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 shadow-[6px_6px_0_#1D2B4F] flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-[#1D2B4F] text-white border border-[#1D2B4F]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            Lớp {exam.grade}
                          </span>
                          <span
                            className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-[#FBF6EC] text-[#C1432E] border border-[#E7DEC9]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {examTypeLabels[exam.type] || exam.type}
                          </span>
                        </div>

                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-bold border ${
                            isPublished
                              ? 'bg-[#DCE9E3] text-[#4C7A6B] border-[#4C7A6B]'
                              : 'bg-[#FBF6EC] text-[#6B7A94] border-[#E7DEC9]'
                          }`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {isPublished ? (
                            <>
                              <CheckCircle2 size={12} /> ĐÃ XUẤT BẢN
                            </>
                          ) : (
                            <>
                              <AlertCircle size={12} /> BẢN NHÁP
                            </>
                          )}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h2
                        className="text-xl font-bold text-[#1D2B4F] mb-2 leading-tight"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {exam.title}
                      </h2>
                      <p className="text-xs text-[#6B7A94] line-clamp-2 leading-relaxed mb-4">
                        {exam.description || 'Chưa có mô tả chi tiết cho đề thi này.'}
                      </p>

                      {/* Meta Pills */}
                      <div
                        className="flex items-center gap-4 text-xs font-mono text-[#6B7A94] pb-4 mb-4 border-b border-[#E7DEC9]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#C1432E]" />
                          {exam.duration} phút
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-[#1D2B4F]" />
                          {totalQuestions} câu hỏi
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Award size={14} className="text-[#E3A73B]" />
                          Thang 10đ
                        </span>
                      </div>

                      {/* Student Performance Mini Grid */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-[#FBF6EC] border border-[#E7DEC9] text-center mb-5">
                        <div>
                          <div className="text-[10px] font-mono text-[#6B7A94]">Bài nộp</div>
                          <div className="text-base font-bold font-mono text-[#1D2B4F]">{attemptsCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#6B7A94]">Điểm TB</div>
                          <div className="text-base font-bold font-mono text-[#C1432E]">{examAvg}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#6B7A94]">Tỷ lệ đạt</div>
                          <div className="text-base font-bold font-mono text-[#4C7A6B]">{passRate}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <Link
                        href={`/teacher/exams/${exam.id}/results`}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1D2B4F] text-white text-xs font-bold border-2 border-[#1D2B4F] hover:bg-[#2A3C6B] shadow-[2px_2px_0_#C1432E] transition-all"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <BarChart2 size={14} />
                        KẾT QUẢ & PHỔ ĐIỂM
                      </Link>

                      <Link
                        href={`/exam/${exam.id}`}
                        target="_blank"
                        title="Xem thử đề thi với tư cách học sinh"
                        className="p-2.5 bg-[#FFFDF7] text-[#1D2B4F] border-2 border-[#1D2B4F] hover:bg-[#E7DEC9] shadow-[2px_2px_0_#1D2B4F] transition-all"
                      >
                        <Eye size={16} />
                      </Link>
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
