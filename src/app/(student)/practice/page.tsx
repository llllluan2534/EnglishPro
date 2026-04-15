import { Headphones, Eye, Edit3, MessageCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const skills = [
  { 
    id: 'listening', 
    name: 'Nghe (Listening)', 
    icon: Headphones, 
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    desc: 'Luyện nghe qua audio và các đoạn hội thoại thực tế.'
  },
  { 
    id: 'reading', 
    name: 'Đọc (Reading)', 
    icon: Eye, 
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    desc: 'Cải thiện kỹ năng đọc hiểu văn bản tiếng Anh.'
  },
  { 
    id: 'writing', 
    name: 'Viết (Writing)', 
    icon: Edit3, 
    color: 'bg-green-50 text-green-600 border-green-100',
    desc: 'Thực hành viết câu và đoạn văn ngắn.'
  },
  { 
    id: 'speaking', 
    name: 'Nói (Speaking)', 
    icon: MessageCircle, 
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    desc: 'Luyện phát âm chuẩn với công nghệ nhận diện giọng nói.'
  },
]

export default function PracticePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-outfit">Luyện tập Kỹ năng</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Chọn một kỹ năng bạn muốn tập trung cải thiện hôm nay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill) => (
          <Link
            key={skill.id}
            href={`/practice/${skill.id}`}
            className="group flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 hover:border-blue-100 transition-all duration-300"
          >
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 border-2 ${skill.color} group-hover:scale-110 transition-transform`}>
              <skill.icon size={36} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1 font-outfit">{skill.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{skill.desc}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
