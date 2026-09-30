'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react'

interface Flashcard {
  front: string
  back: string
  example?: string
}

interface FlashcardSetBlockProps {
  cards: Flashcard[]
}

export default function FlashcardSetBlock({ cards }: FlashcardSetBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  if (!cards || cards.length === 0) return null

  const currentCard = cards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setIsFlipped(false)
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="max-w-2xl mx-auto my-12">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="font-outfit font-bold text-[#1D2B4F] text-xl">Thẻ ghi nhớ (Flashcards)</h3>
        <div className="text-sm font-bold font-mono text-[#6B7A94] uppercase tracking-widest">
          Thẻ {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* The Card */}
      <div 
        className="relative w-full aspect-[4/3] max-h-[400px] perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <div 
          className="w-full h-full relative transition-transform duration-500 transform-style-3d"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-[#FFFDF7] rounded-[2rem] border-2 border-[#E7DEC9] shadow-[8px_8px_0_#E7DEC9] flex flex-col items-center justify-center p-8 group-hover:-translate-y-1 group-hover:shadow-[10px_10px_0_#E7DEC9] transition-all">
            <p className="text-4xl md:text-5xl font-black font-sans text-[#1D2B4F] text-center">{currentCard.front}</p>
            <p className="mt-8 text-[#6B7A94] font-medium italic text-sm">Bấm để lật thẻ</p>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden bg-[#1D2B4F] rounded-[2rem] border-2 border-[#1D2B4F] shadow-[8px_8px_0_#E7DEC9] flex flex-col items-center justify-center p-8 text-white"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="text-3xl md:text-4xl font-bold font-serif text-[#FBF6EC] text-center mb-6">{currentCard.back}</p>
            {currentCard.example && (
              <div className="bg-white/10 rounded-xl p-4 w-full border border-white/20">
                <p className="text-sm text-blue-200 uppercase tracking-widest font-bold mb-2 text-center">Ví dụ</p>
                <p className="text-center font-medium italic text-gray-100 leading-relaxed">"{currentCard.example}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full border-2 border-[#E7DEC9] flex items-center justify-center text-[#1D2B4F] hover:bg-[#FBF6EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleFlip(); }}
          className="flex items-center justify-center gap-2 font-bold uppercase text-sm tracking-widest text-[#6B7A94] hover:text-[#1D2B4F] transition-colors h-14 px-6 border-2 border-transparent hover:border-[#E7DEC9] rounded-full"
        >
          <Repeat size={18} />
          Lật
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={currentIndex === cards.length - 1}
          className="w-14 h-14 rounded-full border-2 border-[#E7DEC9] flex items-center justify-center text-[#1D2B4F] hover:bg-[#FBF6EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}} />
    </div>
  )
}
