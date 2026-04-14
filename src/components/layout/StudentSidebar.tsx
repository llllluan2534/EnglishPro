'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, Layers, PenTool,
  Trophy, BarChart2, LogOut, Zap,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/learn',        icon: BookOpen,        label: 'Bài học' },
  { href: '/flashcards',   icon: Layers,          label: 'Flashcard' },
  { href: '/practice',     icon: PenTool,         label: 'Luyện tập' },
  { href: '/exam',         icon: Zap,             label: 'Kiểm tra' },
  { href: '/progress',     icon: BarChart2,        label: 'Tiến độ' },
  { href: '/leaderboard',  icon: Trophy,          label: 'Xếp hạng' },
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-gray-50 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <span className="text-white font-bold">EP</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-outfit">
            EnglishPro
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[0.925rem] transition-all duration-200 group',
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-medium'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              <Icon size={19} className={cn(
                'transition-transform duration-200',
                !active && 'group-hover:scale-110'
              )} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[0.925rem] text-gray-400 hover:bg-red-50 hover:text-red-500 w-full transition-all duration-200 font-medium"
        >
          <LogOut size={19} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
