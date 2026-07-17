import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { 
  Users, BookOpen, PenTool, 
  BarChart2, ArrowUpRight
} from "lucide-react"

export default async function TeacherDashboard() {
  const session = await auth()
  
  if (!session || session.user.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Khu vực Giáo viên
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Chào mừng quay lại, {session.user.name ?? 'Giáo viên'}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users size={20} />}
          label="Tổng học sinh"
          value="124"
          sub="+12 tháng này"
        />
        <StatCard 
          icon={<BookOpen size={20} />}
          label="Bài học đã tạo"
          value="45"
          sub="3 bài đang soạn"
        />
        <StatCard 
          icon={<PenTool size={20} />}
          label="Câu hỏi"
          value="1,200"
          sub="Trong ngân hàng"
        />
        <StatCard 
          icon={<BarChart2 size={20} />}
          label="Điểm TB"
          value="7.8"
          sub="Tăng 0.4 so với tuần trước"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="minimal-card p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Bài học mới tạo</h2>
          <div className="space-y-6">
            <RecentLessonItem title="Unit 1: Life in the past" students={45} status="HOÀN THÀNH" />
            <RecentLessonItem title="Grammar: Passive Voice" students={12} status="ĐANG SOẠN" />
            <RecentLessonItem title="Vocabulary: Technology" students={30} status="HOÀN THÀNH" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-bold mb-6">Tạo nội dung mới?</h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Bắt đầu soạn thảo bài giảng hoặc bộ câu hỏi trắc nghiệm mới cho học sinh của bạn.
            </p>
          </div>
          <button className="w-full py-5 bg-white text-slate-900 rounded-3xl text-lg font-bold hover:bg-accent hover:text-white transition-all shadow-xl shadow-slate-950/20">
            Bắt đầu Soạn thảo
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-[#F1F5F9] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
        <p className="text-xs text-slate-400 font-medium">{sub}</p>
      </div>
    </div>
  )
}

function RecentLessonItem({ title, students, status }: { title: string, students: number, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
      <div className="space-y-1">
        <p className="font-bold text-slate-800 group-hover:text-accent transition-colors">{title}</p>
        <p className="text-xs text-slate-400">{students} học sinh đã tham gia</p>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${status === 'HOÀN THÀNH' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
          {status}
        </span>
        <ArrowUpRight size={18} className="text-slate-300 group-hover:text-accent transition-colors" />
      </div>
    </div>
  )
}
