'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EnrollButton({ topicId }: { topicId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      })

      if (res.ok) {
        toast.success('Đăng ký khóa học thành công!')
        router.refresh()
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại sau.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-[#FFFDF7] border-2 border-dashed border-[#E4D9BE] mt-8">
      <div className="w-20 h-20 bg-[#F3DAD3] rounded-full flex items-center justify-center mb-6">
        <BookOpen className="text-[#C1432E]" size={40} />
      </div>
      <h2 className="text-2xl font-bold font-serif text-[#1D2B4F] mb-2">Bạn chưa đăng ký chủ đề này</h2>
      <p className="text-[#6B7A94] mb-8 text-center max-w-md">Hãy bắt đầu hành trình học tập bằng cách đăng ký để mở khóa toàn bộ bài học bên trong nhé!</p>
      <button
        onClick={handleEnroll}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-[#C1432E] hover:bg-[#A53826] text-white px-8 py-4 font-bold font-mono text-sm tracking-widest uppercase transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          'Bắt đầu học ngay'
        )}
      </button>
    </div>
  )
}
