import Link from 'next/link'

export default function ExamPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-exam {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-exam * { box-sizing:border-box; }
        
        .studio-exam .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-exam .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-exam .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-exam .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-exam .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-exam .page-head { padding-bottom:32px; margin-bottom:40px; border-bottom:2px dashed #D8CDAE; }
        .studio-exam .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-exam .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-exam .page-head p { font-size:15px; color:var(--ink-soft); max-width:560px; line-height:1.6; margin:0; }

        .studio-exam .cols { display:grid; grid-template-columns:1.4fr 1fr; gap:24px; }

        .studio-exam .exam-sheet {
          background:var(--ink); color:#F3EFE2; padding:36px; position:relative; border-left:5px solid var(--gold);
        }
        .studio-exam .exam-sheet .tag { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--gold); letter-spacing:.12em; margin-bottom:16px; display:block;}
        .studio-exam .exam-sheet h2 { font-family:'Fraunces',serif; font-size:28px; margin:0 0 14px; line-height:1.2;}
        .studio-exam .exam-sheet p { font-size:14px; color:#B9BFCF; line-height:1.65; margin:0 0 26px; max-width:460px;}
        .studio-exam .meta-tickets { display:flex; gap:14px; margin-bottom:32px; flex-wrap:wrap;}
        .studio-exam .ticket { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; border:1px solid rgba(243,239,226,.3); padding:8px 14px; display:flex; align-items:center; gap:8px;}
        .studio-exam .exam-sheet button { width:100%; padding:15px; background:var(--gold); color:var(--ink); border:none; font-weight:700; font-size:14px; cursor:pointer; font-family:'Inter',sans-serif; letter-spacing:.01em; transition: background 0.2s;}
        .studio-exam .exam-sheet button:hover { background: #f0b543; }

        .studio-exam .history-card { background:var(--card); border:1px solid #E4D9BE; padding:36px; text-align:center; display:flex; flex-direction:column; }
        .studio-exam .stamp-empty { width:88px; height:88px; border-radius:50%; border:3px dashed var(--ink-soft); color:var(--ink-soft); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:.06em; transform:rotate(-6deg);}
        .studio-exam .history-card h3 { font-family:'Fraunces',serif; font-size:21px; margin:0 0 10px;}
        .studio-exam .history-card p { font-size:13px; color:var(--ink-soft); line-height:1.6; margin:0 0 24px;}
        .studio-exam .history-card a { margin-top:auto; font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--ink); border:2px solid var(--ink); padding:11px; text-decoration:none; transition: background 0.2s, color 0.2s;}
        .studio-exam .history-card a:hover { background:var(--ink); color:var(--paper); }

        @media (max-width:860px){
          .studio-exam .page {padding-left:56px;} .studio-exam .margin-rule {left:24px;} .studio-exam .cols {grid-template-columns:1fr;}
        }
        `
      }} />

      <div className="studio-exam">
        <div className="page">
          <div className="margin-rule"></div>
          <div className="page-head">
            <div className="eyebrow">Phòng thi thử</div>
            <h1>Hệ thống <em>thi thử</em></h1>
            <p>Đánh giá năng lực chuẩn xác với cấu trúc đề xịn nhất, bám sát định dạng thi thật.</p>
          </div>

          <div className="cols">
            <div className="exam-sheet">
              <span className="tag">◆ ĐỀ MỚI NHẤT</span>
              <h2>Đề thi THPT Quốc gia 2024</h2>
              <p>Bộ đề thi thử mới nhất được biên soạn bởi các chuyên gia. Cấu trúc chuẩn 50 câu trong 60 phút. Sẵn sàng chinh phục đỉnh cao chưa?</p>
              <div className="meta-tickets">
                <div className="ticket">⏱ 60 phút</div>
                <div className="ticket">☰ 50 câu hỏi</div>
              </div>
              <button>Bắt đầu làm bài &rarr;</button>
            </div>

            <div className="history-card">
              <div className="stamp-empty">CHƯA<br/>CÓ DẤU</div>
              <h3>Lịch sử làm bài</h3>
              <p>Bạn chưa hoàn thành bài kiểm tra nào. Hãy làm thử một bài để điểm số xuất hiện ở đây nhé!</p>
              <Link href="/practice">Tới phòng luyện tập</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
