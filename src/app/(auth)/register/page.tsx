'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { 
  GraduationCap, BookOpen, Calendar, Mail, 
  Lock, User, ArrowRight, CheckCircle2, Sparkles, Award
} from 'lucide-react'

const schema = z.object({
  role: z.enum(['STUDENT', 'TEACHER']),
  name: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  dateOfBirth: z.string().min(1, 'Vui lòng chọn ngày tháng năm sinh'),
  grade: z.coerce.number().int().min(10).max(12).optional().nullable(),
}).refine((data) => {
  if (data.role === 'STUDENT' && !data.grade) {
    return false
  }
  return true
}, {
  message: 'Học sinh vui lòng chọn khối lớp',
  path: ['grade'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      role: 'STUDENT',
      grade: 10,
    }
  })

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER') => {
    setSelectedRole(role)
    setValue('role', role)
    if (role === 'TEACHER') {
      setValue('grade', null)
    } else {
      setValue('grade', 10)
    }
  }

  const onSubmit = async (data: FormData) => {
    setServerError(null)

    const payload = {
      ...data,
      role: selectedRole,
      grade: selectedRole === 'STUDENT' ? Number(data.grade) : null,
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const json = await res.json()
      setServerError(
        json.error?.email?.[0] || 
        json.error?.grade?.[0] || 
        json.error?.dateOfBirth?.[0] || 
        'Đăng ký tài khoản thất bại'
      )
      return
    }

    // Tự động đăng nhập
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError('Đăng ký thành công! Vui lòng chuyển sang trang Đăng nhập để tiếp tục.')
      return
    }

    if (selectedRole === 'TEACHER') {
      router.push('/teacher/dashboard')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <div className="w-full min-h-screen bg-[#FBF6EC] flex items-center justify-center p-4 sm:p-6 lg:p-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* FRAME NGANG (HORIZONTAL SPLIT CARD) */}
      <div className="w-full max-w-5xl bg-white border-2 border-[#1D2B4F] shadow-[12px_12px_0_#E7DEC9] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* CỘT TRÁI (BANNER GIỚI THIỆU - COL-SPAN-5) */}
        <div className="lg:col-span-5 bg-[#1D2B4F] text-[#FBF6EC] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Họa tiết trang trí nền */}
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
                Khởi đầu hành trình <em className="italic text-[#E3A73B]">bứt phá điểm số</em>
              </h2>
              <p className="text-[#A2B1C6] text-sm leading-relaxed">
                Nền tảng ôn thi tiếng Anh THPT Quốc gia 2026 thế hệ mới kết hợp AI thông minh và ngân hàng đề thi chuẩn Bộ GD&ĐT.
              </p>
            </div>

            {/* Tính năng nổi bật */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle2 size={18} className="text-[#E3A73B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#E1E9F2]">
                  <strong className="text-white block font-semibold">Đề thi 40 câu chuẩn 2026</strong>
                  Cập nhật 4 dạng bài: Điền từ quảng cáo, sắp xếp câu, đọc hiểu chuyên sâu.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <Sparkles size={18} className="text-[#E3A73B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#E1E9F2]">
                  <strong className="text-white block font-semibold">Luyện 4 kỹ năng tương tác</strong>
                  AI đánh giá phát âm Whisper, bài nghe đa chủ đề kèm transcript chi tiết.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <Award size={18} className="text-[#E3A73B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#E1E9F2]">
                  <strong className="text-white block font-semibold">Phân quyền Học sinh & Giáo viên</strong>
                  Giao diện và tính năng thiết kế chuyên biệt cho từng vai trò.
                </div>
              </div>
            </div>
          </div>

          {/* Footer cột trái */}
          <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#A2B1C6]">
            <span>© 2026 EnglishPro LMS</span>
            <span className="text-[#E3A73B]">Thế hệ mới 2026</span>
          </div>
        </div>

        {/* CỘT PHẢI (FORM ĐĂNG KÝ - COL-SPAN-7) */}
        <div className="lg:col-span-7 p-8 lg:p-10 bg-white flex flex-col justify-center">
          <div className="max-w-xl w-full mx-auto space-y-6">
            
            {/* Header Form */}
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#C1432E] font-bold mb-1">
                Tài khoản mới
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                Đăng ký tài khoản
              </h1>
              <p className="text-[#6B7A94] text-xs lg:text-sm mt-1">
                Lựa chọn đúng vai trò để hệ thống chuẩn bị lộ trình phù hợp
              </p>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-2 gap-3 bg-[#FBF6EC] p-1.5 rounded-2xl border-2 border-[#1D2B4F]">
              <button
                type="button"
                onClick={() => handleRoleSelect('STUDENT')}
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
                onClick={() => handleRoleSelect('TEACHER')}
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('role')} value={selectedRole} />

              {/* Hàng 1: Họ tên + Ngày sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1D2B4F] uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-[#C1432E]" />
                    Họ và tên
                  </label>
                  <input
                    {...register('name')}
                    placeholder={selectedRole === 'STUDENT' ? 'Nguyễn Văn An' : 'Thầy/Cô Nguyễn Thị Mai'}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border-2 border-[#E7DEC9] focus:border-[#1D2B4F] rounded-xl text-sm font-medium text-[#1D2B4F] transition-all outline-none"
                  />
                  {errors.name && <p className="text-[#C1432E] text-[11px] font-bold">{errors.name.message}</p>}
                </div>

                {/* Ngày sinh */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1D2B4F] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#C1432E]" />
                    Ngày sinh
                  </label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border-2 border-[#E7DEC9] focus:border-[#1D2B4F] rounded-xl text-sm font-medium text-[#1D2B4F] transition-all outline-none"
                  />
                  {errors.dateOfBirth && <p className="text-[#C1432E] text-[11px] font-bold">{errors.dateOfBirth.message}</p>}
                </div>
              </div>

              {/* Hàng 2: Email + (Khối lớp nếu là học sinh) */}
              <div className={`grid gap-4 ${selectedRole === 'STUDENT' ? 'grid-cols-1 sm:grid-cols-12' : 'grid-cols-1'}`}>
                {/* Email / Gmail */}
                <div className={`space-y-1 ${selectedRole === 'STUDENT' ? 'sm:col-span-7' : 'w-full'}`}>
                  <label className="text-[11px] font-bold text-[#1D2B4F] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={13} className="text-[#C1432E]" />
                    {selectedRole === 'STUDENT' ? 'Gmail / Email học sinh' : 'Email giáo viên'}
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder={selectedRole === 'STUDENT' ? 'hocsinh@gmail.com' : 'giaovien@school.edu.vn'}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border-2 border-[#E7DEC9] focus:border-[#1D2B4F] rounded-xl text-sm font-medium text-[#1D2B4F] transition-all outline-none"
                  />
                  {errors.email && <p className="text-[#C1432E] text-[11px] font-bold">{errors.email.message}</p>}
                </div>

                {/* Khối lớp (Chỉ hiện cho Học sinh) */}
                {selectedRole === 'STUDENT' && (
                  <div className="space-y-1 sm:col-span-5 animate-in fade-in duration-300">
                    <label className="text-[11px] font-bold text-[#1D2B4F] uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-[#C1432E]" />
                      Khối lớp
                    </label>
                    <select
                      {...register('grade')}
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border-2 border-[#E7DEC9] focus:border-[#1D2B4F] rounded-xl text-sm font-bold text-[#1D2B4F] transition-all outline-none cursor-pointer"
                    >
                      <option value={10}>Lớp 10</option>
                      <option value={11}>Lớp 11</option>
                      <option value={12}>Lớp 12 (Thi THPT)</option>
                    </select>
                    {errors.grade && <p className="text-[#C1432E] text-[11px] font-bold">{errors.grade.message}</p>}
                  </div>
                )}
              </div>

              {/* Hàng 3: Mật khẩu */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1D2B4F] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-[#C1432E]" />
                  Mật khẩu
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border-2 border-[#E7DEC9] focus:border-[#1D2B4F] rounded-xl text-sm font-medium text-[#1D2B4F] transition-all outline-none"
                />
                {errors.password && <p className="text-[#C1432E] text-[11px] font-bold">{errors.password.message}</p>}
              </div>

              {/* Thông báo lỗi */}
              {serverError && (
                <div className="p-3 bg-[#FDECE9] border-2 border-[#C1432E] rounded-xl text-[#C1432E] text-xs font-bold">
                  {serverError}
                </div>
              )}

              {/* Nút bấm Đăng ký */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#1D2B4F] text-[#FBF6EC] rounded-xl text-xs lg:text-sm font-bold border-2 border-[#1D2B4F] shadow-[4px_4px_0_#C1432E] hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0_#C1432E] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span>{isSubmitting ? 'ĐANG KHỞI TẠO...' : `ĐĂNG KÝ VỚI TƯ CÁCH ${selectedRole === 'STUDENT' ? 'HỌC SINH' : 'GIÁO VIÊN'}`}</span>
                <ArrowRight size={16} />
              </button>

              {/* Link chuyển đăng nhập */}
              <p className="text-center text-xs text-[#6B7A94] font-medium pt-2">
                Đã có tài khoản EnglishPro?{' '}
                <Link href="/login" className="text-[#C1432E] font-bold hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
