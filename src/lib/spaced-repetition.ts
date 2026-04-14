// Thuật toán SM-2 cơ bản cho Spaced Repetition
// quality: 0-5 (0: quên hoàn toàn, 5: nhớ hoàn hảo)

interface SM2Input {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

export function calculateNextReview(current: SM2Input, quality: number) {
  let { easeFactor, interval, repetitions } = current

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions++
  } else {
    repetitions = 0
    interval = 1
  }

  // Cập nhật Ease Factor: EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)
  // Xóa đi phần giờ phút giây để chỉ tính theo ngày
  nextReviewAt.setHours(0, 0, 0, 0)

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewAt,
  }
}