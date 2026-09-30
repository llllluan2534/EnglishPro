import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Users, Award, Zap, Flame, 
  Calendar, Mail, CheckCircle, XCircle, Clock, BookOpen, ExternalLink, FileText 
} from 'lucide-react'

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const { id } = await params

  const student = await prisma.user.findUnique({
    where: { id, role: 'STUDENT' },
    include: {
      userXP: true,
      streak: true,
      examAttempts: {
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: 'desc' },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              type: true,
              grade: true,
              duration: true,
            }
          }
        }
      },
      lessonProgress: {
        where: { isCompleted: true },
        orderBy: { lastAccessedAt: 'desc' },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              skill: true,
              topic: {
                select: {
                  title: true,
                  grade: true,
                }
              }
            }
          }
        }
      }
    }
  })

  if (!student) {
    notFound()
  }

  // Calculate statistics
  const attempts = student.examAttempts
  const totalAttempts = attempts.length
  const scores = attempts.map(a => a.score ?? 0)
  const avgScore = totalAttempts > 0
    ? (scores.reduce((a, b) => a + b, 0) / totalAttempts).toFixed(1)
    : '--'
  const maxScore = totalAttempts > 0 ? Math.max(...scores).toFixed(1) : '--'
  const passedCount = attempts.filter(a => a.isPassed === true).length
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0

  const initials = student.name
    ? student.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : 'HS'

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-student-detail {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-student-detail * { box-sizing:border-box; }
        
        .studio-student-detail .page {
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-student-detail .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-student-detail .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-student-detail .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-student-detail .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-student-detail .page-head { padding-bottom:28px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-student-detail .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:32px; margin:0 0 8px; }
        .studio-student-detail .page-head p { font-size:14px; color:var(--ink-soft); line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-student-detail .page {padding-left:56px;} .studio-student-detail .margin-rule {left:24px;}
        }
        `
        }}
      />

      <div className="studio-student-detail">
        <div className="page">
          <div className="margin-rule" />

          {/* Navigation Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/teacher/students"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF7] text-[#1D2B4F] text-xs font-bold font-mono border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#E7DEC9] transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <ArrowLeft size={14} />
              QUAY LẠI SỔ HỌC SINH
            </Link>
          </div>

          {/* Student Profile Card (Vintage Passport Style) */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-8 shadow-[8px_8px_0_#1D2B4F] mb-10 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-dashed border-[#E7DEC9]">
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 bg-[#1D2B4F] text-white flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#1D2B4F] shadow-[3px_3px_0_#C1432E] shrink-0"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1
                      className="text-2xl md:text-3xl font-bold text-[#1D2B4F] leading-tight"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {student.name}
                    </h1>
                    <span
                      className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#FBF6EC] border border-[#1D2B4F] text-[#1D2B4F]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {student.grade ? `LỚP ${student.grade}` : 'CHƯA CHỌN LỚP'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6B7A94] mt-2">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} /> {student.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      Ngày sinh: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </span>
                    <span>
                      Tham gia: {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gamification Pills */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-[#FDF4E2] border-2 border-[#E3A73B] text-center font-mono">
                  <div className="text-[10px] text-[#6B7A94] uppercase tracking-wider font-bold">Tích lũy XP</div>
                  <div className="text-lg font-bold text-[#E3A73B] flex items-center justify-center gap-1">
                    <Zap size={16} /> {student.userXP?.totalXP ?? 0}
                  </div>
                </div>

                <div className="px-4 py-2 bg-[#F3DAD3] border-2 border-[#C1432E] text-center font-mono">
                  <div className="text-[10px] text-[#6B7A94] uppercase tracking-wider font-bold">Chuỗi học tập</div>
                  <div className="text-lg font-bold text-[#C1432E] flex items-center justify-center gap-1">
                    <Flame size={16} /> {student.streak?.currentStreak ?? 0} ngày
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
                <div className="text-[11px] font-mono text-[#6B7A94] uppercase mb-1">Điểm thi TB</div>
                <div className="text-2xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {avgScore}
                </div>
                <div className="text-[10px] font-mono text-[#6B7A94] mt-0.5">Thang điểm 10</div>
              </div>

              <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
                <div className="text-[11px] font-mono text-[#6B7A94] uppercase mb-1">Bài thi đã làm</div>
                <div className="text-2xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {totalAttempts}
                </div>
                <div className="text-[10px] font-mono text-[#4C7A6B] mt-0.5">{passedCount} bài đạt ({passRate}%)</div>
              </div>

              <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
                <div className="text-[11px] font-mono text-[#6B7A94] uppercase mb-1">Điểm cao nhất</div>
                <div className="text-2xl font-serif font-black text-[#C1432E]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {maxScore}
                </div>
                <div className="text-[10px] font-mono text-[#6B7A94] mt-0.5">Kỷ lục cá nhân</div>
              </div>

              <div className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] text-center">
                <div className="text-[11px] font-mono text-[#6B7A94] uppercase mb-1">Bài học đã học</div>
                <div className="text-2xl font-serif font-black text-[#4C7A6B]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {student.lessonProgress.length}
                </div>
                <div className="text-[10px] font-mono text-[#6B7A94] mt-0.5">Đã hoàn thành</div>
              </div>
            </div>
          </div>

          {/* Section 1: Exam History */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F] mb-10">
            <div className="p-6 border-b-2 border-dashed border-[#E7DEC9] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Lịch sử khảo thí & Làm bài thi
                </h2>
                <p className="text-xs text-[#6B7A94] mt-0.5">
                  Toàn bộ các lần học sinh tham gia làm bài thi thử và kiểm tra
                </p>
              </div>
              <span className="text-xs font-mono text-[#6B7A94]">
                {totalAttempts} lượt nộp
              </span>
            </div>

            {totalAttempts === 0 ? (
              <div className="p-12 text-center text-[#6B7A94]">
                <FileText size={36} className="mx-auto mb-2 opacity-40 text-[#1D2B4F]" />
                <p className="text-sm font-bold text-[#1D2B4F]">Học sinh chưa tham gia bài thi nào</p>
                <p className="text-xs text-[#6B7A94] mt-1">Khi học sinh nộp bài thi, kết quả sẽ hiển thị ở đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <thead
                    className="bg-[#FBF6EC] border-b-2 border-[#1D2B4F] text-[#1D2B4F] font-mono text-[11px] uppercase tracking-wider"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <tr>
                      <th className="py-3.5 px-4">Đề thi</th>
                      <th className="py-3.5 px-4 text-center">Điểm số</th>
                      <th className="py-3.5 px-4 text-center">Tỷ lệ đúng</th>
                      <th className="py-3.5 px-4 text-center">Thời gian làm</th>
                      <th className="py-3.5 px-4">Ngày nộp</th>
                      <th className="py-3.5 px-4 text-center">Kết quả</th>
                      <th className="py-3.5 px-4 text-center">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DEC9]">
                    {attempts.map((att) => {
                      const minutes = Math.floor((att.timeSpent ?? 0) / 60)
                      const seconds = (att.timeSpent ?? 0) % 60
                      const isPassed = att.isPassed === true

                      return (
                        <tr key={att.id} className="hover:bg-[#FBF6EC]/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#1D2B4F] text-sm">{att.exam.title}</div>
                            <div className="text-[11px] font-mono text-[#6B7A94]">
                              Lớp {att.exam.grade} • {att.exam.type}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span
                              className="font-serif text-lg font-black text-[#1D2B4F]"
                              style={{ fontFamily: "'Fraunces', serif" }}
                            >
                              {att.score?.toFixed(1) ?? '--'}
                            </span>
                            <span className="text-[10px] font-mono text-[#6B7A94] block">/ 10đ</span>
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-xs font-bold text-[#1D2B4F]">
                            {att.percentage ? `${att.percentage}%` : '--'}
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-xs text-[#6B7A94]">
                            {minutes}m {seconds}s
                          </td>

                          <td className="py-4 px-4 text-xs text-[#6B7A94]">
                            {att.submittedAt ? new Date(att.submittedAt).toLocaleString('vi-VN') : '--'}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono font-bold border ${
                                isPassed
                                  ? 'bg-[#DCE9E3] text-[#4C7A6B] border-[#4C7A6B]'
                                  : 'bg-[#F3DAD3] text-[#C1432E] border-[#C1432E]'
                              }`}
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {isPassed ? (
                                <>
                                  <CheckCircle size={12} /> ĐẠT
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} /> CHƯA ĐẠT
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <Link
                              href={`/exam/${att.examId}/result?attemptId=${att.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold bg-[#FFFDF7] text-[#1D2B4F] border border-[#1D2B4F] hover:bg-[#E7DEC9] shadow-[1px_1px_0_#1D2B4F]"
                            >
                              <span>XEM BÀI</span>
                              <ExternalLink size={11} />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Completed Lessons */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
            <div className="p-6 border-b-2 border-dashed border-[#E7DEC9] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tiến trình bài học đã hoàn thành
                </h2>
                <p className="text-xs text-[#6B7A94] mt-0.5">
                  Danh sách bài giảng trong chương trình học sinh đã xem và vượt qua
                </p>
              </div>
              <span className="text-xs font-mono text-[#6B7A94]">
                {student.lessonProgress.length} bài đã học
              </span>
            </div>

            {student.lessonProgress.length === 0 ? (
              <div className="p-12 text-center text-[#6B7A94]">
                <BookOpen size={36} className="mx-auto mb-2 opacity-40 text-[#1D2B4F]" />
                <p className="text-sm font-bold text-[#1D2B4F]">Học sinh chưa hoàn thành bài học nào</p>
                <p className="text-xs text-[#6B7A94] mt-1">Khi học sinh học và hoàn thành bài giảng, tiến độ sẽ ghi nhận tại đây.</p>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.lessonProgress.map((prog) => {
                  return (
                    <div
                      key={prog.id}
                      className="p-4 bg-[#FBF6EC] border border-[#E7DEC9] flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#1D2B4F] text-white"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {prog.lesson.skill}
                          </span>
                          <span className="text-[11px] font-mono text-[#6B7A94]">
                            {prog.lesson.topic.title}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1D2B4F]">{prog.lesson.title}</h4>
                        <div className="text-[11px] font-mono text-[#6B7A94]">
                          Hoàn thành: {prog.completedAt ? new Date(prog.completedAt).toLocaleDateString('vi-VN') : 'Đang học'}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-[#4C7A6B] bg-[#DCE9E3] border border-[#4C7A6B] block mb-1">
                          HOÀN THÀNH
                        </span>
                        {prog.score !== null && (
                          <span className="text-xs font-mono text-[#1D2B4F]">
                            Điểm: <strong>{prog.score}đ</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
