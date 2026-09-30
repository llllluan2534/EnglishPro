import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  Users, BookOpen, PenTool, Award, 
  Plus, CheckCircle2, Clock, BarChart2, Flame, 
  ArrowRight, ExternalLink, FileText, Zap, ChevronRight 
} from "lucide-react"

export default async function TeacherDashboard() {
  const session = await auth()
  
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  // 1. Fetch real statistics from database
  const [
    totalStudents,
    grade12Students,
    grade11Students,
    grade10Students,
    totalExams,
    publishedExams,
    totalLessons,
    totalQuestions,
    recentAttempts,
    topStudents,
    activeExams,
  ] = await Promise.all([
    // Total students
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'STUDENT', grade: 12 } }),
    prisma.user.count({ where: { role: 'STUDENT', grade: 11 } }),
    prisma.user.count({ where: { role: 'STUDENT', grade: 10 } }),

    // Exams count
    prisma.exam.count(),
    prisma.exam.count({ where: { status: 'PUBLISHED' } }),

    // Lessons count
    prisma.lesson.count(),

    // Questions count
    prisma.question.count(),

    // Recent 5 exam attempts
    prisma.examAttempt.findMany({
      where: { submittedAt: { not: null } },
      orderBy: { submittedAt: 'desc' },
      take: 6,
      include: {
        user: { select: { id: true, name: true, email: true, grade: true } },
        exam: { select: { id: true, title: true, grade: true } },
      }
    }),

    // Top students by Streak / XP
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      take: 5,
      include: {
        userXP: true,
        streak: true,
        examAttempts: { where: { submittedAt: { not: null } }, select: { score: true } },
      },
      orderBy: [
        { streak: { currentStreak: 'desc' } },
        { userXP: { totalXP: 'desc' } }
      ]
    }),

    // Top 4 active exams
    prisma.exam.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        sections: { include: { questions: { select: { id: true } } } },
        attempts: { where: { submittedAt: { not: null } }, select: { score: true, isPassed: true } },
      }
    }),
  ])

  // Calculate overall performance
  const allCompletedAttempts = await prisma.examAttempt.findMany({
    where: { submittedAt: { not: null } },
    select: { score: true, isPassed: true }
  })

  const totalAttemptCount = allCompletedAttempts.length
  const allScores = allCompletedAttempts.map(a => a.score ?? 0)
  const avgOverallScore = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : '0.0'
  const passCount = allCompletedAttempts.filter(a => a.isPassed === true).length
  const overallPassRate = totalAttemptCount > 0 ? Math.round((passCount / totalAttemptCount) * 100) : 0

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-dashboard {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-dashboard * { box-sizing:border-box; }
        
        .studio-dashboard .page {
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-dashboard .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-dashboard .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-dashboard .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-dashboard .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-dashboard .page-head { padding-bottom:32px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-dashboard .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-dashboard .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-dashboard .page-head p { font-size:15px; color:var(--ink-soft); max-width:680px; line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-dashboard .page {padding-left:48px; padding-right:20px;} .studio-dashboard .margin-rule {left:20px;}
        }
        @media (max-width:640px){
          .studio-dashboard .page {padding:20px 14px 60px 26px !important;}
          .studio-dashboard .margin-rule {left:10px !important; opacity:.35 !important;}
          .studio-dashboard .page-head h1 {font-size:26px !important; line-height:1.25 !important;}
          .studio-dashboard .page-head p {font-size:13px !important;}
        }
        `
        }}
      />

      <div className="studio-dashboard">
        <div className="page">
          <div className="margin-rule" />

          {/* Header */}
          <div className="page-head flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Bảng Điều Hành Khảo Thí & Học Thuật</div>
              <h1>
                Chào mừng quay lại, <em>{session.user.name || 'Giáo viên'}</em>
              </h1>
              <p>
                Theo dõi toàn diện tiến độ làm bài thi thử của học sinh, quản lý kho ngân hàng câu hỏi và điều phối giáo trình bài giảng toàn trường.
              </p>
            </div>

            {/* Quick Actions Menu */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/teacher/exams/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C1432E] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F] shadow-[3px_3px_0_#1D2B4F] hover:bg-[#A83724] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Plus size={15} />
                SOẠN ĐỀ THI
              </Link>
              <Link
                href="/teacher/questions/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFDF7] text-[#1D2B4F] font-mono font-bold text-xs border-2 border-[#1D2B4F] shadow-[3px_3px_0_#1D2B4F] hover:bg-[#E7DEC9] transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Plus size={15} />
                THÊM CÂU HỎI
              </Link>
            </div>
          </div>

          {/* 4 Core Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Link
              href="/teacher/students"
              className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] block hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
            >
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Học sinh quản lý</span>
                <Users size={16} className="text-[#1D2B4F] group-hover:text-[#C1432E] transition-colors" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalStudents}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">
                K12: {grade12Students} • K11: {grade11Students} • K10: {grade10Students}
              </div>
            </Link>

            <Link
              href="/teacher/exams"
              className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] block hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
            >
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Đề thi & Khảo thí</span>
                <Award size={16} className="text-[#C1432E] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-serif font-black text-[#C1432E]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalExams}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">
                {publishedExams} đề mở • {totalAttemptCount} lượt thi
              </div>
            </Link>

            <Link
              href="/teacher/questions"
              className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] block hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
            >
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Ngân hàng câu hỏi</span>
                <PenTool size={16} className="text-[#4C7A6B] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-serif font-black text-[#4C7A6B]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalQuestions}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">
                {totalLessons} bài giảng trong giáo trình
              </div>
            </Link>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Điểm trung bình</span>
                <BarChart2 size={16} className="text-[#E3A73B]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {avgOverallScore}
              </div>
              <div className="text-[11px] font-mono text-[#4C7A6B] font-bold mt-1">
                Tỷ lệ đạt toàn trường: {overallPassRate}%
              </div>
            </div>
          </div>

          {/* 2-Column Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Left 2 Cols: Recent Exam Submissions */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
                <div className="p-6 border-b-2 border-dashed border-[#E7DEC9] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                      Bài thi nộp gần đây
                    </h2>
                    <p className="text-xs text-[#6B7A94] mt-0.5">
                      Cập nhật trực tiếp kết quả làm bài của học sinh
                    </p>
                  </div>
                  <Link
                    href="/teacher/exams"
                    className="text-xs font-mono font-bold text-[#C1432E] hover:underline flex items-center gap-1"
                  >
                    Xem tất cả đề thi <ChevronRight size={13} />
                  </Link>
                </div>

                {recentAttempts.length === 0 ? (
                  <div className="p-12 text-center text-[#6B7A94]">
                    <FileText size={40} className="mx-auto mb-2 opacity-40 text-[#1D2B4F]" />
                    <p className="text-sm font-bold text-[#1D2B4F]">Chưa có lượt nộp bài nào gần đây</p>
                    <p className="text-xs text-[#6B7A94] mt-1">Khi học sinh làm bài thi thử, điểm số sẽ xuất hiện ngay tại đây.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E7DEC9]">
                    {recentAttempts.map((attempt) => {
                      const isPassed = attempt.isPassed === true
                      return (
                        <div
                          key={attempt.id}
                          className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-[#FBF6EC]/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#1D2B4F]">
                                {attempt.user.name || 'Học sinh'}
                              </span>
                              <span
                                className="px-2 py-0.2 text-[10px] font-mono font-bold bg-[#FBF6EC] border border-[#1D2B4F] text-[#1D2B4F]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                {attempt.user.grade ? `Lớp ${attempt.user.grade}` : 'K12'}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7A94] line-clamp-1">
                              Đề thi: <strong className="text-[#1D2B4F]">{attempt.exam.title}</strong>
                            </p>
                            <span className="text-[11px] font-mono text-[#6B7A94] block">
                              Nộp lúc: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--'} ngày {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString('vi-VN') : '--'}
                            </span>
                          </div>

                          <div className="shrink-0 flex items-center gap-4 text-right">
                            <div>
                              <div
                                className="font-serif text-2xl font-black text-[#1D2B4F]"
                                style={{ fontFamily: "'Fraunces', serif" }}
                              >
                                {attempt.score?.toFixed(1) ?? '--'}
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase ${
                                  isPassed ? 'text-[#4C7A6B]' : 'text-[#C1432E]'
                                }`}
                              >
                                {isPassed ? '✓ Đạt' : '✗ Chưa đạt'}
                              </span>
                            </div>

                            <Link
                              href={`/teacher/exams/${attempt.exam.id}/results`}
                              className="p-2 bg-[#FFFDF7] text-[#1D2B4F] border-2 border-[#1D2B4F] hover:bg-[#E7DEC9] shadow-[1px_1px_0_#1D2B4F] transition-all"
                              title="Xem phổ điểm đề thi này"
                            >
                              <BarChart2 size={16} />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Active Exams Overview */}
              <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
                <div className="p-6 border-b-2 border-dashed border-[#E7DEC9] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                      Đề thi khảo sát đang mở
                    </h2>
                    <p className="text-xs text-[#6B7A94] mt-0.5">
                      Các đề thi học sinh đang có thể vào phòng thi làm bài
                    </p>
                  </div>
                  <Link
                    href="/teacher/exams"
                    className="text-xs font-mono font-bold text-[#C1432E] hover:underline flex items-center gap-1"
                  >
                    Quản lý đề thi <ChevronRight size={13} />
                  </Link>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeExams.map((exam) => {
                    const totalQ = exam.sections.reduce((acc, s) => acc + s.questions.length, 0)
                    const attemptsNum = exam.attempts.length
                    const scores = exam.attempts.map(a => a.score ?? 0)
                    const avg = attemptsNum > 0 ? (scores.reduce((a, b) => a + b, 0) / attemptsNum).toFixed(1) : '--'

                    return (
                      <div
                        key={exam.id}
                        className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7A94] mb-1">
                            <span>LỚP {exam.grade} • {exam.duration} PHÚT</span>
                            <span className="text-[#4C7A6B] font-bold">● ĐANG MỞ</span>
                          </div>
                          <h4 className="font-bold text-sm text-[#1D2B4F] line-clamp-2 leading-snug">
                            {exam.title}
                          </h4>
                          <div className="text-[11px] font-mono text-[#6B7A94] mt-2">
                            {totalQ} câu hỏi • {attemptsNum} lượt đã thi (TB: <strong>{avg}đ</strong>)
                          </div>
                        </div>

                        <Link
                          href={`/teacher/exams/${exam.id}/results`}
                          className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#1D2B4F] text-white text-xs font-mono font-bold border border-[#1D2B4F] hover:bg-[#2A3C6B]"
                        >
                          <BarChart2 size={13} /> XEM PHỔ ĐIỂM
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Top Students & Shortcuts */}
            <div className="space-y-8">
              {/* Leaderboard / Active Students */}
              <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
                <div className="p-5 border-b-2 border-dashed border-[#E7DEC9]">
                  <h3 className="text-lg font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                    Học sinh chuyên cần nhất
                  </h3>
                  <p className="text-xs text-[#6B7A94] mt-0.5">Xếp hạng theo chuỗi Streak & XP tích lũy</p>
                </div>

                <div className="p-4 divide-y divide-[#E7DEC9]">
                  {topStudents.map((st, idx) => {
                    const initials = st.name
                      ? st.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                      : 'HS'

                    return (
                      <Link
                        key={st.id}
                        href={`/teacher/students/${st.id}`}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-[#FBF6EC] px-2 transition-colors block group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 flex items-center justify-center font-mono font-bold text-xs border ${
                              idx === 0
                                ? 'bg-[#E3A73B] text-white border-[#1D2B4F]'
                                : idx === 1
                                ? 'bg-[#6B7A94] text-white border-[#1D2B4F]'
                                : 'bg-[#FBF6EC] text-[#1D2B4F] border-[#E7DEC9]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-xs text-[#1D2B4F] group-hover:text-[#C1432E] transition-colors">
                              {st.name}
                            </div>
                            <span className="text-[10px] font-mono text-[#6B7A94]">
                              {st.grade ? `Lớp ${st.grade}` : 'K12'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-xs font-bold text-[#C1432E] flex items-center justify-end gap-1">
                            <Flame size={12} /> {st.streak?.currentStreak ?? 0} ngày
                          </div>
                          <span className="text-[10px] text-[#6B7A94]">
                            {st.userXP?.totalXP ?? 0} XP
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <div className="p-4 border-t border-[#E7DEC9] text-center">
                  <Link
                    href="/teacher/students"
                    className="text-xs font-mono font-bold text-[#1D2B4F] hover:underline flex items-center justify-center gap-1"
                  >
                    Xem toàn bộ sổ học sinh <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Action Banner Card */}
              <div className="bg-[#1D2B4F] text-white border-2 border-[#1D2B4F] p-6 shadow-[6px_6px_0_#C1432E] space-y-4">
                <span
                  className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C1432E] text-white inline-block"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Nâng cao nghiệp vụ
                </span>
                <h4 className="text-xl font-bold font-serif leading-snug" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tạo ngân hàng câu hỏi chuẩn GDPT 2018
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  Soạn các câu hỏi đọc hiểu điền từ, bài nghe audio và dạng sắp xếp câu để làm phong phú thêm kho học liệu của lớp.
                </p>
                <Link
                  href="/teacher/questions/create"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white text-[#1D2B4F] font-mono font-bold text-xs hover:bg-[#E7DEC9] transition-all shadow-[2px_2px_0_#C1432E]"
                >
                  <Plus size={14} /> Soạn câu hỏi ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
