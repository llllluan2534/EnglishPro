'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  GraduationCap, BookOpen, Mail, Lock, 
  ArrowRight, CheckCircle2, Sparkles, Trophy 
} from 'lucide-react'

const schema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const fillDemoAccount = (role: 'STUDENT' | 'TEACHER') => {
    setSelectedRole(role)
    if (role === 'STUDENT') {
      setValue('email', 'hocsinh@englishpro.vn')
      setValue('password', 'Student@123')
    } else {
      setValue('email', 'giaovien@englishpro.vn')
      setValue('password', 'Teacher@123')
    }
  }

  const onSubmit = async (data: FormData) => {
    setError(null)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email hoặc mật khẩu không chính xác')
      return
    }

    try {
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const userRole = sessionData?.user?.role

      if (userRole === 'TEACHER' || userRole === 'ADMIN') {
        router.push('/teacher/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch {
      const callbackUrl = searchParams.get('callbackUrl')
      if (callbackUrl) {
        router.push(callbackUrl)
      } else if (selectedRole === 'TEACHER') {
        router.push('/teacher/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Role Tabs */}
      <div className="grid grid-cols-2 gap-3 bg-[#FBF6EC] p-1.5 rounded-2xl border-2 border-[#1D2B4F]">
        <button
          type="button"
          onClick={() => setSelectedRole('STUDENT')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            selectedRole === 'STUDENT'
              ? 'bg-[#1D2B4F] text-white shadow-[2px_2px_0_#C1432E]'
              : 'text-[#6B7A94] hover:text-[#1D2B4F]'
          }`}
        >
          <GraduationCap size={16} />
          <span>Học sinh</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('TEACHER')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            selectedRole === 'TEACHER'
              ? 'bg-[#1D2B4F] text-white shadow-[2px_2px_0_#C1432E]'
              : 'text-[#6B7A94] hover:text-[#1D2B4F]'
          }`}
        >
          <BookOpen size={16} />
          <span>Giáo viên</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#1D2B4F] uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={13} className="text-[#C1432E]" />
            {selectedRole === 'STUDENT' ? 'Địa chỉ Gmail / Email' : 'Email Giáo viên'}
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder={selectedRole === 'STUDENT' ? 'hocsinh@englishpro.vn' : 'giaovien@englishpro.vn'}
            className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border-2 border-[#E7DEC9] focus:border-[#1D2B4F] rounded-xl text-sm font-medium text-[#1D2B4F] transition-all outline-none"
          />
          {errors.email && <p className="text-[#C1432E] text-[11px] font-bold">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-[#1D2B4F] uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={13} className="text-[#C1432E]" />
              Mật khẩu
            </label>
            <button type="button" className="text-xs font-bold text-[#C1432E] hover:underline">
              Quên mật khẩu?
            </button>
          </div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border-2 border-[#E7DEC9] focus:border-[#1D2B4F] rounded-xl text-sm font-medium text-[#1D2B4F] transition-all outline-none"
          />
          {errors.password && <p className="text-[#C1432E] text-[11px] font-bold">{errors.password.message}</p>}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-[#FDECE9] border-2 border-[#C1432E] rounded-xl text-[#C1432E] text-xs font-bold">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[#1D2B4F] text-[#FBF6EC] rounded-xl text-xs lg:text-sm font-bold border-2 border-[#1D2B4F] shadow-[4px_4px_0_#C1432E] hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0_#C1432E] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>{isSubmitting ? 'ĐANG ĐĂNG NHẬP...' : `ĐĂNG NHẬP VỚI TƯ CÁCH ${selectedRole === 'STUDENT' ? 'HỌC SINH' : 'GIÁO VIÊN'}`}</span>
          <ArrowRight size={16} />
        </button>

        {/* Quick Demo Login Pill */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => fillDemoAccount(selectedRole)}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7A94] hover:text-[#1D2B4F] bg-[#FBF6EC] border border-[#E7DEC9] px-3 py-1.5 rounded-full transition-colors font-medium"
          >
            <span>⚡ Điền tài khoản {selectedRole === 'STUDENT' ? 'Học sinh mẫu' : 'Giáo viên mẫu'}</span>
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-xs text-[#6B7A94] font-medium pt-2">
          Chưa có tài khoản EnglishPro?{' '}
          <Link href="/register" className="text-[#C1432E] font-bold hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen bg-[#FBF6EC] flex items-center justify-center p-4 sm:p-6 lg:p-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* FRAME NGANG (HORIZONTAL SPLIT CARD) */}
      <div className="w-full max-w-5xl bg-white border-2 border-[#1D2B4F] shadow-[12px_12px_0_#E7DEC9] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* CỘT TRÁI (BANNER GIỚI THIỆU - COL-SPAN-5) */}
        <div className="lg:col-span-5 bg-[#1D2B4F] text-[#FBF6EC] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, #FFFDF7 0, #FFFDF7 2px, transparent 0, transparent 16px)' 
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 bg-[#E3A73B] text-[#1D2B4F] rounded-2xl flex items-center justify-center font-black text-xl border-2 border-[#FFFDF7] shadow-[3px_3px_0_#C1432E]" 
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                EP
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block">EnglishPro</span>
                <span className="text-[11px] uppercase tracking-widest text-[#E3A73B] font-mono block">Chương trình GDPT 2018</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-[#FFFDF7]" style={{ fontFamily: "'Fraunces', serif" }}>
                Chào mừng <em className="italic text-[#E3A73B]">bạn quay lại</em>
              </h2>
              <p className="text-[#A2B1C6] text-sm leading-relaxed">
                Tiếp tục chuỗi ngày học tập chăm chỉ và chinh phục điểm số mục tiêu kỳ thi THPT 2026.
              </p>
            </div>

            {/* Tính năng nổi bật */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <Trophy size={18} className="text-[#E3A73B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#E1E9F2]">
                  <strong className="text-white block font-semibold">Duy trì Streak học tập</strong>
                  Học mỗi ngày để tích lũy XP và thăng hạng trên Bảng vàng toàn quốc.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle2 size={18} className="text-[#E3A73B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#E1E9F2]">
                  <strong className="text-white block font-semibold">Đồng bộ tiến độ học tức thì</strong>
                  Kết quả làm bài, flashcard và bài thi được lưu trữ an toàn trong tài khoản.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <Sparkles size={18} className="text-[#E3A73B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#E1E9F2]">
                  <strong className="text-white block font-semibold">Hệ thống AI thông minh</strong>
                  Chấm phát âm và gợi ý lộ trình cải thiện kỹ năng còn yếu.
                </div>
              </div>
            </div>
          </div>

          {/* Footer cột trái */}
          <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#A2B1C6]">
            <span>© 2026 EnglishPro LMS</span>
            <span className="text-[#E3A73B]">Phiên bản 2.0</span>
          </div>
        </div>

        {/* CỘT PHẢI (FORM ĐĂNG NHẬP - COL-SPAN-7) */}
        <div className="lg:col-span-7 p-8 lg:p-10 bg-white flex flex-col justify-center">
          <div className="max-w-xl w-full mx-auto space-y-6">
            
            {/* Header Form */}
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#C1432E] font-bold mb-1">
                Xác thực tài khoản
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                Đăng nhập EnglishPro
              </h1>
              <p className="text-[#6B7A94] text-xs lg:text-sm mt-1">
                Chọn vai trò và đăng nhập để vào không gian học tập của bạn
              </p>
            </div>

            {/* Form */}
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-[#6B7A94] font-mono text-sm">Đang tải biểu mẫu...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

      </div>
    </div>
  )
}
