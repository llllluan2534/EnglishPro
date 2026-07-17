import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardData(userId: string) {
  const [userXP, streak, dueCount, topics] = await Promise.all([
    prisma.userXP.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.flashcardReview.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    }),
    prisma.topic.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ grade: 'asc' }, { order: 'asc' }],
      take: 4,
      include: { _count: { select: { lessons: true } } },
    }),
  ])
  return { userXP, streak, dueCount, topics }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const { userXP, streak, dueCount, topics } = await getDashboardData(session.user.id)

  const totalXP = userXP?.totalXP ?? 0
  const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 50)))
  const nextLevelXP = Math.pow(level + 1, 2) * 50
  const currentLevelXP = Math.pow(level, 2) * 50
  const progressPercent = Math.min(100, Math.max(0, ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100))

  const firstName = session.user.name?.split(' ').pop() ?? 'bạn'

  // Get current date string
  const today = new Date()
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dayName = days[today.getDay()]
  
  // Calculate week number (simple approximation)
  const startDate = new Date(today.getFullYear(), 0, 1)
  const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((today.getDay() + 1 + daysPassed) / 7)

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        
        :root{
          --paper:#FBF6EC;
          --paper-line:#E7DEC9;
          --ink:#1D2B4F;
          --ink-soft:#6B7A94;
          --red:#C1432E;
          --red-soft:#F3DAD3;
          --gold:#E3A73B;
          --gold-soft:#FBEACB;
          --green:#4C7A6B;
          --green-soft:#DCE9E3;
          --card:#FFFDF7;
        }

        .studio-dashboard {
          background:var(--paper);
          background-image: linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size: 100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        
        .studio-dashboard * {
          box-sizing:border-box;
        }

        .studio-dashboard .page {
          max-width:1180px;
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
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase;
          color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-dashboard .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }

        /* HERO */
        .studio-dashboard .hero {
          display:flex; justify-content:space-between; align-items:flex-end; gap:40px; padding-bottom:36px; margin-bottom:36px; border-bottom:2px dashed #D8CDAE; flex-wrap:wrap;
        }
        .studio-dashboard .hero h1 {
          font-family:'Fraunces',serif; font-weight:600; font-size:44px; line-height:1.08; margin:0 0 14px; letter-spacing:-.01em;
        }
        .studio-dashboard .hero h1 em { font-style:italic; color:var(--red); }
        .studio-dashboard .hero p { font-size:16px; color:var(--ink-soft); max-width:480px; line-height:1.6; margin:0;}

        .studio-dashboard .stamp {
          width:150px; height:150px; border-radius:50%; border:3px solid var(--red); color:var(--red);
          display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
          transform:rotate(-9deg); flex-shrink:0; position:relative; background:rgba(193,67,46,0.03);
        }
        .studio-dashboard .stamp::before {
          content:''; position:absolute; inset:8px; border:1px solid var(--red); border-radius:50%; opacity:.5;
        }
        .studio-dashboard .stamp .lvl-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.15em; font-weight:700;}
        .studio-dashboard .stamp .lvl-num { font-family:'Fraunces',serif; font-size:40px; font-weight:700; line-height:1;}
        .studio-dashboard .stamp .lvl-sub { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.1em; margin-top:2px;}

        /* STAT ROW */
        .studio-dashboard .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin-bottom:48px; border-top:2px solid var(--ink); border-bottom:2px solid var(--ink);}
        .studio-dashboard .stat { padding:22px 20px; border-right:1px dashed #D8CDAE; }
        .studio-dashboard .stat:last-child { border-right:none; }
        .studio-dashboard .stat .label { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:var(--ink-soft); font-weight:600; margin-bottom:8px;}
        .studio-dashboard .stat .val { font-family:'JetBrains Mono',monospace; font-size:30px; font-weight:700; color:var(--ink); }
        .studio-dashboard .stat .val span { font-size:14px; color:var(--ink-soft); font-weight:500; margin-left:2px;}
        .studio-dashboard .stat .sub { font-size:12px; color:var(--ink-soft); margin-top:6px;}
        .studio-dashboard .stat.accent .val { color:var(--red); }

        /* LAYOUT COLUMNS */
        .studio-dashboard .cols { display:grid; grid-template-columns:2fr 1fr; gap:44px; }

        .studio-dashboard .section-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px;}
        .studio-dashboard .section-head h2 { font-family:'Fraunces',serif; font-size:24px; font-weight:600; margin:0;}
        .studio-dashboard .section-head a { font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--red); text-decoration:none; font-weight:700;}

        .studio-dashboard .topics { display:grid; grid-template-columns:1fr 1fr; gap:18px;}
        .studio-dashboard .topic-card {
          background:var(--card); border:1px solid #E4D9BE; padding:22px; position:relative; overflow:hidden;
          clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%);
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .studio-dashboard .topic-card:hover {
          background: #fdfaf0;
        }
        .studio-dashboard .topic-card::after {
          content:''; position:absolute; top:0; right:0; width:22px; height:22px; background:var(--paper);
          clip-path: polygon(0 0, 0 100%, 100% 100%); border-bottom:1px solid #E4D9BE; border-left:1px solid #E4D9BE;
        }
        .studio-dashboard .topic-card .grade { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:var(--green); background:var(--green-soft); padding:3px 8px; display:inline-block; margin-bottom:12px;}
        .studio-dashboard .topic-card h3 { font-family:'Fraunces',serif; font-size:18px; font-weight:600; margin:0 0 8px; line-height:1.3; color:var(--ink);}
        .studio-dashboard .topic-card p { font-size:13px; color:var(--ink-soft); line-height:1.55; margin:0 0 16px;}
        .studio-dashboard .topic-card .foot { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--ink-soft); border-top:1px dashed #E4D9BE; padding-top:12px; font-family:'JetBrains Mono',monospace;}

        /* RIGHT COLUMN */
        .studio-dashboard .ai-block {
          background:var(--ink); color:#F3EFE2; padding:30px; position:relative; margin-bottom:22px;
          border-left:5px solid var(--gold);
        }
        .studio-dashboard .ai-block .tag { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--gold); letter-spacing:.1em; margin-bottom:14px; display:block;}
        .studio-dashboard .ai-block h3 { font-family:'Fraunces',serif; font-size:22px; margin:0 0 10px;}
        .studio-dashboard .ai-block p { font-size:13px; color:#B9BFCF; line-height:1.6; margin:0 0 20px;}
        .studio-dashboard .ai-block button {
          width:100%; padding:13px; background:var(--gold); color:var(--ink); border:none; font-weight:700; font-size:14px;
          cursor:pointer; font-family:'Inter',sans-serif;
        }

        .studio-dashboard .achievements { background:var(--card); border:1px solid #E4D9BE; padding:24px;}
        .studio-dashboard .achievements h3 { font-family:'Fraunces',serif; font-size:18px; margin:0 0 18px; display:flex; align-items:center; gap:8px;}
        .studio-dashboard .ach-item { display:flex; align-items:center; gap:14px; padding:10px 0; border-bottom:1px dashed #E4D9BE;}
        .studio-dashboard .ach-item:last-child { border-bottom:none; }
        .studio-dashboard .ach-badge {
          width:38px; height:38px; border-radius:50%; border:2px solid var(--red); color:var(--red);
          display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; font-weight:700; font-size:13px;
          flex-shrink:0; transform:rotate(-6deg);
        }
        .studio-dashboard .ach-item .t { font-size:13px; font-weight:600; }
        .studio-dashboard .ach-item .s { font-size:11px; color:var(--ink-soft); }

        @media (max-width:860px){
          .studio-dashboard .page {padding-left:56px;}
          .studio-dashboard .margin-rule {left:24px;}
          .studio-dashboard .cols {grid-template-columns:1fr;}
          .studio-dashboard .stats {grid-template-columns:1fr 1fr;}
          .studio-dashboard .topics {grid-template-columns:1fr;}
          .studio-dashboard .hero h1 {font-size:32px;}
        }
        `
      }} />
      <div className="studio-dashboard">
        <div className="page">
          <div className="margin-rule"></div>

          <div className="hero">
            <div>
              <div className="eyebrow">{dayName} &middot; Tuần {weekNumber}</div>
              <h1>Sẵn sàng tỏa sáng<br/>hôm nay chứ, <em>{firstName}</em>?</h1>
              <p>Mỗi ngày ôn thêm một chút, nền tảng của bạn đang vững hơn từng ngày. Giữ vững phong độ nhé.</p>
            </div>
            <div className="stamp">
              <div className="lvl-label">CẤP ĐỘ</div>
              <div className="lvl-num">{level}</div>
              <div className="lvl-sub">XUẤT SẮC</div>
            </div>
          </div>

          <div className="stats">
            <div className="stat accent">
              <div className="label">Chuỗi học</div>
              <div className="val">{streak?.currentStreak ?? 0}<span>ngày</span></div>
              <div className="sub">Giữ lửa mỗi ngày nhé</div>
            </div>
            <div className="stat">
              <div className="label">Cần ôn</div>
              <div className="val">{dueCount}<span>thẻ</span></div>
              <div className="sub">Đến lúc ôn bài rồi</div>
            </div>
            <div className="stat">
              <div className="label">Hạng tuần</div>
              <div className="val">#12</div>
              <div className="sub">Top 5% chăm nhất</div>
            </div>
            <div className="stat">
              <div className="label">Tăng trưởng XP</div>
              <div className="val">+120</div>
              <div className="sub">So với tuần trước</div>
            </div>
          </div>

          <div className="cols">
            <section>
              <div className="section-head">
                <h2>Lộ trình học tập</h2>
                <Link href="/learn">Xem toàn bộ &rarr;</Link>
              </div>
              <div className="topics">
                {topics.map(topic => (
                  <Link href={`/learn/${topic.id}`} key={topic.id} className="topic-card">
                    <span className="grade">LỚP {topic.grade}</span>
                    <h3>{topic.title}</h3>
                    <p>{topic.description || 'Không có mô tả'}</p>
                    <div className="foot">
                      <span>{topic._count.lessons} bài học</span>
                      <span>0%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="ai-block">
                <span className="tag">◆ LUYỆN TẬP AI</span>
                <h3>Đề luyện riêng cho bạn</h3>
                <p>Hệ thống phân tích điểm yếu và sinh bài tập độc quyền, sát với năng lực hiện tại của bạn.</p>
                <button>Bắt đầu ngay &rarr;</button>
              </div>

              <div className="achievements">
                <h3>Thành tích nổi bật</h3>
                <div className="ach-item">
                  <div className="ach-badge">7d</div>
                  <div><div className="t">Chuỗi 7 ngày</div><div className="s">Đang giữ nhịp độ rất tốt</div></div>
                </div>
                <div className="ach-item">
                  <div className="ach-badge">A+</div>
                  <div><div className="t">Xạ thủ Unit 1</div><div className="s">Hoàn thành với điểm A+</div></div>
                </div>
                <div className="ach-item">
                  <div className="ach-badge">01</div>
                  <div><div className="t">Người mới</div><div className="s">Hoàn thành đăng ký và setup</div></div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
