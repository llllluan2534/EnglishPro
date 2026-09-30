'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(resData => {
        setData(resData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C1432E]" />
      </div>
    )
  }

  const leaderboard = data?.leaderboard || []
  const currentUserRank = data?.currentUserRank

  // Podium users (Top 3)
  const first = leaderboard.length > 0 ? leaderboard[0] : null
  const second = leaderboard.length > 1 ? leaderboard[1] : null
  const third = leaderboard.length > 2 ? leaderboard[2] : null
  const others = leaderboard.slice(3)

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-leaderboard {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-leaderboard * { box-sizing:border-box; }
        
        .studio-leaderboard .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-leaderboard .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-leaderboard .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-leaderboard .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-leaderboard .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-leaderboard .page-head { display:flex; justify-content:space-between; align-items:flex-end; gap:30px; padding-bottom:32px; margin-bottom:44px; border-bottom:2px dashed #D8CDAE; flex-wrap:wrap;}
        .studio-leaderboard .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-leaderboard .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-leaderboard .page-head p { font-size:15px; color:var(--ink-soft); max-width:500px; line-height:1.6; margin:0; }
        .studio-leaderboard .scope-ticket { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; border:2px solid var(--ink); padding:10px 18px; letter-spacing:.05em; white-space:nowrap;}

        /* PODIUM */
        .studio-leaderboard .podium { display:grid; grid-template-columns:1fr 1.15fr 1fr; gap:20px; align-items:end; margin-bottom:56px; }
        .studio-leaderboard .p-card { background:var(--card); border:1px solid #E4D9BE; padding:26px 20px; text-align:center; position:relative;}
        .studio-leaderboard .p-card .rank-stamp {
          width:56px; height:56px; border-radius:50%; border:3px solid var(--ink-soft); color:var(--ink-soft); margin:0 auto 14px;
          display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-weight:700; font-size:22px; transform:rotate(-6deg);
        }
        .studio-leaderboard .p-card.first { border:2px solid var(--red); padding-top:38px; }
        .studio-leaderboard .p-card.first .rank-stamp { width:72px; height:72px; border-color:var(--red); color:var(--red); font-size:28px;}
        .studio-leaderboard .p-card h3 { font-family:'Fraunces',serif; font-size:17px; margin:0 0 6px;}
        .studio-leaderboard .p-card .xp { font-family:'JetBrains Mono',monospace; font-size:14px; color:var(--red); font-weight:700;}

        /* TABLE */
        .studio-leaderboard .board { background:var(--card); border:1px solid #E4D9BE; }
        .studio-leaderboard .board-head { display:flex; justify-content:space-between; align-items:center; padding:22px 28px; border-bottom:2px dashed #D8CDAE;}
        .studio-leaderboard .board-head h2 { font-family:'Fraunces',serif; font-size:21px; margin:0;}
        .studio-leaderboard .you-badge { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--red); background:#F3DAD3; padding:6px 12px;}
        .studio-leaderboard .row { display:flex; align-items:center; gap:20px; padding:16px 28px; border-bottom:1px dashed #E4D9BE; }
        .studio-leaderboard .row:last-child { border-bottom:none; }
        .studio-leaderboard .row.you { background:#FDF3EC; }
        .studio-leaderboard .row .rank { font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--paper-line); font-size:18px; width:34px; }
        .studio-leaderboard .row .name { flex:1; font-weight:600; font-size:14px;}
        .studio-leaderboard .row .lvl { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--ink-soft);}
        .studio-leaderboard .row .xp { font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--ink); font-size:14px; text-align:right; width:90px;}

        @media (max-width:860px){
          .studio-leaderboard .page {padding-left:56px;} .studio-leaderboard .margin-rule {left:24px;}
          .studio-leaderboard .podium {grid-template-columns:1fr; } .studio-leaderboard .p-card.first {order:-1;}
        }
        `
      }} />

      <div className="studio-leaderboard">
        <div className="page">
          <div className="margin-rule"></div>
          <div className="page-head">
            <div>
              <div className="eyebrow">Sổ điểm danh dự</div>
              <h1>Bảng xếp <em>hạng</em></h1>
              <p>Cùng xem ai là người chăm chỉ nhất toàn hệ thống.</p>
            </div>
            <div className="scope-ticket">TOP 10 &middot; TOÀN TRƯỜNG</div>
          </div>

          <div className="podium">
            {second ? (
              <div className="p-card">
                <div className="rank-stamp">2</div>
                <h3>{second.name}</h3>
                <div className="xp">{second.totalXP.toLocaleString()} XP</div>
              </div>
            ) : <div />}
            {first ? (
              <div className="p-card first">
                <div className="rank-stamp">1</div>
                <h3>{first.name}</h3>
                <div className="xp">{first.totalXP.toLocaleString()} XP</div>
              </div>
            ) : <div />}
            {third ? (
              <div className="p-card">
                <div className="rank-stamp">3</div>
                <h3>{third.name}</h3>
                <div className="xp">{third.totalXP.toLocaleString()} XP</div>
              </div>
            ) : <div />}
          </div>

          <div className="board">
            <div className="board-head">
              <h2>Danh sách xếp hạng</h2>
              {currentUserRank && (
                <span className="you-badge">Bạn đang xếp #{currentUserRank.rank}</span>
              )}
            </div>
            {others.map((user: any) => (
              <div key={user.userId} className={`row ${currentUserRank?.userId === user.userId ? 'you' : ''}`}>
                <span className="rank">{String(user.rank).padStart(2, '0')}</span>
                <span className="name">{user.name} {currentUserRank?.userId === user.userId && '(Bạn)'}</span>
                <span className="lvl">LV {user.level}</span>
                <span className="xp">{user.totalXP.toLocaleString()} XP</span>
              </div>
            ))}
            
            {currentUserRank && currentUserRank.rank > 10 && (
              <div className="row you border-t-2 border-[#1D2B4F]">
                <span className="rank">{String(currentUserRank.rank).padStart(2, '0')}</span>
                <span className="name">{currentUserRank.name} (Bạn)</span>
                <span className="lvl">LV {currentUserRank.level}</span>
                <span className="xp">{currentUserRank.totalXP.toLocaleString()} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
