import { Trophy, Medal, Star, Flame } from 'lucide-react'

export default function LeaderboardPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-outfit">Bảng xếp hạng</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Cùng xem ai là người chăm chỉ nhất tuần này nhé!
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <Flame size={20} className="text-orange-500" />
              <div className="text-sm font-bold text-gray-900">Tính theo tuần</div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-50/50 p-10 text-center">
        <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Trophy className="text-yellow-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-outfit mb-4">Dữ liệu xếp hạng đang được cập nhật</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-10">
           Tính năng bảng xếp hạng đang trong quá trình đồng bộ dữ liệu. Hãy quay lại sau vài giờ nhé!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <Medal size={32} className="text-gray-300 mb-4 mx-auto" />
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto"></div>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 scale-110 shadow-lg shadow-gray-200/50">
            <Trophy size={32} className="text-gray-300 mb-4 mx-auto" />
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto"></div>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <Medal size={32} className="text-gray-300 mb-4 mx-auto" />
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
