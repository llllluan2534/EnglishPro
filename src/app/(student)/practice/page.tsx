import Link from 'next/link'

export default function PracticePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --paper:#FBF6EC; --paper-line:#E7DEC9; --ink:#1D2B4F; --ink-soft:#6B7A94;
          --red:#C1432E; --gold:#E3A73B; --green:#4C7A6B; --card:#FFFDF7;
        }
        
        .studio-practice {
          background:var(--paper);
          background-image:linear-gradient(var(--paper-line) 1px, transparent 1px);
          background-size:100% 34px;
          font-family:'Inter',sans-serif;
          color:var(--ink);
          padding:0 0 80px;
          min-height: 100vh;
        }
        .studio-practice * { box-sizing:border-box; }
        
        .studio-practice .page {
          max-width:1180px;
          margin:0 auto;
          padding:40px 32px 0 96px;
          position:relative;
        }
        .studio-practice .margin-rule {
          position:absolute; left:56px; top:0; bottom:0; width:2px; background:var(--red); opacity:.55;
        }
        .studio-practice .margin-rule::before {
          content:''; position:absolute; left:-5px; top:0; width:12px; height:12px; border-radius:50%; background:var(--red);
        }
        .studio-practice .eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-practice .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        .studio-practice .page-head { padding-bottom:32px; margin-bottom:40px; border-bottom:2px dashed #D8CDAE; }
        .studio-practice .page-head h1 { font-family:'Fraunces',serif; font-weight:600; font-size:38px; margin:0 0 12px; }
        .studio-practice .page-head h1 em { font-style:italic; color:var(--red); }
        .studio-practice .page-head p { font-size:15px; color:var(--ink-soft); max-width:560px; line-height:1.6; margin:0; }

        .studio-practice .skills { display:grid; grid-template-columns:1fr 1fr; gap:20px; counter-reset:skill; }
        .studio-practice .skill-card {
          background:var(--card); border:1px solid #E4D9BE; padding:28px; display:flex; gap:20px; align-items:flex-start;
          position:relative; counter-increment:skill; text-decoration:none; color:inherit;
          transition: background 0.2s;
        }
        .studio-practice .skill-card:hover {
          background:#fdfaf0;
        }
        .studio-practice .skill-card::before {
          content:"0" counter(skill); position:absolute; top:16px; right:20px; font-family:'JetBrains Mono',monospace;
          font-size:34px; font-weight:700; color:var(--paper-line);
        }
        .studio-practice .skill-icon {
          width:56px; height:56px; border:2px solid var(--ink); display:flex; align-items:center; justify-content:center; flex-shrink:0;
          font-family:'Fraunces',serif; font-size:22px; font-weight:700; transform:rotate(-4deg); background:var(--card);
          transition: transform 0.3s;
        }
        .studio-practice .skill-card:hover .skill-icon {
          transform:rotate(0deg) scale(1.1);
        }
        .studio-practice .skill-card.listening .skill-icon { border-color:#3D5A80; color:#3D5A80; }
        .studio-practice .skill-card.reading .skill-icon { border-color:var(--green); color:var(--green); }
        .studio-practice .skill-card.writing .skill-icon { border-color:var(--gold); color:#8A5E12; }
        .studio-practice .skill-card.speaking .skill-icon { border-color:var(--red); color:var(--red); }
        .studio-practice .skill-card h3 { font-family:'Fraunces',serif; font-size:20px; font-weight:600; margin:0 0 8px;}
        .studio-practice .skill-card p { font-size:13px; color:var(--ink-soft); line-height:1.55; margin:0 0 14px; max-width:340px;}
        .studio-practice .skill-card .link { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--ink); text-decoration:none; border-bottom:2px solid var(--ink); padding-bottom:2px;}
        .studio-practice .skill-card:hover .link { color:var(--red); border-color:var(--red); }

        @media (max-width:860px){
          .studio-practice .page {padding-left:56px;} .studio-practice .margin-rule {left:24px;} .studio-practice .skills {grid-template-columns:1fr;}
        }
        `
      }} />

      <div className="studio-practice">
        <div className="page">
          <div className="margin-rule"></div>
          <div className="page-head">
            <div className="eyebrow">Trạm luyện tập</div>
            <h1>Luyện tập <em>kỹ năng</em></h1>
            <p>Chọn một kỹ năng bạn muốn tập trung cải thiện hôm nay. Hệ thống AI sẽ hỗ trợ bạn tối đa.</p>
          </div>

          <div className="skills">
            <Link href="/practice/listening" className="skill-card listening">
              <div className="skill-icon">Ng</div>
              <div>
                <h3>Nghe &middot; Listening</h3>
                <p>Luyện nghe qua audio và các đoạn hội thoại thực tế, sát đề thi.</p>
                <span className="link">Bắt đầu luyện &rarr;</span>
              </div>
            </Link>
            
            <Link href="/practice/reading" className="skill-card reading">
              <div className="skill-icon">Đ</div>
              <div>
                <h3>Đọc &middot; Reading</h3>
                <p>Cải thiện kỹ năng đọc hiểu văn bản tiếng Anh học thuật.</p>
                <span className="link">Bắt đầu luyện &rarr;</span>
              </div>
            </Link>
            
            <Link href="/practice/writing" className="skill-card writing">
              <div className="skill-icon">V</div>
              <div>
                <h3>Viết &middot; Writing</h3>
                <p>Thực hành viết câu và đoạn văn ngắn, có chấm lỗi tự động.</p>
                <span className="link">Bắt đầu luyện &rarr;</span>
              </div>
            </Link>
            
            <Link href="/practice/speaking" className="skill-card speaking">
              <div className="skill-icon">N</div>
              <div>
                <h3>Nói &middot; Speaking</h3>
                <p>Luyện phát âm chuẩn với công nghệ nhận diện giọng nói.</p>
                <span className="link">Bắt đầu luyện &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
