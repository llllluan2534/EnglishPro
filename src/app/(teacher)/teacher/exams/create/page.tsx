import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreateExamForm from '@/components/teacher/CreateExamForm'

export default async function TeacherCreateExamPage() {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  // Fetch available questions from database to pick
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      skill: true,
      type: true,
      difficulty: true,
      content: true,
      points: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const availableQuestions = questions.map(q => {
    let text = ''
    try {
      const c = typeof q.content === 'string' ? JSON.parse(q.content) : q.content
      text = c?.text || c?.question || c?.passageTitle || 'Câu hỏi trắc nghiệm'
    } catch {
      text = 'Nội dung câu hỏi'
    }

    return {
      id: q.id,
      skill: q.skill,
      type: q.type,
      difficulty: q.difficulty,
      text,
      points: q.points,
    }
  })

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-create-exam {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-create-exam * { box-sizing:border-box; }
        
        .studio-create-exam .page {
          max-width:1100px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-create-exam .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-create-exam .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-create-exam .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-create-exam .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-create-exam .page-head { padding-bottom:28px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-create-exam .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:34px; margin:0 0 8px; }
        .studio-create-exam .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-create-exam .page-head p { font-size:14px; color:var(--ink-soft); line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-create-exam .page {padding-left:48px; padding-right:20px;} .studio-create-exam .margin-rule {left:20px;}
        }
        @media (max-width:640px){
          .studio-create-exam .page {padding:20px 14px 60px 26px !important;}
          .studio-create-exam .margin-rule {left:10px !important; opacity:.35 !important;}
          .studio-create-exam .page-head h1 {font-size:24px !important; line-height:1.25 !important;}
          .studio-create-exam .page-head p {font-size:13px !important;}
        }
        `
        }}
      />

      <div className="studio-create-exam">
        <div className="page">
          <div className="margin-rule" />

          {/* Navigation */}
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

          {/* Header */}
          <div className="page-head">
            <div className="eyebrow">Biên soạn Đề thi Khảo thí</div>
            <h1>
              Soạn thảo <em>Đề thi mới</em>
            </h1>
            <p>
              Tạo đề thi trắc nghiệm và tự luận chuẩn hóa theo khung chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo.
            </p>
          </div>

          {/* Form Component */}
          <CreateExamForm availableQuestions={availableQuestions} />
        </div>
      </div>
    </>
  )
}
