'use client'

import { useState } from 'react'
import { Question } from '@prisma/client'
import { cn } from '@/lib/utils'

interface Props {
  question: Question
  onComplete: (points: number) => void
}

export default function OrderingViewer({ question, onComplete }: Props) {
  // Simple click-to-swap implementation
  const [items, setItems] = useState([
    { id: '1', text: 'lazy' },
    { id: '2', text: 'jumps' },
    { id: '3', text: 'fox' },
    { id: '4', text: 'over' },
    { id: '5', text: 'the' }
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleItemClick = (id: string) => {
    if (submitted) return
    if (!selectedId) {
      setSelectedId(id)
    } else {
      // Swap
      const newItems = [...items]
      const idx1 = newItems.findIndex(i => i.id === selectedId)
      const idx2 = newItems.findIndex(i => i.id === id)
      
      const temp = newItems[idx1]
      newItems[idx1] = newItems[idx2]
      newItems[idx2] = temp
      
      setItems(newItems)
      setSelectedId(null)
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => onComplete(15), 1500)
  }

  return (
    <div>
      <h3 className="text-xl font-serif font-bold text-[#1D2B4F] mb-2">Sắp xếp thành câu hoàn chỉnh</h3>
      <p className="text-sm text-[#6B7A94] mb-6 font-mono">Bấm vào 2 ô để hoán đổi vị trí</p>
      
      <div className="flex flex-wrap gap-3 mb-8">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={cn(
              "px-4 py-2 border-2 border-[#1D2B4F] font-bold cursor-pointer transition-all",
              selectedId === item.id 
                ? "bg-[#C1432E] text-[#FBF6EC] -translate-y-1 shadow-[4px_4px_0_#1D2B4F]" 
                : "bg-white text-[#1D2B4F] hover:bg-[#FBF6EC] shadow-[2px_2px_0_#1D2B4F]"
            )}
          >
            {item.text}
          </div>
        ))}
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
