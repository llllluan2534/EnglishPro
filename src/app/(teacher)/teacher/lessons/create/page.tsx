import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import LessonCreateForm from '@/components/teacher/LessonCreateForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  searchParams: Promise<{ topicId?: string }>
}

export default async function CreateLessonPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const { topicId } = await searchParams

  const topic = topicId
    ? await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true, title: true, grade: true } })
    : null

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-create-lesson {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-create-lesson * { box-sizing:border-box; }
        
        .studio-create-lesson .page {
          max-width:1100px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-create-lesson .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-create-lesson .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-create-lesson .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-create-lesson .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-create-lesson .page-head { padding-bottom:28px; margin-bottom:32px; border-bottom:2px dashed #D8CDAE; }
        .studio-create-lesson .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:34px; margin:0 0 8px; }
        .studio-create-lesson .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-create-lesson .page-head p { font-size:14px; color:var(--ink-soft); line-height:1.6; margin:0; }

        @media (max-width:860px){
          .studio-create-lesson .page {padding-left:56px;} .studio-create-lesson .margin-rule {left:24px;}
        }
        `
        }}
      />

      <div className="studio-create-lesson">
        <div className="page">
          <div className="margin-rule" />

          {/* Navigation Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/teacher/lessons"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF7] text-[#1D2B4F] text-xs font-bold font-mono border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#E7DEC9] transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <ArrowLeft size={14} />
              QUAY LẠI QUẢN LÝ BÀI HỌC
            </Link>
          </div>

          {/* Header */}
          <div className="page-head">
            <div className="eyebrow">Biên soạn Giáo trình</div>
            <h1>
              Soạn thảo <em>Bài học mới</em>
            </h1>
            <p>
              {topic ? (
                <>Đang soạn cho chủ đề: <strong className="text-[#1D2B4F]">{topic.title}</strong> (Khối lớp {topic.grade})</>
              ) : (
                'Thiết lập nội dung bài học, gán file âm thanh, hình ảnh và câu hỏi ôn tập tương tác.'
              )}
            </p>
          </div>

          {/* Form */}
          <LessonCreateForm topicId={topicId ?? ''} />
        </div>
      </div>
    </>
  )
}
