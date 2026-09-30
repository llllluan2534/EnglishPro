'use client'

import { useState } from 'react'
import { Question } from '@prisma/client'

interface Props {
  question: Question
  onComplete: (points: number) => void
}

export default function ReadingComprehensionViewer({ question, onComplete }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const handleSubmit = () => {
    if (selected === null) return
    setSubmitted(true)
    setTimeout(() => onComplete(20), 1500)
  }

  const options = ['Option A', 'Option B', 'Option C', 'Option D']

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Passage Pane */}
      <div className="flex-1 bg-white p-6 border-2 border-[#1D2B4F] shadow-inner h-[400px] overflow-y-auto font-serif leading-relaxed text-[#1D2B4F]">
        <h4 className="font-bold mb-4 font-mono text-[#C1432E]">ĐỌC ĐOẠN VĂN SAU:</h4>
        <p>
          The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet. 
          It is commonly used for touch-typing practice, testing typewriters and computer keyboards, displaying examples of fonts, 
          and other applications involving text where the use of all letters in the alphabet is desired.
        </p>
        <p className="mt-4">
          The earliest known appearance of the phrase was in The Boston Journal in 1885.
        </p>
      </div>

      {/* Questions Pane */}
      <div className="flex-1">
        <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-4">Câu hỏi:</h3>
        <p className="font-bold mb-6 text-[#1D2B4F]">When did the phrase first appear?</p>

        <div className="flex flex-col gap-3 mb-8">
          {options.map((opt, i) => (
            <label 
              key={i} 
              className={`p-4 border-2 border-[#1D2B4F] flex items-center gap-3 cursor-pointer transition-colors ${selected === i ? 'bg-[#E1E9F2]' : 'bg-white hover:bg-[#FBF6EC]'}`}
            >
              <input 
                type="radio" 
                name="rc-option" 
                className="w-4 h-4 accent-[#C1432E]"
                checked={selected === i}
                onChange={() => setSelected(i)}
                disabled={submitted}
              />
              <span className="font-bold text-[#1D2B4F]">{opt}</span>
            </label>
          ))}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={submitted || selected === null}
          className="px-6 py-3 bg-[#1D2B4F] text-[#FBF6EC] font-bold font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#E7DEC9] disabled:opacity-50"
        >
          {submitted ? 'Đang chấm...' : 'Kiểm tra'}
        </button>
      </div>
    </div>
  )
}
