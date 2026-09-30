import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Award, Clock, Users, BarChart2, 
  CheckCircle, XCircle, TrendingUp, AlertCircle, FileText 
} from 'lucide-react'

export default async function ExamResultsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const { id } = await params

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          questions: {
            select: { id: true }
          }
        }
      }
    }
  })

  if (!exam) {
    notFound()
  }

  // Fetch all completed attempts for this exam
  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId: id,
      submittedAt: { not: null },
    },
    orderBy: [
      { score: 'desc' },
      { submittedAt: 'asc' }
    ],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          grade: true,
        }
      },
      answers: {
        select: {
          isCorrect: true,
          score: true,
          questionId: true,
        }
      }
    }
  })

  const totalQuestions = exam.sections.reduce((acc, s) => acc + s.questions.length, 0)
  const totalSubmissions = attempts.length

  // Calculate statistics
  const scores = attempts.map(a => a.score ?? 0)
  const avgScore = totalSubmissions > 0
    ? (scores.reduce((a, b) => a + b, 0) / totalSubmissions).toFixed(1)
    : '0.0'
  const maxScore = totalSubmissions > 0 ? Math.max(...scores).toFixed(1) : '0.0'
  const minScore = totalSubmissions > 0 ? Math.min(...scores).toFixed(1) : '0.0'
  
  const passedCount = attempts.filter(a => a.isPassed === true).length
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0

  const avgTimeSeconds = totalSubmissions > 0
    ? Math.round(attempts.reduce((acc, a) => acc + (a.timeSpent ?? 0), 0) / totalSubmissions)
    : 0
  const avgMinutes = Math.floor(avgTimeSeconds / 60)
  const avgSeconds = avgTimeSeconds % 60

  // Calculate Score Distribution (Phổ điểm)
  // Ranges: [< 5.0], [5.0 - 6.4], [6.5 - 7.9], [8.0 - 8.9], [9.0 - 10.0]
  const distribution = [
    { label: '< 5.0 (Yếu)', count: 0, color: '#C1432E' },
    { label: '5.0 - 6.4 (TB)', count: 0, color: '#E3A73B' },
    { label: '6.5 - 7.9 (Khá)', count: 0, color: '#6B7A94' },
    { label: '8.0 - 8.9 (Giỏi)', count: 0, color: '#4C7A6B' },
    { label: '9.0 - 10.0 (Xuất sắc)', count: 0, color: '#1D2B4F' },
  ]

  attempts.forEach(a => {
    const s = a.score ?? 0
    if (s < 5.0) distribution[0].count++
    else if (s < 6.5) distribution[1].count++
    else if (s < 8.0) distribution[2].count++
    else if (s < 9.0) distribution[3].count++
    else distribution[4].count++
  })

  const maxDistributionCount = Math.max(...distribution.map(d => d.count), 1)

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-results {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-results * { box-sizing:border-box; }
        
        .studio-results .page {
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-results .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-results .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-results .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-results .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-results .page-head { padding-bottom:28px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-results .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:32px; margin:0 0 8px; }
        .studio-results .page-head p { font-size:14px; color:var(--ink-soft); line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-results .page {padding-left:48px; padding-right:20px;} .studio-results .margin-rule {left:20px;}
        }
        @media (max-width:640px){
          .studio-results .page {padding:20px 14px 60px 26px !important;}
          .studio-results .margin-rule {left:10px !important; opacity:.35 !important;}
          .studio-results .page-head h1 {font-size:24px !important; line-height:1.25 !important;}
          .studio-results .page-head p {font-size:13px !important;}
        }
        `
        }}
      />

      <div className="studio-results">
        <div className="page">
          <div className="margin-rule" />

          {/* Navigation Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/teacher/exams"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF7] text-[#1D2B4F] text-xs font-bold font-mono border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#E7DEC9] transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <ArrowLeft size={14} />
              QUAY LẠI DANH SÁCH ĐỀ THI
            </Link>
          </div>

          {/* Header Title */}
          <div className="page-head flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Báo cáo Khảo thí & Phổ điểm</div>
              <h1>{exam.title}</h1>
              <p>
                Khối lớp {exam.grade} • Thời lượng: {exam.duration} phút • Tổng số: {totalQuestions} câu hỏi • Điểm đạt: {exam.passingScore ?? 5}/10đ
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 font-mono text-xs font-bold bg-[#DCE9E3] text-[#4C7A6B] border border-[#4C7A6B]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalSubmissions} HỌC SINH ĐÃ NỘP BÀI
              </span>
            </div>
          </div>

          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="text-xs font-mono text-[#6B7A94] uppercase tracking-wider mb-1">Điểm trung bình</div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {avgScore}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Thang điểm 10</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="text-xs font-mono text-[#6B7A94] uppercase tracking-wider mb-1">Tỷ lệ đạt (≥ 5đ)</div>
              <div className="text-3xl font-serif font-black text-[#4C7A6B]" style={{ fontFamily: "'Fraunces', serif" }}>
                {passRate}%
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">{passedCount}/{totalSubmissions} học sinh đạt</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="text-xs font-mono text-[#6B7A94] uppercase tracking-wider mb-1">Cao nhất / Thấp nhất</div>
              <div className="text-3xl font-serif font-black text-[#C1432E]" style={{ fontFamily: "'Fraunces', serif" }}>
                {maxScore} <span className="text-sm font-sans font-normal text-[#6B7A94]">/ {minScore}</span>
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Biên độ điểm số</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="text-xs font-mono text-[#6B7A94] uppercase tracking-wider mb-1">Thời gian làm TB</div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {avgMinutes}m {avgSeconds}s
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Giới hạn {exam.duration} phút</div>
            </div>
          </div>

          {/* Phổ Điểm (Score Distribution Chart) */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] mb-10">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E7DEC9]">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Phổ điểm bài thi (Score Distribution)
                </h2>
                <p className="text-xs text-[#6B7A94] mt-0.5">
                  Phân bố số lượng học sinh theo từng dải điểm chuẩn để đánh giá độ phân hóa của đề
                </p>
              </div>
              <span
                className="text-xs font-mono text-[#C1432E] font-bold uppercase tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalSubmissions} Bài làm
              </span>
            </div>

            {totalSubmissions === 0 ? (
              <div className="py-12 text-center text-[#6B7A94] text-sm">
                Chưa có dữ liệu bài nộp để tạo biểu đồ phổ điểm.
              </div>
            ) : (
              <div className="space-y-4">
                {distribution.map((d, idx) => {
                  const percentage = totalSubmissions > 0 ? Math.round((d.count / totalSubmissions) * 100) : 0
                  const barWidth = maxDistributionCount > 0 ? Math.max((d.count / maxDistributionCount) * 100, 2) : 2

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold text-[#1D2B4F]">
                        <span>{d.label}</span>
                        <span>
                          {d.count} bài ({percentage}%)
                        </span>
                      </div>
                      <div className="h-6 w-full bg-[#FBF6EC] border border-[#E7DEC9] p-0.5">
                        <div
                          className="h-full border border-black/20 transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: d.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submissions Table */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
            <div className="p-6 border-b-2 border-dashed border-[#E7DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Danh sách bài thi của học sinh
                </h3>
                <p className="text-xs text-[#6B7A94] mt-0.5">
                  Xếp hạng theo điểm số từ cao xuống thấp và thời gian nộp
                </p>
              </div>
              <span
                className="text-xs font-mono text-[#6B7A94]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Tổng số: {totalSubmissions} thí sinh
              </span>
            </div>

            {attempts.length === 0 ? (
              <div className="p-16 text-center text-[#6B7A94]">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-base font-bold font-serif text-[#1D2B4F]">Chưa có học sinh nào nộp bài</p>
                <p className="text-xs text-[#6B7A94] mt-1">
                  Khi học sinh hoàn thành và nộp bài thi, danh sách và điểm số chi tiết sẽ hiển thị ở đây.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <thead
                    className="bg-[#FBF6EC] border-b-2 border-[#1D2B4F] text-[#1D2B4F] font-mono text-[11px] uppercase tracking-wider"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">Học sinh</th>
                      <th className="py-3.5 px-4">Khối lớp</th>
                      <th className="py-3.5 px-4 text-center">Điểm số</th>
                      <th className="py-3.5 px-4 text-center">Thời gian</th>
                      <th className="py-3.5 px-4">Thời điểm nộp</th>
                      <th className="py-3.5 px-4 text-center">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DEC9]">
                    {attempts.map((attempt, index) => {
                      const minutes = Math.floor((attempt.timeSpent ?? 0) / 60)
                      const seconds = (attempt.timeSpent ?? 0) % 60
                      const isPassed = attempt.isPassed === true
                      const rank = index + 1

                      return (
                        <tr key={attempt.id} className="hover:bg-[#FBF6EC]/50 transition-colors">
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`w-6 h-6 inline-flex items-center justify-center font-mono font-bold text-xs ${
                                rank === 1
                                  ? 'bg-[#E3A73B] text-white border border-[#1D2B4F]'
                                  : rank === 2
                                  ? 'bg-[#6B7A94] text-white border border-[#1D2B4F]'
                                  : rank === 3
                                  ? 'bg-[#C1432E] text-white border border-[#1D2B4F]'
                                  : 'text-[#6B7A94]'
                              }`}
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {rank}
                            </span>
                          </td>

                          {/* Student Info */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#1D2B4F]">{attempt.user.name || 'Học sinh'}</div>
                            <div className="text-xs text-[#6B7A94] font-mono">{attempt.user.email}</div>
                          </td>

                          {/* Grade */}
                          <td className="py-4 px-4">
                            <span
                              className="px-2 py-0.5 text-xs font-mono font-bold bg-[#FBF6EC] border border-[#E7DEC9] text-[#1D2B4F]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {attempt.user.grade ? `Lớp ${attempt.user.grade}` : 'Chưa cập nhật'}
                            </span>
                          </td>

                          {/* Score */}
                          <td className="py-4 px-4 text-center">
                            <div
                              className="font-serif text-xl font-black text-[#1D2B4F]"
                              style={{ fontFamily: "'Fraunces', serif" }}
                            >
                              {attempt.score?.toFixed(1) ?? '--'}
                            </div>
                            <div className="text-[10px] font-mono text-[#6B7A94]">
                              {attempt.percentage ? `${attempt.percentage}%` : ''}
                            </div>
                          </td>

                          {/* Time Spent */}
                          <td className="py-4 px-4 text-center font-mono text-xs text-[#1D2B4F]">
                            {minutes}m {seconds}s
                          </td>

                          {/* Submitted At */}
                          <td className="py-4 px-4 text-xs text-[#6B7A94]">
                            {attempt.submittedAt
                              ? new Date(attempt.submittedAt).toLocaleString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                              : '--'}
                          </td>

                          {/* Status Stamp */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold border ${
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
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
