import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardData(userId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    userXP,
    streak,
    dueCount,
    topics,
    completedProgress,
    xpGrowthResult,
    userBadges,
    allBadges
  ] = await Promise.all([
    prisma.userXP.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.flashcardReview.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    }),
    prisma.topic.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ grade: 'asc' }, { order: 'asc' }],
      take: 4,
      include: {
        _count: { select: { lessons: true } },
        lessons: { select: { id: true } }
      },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, isCompleted: true },
      select: { lessonId: true }
    }),
    prisma.xPHistory.aggregate({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo }
      },
      _sum: { amount: true }
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 3
    }),
    prisma.badge.findMany({
      take: 3,
      orderBy: { xpReward: 'asc' }
    })
  ])

  // Count users with higher weeklyXP
  const higherRankCount = await prisma.userXP.count({
    where: {
      weeklyXP: { gt: userXP?.weeklyXP ?? 0 }
    }
  })

  // Map completed lessons for quick progress calculation
  const completedSet = new Set(completedProgress.map(p => p.lessonId))

  const topicsWithProgress = topics.map(t => {
    const total = t.lessons.length
    const completed = t.lessons.filter(l => completedSet.has(l.id)).length
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      grade: t.grade,
      lessonCount: total,
      progressPercent
    }
  })

  // Format badges to display
  let displayBadges: Array<{ name: string; description: string; isEarned: boolean; iconText: string }> = []
  if (userBadges.length > 0) {
    displayBadges = userBadges.map(ub => ({
      name: ub.badge.name,
      description: ub.badge.description,
      isEarned: true,
      iconText: ub.badge.name.substring(0, 2).toUpperCase()
    }))
  } else {
    // If not earned yet, show targets
    displayBadges = allBadges.map((b, i) => ({
      name: b.name,
      description: b.description,
      isEarned: false,
      iconText: `0${i + 1}`
    }))
  }

  const weeklyRank = higherRankCount + 1
  const weeklyXPGrowth = xpGrowthResult._sum.amount ?? (userXP?.weeklyXP ?? 0)

  return {
    userXP,
    streak,
    dueCount,
    topics: topicsWithProgress,
    weeklyRank,
    weeklyXPGrowth,
    displayBadges
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const {
    userXP,
    streak,
    dueCount,
    topics,
    weeklyRank,
    weeklyXPGrowth,
    displayBadges
  } = await getDashboardData(session.user.id)

  const totalXP = userXP?.totalXP ?? 0
  const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 50)))
  const firstName = session.user.name?.split(' ').pop() ?? 'bạn'

  // Get current date string
  const today = new Date()
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dayName = days[today.getDay()]
  
  // Calculate week number
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
          position:absolute;
          left:56px;
          top:0;
          bottom:0;
          width:2px;
          background:var(--red);
          opacity:.55;
        }
        .studio-dashboard .margin-rule::before {
          content:'';
          position:absolute;
          left:-5px;
          top:0;
          width:12px;
          height:12px;
          border-radius:50%;
          background:var(--red);
        }

        .studio-dashboard .eyebrow {
          font-family:'JetBrains Mono',monospace;
          font-size:12px;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:var(--red);
          font-weight:700;
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:10px;
        }
        .studio-dashboard .eyebrow::after {
          content:'';
          flex:1;
          height:1px;
          background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px);
          opacity:.5;
        }

        .studio-dashboard .hero {
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          gap:40px;
          padding-bottom:36px;
          margin-bottom:36px;
          border-bottom:2px dashed #D8CDAE;
          flex-wrap:wrap;
        }

        .studio-dashboard .hero h1 {
          font-family:'Fraunces',serif;
          font-weight:600;
          font-size:44px;
          line-height:1.08;
          margin:0 0 14px;
          letter-spacing:-.01em;
        }
        .studio-dashboard .hero h1 em {
          font-style:italic;
          color:var(--red);
          font-weight:400;
        }
        .studio-dashboard .hero p {
          font-size:15px;
          color:var(--ink-soft);
          max-width:560px;
          line-height:1.6;
          margin:0;
        }

        .studio-dashboard .stamp {
          border:2.5px solid var(--ink);
          padding:16px 22px;
          background:var(--card);
          transform:rotate(-2deg);
          box-shadow:4px 4px 0 #E7DEC9;
          text-align:center;
          min-width:140px;
        }
        .studio-dashboard .stamp .lvl-label {
          font-family:'JetBrains Mono',monospace;
          font-size:10px;
          letter-spacing:.15em;
          color:var(--ink-soft);
          text-transform:uppercase;
        }
        .studio-dashboard .stamp .lvl-num {
          font-family:'Fraunces',serif;
          font-size:48px;
          font-weight:700;
          line-height:1;
          color:var(--ink);
          margin:4px 0;
        }
        .studio-dashboard .stamp .lvl-sub {
          font-family:'JetBrains Mono',monospace;
          font-size:10px;
          color:var(--red);
          font-weight:700;
          letter-spacing:.1em;
        }

        .studio-dashboard .stats {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:18px;
          margin-bottom:44px;
        }
        .studio-dashboard .stat {
          background:var(--card);
          border:1px solid #E4D9BE;
          padding:22px;
          position:relative;
          transition:transform .15s ease;
        }
        .studio-dashboard .stat:hover {
          transform:translateY(-2px);
        }
        .studio-dashboard .stat .label {
          font-family:'JetBrains Mono',monospace;
          font-size:11px;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:var(--ink-soft);
          margin-bottom:12px;
        }
        .studio-dashboard .stat .val {
          font-family:'Fraunces',serif;
          font-size:38px;
          font-weight:600;
          line-height:1;
          margin-bottom:6px;
        }
        .studio-dashboard .stat .val span {
          font-size:18px;
          font-family:'Inter',sans-serif;
          font-weight:400;
          color:var(--ink-soft);
          margin-left:4px;
        }
        .studio-dashboard .stat .sub {
          font-size:12px;
          color:var(--ink-soft);
        }
        .studio-dashboard .stat.accent {
          border-color:var(--red);
          background:linear-gradient(180deg,#FFFDF7 0%,#FBF4ED 100%);
        }
        .studio-dashboard .stat.accent .val {
          color:var(--red);
        }

        .studio-dashboard .cols {
          display:grid;
          grid-template-columns:1.7fr 1fr;
          gap:36px;
        }

        .studio-dashboard .section-head {
          display:flex;
          align-items:baseline;
          justify-content:space-between;
          margin-bottom:20px;
        }
        .studio-dashboard .section-head h2 {
          font-family:'Fraunces',serif;
          font-size:22px;
          margin:0;
          font-weight:600;
        }
        .studio-dashboard .section-head a {
          font-family:'JetBrains Mono',monospace;
          font-size:12px;
          color:var(--ink);
          text-decoration:none;
          font-weight:700;
          border-bottom:1px solid var(--ink);
          padding-bottom:2px;
        }

        .studio-dashboard .topics {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:18px;
        }
        .studio-dashboard .topic-card {
          background:var(--card);
          border:1px solid #E4D9BE;
          padding:24px;
          text-decoration:none;
          color:inherit;
          display:flex;
          flex-direction:column;
          position:relative;
          transition:border-color .15s ease;
        }
        .studio-dashboard .topic-card:hover {
          border-color:var(--ink);
        }
        .studio-dashboard .topic-card .grade {
          font-family:'JetBrains Mono',monospace;
          font-size:10px;
          letter-spacing:.12em;
          color:var(--red);
          font-weight:700;
          margin-bottom:8px;
        }
        .studio-dashboard .topic-card h3 {
          font-family:'Fraunces',serif;
          font-size:19px;
          margin:0 0 8px;
          font-weight:600;
          line-height:1.25;
        }
        .studio-dashboard .topic-card p {
          font-size:13px;
          color:var(--ink-soft);
          margin:0 0 20px;
          line-height:1.55;
          flex:1;
        }
        .studio-dashboard .topic-card .foot {
          display:flex;
          justify-content:space-between;
          font-family:'JetBrains Mono',monospace;
          font-size:11px;
          color:var(--ink-soft);
          border-top:1px dashed #E7DEC9;
          padding-top:12px;
        }

        .studio-dashboard .ai-block {
          background:var(--ink);
          color:#F3EFE2;
          padding:28px;
          margin-bottom:24px;
          position:relative;
        }
        .studio-dashboard .ai-block .tag {
          font-family:'JetBrains Mono',monospace;
          font-size:10px;
          letter-spacing:.15em;
          color:var(--gold);
          margin-bottom:12px;
          display:block;
        }
        .studio-dashboard .ai-block h3 {
          font-family:'Fraunces',serif;
          font-size:22px;
          margin:0 0 10px;
          color:#FFFDF7;
        }
        .studio-dashboard .ai-block p {
          font-size:13px;
          color:#B9BFCF;
          line-height:1.6;
          margin:0 0 18px;
        }

        .studio-dashboard .achievements {
          background:var(--card);
          border:1px solid #E4D9BE;
          padding:24px;
        }
        .studio-dashboard .achievements h3 {
          font-family:'Fraunces',serif;
          font-size:18px;
          margin:0 0 18px;
        }
        .studio-dashboard .ach-item {
          display:flex;
          gap:14px;
          align-items:center;
          padding:10px 0;
          border-bottom:1px dashed #E7DEC9;
        }
        .studio-dashboard .ach-item:last-child {
          border-bottom:none;
        }
        .studio-dashboard .ach-badge {
          width:36px;
          height:36px;
          border:1.5px solid var(--ink);
          display:flex;
          align-items:center;
          justify-content:center;
          font-family:'JetBrains Mono',monospace;
          font-size:11px;
          font-weight:700;
          background:#FAF6EE;
          flex-shrink:0;
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
              <div className="lvl-sub">{totalXP} XP</div>
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
              <div className="val">#{weeklyRank}</div>
              <div className="sub">{weeklyRank <= 3 ? 'Top dẫn đầu bảng' : 'Bảng xếp hạng chung'}</div>
            </div>
            <div className="stat">
              <div className="label">Tăng trưởng XP</div>
              <div className="val">+{weeklyXPGrowth}</div>
              <div className="sub">7 ngày gần nhất</div>
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
                      <span>{topic.lessonCount} bài học</span>
                      <span className={topic.progressPercent > 0 ? 'text-[#4C7A6B] font-bold' : ''}>
                        {topic.progressPercent}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="ai-block">
                <span className="tag">◆ LUYỆN TẬP THÔNG MINH</span>
                <h3>Luyện tập 4 kỹ năng</h3>
                <p>Hệ thống hỗ trợ luyện Nghe, Nói, Đọc, Viết có AI chấm phát âm và ngữ pháp tức thì.</p>
                <Link
                  href="/practice"
                  className="inline-block px-5 py-2.5 bg-[#E3A73B] text-[#1D2B4F] font-mono text-xs font-bold hover:bg-[#f0b543] transition-colors"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Bắt đầu ngay &rarr;
                </Link>
              </div>

              <div className="achievements">
                <h3>Thành tích & Huy hiệu</h3>
                <div className="space-y-1">
                  {displayBadges.map((badge, idx) => (
                    <div key={idx} className="ach-item">
                      <div
                        className={`ach-badge ${
                          badge.isEarned
                            ? 'bg-[#DCE9E3] text-[#4C7A6B] border-[#4C7A6B]'
                            : 'bg-[#FBF6EC] text-[#6B7A94] border-[#E7DEC9]'
                        }`}
                      >
                        {badge.iconText}
                      </div>
                      <div>
                        <div className="t flex items-center gap-2">
                          <span>{badge.name}</span>
                          {badge.isEarned && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#DCE9E3] text-[#4C7A6B] rounded">
                              Đã đạt
                            </span>
                          )}
                        </div>
                        <div className="s">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
