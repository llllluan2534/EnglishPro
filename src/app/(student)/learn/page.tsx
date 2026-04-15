import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, ChevronRight, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getTopics() {
  return await prisma.topic.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ grade: 'asc' }, { order: 'asc' }],
    include: {
      _count: { select: { lessons: true } },
    },
  })
}

export default async function LearnPage() {
  const topics = await getTopics()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-outfit">Lộ trình học tập</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Chọn một chủ đề để bắt đầu bài học của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/learn/${topic.id}`}
            className="group block bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
          >
            {/* Tag */}
            <div className="absolute top-6 right-8">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[0.65rem] font-black uppercase tracking-widest">
                Lớp {topic.grade}
              </span>
            </div>

            {/* Icon */}
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              <BookOpen size={28} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors font-outfit line-clamp-2">
              {topic.title}
            </h3>
            
            <p className="text-gray-500 text-sm line-clamp-2 mb-8 leading-relaxed">
              {topic.description}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                  <Star size={12} fill="currentColor" />
                  <span>{topic._count.lessons} bài</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                  <Clock size={12} />
                  <span>~2h học</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:translate-x-1 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </Link>
        ))}

        {topics.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Hiện chưa có chủ đề nào được công bố.</p>
          </div>
        )}
      </div>
    </div>
  )
}
