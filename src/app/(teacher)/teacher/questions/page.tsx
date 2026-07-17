import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { HelpCircle, Plus } from 'lucide-react'

export default async function QuestionsPage() {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ngân hàng câu hỏi</h1>
          <p className="text-slate-500 text-sm mt-1">Tạo và quản lý toàn bộ ngân hàng câu hỏi của lớp.</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 text-center flex flex-col items-center gap-4">
        <HelpCircle className="text-slate-300" size={48} />
        <div>
          <p className="text-slate-600 font-bold text-lg">Đang phát triển (Giai đoạn 3)</p>
          <p className="text-slate-400 text-sm mt-1">Tính năng ngân hàng câu hỏi sẽ sớm ra mắt.</p>
        </div>
      </div>
    </div>
  )
}
