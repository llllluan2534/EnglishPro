import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Play, CheckCircle2 } from 'lucide-react'

async function getTopicWithLessons(topicId: string, userId: string) {
  const [topic, lessonProgress] = await Promise.all([
    prisma.topic.findUnique({
      where: { id: topicId, status: 'PUBLISHED' },
      include: {
        lessons: {
          where: { status: 'PUBLISHED' },
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, lesson: { topicId } },
    }),
  ])

  if (!topic) return null

  // Map progress to lessons
  const lessonsWithProgress = topic.lessons.map((lesson) => {
    const progress = lessonProgress.find((p) => p.lessonId === lesson.id)
    return {
      ...lesson,
      isCompleted: progress?.isCompleted ?? false,
    }
  })

  return { ...topic, lessons: lessonsWithProgress }
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }> | { topicId: string }
}) {
  const session = await auth()
  if (!session) return null

  const resolvedParams = await Promise.resolve(params)
  const topicId = resolvedParams.topicId
  const topic = await getTopicWithLessons(topicId, session.user.id)

  if (!topic) {
    notFound()
  }

  const completedCount = topic.lessons.filter((l) => l.isCompleted).length
  const progressPercent = topic.lessons.length > 0
    ? Math.round((completedCount / topic.lessons.length) * 100)
    : 0

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-topic {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-topic * { box-sizing:border-box; }
        
        .studio-topic .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-topic .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-topic .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-topic .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-topic .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-topic .page-head { display:flex; justify-content:space-between; align-items:flex-end; gap:30px; padding-bottom:32px; margin-bottom:44px; border-bottom:2px dashed #D8CDAE; flex-wrap:wrap;}
        .studio-topic .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-topic .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-topic .page-head p { font-size:15px; color:var(--ink-soft); max-width:500px; line-height:1.6; margin:0; }
        .studio-topic .progress-ticket { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; border:2px solid var(--ink); padding:10px 18px; letter-spacing:.05em; white-space:nowrap; background:var(--card);}

        /* TABLE */
        .studio-topic .board { background:var(--card); border:1px solid #E4D9BE; }
        .studio-topic .board-head { display:flex; justify-content:space-between; align-items:center; padding:22px 28px; border-bottom:2px dashed #D8CDAE;}
        .studio-topic .board-head h2 { font-family:'Fraunces',serif; font-size:21px; margin:0;}
        .studio-topic .back-badge { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--ink-soft); text-decoration:none; padding:6px 12px; border:1px solid var(--ink-soft); transition: all 0.2s;}
        .studio-topic .back-badge:hover { background:var(--ink-soft); color:var(--paper); }
        .studio-topic .row { display:flex; align-items:center; gap:20px; padding:16px 28px; border-bottom:1px dashed #E4D9BE; text-decoration:none; color:inherit; transition: background 0.2s;}
        .studio-topic .row:last-child { border-bottom:none; }
        .studio-topic .row:hover { background:#fdfaf0; }
        .studio-topic .row.completed { background:#FDF3EC; }
        .studio-topic .row .rank { font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--paper-line); font-size:18px; width:34px; }
        .studio-topic .row .name { flex:1; font-weight:600; font-size:15px;}
        .studio-topic .row .lvl { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--ink-soft); text-transform:uppercase;}
        .studio-topic .row .action { font-family:'JetBrains Mono',monospace; font-weight:700; font-size:14px; text-align:right; width:40px; display:flex; justify-content:flex-end;}

        @media (max-width:860px){
          .studio-topic .page {padding-left:56px;} .studio-topic .margin-rule {left:24px;}
        }
        `
      }} />

      <div className="studio-topic">
        <div className="page">
          <div className="margin-rule"></div>
          <div className="page-head">
            <div>
              <div className="eyebrow">Chủ đề bài học</div>
              <h1>{topic.title}</h1>
              <p>{topic.description}</p>
            </div>
            <div className="progress-ticket">HOÀN THÀNH &middot; {progressPercent}%</div>
          </div>

          <div className="board">
            <div className="board-head">
              <h2>Mục lục bài học</h2>
              <Link href="/learn" className="back-badge">&larr; Quay lại</Link>
            </div>
            {topic.lessons.length > 0 ? (
              topic.lessons.map((lesson, index) => (
                <Link key={lesson.id} href={`/learn/${topicId}/${lesson.id}`} className={`row ${lesson.isCompleted ? 'completed' : ''}`}>
                  <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="name" style={{ fontFamily: "'Fraunces', serif" }}>{lesson.title}</span>
                  <span className="lvl">{lesson.skill}</span>
                  <span className="action">
                    {lesson.isCompleted ? <CheckCircle2 size={20} className="text-[#C1432E]" /> : <Play size={20} className="text-[#1D2B4F]" />}
                  </span>
                </Link>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: "'Fraunces', serif" }}>
                Chưa có bài học nào trong chủ đề này.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
