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
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp

  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60)
    isTimeUpTriggered.current = false
  }, [durationMinutes])

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused])

  // Kích hoạt onTick & onTimeUp trong effect sau khi render hoàn tất
  useEffect(() => {
    onTickRef.current?.(secondsLeft)

    if (secondsLeft === 0 && !isTimeUpTriggered.current) {
      isTimeUpTriggered.current = true
      onTimeUpRef.current()
    }
  }, [secondsLeft])

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
          ? 'bg-[#FDF4E2] text-[#E3A73B] border-[#E3A73B]'
          : 'bg-[#FFFDF7] text-[#1D2B4F] border-[#1D2B4F]'
      }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {isCritical ? (
        <AlertTriangle size={18} className="text-[#C1432E]" />
      ) : (
        <Clock size={18} className="text-[#1D2B4F]" />
      )}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-[#6B7A94] leading-none mb-0.5">
          {isCritical ? 'SẮP HẾT GIỜ!' : 'THỜI GIAN CÒN LẠI'}
        </span>
        <span className="text-base tracking-widest leading-none">{formattedTime}</span>
      </div>
    </div>
  )
}
