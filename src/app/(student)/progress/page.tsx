import { BarChart2, TrendingUp, Calendar, Target } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-outfit">Tiến độ học tập</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Theo dõi sự tiến bộ của bạn qua từng ngày.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-bold text-gray-900 font-outfit">Biểu đồ XP tuần</h3>
                 <div className="flex gap-2">
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">Thứ 2 - Chủ Nhật</div>
                 </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                 {[40, 70, 45, 90, 65, 30, 0].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div 
                        className="w-full bg-blue-100 rounded-t-xl group-hover:bg-blue-600 transition-all duration-500 relative cursor-pointer" 
                        style={{ height: `${h}%` }}
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[0.6rem] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {h} XP
                         </div>
                      </div>
                      <span className="text-xs font-bold text-gray-400">T{i+2 === 8 ? 'N' : i+2}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <Target className="text-green-500" size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 font-outfit">Mục tiêu ngày</h3>
                    <p className="text-xs text-gray-400">Còn 20 XP nữa</p>
                 </div>
              </div>
              <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5 mb-2">
                 <div className="h-full w-[60%] bg-green-500 rounded-full"></div>
              </div>
              <p className="text-[0.7rem] text-gray-400 font-medium text-right italic">"Keep going, you're almost there!"</p>
           </div>

           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
              <TrendingUp className="text-indigo-200 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2 font-outfit">Kỹ năng tốt nhất</h3>
              <p className="text-indigo-100 text-sm mb-6">Grammar & Vocabulary</p>
              <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full w-[85%] bg-white rounded-full"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
