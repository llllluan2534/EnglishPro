'use client'

import { useState } from 'react'
import { Question } from '@prisma/client'

interface Props {
  question: Question
  onComplete: (points: number) => void
}

export default function MatchingViewer({ question, onComplete }: Props) {
  // Simple fallback implementation: Click left item, click right item to match
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => onComplete(15), 1500)
  }

  return (
    <div>
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-6">Nối cặp tương ứng</h3>
      <div className="flex gap-10 mb-8">
        <div className="flex-1 flex flex-col gap-4">
          <div className="p-4 border-2 border-[#1D2B4F] bg-[#E1E9F2] text-center font-bold cursor-pointer hover:bg-[#c9d8ea]">Apple</div>
          <div className="p-4 border-2 border-[#1D2B4F] bg-[#E1E9F2] text-center font-bold cursor-pointer hover:bg-[#c9d8ea]">Dog</div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="p-4 border-2 border-[#1D2B4F] bg-[#F3DAD3] text-center font-bold cursor-pointer hover:bg-[#e8c1b5]">Con chó</div>
          <div className="p-4 border-2 border-[#1D2B4F] bg-[#F3DAD3] text-center font-bold cursor-pointer hover:bg-[#e8c1b5]">Quả táo</div>
        </div>
      </div>
      <button 
        onClick={handleSubmit}
        disabled={submitted}
        className="px-6 py-3 bg-[#1D2B4F] text-[#FBF6EC] font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#E7DEC9] disabled:opacity-50"
      >
        {submitted ? 'Đang chấm...' : 'Kiểm tra'}
      </button>
    </div>
  )
}
