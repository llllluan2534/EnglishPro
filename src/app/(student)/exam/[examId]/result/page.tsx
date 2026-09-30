'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import ExamResult, { ExamResultData } from '@/components/exam/ExamResult'

interface Props {
  params: Promise<{ examId: string }>
}

export default function ExamResultPage({ params }: Props) {
  const resolvedParams = use(params)
  const examId = resolvedParams.examId
  const searchParams = useSearchParams()
  const attemptId = searchParams.get('attemptId')

  const [result, setResult] = useState<ExamResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!attemptId) {
      setError('Không tìm thấy mã lần làm bài (attemptId).')
      setLoading(false)
      return
    }

    async function fetchResult() {
      try {
        const res = await fetch(`/api/exams/attempts/${attemptId}`)
        const data = await res.json()

        if (!res.ok || data.error) {
          setError(data.error || 'Không thể tải kết quả bài thi.')
          return
        }

        setResult(data.attempt)
      } catch (err) {
        console.error(err)
        setError('Lỗi kết nối khi tải kết quả.')
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [attemptId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#C1432E]" />
        <p className="font-mono text-sm text-[#6B7A94]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Đang nạp kết quả bài thi...
        </p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F] text-center">
        <AlertCircle size={44} className="text-[#C1432E] mx-auto mb-4" />
        <h2 className="text-xl font-bold font-serif text-[#1D2B4F] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
          Lỗi hiển thị kết quả
        </h2>
        <p className="text-sm text-[#6B7A94] mb-6">{error || 'Không tìm thấy dữ liệu kết quả.'}</p>
        <Link
          href="/exam"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1D2B4F] text-white font-mono font-bold text-xs"
        >
          <ArrowLeft size={16} /> Quay lại danh sách đề thi
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF6EC] py-12 px-4 md:px-8">
      <ExamResult data={result} />
    </div>
  )
}
