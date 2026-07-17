import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'

export default async function StudentsPage() {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý học sinh</h1>
        <p className="text-slate-500 text-sm mt-1">Xem tiến độ và kết quả học tập của từng học sinh.</p>
      </div>
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 text-center flex flex-col items-center gap-4">
        <Users className="text-slate-300" size={48} />
        <div>
          <p className="text-slate-600 font-bold text-lg">Đang phát triển (Giai đoạn 5)</p>
          <p className="text-slate-400 text-sm mt-1">Dashboard phân tích học sinh sẽ sớm ra mắt.</p>
        </div>
      </div>
    </div>
  )
}
