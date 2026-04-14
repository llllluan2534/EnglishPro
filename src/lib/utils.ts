import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes an toàn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format điểm số
export function formatScore(score: number, total: number): string {
  return `${score}/${total} (${Math.round((score / total) * 100)}%)`
}

// Tính XP dựa trên độ khó
export function calculateXP(difficulty: 'EASY' | 'MEDIUM' | 'HARD', isCorrect: boolean): number {
  if (!isCorrect) return 0
  const base = { EASY: 5, MEDIUM: 10, HARD: 20 }
  return base[difficulty]
}