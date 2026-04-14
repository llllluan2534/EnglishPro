'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FlashCard from './FlashCard'
import { CheckCircle, RotateCcw, Loader2 } from 'lucide-react'

interface FlashCardDeckProps {
  topicId?: string
}

export default function FlashCardDeck({ topicId }: FlashCardDeckProps) {
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })

  const { data, isLoading } = useQuery({
    queryKey: ['flashcards-due', topicId],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' })
      if (topicId) params.set('topicId', topicId)
      const res = await fetch(`/api/flashcards/due?${params}`)
      return res.json()
    },
  })

  const reviewMutation = useMutation({
    mutationFn: async ({
      vocabularyId, quality,
    }: {
      vocabularyId: string; quality: number
    }) => {
      const res = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyId, quality }),
      })
      return res.json()
    },
    onSuccess: (_, { quality }) => {
      setSessionStats(prev => ({
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
      }))
      setCurrentIndex(prev => prev + 1)
    },
  })

  const cards = data?.cards ?? []
  const currentCard = cards[currentIndex]
  const isDone = !isLoading && currentIndex >= cards.length

  const handleRate = useCallback((quality: number) => {
    if (!currentCard) return
    reviewMutation.mutate({
      vocabularyId: currentCard.vocabularyId,
      quality,
    })
  }, [currentCard, reviewMutation])

  const handleRestart = () => {
    setCurrentIndex(0)
    setSessionStats({ correct: 0, total: 0 })
    queryClient.invalidateQueries({ queryKey: ['flashcards-due', topicId] })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-blue-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-gray-400 font-medium animate-pulse">Đang chuẩn bị thẻ cho bạn...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-outfit">Sạch bản tin!</h2>
        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Bạn đã hoàn thành toàn bộ mục tiêu của hôm nay. Hãy nghỉ ngơi hoặc học bài mới nhé!</p>
      </div>
    )
  }

  if (isDone) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100)
    return (
      <div className="text-center py-16 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl px-10 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Trophy className="text-green-500" size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 font-outfit">Tuyệt vời!</h2>
        <p className="text-gray-500 mt-3 text-lg">Bạn đã hoàn thành phiên ôn tập</p>
        
        <div className="grid grid-cols-2 gap-4 mt-10">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">Chính xác</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-2xl font-bold text-gray-900">{sessionStats.correct}</p>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">Lần nhớ</p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="mt-10 flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl text-base font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <RotateCcw size={20} />
          Ôn lại phiên này
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">
      {/* Progress */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">{currentIndex + 1}</span>
            <span className="text-gray-500 font-medium">trên {cards.length} thẻ</span>
          </div>
          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold text-xs">{sessionStats.correct} đúng</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <FlashCard
        word={currentCard.vocabulary.word}
        pronunciation={currentCard.vocabulary.pronunciation}
        definition={currentCard.vocabulary.definition}
        example={currentCard.vocabulary.example}
        audioUrl={currentCard.vocabulary.audioUrl}
        onRate={handleRate}
        isLoading={reviewMutation.isPending}
      />
    </div>
  )
}

function Trophy({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
