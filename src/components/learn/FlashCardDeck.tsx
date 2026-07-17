'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, RotateCcw, Loader2 } from 'lucide-react'

interface FlashCardDeckProps {
  topicId?: string
}

export default function FlashCardDeck({ topicId }: FlashCardDeckProps) {
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [isRevealed, setIsRevealed] = useState(false)

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
      setIsRevealed(false)
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
    setIsRevealed(false)
    queryClient.invalidateQueries({ queryKey: ['flashcards-due', topicId] })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--ink)' }}>
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold font-mono">Đang tải thẻ...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E4D9BE] px-6 max-w-lg w-full mb-10 mx-auto">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#4C7A6B]">
          <CheckCircle className="text-[#4C7A6B]" size={40} />
        </div>
        <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]">Sạch bản tin!</h2>
        <p className="text-[#6B7A94] mt-2 max-w-xs mx-auto">Bạn đã ôn xong toàn bộ thẻ. Chờ hệ thống sắp lịch tiếp nhé!</p>
      </div>
    )
  }

  if (isDone) {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0
    return (
      <div className="text-center py-16 bg-[#FFFDF7] rounded-3xl border border-[#E4D9BE] px-10 max-w-md w-full mx-auto relative overflow-hidden mb-10">
        <div className="w-24 h-24 bg-[#E1E9F2] rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-[#3D5A80]">
          <span className="font-serif font-bold text-4xl text-[#3D5A80]">!</span>
        </div>
        <h2 className="text-3xl font-bold text-[#1D2B4F] font-serif">Tuyệt vời!</h2>
        <p className="text-[#6B7A94] mt-3 text-lg">Bạn đã hoàn thành phiên ôn tập</p>
        
        <div className="grid grid-cols-2 gap-4 mt-10">
          <div className="border border-[#E4D9BE] bg-white p-4">
            <p className="text-2xl font-bold text-[#1D2B4F] font-mono">{accuracy}%</p>
            <p className="text-xs text-[#6B7A94] font-bold tracking-wider mt-1 uppercase">Chính xác</p>
          </div>
          <div className="border border-[#E4D9BE] bg-white p-4">
            <p className="text-2xl font-bold text-[#1D2B4F] font-mono">{sessionStats.correct}</p>
            <p className="text-xs text-[#6B7A94] font-bold tracking-wider mt-1 uppercase">Thẻ nhớ</p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="mt-10 flex items-center justify-center gap-2 w-full py-4 bg-[#C1432E] text-[#FBF6EC] font-bold font-mono hover:bg-[#A53826] transition-all"
        >
          <RotateCcw size={20} />
          Ôn lại phiên này
        </button>
      </div>
    )
  }

  return (
    <div className="deck-wrap">
      <div className="deck-meta">
        Thẻ <b>{currentIndex + 1}</b> / {cards.length} &middot; Tiến độ <b>{sessionStats.correct}</b> đúng
      </div>
      <div className="card-stack" onClick={() => !isRevealed && setIsRevealed(true)}>
        <div className="stack-layer l2"></div>
        <div className="stack-layer l1"></div>
        <div className="flash-card" style={{ cursor: !isRevealed ? 'pointer' : 'default' }}>
          <span className="corner">{String(currentIndex + 1).padStart(2, '0')}/{cards.length}</span>
          {currentCard.vocabulary.topic?.grade && (
             <span className="corner r">LỚP {currentCard.vocabulary.topic.grade}</span>
          )}
          <div className="word">{currentCard.vocabulary.word}</div>
          
          {isRevealed ? (
            <>
              <div className="phon" style={{ marginBottom: 10 }}>{currentCard.vocabulary.pronunciation}</div>
              <div className="phon" style={{ color: 'var(--ink)' }}>{currentCard.vocabulary.definition}</div>
            </>
          ) : (
            <div className="phon" style={{ marginTop: 20, fontStyle: 'italic', opacity: 0.7 }}>Bấm vào thẻ để xem đáp án</div>
          )}
        </div>
      </div>
      
      <div className="rate-row" style={{ visibility: isRevealed ? 'visible' : 'hidden', opacity: isRevealed ? 1 : 0, transition: 'opacity 0.2s' }}>
        <button 
          className="rate-btn hard" 
          onClick={() => handleRate(1)}
          disabled={reviewMutation.isPending}
        >Khó &mdash; lại</button>
        <button 
          className="rate-btn good"
          onClick={() => handleRate(3)}
          disabled={reviewMutation.isPending}
        >Ổn</button>
        <button 
          className="rate-btn easy"
          onClick={() => handleRate(5)}
          disabled={reviewMutation.isPending}
        >Dễ &mdash; nhớ rồi</button>
      </div>
    </div>
  )
}
