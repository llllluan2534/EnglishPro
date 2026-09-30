'use client'

import { useEffect, useState, useRef } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface ExamTimerProps {
  durationMinutes: number
  onTimeUp: () => void
  onTick?: (secondsLeft: number) => void
  isPaused?: boolean
}

export default function ExamTimer({
  durationMinutes,
  onTimeUp,
  onTick,
  isPaused = false
}: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)
  const isTimeUpTriggered = useRef(false)

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60)
  }, [durationMinutes])

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!isTimeUpTriggered.current) {
            isTimeUpTriggered.current = true
            onTimeUp()
          }
          return 0
        }
        const next = prev - 1
        onTick?.(next)
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, onTimeUp, onTick])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isCritical = secondsLeft <= 60 && secondsLeft > 0
  const isWarning = secondsLeft <= 300 && secondsLeft > 60

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2 border-2 transition-all font-mono font-bold text-sm shadow-[2px_2px_0_#1D2B4F] ${
        isCritical
          ? 'bg-[#F3DAD3] text-[#C1432E] border-[#C1432E] animate-pulse'
          : isWarning
          ? 'bg-[#FBEACB] text-[#8A5E12] border-[#E3A73B]'
          : 'bg-[#FFFDF7] text-[#1D2B4F] border-[#1D2B4F]'
      }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {isCritical ? (
        <AlertTriangle size={18} className="text-[#C1432E] animate-bounce" />
      ) : (
        <Clock size={18} className={isWarning ? 'text-[#E3A73B]' : 'text-[#1D2B4F]'} />
      )}
      <span className="text-base tracking-wider">{formattedTime}</span>
      {isCritical && <span className="text-xs uppercase font-sans font-bold">Sắp hết giờ!</span>}
    </div>
  )
}
