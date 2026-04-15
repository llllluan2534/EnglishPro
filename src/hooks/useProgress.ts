'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useProgress() {
  const queryClient = useQueryClient()

  const saveProgress = useMutation({
    mutationFn: async ({
      lessonId,
      isCompleted,
      timeSpent,
      score,
    }: {
      lessonId: string
      isCompleted?: boolean
      timeSpent?: number
      score?: number
    }) => {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          isCompleted,
          timeSpent,
          score,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save progress')
      }

      return res.json()
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Progress Error:', error)
      toast.error('Không thể lưu tiến độ học tập.')
    },
  })

  return {
    saveProgress,
    isLoading: saveProgress.isPending,
  }
}
