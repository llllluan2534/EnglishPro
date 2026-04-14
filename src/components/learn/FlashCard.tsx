'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Volume2 } from 'lucide-react'

interface FlashCardProps {
  word: string
  pronunciation?: string | null
  definition: string
  example?: string | null
  audioUrl?: string | null
  onRate: (quality: number) => void
  isLoading?: boolean
}

export default function FlashCard({
  word, pronunciation, definition, example, audioUrl, onRate, isLoading,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (audioUrl) new Audio(audioUrl).play()
  }

  const handleRate = (quality: number) => {
    setIsFlipped(false)
    setTimeout(() => onRate(quality), 150)
  }

  return (
    <div className="flex flex-col items-center gap-8 select-none w-full max-w-lg mx-auto">
      <div
        className="w-full h-[320px] cursor-pointer group"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full transition-all duration-700 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-blue-50 flex flex-col items-center justify-center p-10 group-hover:border-blue-100 transition-colors"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-6 left-6 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">EN</span>
            </div>
            
            <h3 className="text-4xl font-bold text-gray-900 tracking-tight text-center font-outfit">{word}</h3>
            {pronunciation && (
              <p className="text-blue-400 font-medium text-lg mt-3">{pronunciation}</p>
            )}
            
            {audioUrl && (
              <button
                onClick={playAudio}
                className="mt-6 p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
              >
                <Volume2 size={24} />
              </button>
            )}
            
            <div className="absolute bottom-8 text-gray-300 text-xs font-medium uppercase tracking-widest animate-pulse">
              Nhấn để lật thẻ
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-10 text-white"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="absolute top-6 left-6 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-xs">VN</span>
            </div>

            <p className="text-3xl font-bold text-center leading-snug">{definition}</p>
            {example && (
              <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 max-w-xs">
                <p className="text-blue-50 text-base text-center italic">"{example}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-4 gap-3 w-full transition-all duration-500 delay-100',
          isFlipped ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
        )}
      >
        {[
          { quality: 1, label: 'Quên', sub: 'Học lại', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
          { quality: 3, label: 'Khó', sub: 'Gần được', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
          { quality: 4, label: 'Nhớ', sub: 'Tốt lắm', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
          { quality: 5, label: 'Dễ', sub: 'Quá siêu', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
        ].map(({ quality, label, sub, color }) => (
          <button
            key={quality}
            disabled={isLoading}
            onClick={() => handleRate(quality)}
            className={cn(
              'flex flex-col items-center justify-center py-3 px-2 rounded-[1.25rem] transition-all active:scale-95 disabled:opacity-50 border border-transparent',
              color
            )}
          >
            <span className="font-bold text-base">{label}</span>
            <span className="text-[0.65rem] opacity-70 uppercase tracking-tighter mt-0.5 font-medium">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
