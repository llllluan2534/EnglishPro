'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, PenTool,
  Trophy, LogOut, Users, Settings
} from 'lucide-react'

const navItems = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Thống kê' },
  { href: '/teacher/lessons',   icon: BookOpen,        label: 'Bài giảng' },
  { href: '/teacher/questions', icon: PenTool,         label: 'Ngân hàng câu đố' },
  { href: '/teacher/students',  icon: Users,           label: 'Học sinh' },
  { href: '/teacher/settings',  icon: Settings,        label: 'Cài đặt' },
]

export default function TeacherSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 bg-white border-r border-[#F8FAFC] flex flex-col">
      {/* Logo */}
      <div className="h-24 flex items-center px-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xs font-sans">EP</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
            Teacher Hub
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[14px] transition-all duration-300 group font-medium',
                active
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon size={18} className={cn(
                'transition-transform duration-300',
                !active && 'group-hover:scale-110'
              )} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout Row */}
      <div className="p-6 border-t border-slate-50">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[14px] text-slate-400 hover:bg-red-50 hover:text-red-500 w-full transition-all duration-300 font-medium"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
