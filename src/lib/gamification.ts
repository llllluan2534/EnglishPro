import { prisma } from './prisma'
import { XPAction, LevelInfo } from '../types/gamification.types'

export const XP_VALUES: Record<XPAction, number> = {
  FLASHCARD_CORRECT: 5,
  FLASHCARD_EASY: 5,
  FLASHCARD_HARD: 3,
  LESSON_COMPLETE: 20,
  EXAM_PASS: 50,
  EXAM_PERFECT: 100,
  STREAK_BONUS: 50,
}

/**
 * Tính toán thông tin cấp độ từ tổng XP
 */
export function calculateLevelInfo(totalXP: number): LevelInfo {
  const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 50)))
  const nextLevelXP = Math.pow(level + 1, 2) * 50
  const currentLevelXP = Math.pow(level, 2) * 50
  
  const progress = Math.min(
    100, 
    Math.max(0, ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
  )

  return {
    level,
    currentXP: totalXP,
    nextLevelXP,
    progress
  }
}

/**
 * Cộng XP cho người dùng và cập nhật level nếu cần
 */
export async function addXP(userId: string, action: XPAction, refId?: string) {
  const amount = XP_VALUES[action]
  
  return await prisma.$transaction(async (tx) => {
    // 1. Cập nhật UserXP
    const userXP = await tx.userXP.upsert({
      where: { userId },
      update: {
        totalXP: { increment: amount },
        weeklyXP: { increment: amount },
        monthlyXP: { increment: amount },
      },
      create: {
        userId,
        totalXP: amount,
        level: 1,
        weeklyXP: amount,
        monthlyXP: amount,
      },
    })

    // 2. Tính toán level mới
    const { level: newLevel } = calculateLevelInfo(userXP.totalXP)
    
    if (newLevel > userXP.level) {
      await tx.userXP.update({
        where: { userId },
        data: { level: newLevel }
      })
    }

    // 3. Lưu lịch sử XP
    await tx.xPHistory.create({
      data: {
        userId,
        amount,
        reason: action,
        refId,
      }
    })

    return { ...userXP, level: newLevel, addedXP: amount }
  })
}

/**
 * Cập nhật chuỗi ngày học (Streak)
 */
export async function updateStreak(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const streak = await prisma.streak.findUnique({
    where: { userId }
  })

  if (!streak) {
    return await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: today
      }
    })
  }

  const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null
  if (lastDate) {
    lastDate.setHours(0, 0, 0, 0)
  }

  const diffTime = lastDate ? today.getTime() - lastDate.getTime() : null
  const diffDays = diffTime ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null

  if (diffDays === 1) {
    // Tiếp tục chuỗi
    const newStreak = streak.currentStreak + 1
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(streak.longestStreak, newStreak),
        lastStudyDate: today
      }
    })
  } else if (diffDays === 0) {
    // Đã học hôm nay, không làm gì
    return streak
  } else {
    // Đứt chuỗi
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastStudyDate: today
      }
    })
  }
}

/**
 * Kiểm tra và cấp huy hiệu (Sẽ hoàn thiện sau khi có logic Badge cụ thể)
 */
export async function checkAndAwardBadges(userId: string) {
  // TODO: Implement badge logic
  // Ví dụ: Check streak >= 7, check totalXP, check hoàn thành topic...
}
