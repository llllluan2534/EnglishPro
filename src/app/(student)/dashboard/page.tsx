import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Layers, Zap, Flame, BookOpen, ChevronRight, TrendingUp, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getDashboardData(userId: string) {
  const [userXP, streak, dueCount, topics] = await Promise.all([
    prisma.userXP.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.flashcardReview.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    }),
    prisma.topic.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ grade: 'asc' }, { order: 'asc' }],
      take: 6,
      include: { _count: { select: { lessons: true } } },
    }),
  ])
  return { userXP, streak, dueCount, topics }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const { userXP, streak, dueCount, topics } = await getDashboardData(session.user.id)

  const totalXP = userXP?.totalXP ?? 0
  const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 50)))
  const nextLevelXP = Math.pow(level + 1, 2) * 50
  const currentLevelXP = Math.pow(level, 2) * 50
  const progressPercent = Math.min(100, Math.max(0, ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100))

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-outfit">
            Chào buổi sáng, {session.user.name.split(' ').pop()}! 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Hôm nay là một ngày tuyệt vời để học từ mới.
          </p>
        </div>
        
        {/* Level Banner */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center gap-6 shadow-xl shadow-blue-50/50 min-w-[320px]">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
            <span className="text-2xl font-black">{level}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Cấp độ hiện tại</span>
              <span className="text-xs font-bold text-blue-600">{totalXP} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Flame size={24} className="text-orange-500" />}
          label="Chuỗi ngày học" 
          value={`${streak?.currentStreak ?? 0} ngày`} 
          sub={`Kỷ lục: ${streak?.longestStreak ?? 0} ngày`}
          color="bg-orange-50/50"
        />
        <StatCard 
          icon={<Layers size={24} className="text-blue-500" />}
          label="Cần ôn hôm nay" 
          value={`${dueCount} thẻ`} 
          sub={dueCount > 0 ? 'Ưu tiên hàng đầu' : 'Đã hoàn thành tốt'}
          color="bg-blue-50/50"
          action={dueCount > 0 ? <Link href="/flashcards" className="text-blue-600 font-bold hover:underline">Ôn ngay</Link> : null}
        />
        <StatCard 
          icon={<Trophy size={24} className="text-yellow-500" />}
          label="Xếp hạng tuần" 
          value="#12" 
          sub="Top 5% học sinh"
          color="bg-yellow-50/50"
        />
        <StatCard 
          icon={<TrendingUp size={24} className="text-green-500" />}
          label="Tiến độ tuần" 
          value="+120 XP" 
          sub="Học nhiều hơn 20%"
          color="bg-green-50/50"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Course Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 font-outfit">Lộ trình học tập</h2>
            <Link href="/learn" className="text-sm font-bold text-blue-600 flex items-center gap-1 group">
              Tất cả bài học <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map(topic => (
              <Link 
                key={topic.id}
                href={`/learn/${topic.id}`}
                className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex items-center gap-2 mb-4">
                   <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[0.65rem] font-black uppercase tracking-widest">
                    Lớp {topic.grade}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem] font-outfit">
                  {topic.title}
                </h3>
                
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{topic._count.lessons} bài học</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions / Recent */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 font-outfit">Phím tắt nhanh</h2>
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
            <Zap className="mb-4 text-yellow-300" size={32} />
            <h3 className="text-xl font-bold mb-2 font-outfit">Chế độ luyện tập AI</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
               Hệ thống sẽ chọn các câu hỏi bạn hay sai nhất để luyện tập lại.
            </p>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-[1.25rem] text-sm font-bold hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20">
              Bắt đầu ngay
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-6 font-outfit">Thành tích gần đây</h3>
             <div className="space-y-6">
                <AchievementItem icon="🔥" label="Chuỗi 3 ngày" sub="Học liên tiếp 3 ngày" />
                <AchievementItem icon="🎯" label="Xạ thủ" sub="Đạt 100% trong bài Unit 1" />
                <AchievementItem icon="💎" label="Người mới" sub="Hoàn thành bài học đầu tiên" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, action }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  color: string
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
          {icon}
        </div>
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
          <p className="text-2xl font-black text-gray-900 mt-1 font-outfit tracking-tight">{value}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400 font-medium">{sub}</span>
          {action && <div className="text-xs">{action}</div>}
        </div>
      </div>
    </div>
  )
}

function AchievementItem({ icon, label, sub }: { icon: string, label: string, sub: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{label}</p>
        <p className="text-[0.7rem] text-gray-400 font-medium">{sub}</p>
      </div>
    </div>
  )
}
