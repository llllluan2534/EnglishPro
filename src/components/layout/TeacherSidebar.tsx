'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, PenTool,
  Award, LogOut, Users, ExternalLink
} from 'lucide-react'

const navItems = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Thống kê tổng quan' },
  { href: '/teacher/exams',     icon: Award,           label: 'Đề thi & Kiểm tra' },
  { href: '/teacher/lessons',   icon: BookOpen,        label: 'Quản lý Bài giảng' },
  { href: '/teacher/questions', icon: PenTool,         label: 'Ngân hàng câu hỏi' },
  { href: '/teacher/students',  icon: Users,           label: 'Quản lý Học sinh' },
]

export default function TeacherSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-72 shrink-0 h-screen sticky top-0 bg-[#FFFDF7] border-r-2 border-[#1D2B4F] flex flex-col z-20"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Brand Header */}
      <div className="h-24 flex items-center px-8 border-b-2 border-dashed border-[#E7DEC9]">
        <Link href="/teacher/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#1D2B4F] border-2 border-[#1D2B4F] flex items-center justify-center shadow-[2px_2px_0_#C1432E] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
            <span
              className="text-white font-bold text-sm tracking-wider"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              EP
            </span>
          </div>
          <div>
            <div
              className="text-lg font-bold text-[#1D2B4F] tracking-tight leading-none"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              EnglishPro
            </div>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C1432E] mt-1 block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Phân hệ Giáo viên
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div
          className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B7A94]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Menu Nghiệp vụ
        </div>

        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all border-2',
                active
                  ? 'bg-[#1D2B4F] text-white border-[#1D2B4F] shadow-[3px_3px_0_#C1432E]'
                  : 'bg-[#FFFDF7] text-[#1D2B4F] border-transparent hover:border-[#1D2B4F] hover:bg-[#FBF6EC]'
              )}
            >
              <Icon
                size={18}
                className={cn('shrink-0', active ? 'text-[#E3A73B]' : 'text-[#6B7A94]')}
              />
              <span>{label}</span>
            </Link>
          )
        })}

        <div className="pt-6">
          <div
            className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B7A94]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Trải nghiệm
          </div>
          <Link
            href="/exam"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-[#4C7A6B] bg-[#DCE9E3] border-2 border-[#4C7A6B] hover:bg-[#C9DFD6] transition-all shadow-[2px_2px_0_#4C7A6B]"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              Góc nhìn Học sinh
            </span>
            <span className="text-[10px] font-mono uppercase">Mở</span>
          </Link>
        </div>
      </nav>

      {/* User / Sign Out Footer */}
      <div className="p-4 border-t-2 border-[#1D2B4F] bg-[#FBF6EC]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold font-mono text-[#C1432E] border-2 border-[#C1432E] bg-[#FFFDF7] hover:bg-[#C1432E] hover:text-white transition-all shadow-[2px_2px_0_#C1432E]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <LogOut size={14} />
          ĐĂNG XUẤT
        </button>
      </div>
    </aside>
  )
}
