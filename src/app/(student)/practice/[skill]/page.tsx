import PracticeSession from '@/components/practice/PracticeSession'

import { prisma } from '@/lib/prisma'
import { Skill } from '@prisma/client'
import Link from 'next/link'

interface Props {
  params: Promise<{ skill: string }>
  searchParams: Promise<{ topicId?: string }>
}

export default async function PracticeSkillPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const skill = resolvedParams.skill.toUpperCase()
  const topicId = resolvedSearchParams.topicId

  const skillNames: Record<string, string> = {
    LISTENING: 'Nghe',
    READING: 'Đọc',
    WRITING: 'Viết',
    SPEAKING: 'Nói'
  }

  const skillName = skillNames[skill] || skill

  // Fetch topics if no topicId is selected
  let topics: any[] = []
  if (!topicId) {
    topics = await prisma.topic.findMany({
      where: {
        status: 'PUBLISHED',
        questions: {
          some: {
            skill: skill as Skill,
            status: 'PUBLISHED'
          }
        }
      },
      include: {
        _count: {
          select: {
            questions: {
              where: {
                skill: skill as Skill,
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })
  }

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
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em; text-transform:uppercase;
          color:var(--red); font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .studio-practice .eyebrow::after {
          content:''; flex:1; height:1px; background:repeating-linear-gradient(90deg,var(--ink-soft) 0 6px, transparent 6px 12px); opacity:.5;
        }
        
        .studio-practice .hero {
          display:flex; justify-content:space-between; align-items:flex-end; gap:40px; padding-bottom:36px; margin-bottom:36px; border-bottom:2px dashed #D8CDAE; flex-wrap:wrap;
        }
        .studio-practice .hero h1 { font-family:'Fraunces',serif; font-weight:600; font-size:44px; line-height:1.08; margin:0 0 14px; letter-spacing:-.01em; }
        
        .studio-practice .topic-card {
          background: var(--card);
          border: 1px solid #E4D9BE;
          padding: 32px;
          position: relative;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }
        .studio-practice .topic-card:hover {
          background: #fdfaf0;
          border-color: #D3CAB6;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }
        .studio-practice .topic-card::before {
          content: "";
          position: absolute;
          top: -1px;
          right: -1px;
          border-width: 0 36px 36px 0;
          border-style: solid;
          border-color: var(--paper) var(--paper) transparent transparent;
          z-index: 1;
        }
        .studio-practice .topic-card::after {
          content: "";
          position: absolute;
          top: -1px;
          right: -1px;
          border-width: 0 0 36px 36px;
          border-style: solid;
          border-color: transparent transparent transparent #EBE3CD;
          z-index: 2;
          box-shadow: -2px 2px 4px rgba(0,0,0,0.03);
        }

        @media (max-width:860px){
          .studio-practice .page {padding-left:56px;} .studio-practice .margin-rule {left:24px;}
        }
        `
      }} />
      <div className="studio-practice">
        <div className="page">
          <div className="margin-rule"></div>
          
          <div className="hero">
            <div>
              <div className="eyebrow">Phiên luyện tập</div>
              <h1>Kỹ năng {skillName}</h1>
            </div>
          </div>
          
          {!topicId ? (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-[#1D2B4F] mb-6 font-fraunces">Chọn chủ đề luyện tập</h2>
              {topics.length === 0 ? (
                <div className="bg-[#FFFDF7] p-8 border-2 border-[#1D2B4F] shadow-[4px_4px_0_#E7DEC9] text-center">
                  <h3 className="font-serif font-bold text-xl text-[#1D2B4F] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                    Ngân hàng câu hỏi tổng hợp
                  </h3>
                  <p className="text-[#6B7A94] text-sm mb-6 max-w-md mx-auto">
                    Kỹ năng này chưa chia theo từng Unit bài học. Bạn có thể bắt đầu làm ngay các câu hỏi tổng hợp được chọn ngẫu nhiên.
                  </p>
                  <Link
                    href={`/practice/${skill.toLowerCase()}?topicId=all`}
                    className="inline-block px-6 py-3 bg-[#1D2B4F] text-[#FFFDF7] font-mono text-xs font-bold hover:bg-[#2A3C6D] transition-all shadow-[2px_2px_0_#C1432E]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Bắt đầu luyện tập tổng hợp &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {topics.map(topic => (
                    <Link 
                      href={`/practice/${skill.toLowerCase()}?topicId=${topic.id}`} 
                      key={topic.id}
                      className="topic-card"
                    >
                      <div className="inline-block bg-[#E5EAF1] text-[#2D4B66] font-mono text-xs font-bold px-2 py-1 mb-4 rounded-sm uppercase tracking-wider self-start">
                        LỚP 10
                      </div>
                      <h3 className="text-[26px] font-fraunces font-bold text-[#1D2B4F] mb-3 leading-snug">
                        {topic.title}
                      </h3>
                      <p className="text-[15px] text-[#6B7A94] mb-8 line-clamp-2">
                        {topic.description || 'Chủ đề luyện tập tổng hợp giúp bạn củng cố kiến thức và nâng cao kỹ năng.'}
                      </p>
                      
                      <div className="mt-auto border-t border-dashed border-[#D3CAB6] pt-5 flex justify-between items-center">
                        <span className="font-mono text-[13px] text-[#6B7A94] tracking-wide">
                          {topic._count.questions} bài tập
                        </span>
                        <span className="text-[#C1432E] font-bold font-mono text-[13px] flex items-center gap-2 hover:gap-3 transition-all">
                          Vào học &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <Link href={`/practice/${skill.toLowerCase()}`} className="text-[#C1432E] font-bold font-mono hover:underline inline-flex items-center gap-1">
                  &larr; Đổi chủ đề
                </Link>
              </div>
              <PracticeSession skill={skill} topicId={topicId} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
