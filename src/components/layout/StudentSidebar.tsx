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
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/learn', icon: BookOpen, label: 'Bài học' },
  { href: '/flashcards', icon: Layers, label: 'Flashcard' },
  { href: '/practice', icon: PenTool, label: 'Luyện tập' },
  { href: '/exam', icon: Zap, label: 'Kiểm tra' },
  { href: '/progress', icon: BarChart2, label: 'Tiến độ' },
  { href: '/leaderboard', icon: Trophy, label: 'Xếp hạng' },
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-72 shrink-0 h-screen sticky top-0 bg-[#FFFDF7] border-r-2 border-[#1D2B4F] flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Logo — con dấu */}
      <div className="px-8 py-8 flex items-center gap-3.5 border-b-2 border-dashed border-[#E7DEC9]">
        <div className="w-11 h-11 rounded-full border-[2.5px] border-[#C1432E] flex items-center justify-center -rotate-6 relative shrink-0">
          <div className="absolute inset-1 rounded-full border border-[#C1432E]/50" />
          <span
            className="text-[#C1432E] font-bold text-[11px] relative z-10"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            EP
          </span>
        </div>
        <div>
          <div
            className="text-[21px] font-semibold text-[#1D2B4F] leading-none tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            EnglishPro
          </div>
          <div
            className="text-[10px] text-[#6B7A94] tracking-[0.1em] mt-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            SỔ TAY ÔN THI
          </div>
        </div>
      </div>

      {/* Navigation — mục lục */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <span
          className="block px-8 mb-3 text-[10px] uppercase tracking-[0.15em] text-[#6B7A94]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Điều hướng
        </span>
        {navItems.map(({ href, icon: Icon, label }, i) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3.5 px-8 py-3 text-[14px] font-semibold border-l-[3px] transition-colors duration-150',
                active
                  ? 'text-[#C1432E] bg-[#F3DAD3] border-[#C1432E]'
                  : 'text-[#6B7A94] border-transparent hover:text-[#1D2B4F] hover:bg-[#FBF6EC]'
              )}
            >
              <span
                className={cn(
                  'w-[18px] text-[11px] font-bold shrink-0',
                  active ? 'text-[#C1432E]' : 'text-[#E7DEC9]'
                )}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <Icon size={17} className="shrink-0 opacity-80" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — streak + logout */}
      <div className="px-8 pt-5 pb-7 border-t-2 border-dashed border-[#E7DEC9]">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 border-[1.5px] border-[#E7DEC9] mb-4 text-[11px] text-[#6B7A94]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>Chuỗi học</span>
          <b className="text-[#C1432E] text-[13px]">7 ngày 🔥</b>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full text-[13px] font-bold text-[#6B7A94] hover:text-[#C1432E] py-2 transition-colors"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}