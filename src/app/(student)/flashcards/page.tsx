import FlashCardDeck from '@/components/learn/FlashCardDeck'

export default function FlashcardsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7; --blue-soft:#E1E9F2;
        }
        
        .studio-flashcards {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-flashcards * { box-sizing:border-box; }
        
        .studio-flashcards .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-flashcards .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-flashcards .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-flashcards .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-flashcards .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-flashcards .page-head { padding-bottom:32px; margin-bottom:40px; border-bottom:2px dashed #D8CDAE; }
        .studio-flashcards .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-flashcards .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-flashcards .page-head p { font-size:15px; color:var(--ink-soft); max-width:560px; line-height:1.6; margin:0; }

        /* CARD STACK */
        .studio-flashcards .deck-wrap { display:flex; flex-direction:column; align-items:center; margin-bottom:56px; }
        .studio-flashcards .deck-meta { font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--ink-soft); margin-bottom:20px; letter-spacing:.05em; }
        .studio-flashcards .deck-meta b { color:var(--ink); }
        .studio-flashcards .card-stack { position:relative; width:420px; height:260px; margin-bottom:28px; }
        .studio-flashcards .stack-layer { position:absolute; inset:0; border:1px solid #E4D9BE; background:var(--card); }
        .studio-flashcards .stack-layer.l2 { transform:translate(10px,10px) rotate(1.5deg); opacity:.5; }
        .studio-flashcards .stack-layer.l1 { transform:translate(5px,5px) rotate(-1deg); opacity:.75; }
        .studio-flashcards .flash-card {
          position:relative; width:100%; height:100%; background:var(--card); border:2px solid var(--ink);
          display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px;
        }
        .studio-flashcards .flash-card .corner { position:absolute; top:14px; left:18px; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--ink-soft); }
        .studio-flashcards .flash-card .corner.r { left:auto; right:18px; }
        .studio-flashcards .flash-card .word { font-family:'Fraunces',serif; font-size:36px; font-weight:600; margin-bottom:10px;}
        .studio-flashcards .flash-card .phon { font-family:'JetBrains Mono',monospace; font-size:14px; color:var(--ink-soft);}

        .studio-flashcards .rate-row { display:flex; gap:12px; }
        .studio-flashcards .rate-btn { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; padding:12px 22px; border:2px solid var(--ink); background:transparent; color:var(--ink); cursor:pointer; letter-spacing:.03em;}
        .studio-flashcards .rate-btn:hover { background:var(--ink); color:var(--paper); border-color:var(--ink); }
        .studio-flashcards .rate-btn.hard { border-color:var(--red); color:var(--red); }
        .studio-flashcards .rate-btn.hard:hover { background:var(--red); color:var(--paper); }
        .studio-flashcards .rate-btn.good { border-color:var(--gold); color:#8A5E12; }
        .studio-flashcards .rate-btn.good:hover { background:var(--gold); color:var(--paper); border-color:var(--gold); }
        .studio-flashcards .rate-btn.easy { border-color:var(--green); color:var(--green); }
        .studio-flashcards .rate-btn.easy:hover { background:var(--green); color:var(--paper); border-color:var(--green); }

        .studio-flashcards .tips { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .studio-flashcards .tip { background:var(--card); border:1px solid #E4D9BE; border-left:4px solid var(--ink); padding:24px; position:relative;}
        .studio-flashcards .tip .num { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--red); font-weight:700; letter-spacing:.1em; margin-bottom:10px; display:block;}
        .studio-flashcards .tip h3 { font-family:'Fraunces',serif; font-size:17px; margin:0 0 8px;}
        .studio-flashcards .tip p { font-size:13px; color:var(--ink-soft); line-height:1.6; margin:0;}

        @media (max-width:860px){
          .studio-flashcards .page {padding-left:56px;} .studio-flashcards .margin-rule {left:24px;}
          .studio-flashcards .card-stack, .studio-flashcards .flash-card {width:100%; max-width:420px;}
          .studio-flashcards .tips {grid-template-columns:1fr;}
        }
        `
      }} />

      <div className="studio-flashcards">
        <div className="page">
          <div className="margin-rule"></div>
          <div className="page-head">
            <div className="eyebrow">Bộ nhớ dài hạn</div>
            <h1>Ôn tập <em>Flashcard</em></h1>
            <p>Hệ thống sử dụng thuật toán Spaced Repetition để đưa từ vựng vào trí nhớ dài hạn.</p>
          </div>

          <FlashCardDeck />

          <div className="tips">
            <div className="tip">
              <span className="num">MẸO 01</span>
              <h3>Mẹo nhỏ</h3>
              <p>Đừng cố học quá nhiều một lúc. Ôn mỗi ngày 10–15 phút để đạt hiệu quả cao nhất.</p>
            </div>
            <div className="tip">
              <span className="num">MẸO 02</span>
              <h3>Chất lượng</h3>
              <p>Hãy trung thực khi đánh giá mức độ ghi nhớ để hệ thống sắp lịch ôn chuẩn xác nhất.</p>
            </div>
            <div className="tip">
              <span className="num">MẸO 03</span>
              <h3>Hứng khởi</h3>
              <p>Hoàn thành mục tiêu hàng ngày để giữ chuỗi Streak và nhận thêm XP thưởng.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
