import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Award, Zap, Flame, Search, 
  ArrowRight, BookOpen, Calendar, Mail, FileText 
} from 'lucide-react'

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; q?: string }>
}) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams
  const selectedGrade = resolvedSearchParams?.grade || 'ALL'
  const query = resolvedSearchParams?.q || ''

  // Build filter query
  const whereClause: any = {
    role: 'STUDENT',
  }

  if (selectedGrade !== 'ALL') {
    whereClause.grade = parseInt(selectedGrade)
  }

  if (query.trim()) {
    whereClause.OR = [
      { name: { contains: query.trim(), mode: 'insensitive' } },
      { email: { contains: query.trim(), mode: 'insensitive' } },
    ]
  }

  // Fetch students
  const students = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      userXP: true,
      streak: true,
      examAttempts: {
        where: { submittedAt: { not: null } },
        select: {
          id: true,
          score: true,
          isPassed: true,
          submittedAt: true,
        }
      },
      _count: {
        select: {
          lessonProgress: { where: { isCompleted: true } }
        }
      }
    }
  })

  // All students count for stats
  const allStudents = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      grade: true,
      userXP: { select: { totalXP: true } },
      examAttempts: {
        where: { submittedAt: { not: null } },
        select: { score: true }
      }
    }
  })

  const totalStudents = allStudents.length
  const grade12Count = allStudents.filter(s => s.grade === 12).length
  const grade11Count = allStudents.filter(s => s.grade === 11).length
  const grade10Count = allStudents.filter(s => s.grade === 10).length

  const allScores = allStudents.flatMap(s => s.examAttempts.map(a => a.score ?? 0))
  const avgOverallScore = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : '--'

  const totalXPAll = allStudents.reduce((acc, s) => acc + (s.userXP?.totalXP ?? 0), 0)

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-students {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-students * { box-sizing:border-box; }
        
        .studio-students .page {
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-students .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-students .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-students .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-students .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-students .page-head { padding-bottom:32px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-students .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-students .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-students .page-head p { font-size:15px; color:var(--ink-soft); max-width:680px; line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-students .page {padding-left:56px;} .studio-students .margin-rule {left:24px;}
        }
        `
        }}
      />

      <div className="studio-students">
        <div className="page">
          <div className="margin-rule" />

          {/* Header */}
          <div className="page-head flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Phân hệ Quản lý Lớp học</div>
              <h1>
                Sổ theo dõi <em>Học sinh</em>
              </h1>
              <p>
                Quản lý danh sách học sinh theo khối lớp, theo dõi chuỗi chuyên cần, điểm số khảo thí và hồ sơ học tập cá nhân.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span
                className="px-3.5 py-1.5 bg-[#FFFDF7] text-[#1D2B4F] font-mono text-xs font-bold border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                TỔNG SỐ: {totalStudents} HỌC SINH
              </span>
            </div>
          </div>

          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Tổng học sinh</span>
                <Users size={16} className="text-[#1D2B4F]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalStudents}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Đã kích hoạt tài khoản</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Khối 12 trọng tâm</span>
                <Award size={16} className="text-[#C1432E]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#C1432E]" style={{ fontFamily: "'Fraunces', serif" }}>
                {grade12Count}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Lớp 11: {grade11Count} • Lớp 10: {grade10Count}</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Điểm thi TB</span>
                <FileText size={16} className="text-[#4C7A6B]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#4C7A6B]" style={{ fontFamily: "'Fraunces', serif" }}>
                {avgOverallScore}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Toàn bộ bài khảo thí</div>
            </div>

            <div className="p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F]">
              <div className="flex items-center justify-between text-[#6B7A94] mb-2 font-mono text-xs uppercase tracking-wider">
                <span>Tổng tích lũy XP</span>
                <Zap size={16} className="text-[#E3A73B]" />
              </div>
              <div className="text-3xl font-serif font-black text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {totalXPAll.toLocaleString()}
              </div>
              <div className="text-[11px] font-mono text-[#6B7A94] mt-1">Điểm kinh nghiệm toàn khóa</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-4 shadow-[4px_4px_0_#1D2B4F] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Grade Tabs */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-[#6B7A94] uppercase tracking-wider mr-2 text-[11px]">Khối lớp:</span>
              {[
                { label: 'Tất cả', val: 'ALL' },
                { label: 'Khối 12', val: '12' },
                { label: 'Khối 11', val: '11' },
                { label: 'Khối 10', val: '10' },
              ].map((tab) => {
                const active = selectedGrade === tab.val
                return (
                  <Link
                    key={tab.val}
                    href={`/teacher/students?grade=${tab.val}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
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

            {/* Search Input Form */}
            <form method="GET" action="/teacher/students" className="flex items-center gap-2">
              <input type="hidden" name="grade" value={selectedGrade} />
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Tìm theo tên hoặc Gmail..."
                  className="px-3.5 py-1.5 pl-8 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs font-mono text-[#1D2B4F] focus:outline-none focus:bg-white shadow-[2px_2px_0_#1D2B4F] w-64"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B7A94]" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#C1432E] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#A83724]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                TÌM
              </button>
            </form>
          </div>

          {/* Students Table */}
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
            <div className="p-6 border-b-2 border-dashed border-[#E7DEC9] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Danh sách hồ sơ học sinh
                </h3>
                <p className="text-xs text-[#6B7A94] mt-0.5">
                  Nhấp vào hồ sơ để xem chi tiết kết quả làm bài thi và tiến độ học tập
                </p>
              </div>
              <span className="text-xs font-mono text-[#6B7A94]">
                Tìm thấy: {students.length} học sinh
              </span>
            </div>

            {students.length === 0 ? (
              <div className="p-16 text-center text-[#6B7A94]">
                <Users size={48} className="mx-auto mb-3 opacity-40 text-[#1D2B4F]" />
                <p className="text-lg font-bold font-serif text-[#1D2B4F]">Không tìm thấy học sinh nào</p>
                <p className="text-xs text-[#6B7A94] mt-1">
                  Hãy thử thay đổi bộ lọc khối lớp hoặc từ khóa tìm kiếm.
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
                      <th className="py-3.5 px-4">Khối lớp & Ngày sinh</th>
                      <th className="py-3.5 px-4 text-center">Tích lũy XP</th>
                      <th className="py-3.5 px-4 text-center">Streak</th>
                      <th className="py-3.5 px-4 text-center">Bài thi đã làm</th>
                      <th className="py-3.5 px-4 text-center">Bài học</th>
                      <th className="py-3.5 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DEC9]">
                    {students.map((student, index) => {
                      const studentScores = student.examAttempts.map(a => a.score ?? 0)
                      const avgStudentScore = studentScores.length > 0
                        ? (studentScores.reduce((a, b) => a + b, 0) / studentScores.length).toFixed(1)
                        : '--'
                      const passCount = student.examAttempts.filter(a => a.isPassed === true).length

                      const initials = student.name
                        ? student.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                        : 'HS'

                      return (
                        <tr key={student.id} className="hover:bg-[#FBF6EC]/50 transition-colors">
                          {/* Index */}
                          <td className="py-4 px-4 text-center font-mono text-xs text-[#6B7A94]">
                            {index + 1}
                          </td>

                          {/* Name & Email */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 bg-[#1D2B4F] text-white flex items-center justify-center font-mono font-bold text-xs border border-[#1D2B4F] shadow-[1px_1px_0_#C1432E] shrink-0"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-[#1D2B4F] text-sm">{student.name}</div>
                                <div className="text-xs text-[#6B7A94] font-mono flex items-center gap-1 mt-0.5">
                                  <Mail size={11} /> {student.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Grade & DOB */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="px-2 py-0.5 text-xs font-mono font-bold bg-[#FBF6EC] border border-[#1D2B4F] text-[#1D2B4F]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                {student.grade ? `Lớp ${student.grade}` : 'Chưa chọn lớp'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#6B7A94] font-mono flex items-center gap-1">
                              <Calendar size={11} />
                              {student.dateOfBirth
                                ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN')
                                : 'Chưa cập nhật ngày sinh'}
                            </div>
                          </td>

                          {/* XP */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold bg-[#FDF4E2] text-[#E3A73B] border border-[#E3A73B]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              <Zap size={12} /> {student.userXP?.totalXP ?? 0} XP
                            </span>
                            <div className="text-[10px] font-mono text-[#6B7A94] mt-0.5">
                              Cấp {student.userXP?.level ?? 1}
                            </div>
                          </td>

                          {/* Streak */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold text-[#C1432E] bg-[#F3DAD3] border border-[#C1432E]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              <Flame size={12} /> {student.streak?.currentStreak ?? 0} ngày
                            </span>
                          </td>

                          {/* Exam Stats */}
                          <td className="py-4 px-4 text-center">
                            <div
                              className="font-serif text-base font-bold text-[#1D2B4F]"
                              style={{ fontFamily: "'Fraunces', serif" }}
                            >
                              {avgStudentScore} <span className="text-xs font-mono text-[#6B7A94]">/ 10đ</span>
                            </div>
                            <div className="text-[10px] font-mono text-[#6B7A94]">
                              {student.examAttempts.length} bài ({passCount} đạt)
                            </div>
                          </td>

                          {/* Lessons Completed */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-mono text-xs font-bold text-[#4C7A6B]">
                              {student._count.lessonProgress} bài
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-center">
                            <Link
                              href={`/teacher/students/${student.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D2B4F] text-white text-xs font-mono font-bold border-2 border-[#1D2B4F] shadow-[2px_2px_0_#C1432E] hover:bg-[#2A3C6B] transition-all"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              <span>HỌC BẠ</span>
                              <ArrowRight size={12} />
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
        </div>
      </div>
    </>
  )
}
