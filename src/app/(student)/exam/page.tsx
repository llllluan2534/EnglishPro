import { Zap, Timer, FileText, CheckCircle } from 'lucide-react'

export default function ExamPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-outfit">Hệ thống Thi thử</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Luyện tập với các đề thi bám sát cấu trúc của Bộ GD&ĐT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-200">
           <Zap className="text-yellow-400 mb-6" size={40} />
           <h2 className="text-2xl font-bold mb-4 font-outfit">Đề thi THPT Quốc gia 2024</h2>
           <p className="text-blue-100 mb-8 leading-relaxed">
             Bộ đề thi thử mới nhất được biên soạn bởi các chuyên gia, cấu trúc 50 câu trong 60 phút.
           </p>
           <div className="flex gap-6 mb-10">
              <div className="flex items-center gap-2">
                <Timer size={18} />
                <span className="text-sm font-medium">60 phút</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <span className="text-sm font-medium">50 câu hỏi</span>
              </div>
           </div>
           <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold shadow-lg hover:bg-blue-50 transition-all active:scale-95">
             Bắt đầu làm bài
           </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <CheckCircle className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-outfit">Lịch sử làm bài</h3>
            <p className="text-gray-400 text-sm mb-0">Bạn chưa làm bài kiểm tra nào.</p>
        </div>
      </div>
    </div>
  )
}
