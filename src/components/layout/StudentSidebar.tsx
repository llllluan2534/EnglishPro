'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, Layers, PenTool,
  Trophy, BarChart2, LogOut, Zap, ChevronLeft, ChevronRight, Menu, X
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

interface StudentSidebarProps {
  user?: {
    name?: string | null
    email?: string | null
  }
}

export default function StudentSidebar({ user }: StudentSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [streakDays, setStreakDays] = useState<number | null>(null)

  // Auto-close mobile sidebar when navigating
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Fetch real streak
  useEffect(() => {
    fetch('/api/student/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.streak?.current !== undefined) {
          setStreakDays(data.streak.current)
        }
      })
      .catch(() => {})
  }, [pathname])

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden shrink-0 h-16 bg-[#FFFDF7] border-b-2 border-[#1D2B4F] flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#C1432E] flex items-center justify-center -rotate-6 relative shrink-0">
            <span className="text-[#C1432E] font-bold text-[9px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>EP</span>
          </div>
          <span className="font-semibold text-[#1D2B4F] text-lg" style={{ fontFamily: "'Fraunces', serif" }}>EnglishPro</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="w-10 h-10 bg-[#E7DEC9] rounded-lg border-2 border-[#1D2B4F] flex items-center justify-center text-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-[#1D2B4F]/40 backdrop-blur-sm z-40" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "shrink-0 h-[100dvh] bg-[#FFFDF7] border-r-2 border-[#1D2B4F] flex flex-col z-50 transition-all duration-300",
          "fixed md:sticky top-0 left-0",
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-72"
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-[#C1432E] rounded-full text-white items-center justify-center border-2 border-[#1D2B4F] z-50 hover:bg-[#A53826] transition-colors shadow-[2px_2px_0_#1D2B4F]"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile Close Button inside Sidebar */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            "md:hidden absolute -right-5 top-4 w-10 h-10 bg-[#FFFDF7] rounded-full text-[#1D2B4F] flex items-center justify-center border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] transition-all z-50",
            isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
          )}
        >
          <X size={20} />
        </button>

        {/* Logo — con dấu */}
      <div className={cn("py-8 flex items-center border-b-2 border-dashed border-[#E7DEC9]", isCollapsed ? "px-4 justify-center" : "px-8 gap-3.5")}>
        <div className="w-11 h-11 rounded-full border-[2.5px] border-[#C1432E] flex items-center justify-center -rotate-6 relative shrink-0">
          <div className="absolute inset-1 rounded-full border border-[#C1432E]/50" />
          <span
            className="text-[#C1432E] font-bold text-[11px] relative z-10"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            EP
          </span>
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap transition-all duration-300 opacity-100">
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
        )}
      </div>

      {/* Navigation — mục lục */}
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <span
            className="block px-8 mb-3 text-[10px] uppercase tracking-[0.15em] text-[#6B7A94] whitespace-nowrap"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Điều hướng
          </span>
        )}
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
                style={{ fontFamily: "'JetBrains Mono', monospace", display: isCollapsed ? 'none' : 'block' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <Icon size={17} className={cn("shrink-0 opacity-80", isCollapsed && "mx-auto")} />
              {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer — user info + streak + logout */}
      <div className={cn("pt-4 pb-6 border-t-2 border-dashed border-[#E7DEC9]", isCollapsed ? "px-3" : "px-6")}>
        {!isCollapsed && (
          <>
            {user?.name && (
              <div className="flex items-center gap-2.5 mb-3 p-2 bg-[#FBF6EC] border border-[#E7DEC9]">
                <div className="w-7 h-7 rounded-full bg-[#1D2B4F] text-[#FFFDF7] flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[#1D2B4F] truncate">{user.name}</div>
                  <div className="text-[10px] text-[#6B7A94] font-mono leading-none">Học sinh</div>
                </div>
              </div>
            )}
            <div
              className="flex items-center justify-between px-3.5 py-2 border-[1.5px] border-[#E7DEC9] mb-3 text-[11px] text-[#6B7A94]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span>Chuỗi học</span>
              <b className="text-[#C1432E] text-[13px]">
                {streakDays !== null ? `${streakDays} ngày` : '0 ngày'} 🔥
              </b>
            </div>
          </>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn("flex items-center text-[13px] font-bold text-[#6B7A94] hover:text-[#C1432E] py-2 transition-colors", isCollapsed ? "justify-center w-full" : "gap-3 w-full")}
          title="Đăng xuất"
        >
          <LogOut size={isCollapsed ? 20 : 16} />
          {!isCollapsed && "Đăng xuất"}
        </button>
      </div>
    </aside>
    </>
  )
}