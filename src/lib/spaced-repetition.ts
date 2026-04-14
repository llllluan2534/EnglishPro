export interface SM2Card {
    easeFactor: number   // Hệ số dễ, mặc định 2.5
    interval: number     // Số ngày đến lần ôn tiếp theo
    repetitions: number  // Số lần đã ôn đúng liên tiếp
    nextReviewAt: Date
}

/**
 * Tính toán lịch ôn tiếp theo dựa trên chất lượng trả lời
 * @param quality 0-5: 0-2 = sai, 3 = khó, 4 = đúng, 5 = rất dễ
 */
export function calculateNextReview(card: SM2Card, quality: number): SM2Card {
    let { easeFactor, interval, repetitions } = card

    if (quality >= 3) {
        if (repetitions === 0) interval = 1
        else if (repetitions === 1) interval = 6
        else interval = Math.round(interval * easeFactor)

        repetitions += 1
    } else {
        repetitions = 0
        interval = 1
    }

    easeFactor = Math.max(
        1.3,
        easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    )

    const nextReviewAt = new Date()
    nextReviewAt.setDate(nextReviewAt.getDate() + interval)

    return { easeFactor, interval, repetitions, nextReviewAt }
}