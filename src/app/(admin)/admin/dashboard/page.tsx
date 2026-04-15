import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Quản trị Hệ thống
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Tất cả hoạt động trong tầm kiểm soát.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="minimal-card p-10 bg-slate-900 text-white">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Người dùng</h3>
          <p className="text-4xl font-bold">2,456</p>
          <div className="mt-6 flex items-center gap-2 text-green-400 text-xs font-bold">
            <span>+12%</span>
            <span className="text-slate-500">so với tháng trước</span>
          </div>
        </div>
        <div className="minimal-card p-10">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Bài học công khai</h3>
          <p className="text-4xl font-bold">452</p>
          <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs font-bold">
            <span>98%</span>
            <span className="text-slate-500">tỷ lệ hoàn thành</span>
          </div>
        </div>
        <div className="minimal-card p-10">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Tỷ lệ uptime</h3>
          <p className="text-4xl font-bold">99.9%</p>
          <div className="mt-6 flex items-center gap-2 text-green-400 text-xs font-bold">
            <span>Ổn định</span>
          </div>
        </div>
      </div>
    </div>
  )
}
