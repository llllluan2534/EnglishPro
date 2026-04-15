import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Trophy, Medal, Star, Flame, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getLeaderboard() {
  const topUsers = await prisma.userXP.findMany({
    orderBy: { totalXP: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          name: true,
          image: true,
          role: true,
        },
      },
    },
  })

  return topUsers
}

export default async function LeaderboardPage() {
  const session = await auth()
  const topUsers = await getLeaderboard()
  
  const currentUserRank = session?.user?.id 
    ? topUsers.findIndex(u => u.userId === session.user.id) + 1 
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 font-outfit">Bảng xếp hạng</h1>
          <p className="text-gray-500 text-lg">
             Cùng xem ai là người chăm chỉ nhất toàn hệ thống nhé!
          </p>
        </div>
        
        <div className="bg-yellow-50 px-6 py-3 rounded-2xl border border-yellow-100 flex items-center gap-3">
          <Trophy size={24} className="text-yellow-500" />
          <div className="text-sm font-black text-yellow-700 uppercase tracking-widest">Global Top 10</div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12">
        {/* Rank 2 */}
        {topUsers[1] && (
          <div className="order-2 md:order-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 text-center space-y-4">
             <div className="relative inline-block">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                   {topUsers[1].user.image ? <img src={topUsers[1].user.image} alt={topUsers[1].user.name} /> : <div className="text-2xl font-bold text-slate-400">{topUsers[1].user.name[0]}</div>}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-white border-4 border-white font-bold">2</div>
             </div>
             <div>
                <h3 className="font-bold text-gray-900 truncate">{topUsers[1].user.name}</h3>
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{topUsers[1].totalXP} XP</p>
             </div>
          </div>
        )}

        {/* Rank 1 */}
        {topUsers[0] && (
          <div className="order-1 md:order-2 bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-blue-200 text-center space-y-6 scale-110 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="relative inline-block">
                <div className="w-24 h-24 rounded-[2rem] bg-yellow-400 flex items-center justify-center overflow-hidden border-4 border-yellow-300 shadow-2xl">
                   {topUsers[0].user.image ? <img src={topUsers[0].user.image} alt={topUsers[0].user.name} /> : <div className="text-3xl font-bold text-white uppercase">{topUsers[0].user.name[0]}</div>}
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                   <Crown size={32} fill="currentColor" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white border-4 border-slate-900 font-bold text-lg">1</div>
             </div>
             <div>
                <h3 className="text-xl font-bold text-white truncate">{topUsers[0].user.name}</h3>
                <p className="text-base font-black text-blue-400 uppercase tracking-widest">{topUsers[0].totalXP} XP</p>
             </div>
          </div>
        )}

        {/* Rank 3 */}
        {topUsers[2] && (
          <div className="order-3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 text-center space-y-4">
             <div className="relative inline-block">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                   {topUsers[2].user.image ? <img src={topUsers[2].user.image} alt={topUsers[2].user.name} /> : <div className="text-2xl font-bold text-orange-300">{topUsers[2].user.name[0]}</div>}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center text-white border-4 border-white font-bold">3</div>
             </div>
             <div>
                <h3 className="font-bold text-gray-900 truncate">{topUsers[2].user.name}</h3>
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{topUsers[2].totalXP} XP</p>
             </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
           <h2 className="font-bold text-gray-900">Danh sách xếp hạng</h2>
           {currentUserRank > 0 && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Xếp hạng của bạn: #{currentUserRank}</span>
           )}
        </div>
        <div className="divide-y divide-gray-50">
          {topUsers.slice(3).map((u, index) => (
            <div 
              key={u.userId}
              className={cn(
                "flex items-center gap-6 p-6 hover:bg-gray-50 transition-colors",
                u.userId === session?.user?.id && "bg-blue-50/50"
              )}
            >
              <div className="w-10 text-center font-black text-gray-300">#{index + 4}</div>
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden border border-white">
                {u.user.image ? <img src={u.user.image} alt={u.user.name} /> : u.user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{u.user.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{u.level} LVL</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-blue-600 uppercase tracking-tighter">{u.totalXP} XP</p>
              </div>
            </div>
          ))}
          
          {topUsers.length === 0 && (
             <div className="py-20 text-center text-gray-400 font-medium">Chưa có dữ liệu xếp hạng.</div>
          )}
        </div>
      </div>
    </div>
  )
}
