import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getTopics(gradeFilter?: string) {
  const whereClause: any = { status: 'PUBLISHED' }
  if (gradeFilter) {
    whereClause.grade = parseInt(gradeFilter)
  }
  
  return await prisma.topic.findMany({
    where: whereClause,
    orderBy: [{ grade: 'asc' }, { order: 'asc' }],
    include: {
      _count: { select: { lessons: true } },
    },
  })
}

// Next.js 15+ searchParams are Promises
export default async function LearnPage({ searchParams }: { searchParams: Promise<{ grade?: string }> | { grade?: string } }) {
  // Resolve searchParams safely for both Next 14 and 15
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const grade = resolvedSearchParams?.grade

  const topics = await getTopics(grade)

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --red-soft:#F3DAD3; --gold:#E3A73B; --gold-soft:#FBEACB;
          --green:#4C7A6B; --green-soft:#DCE9E3; --card:#FFFDF7;
          --blue:#3D5A80; --blue-soft:#E1E9F2;
        }
        
        .studio-learn {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-learn * { box-sizing:border-box; }
        
        .studio-learn .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-learn .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-learn .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-learn .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-learn .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-learn .page-head {
          display:flex; justify-content:space-between; align-items:flex-end; gap:40px; padding-bottom:32px; margin-bottom:40px; border-bottom:2px dashed #D8CDAE; flex-wrap:wrap;
        }
        .studio-learn .page-head h1 {
          font-family:'Fraunces',serif; font-weight:600; font-size:38px; line-height:1.1; margin:0 0 12px;
        }
        .studio-learn .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-learn .page-head p {
          font-size:15px; color:var(--ink-soft); max-width:520px; line-height:1.6; margin:0;
        }

        .studio-learn .filter-row { display:flex; gap:10px; margin-bottom:32px; flex-wrap:wrap; }
        .studio-learn .filter-chip { 
          font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; padding:8px 16px; border:1px solid var(--ink); color:var(--ink); background:transparent; letter-spacing:.04em; cursor:pointer; text-decoration:none;
        }
        .studio-learn .filter-chip:hover { background:var(--ink-soft); color:var(--paper); border-color:var(--ink-soft); }
        .studio-learn .filter-chip.active { background:var(--ink); color:var(--paper); border-color:var(--ink); }

        .studio-learn .topics-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .studio-learn .topic-card {
          background:var(--card); border:1px solid #E4D9BE; padding:24px; position:relative;
          clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%);
          display:flex; flex-direction:column; text-decoration:none; color:inherit;
          transition: transform 0.2s, background 0.2s;
        }
        .studio-learn .topic-card:hover {
          background:#fdfaf0; transform: translateY(-2px);
        }
        .studio-learn .topic-card::after {
          content:''; position:absolute; top:0; right:0; width:24px; height:24px; background:var(--paper);
          clip-path: polygon(0 0, 0 100%, 100% 100%); border-bottom:1px solid #E4D9BE; border-left:1px solid #E4D9BE;
        }
        .studio-learn .topic-card .row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;}
        .studio-learn .topic-card .grade { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:var(--blue); background:var(--blue-soft); padding:3px 8px; }
        .studio-learn .topic-card h3 { font-family:'Fraunces',serif; font-size:19px; font-weight:600; margin:0 0 10px; line-height:1.3;}
        .studio-learn .topic-card p { font-size:13px; color:var(--ink-soft); line-height:1.55; margin:0 0 20px; flex:1;}
        .studio-learn .topic-card .foot { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--ink-soft); border-top:1px dashed #E4D9BE; padding-top:14px; font-family:'JetBrains Mono',monospace;}
        .studio-learn .topic-card .foot .go { color:var(--red); font-weight:700; }

        .studio-learn .empty { padding:80px 40px; text-align:center; border:2px dashed #D8CDAE; grid-column: 1 / -1; }
        .studio-learn .empty p { font-family:'Fraunces',serif; font-style:italic; color:var(--ink-soft); font-size:16px;}

        @media (max-width:900px){
          .studio-learn .page {padding-left:56px;}
          .studio-learn .margin-rule {left:24px;}
          .studio-learn .topics-grid {grid-template-columns:1fr 1fr;}
        }
        @media (max-width:600px){ .studio-learn .topics-grid {grid-template-columns:1fr;} }
        `
      }} />

      <div className="studio-learn">
        <div className="page">
          <div className="margin-rule"></div>

          <div className="page-head">
            <div>
              <div className="eyebrow">Sổ tay ôn tập</div>
              <h1>Lộ trình học <em>tập</em></h1>
              <p>Được thiết kế chuẩn khoa học. Chọn một chủ đề và bắt đầu hành trình nâng band điểm của bạn.</p>
            </div>
          </div>

          <div className="filter-row">
            <Link href="/learn" className={!grade ? "filter-chip active" : "filter-chip"}>
              Tất cả
            </Link>
            <Link href="/learn?grade=10" className={grade === '10' ? "filter-chip active" : "filter-chip"}>
              Lớp 10
            </Link>
            <Link href="/learn?grade=11" className={grade === '11' ? "filter-chip active" : "filter-chip"}>
              Lớp 11
            </Link>
            <Link href="/learn?grade=12" className={grade === '12' ? "filter-chip active" : "filter-chip"}>
              Lớp 12
            </Link>
          </div>

          <div className="topics-grid">
            {topics.length > 0 ? (
              topics.map(topic => (
                <Link key={topic.id} href={`/learn/${topic.id}`} className="topic-card">
                  <div className="row">
                    <span className="grade">LỚP {topic.grade}</span>
                  </div>
                  <h3>{topic.title}</h3>
                  <p>{topic.description || 'Không có mô tả'}</p>
                  <div className="foot">
                    <span>{topic._count.lessons} bài học</span>
                    <span className="go">Vào học &rarr;</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty">
                <p>Hiện chưa có chủ đề nào phù hợp.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
