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
    <div className="max-w-7xl mx-auto space-y-12 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Chào nhé, {session.user.name.split(' ').pop()}
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Hôm nay mình học bài gì nhỉ?
          </p>
        </div>
        
        {/* Level Stats - Ultra Minimal */}
        <div className="glass rounded-3xl p-6 flex items-center gap-6 min-w-[280px]">
          <div className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-accent/20">
            {level}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Cấp độ {level}</span>
              <span>{totalXP} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Flame size={20} />}
          label="Chuỗi ngày" 
          value={`${streak?.currentStreak ?? 0}`} 
          sub="Ngày liên tiếp"
          variant="orange"
        />
        <StatCard 
          icon={<BookOpen size={20} />}
          label="Cần ôn tập" 
          value={`${dueCount}`} 
          sub="Thẻ cần review"
          variant="blue"
          action={dueCount > 0 ? <Link href="/flashcards" className="text-accent hover:underline">Ôn ngay</Link> : null}
        />
        <StatCard 
          icon={<Trophy size={20} />}
          label="Hạng tuần" 
          value="#12" 
          sub="Top 5% toàn app"
          variant="yellow"
        />
        <StatCard 
          icon={<TrendingUp size={20} />}
          label="Tăng trưởng" 
          value="+120" 
          sub="XP kiếm được"
          variant="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Learning Paths */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Lộ trình học tập</h2>
            <Link href="/learn" className="text-sm font-bold text-accent px-4 py-2 hover:bg-accent/5 rounded-xl transition-colors">
              Xem tất cả
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map(topic => (
              <Link 
                key={topic.id}
                href={`/learn/${topic.id}`}
                className="minimal-card group relative p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                   <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                    Lớp {topic.grade}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-accent transition-colors leading-snug">
                  {topic.title}
                </h3>
                
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm text-slate-400">{topic._count.lessons} bài học</span>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-accent group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <Zap className="mb-6 text-accent" size={32} />
            <h3 className="text-2xl font-bold mb-3">Luyện tập AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
               Hệ thống tự động chọn các kiến thức bạn còn yếu để ôn luyện.
            </p>
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-sm font-bold hover:bg-accent hover:text-white transition-all active:scale-[0.98]">
              Bắt đầu luyện tập
            </button>
          </div>

          <div className="minimal-card p-10">
             <h3 className="text-lg font-bold text-slate-900 mb-8 border-b border-slate-50 pb-4">Thành tích</h3>
             <div className="space-y-8">
                <AchievementItem icon="🔥" label="Chuỗi 3 ngày" sub="Gần đây nhất" />
                <AchievementItem icon="🎯" label="Xạ thủ" sub="Đúng 100% bài Unit 1" />
                <AchievementItem icon="💎" label="Người mới" sub="Học bài đầu tiên" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, variant, action }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  variant: 'blue' | 'orange' | 'green' | 'yellow'
  action?: React.ReactNode
}) {
  const variants = {
    blue: "text-blue-500 bg-blue-50",
    orange: "text-orange-500 bg-orange-50",
    green: "text-green-500 bg-green-50",
    yellow: "text-yellow-500 bg-yellow-50",
  }

  return (
    <div className="minimal-card p-6 space-y-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", variants[variant])}>
        {icon}
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{label}</span>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <span className="text-xs text-slate-400 font-medium">{sub}</span>
        {action && <div className="text-xs font-bold">{action}</div>}
      </div>
    </div>
  )
}

function AchievementItem({ icon, label, sub }: { icon: string, label: string, sub: string }) {
  return (
    <div className="flex items-center gap-5 group cursor-pointer">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 group-hover:text-accent transition-colors">{label}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
