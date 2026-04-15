import { Construction, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UnderConstruction({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-8 animate-pulse text-yellow-500">
        <Construction size={48} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 font-outfit">Tính năng đang phát triển</h1>
      <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
        Phần <span className="font-bold text-blue-600">"{title}"</span> đang được chúng tôi hoàn thiện. Những bài tập thú vị sẽ sớm xuất hiện tại đây!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/practice" 
          className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
        >
          <ArrowLeft size={18} />
          Quay lại
        </Link>
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Sparkles size={18} className="text-yellow-300" />
          Về Trang chủ
        </Link>
      </div>
    </div>
  )
}
