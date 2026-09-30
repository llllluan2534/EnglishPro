'use client'

import { Target, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ProgressPage() {
   const [data, setData] = useState<any>(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
     fetch('/api/progress')
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

   const week = data?.week || [
      { day: 'T2', xp: 0 },
      { day: 'T3', xp: 0 },
      { day: 'T4', xp: 0 },
      { day: 'T5', xp: 0 },
      { day: 'T6', xp: 0 },
      { day: 'T7', xp: 0 },
      { day: 'CN', xp: 0 },
   ]
   const maxXp = data?.maxXp || 100
   const today = data?.today || 'T2'
   const bestSkill = data?.bestSkill || 'Chưa có dữ liệu'
   const bestScore = data?.bestScore || 0

   const todayXP = week.find((d: any) => d.day === today)?.xp || 0
   const goalXP = 100
   const remainingXP = Math.max(0, goalXP - todayXP)
   const goalPercent = Math.min(100, (todayXP / goalXP) * 100)

   return (
      <div className="max-w-7xl mx-auto pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
         <div className="pb-8 mb-10 border-b-2 border-dashed border-[#D8CDAE]">
            <div
               className="flex items-center gap-2.5 text-[12px] uppercase tracking-[0.12em] text-[#C1432E] font-bold mb-2.5"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
               Nhật ký học tập
            </div>
            <h1
               className="text-[38px] font-semibold text-[#1D2B4F] mb-3"
               style={{ fontFamily: "'Fraunces', serif" }}
            >
               Tiến độ <em className="italic text-[#C1432E]">học tập</em>
            </h1>
            <p className="text-[15px] text-[#6B7A94] max-w-xl leading-relaxed">
               Theo dõi sự tiến bộ của bạn qua từng ngày. Phân tích chi tiết nỗ lực học tập của bạn.
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
            {/* Ledger chart */}
            <div className="bg-[#FFFDF7] border border-[#E4D9BE] p-8">
               <div className="flex flex-wrap justify-between items-start gap-3.5 mb-9">
                  <div>
                     <h2 className="text-[22px] font-semibold text-[#1D2B4F] mb-1.5" style={{ fontFamily: "'Fraunces', serif" }}>
                        Biểu đồ XP tuần
                     </h2>
                     <p className="text-[13px] text-[#6B7A94]">Xu hướng học tập 7 ngày qua</p>
                  </div>
                  <div
                     className="text-[11px] font-bold border-[1.5px] border-[#1D2B4F] px-3 py-1.5 tracking-wide"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                     T2 → CN
                  </div>
               </div>

               <div className="flex items-end justify-between gap-2.5 h-56 border-b-2 border-[#1D2B4F] relative">
                  <div
                     className="absolute left-0 right-0 top-0 h-px"
                     style={{ backgroundImage: 'repeating-linear-gradient(90deg, #E7DEC9 0 4px, transparent 4px 8px)' }}
                  />
                  {week.map(({ day, xp }: any) => (
                     <div key={day} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end relative group">
                        <span
                           className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-[#C1432E]"
                           style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                           {xp} XP
                        </span>
                        <div
                           className={`w-full transition-colors duration-200 ${day === today ? 'bg-[#1D2B4F]' : 'bg-[#E7DEC9] group-hover:bg-[#C1432E]'
                              }`}
                           style={{ height: `${Math.max((xp / maxXp) * 100, 2)}%` }}
                        />
                        <span
                           className={`text-[11px] font-bold uppercase mt-3 ${day === today ? 'text-[#C1432E]' : 'text-[#6B7A94]'}`}
                           style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                           {day}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            <div>
               {/* Goal card */}
               <div className="bg-[#FFFDF7] border border-[#E4D9BE] border-l-4 border-l-[#4C7A6B] p-6 mb-5">
                  <div className="flex items-center gap-3.5 mb-4.5">
                     <div className="w-11 h-11 border-2 border-[#4C7A6B] text-[#4C7A6B] flex items-center justify-center -rotate-3 shrink-0 text-lg">
                        <Target size={20} />
                     </div>
                     <div>
                        <h3 className="text-[17px] font-semibold text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                           Mục tiêu ngày ({goalXP} XP)
                        </h3>
                        <div className="text-[12px] text-[#6B7A94]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                           {remainingXP > 0 ? `Còn ${remainingXP} XP nữa` : 'Đã đạt mục tiêu!'}
                        </div>
                     </div>
                  </div>
                  <div className="h-2.5 bg-[#FBF6EC] border border-[#E7DEC9] relative mb-2.5">
                     <div className="absolute inset-0 bg-[#4C7A6B]" style={{ width: `${goalPercent}%` }} />
                  </div>
                  <p className="text-[12px] text-[#6B7A94] text-right italic" style={{ fontFamily: "'Fraunces', serif" }}>
                     {remainingXP > 0 ? '"Sắp xong rồi, cố lên nhé!"' : '"Tuyệt vời! Bạn đã hoàn thành xuất sắc!"'}
                  </p>
               </div>

               {/* Best skill */}
               <div className="bg-[#1D2B4F] text-[#F3EFE2] p-7 border-l-4 border-l-[#E3A73B]">
                  <div className="w-[52px] h-[52px] rounded-full border-[2.5px] border-[#E3A73B] text-[#E3A73B] flex items-center justify-center -rotate-6 mb-4 text-[11px] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                     TOP
                  </div>
                  <h3 className="text-[19px] font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                     Kỹ năng tốt nhất
                  </h3>
                  <p className="text-[12px] text-[#B9BFCF] mb-5">{bestSkill}</p>
                  <div className="h-1.5 bg-white/15 relative mb-2">
                     <div className="absolute inset-0 bg-[#E3A73B]" style={{ width: `${bestScore}%` }} />
                  </div>
                  <div className="text-[11px] text-[#E3A73B] text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                     {bestScore}%
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}