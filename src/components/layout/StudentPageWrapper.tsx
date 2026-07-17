'use client'

import { usePathname } from 'next/navigation'

export default function StudentPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Nếu là các trang sử dụng giao diện Studio Preview, ta cho tràn viền 100%
  if (
    pathname === '/dashboard' || 
    pathname.startsWith('/learn') || 
    pathname === '/practice' || 
    pathname === '/flashcards' || 
    pathname === '/exam' || 
    pathname === '/leaderboard'
  ) {
    return <div className="w-full min-h-full">{children}</div>
  }

  // Các trang khác vẫn giữ nguyên layout padding cũ để không bị vỡ giao diện
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 sm:px-10">
      {children}
    </div>
  )
}
