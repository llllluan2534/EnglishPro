export type XPAction = 
  | 'FLASHCARD_CORRECT' 
  | 'FLASHCARD_EASY' 
  | 'FLASHCARD_HARD' 
  | 'LESSON_COMPLETE' 
  | 'EXAM_PASS' 
  | 'EXAM_PERFECT' 
  | 'STREAK_BONUS'

export interface LevelInfo {
  level: number
  currentXP: number
  nextLevelXP: number
  progress: number // 0-100
}

export interface UserGamification {
  userId: string
  totalXP: number
  level: number
  weeklyXP: number
  monthlyXP: number
  streak: number
  lastStudyDate: Date | null
}
