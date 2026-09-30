import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreateQuestionForm from '@/components/teacher/CreateQuestionForm'

export default async function TeacherCreateQuestionPage() {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-create-question {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-create-question * { box-sizing:border-box; }
        
        .studio-create-question .page {
          max-width:1100px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-create-question .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-create-question .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-create-question .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-create-question .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-create-question .page-head { padding-bottom:28px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-create-question .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:34px; margin:0 0 8px; }
        .studio-create-question .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-create-question .page-head p { font-size:14px; color:var(--ink-soft); line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-create-question .page {padding-left:56px;} .studio-create-question .margin-rule {left:24px;}
        }
        `
        }}
      />

      <div className="studio-create-question">
        <div className="page">
          <div className="margin-rule" />

          {/* Navigation */}
          <div className="mb-6">
            <Link
              href="/teacher/questions"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF7] text-[#1D2B4F] text-xs font-bold font-mono border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#E7DEC9] transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <ArrowLeft size={14} />
              QUAY LẠI NGÂN HÀNG CÂU HỎI
            </Link>
          </div>

          {/* Header */}
          <div className="page-head">
            <div className="eyebrow">Biên soạn Câu hỏi & Học liệu</div>
            <h1>
              Soạn thảo <em>Câu hỏi mới</em>
            </h1>
            <p>
              Thêm câu hỏi trắc nghiệm hoặc đọc hiểu chuẩn hóa vào kho ngân hàng câu hỏi để sử dụng trong các đề thi và bài giảng.
            </p>
          </div>

          {/* Form Component */}
          <CreateQuestionForm />
        </div>
      </div>
    </>
  )
}
