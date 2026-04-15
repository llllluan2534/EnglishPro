'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'

const schema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  grade: z.coerce.number().int().min(10).max(12),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      setServerError(json.error?.email?.[0] || 'Đăng ký thất bại')
      return
    }

    // Đăng nhập ngay sau khi đăng ký thành công
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError('Đăng ký thành công nhưng không thể tự động đăng nhập. Vui lòng đăng nhập thủ công.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-[480px] space-y-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200 text-white font-bold text-xs">
            EP
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tạo tài khoản mới</h1>
          <p className="text-slate-400 text-lg font-medium">Bắt đầu hành trình chinh phục tiếng Anh ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Họ và tên</label>
              <input
                {...register('name')}
                placeholder="Nguyễn Văn An"
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-slate-300"
              />
              {errors.name && <p className="text-red-500 text-[11px] font-medium ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Lớp học</label>
              <select
                {...register('grade')}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer appearance-none"
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="name@email.com"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-slate-300"
            />
            {errors.email && <p className="text-red-500 text-[11px] font-medium ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mật khẩu</label>
            <input
              {...register('password')}
              type="password"
              placeholder="Ít nhất 8 ký tự"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-slate-300"
            />
            {errors.password && <p className="text-red-500 text-[11px] font-medium ml-1">{errors.password.message}</p>}
          </div>

          {serverError && (
            <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-xl border border-red-100 font-medium">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Đang khởi tạo...' : 'Đăng ký ngay'}
          </button>

          <p className="text-center text-sm text-slate-400 font-medium pt-4">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-slate-900 hover:text-accent font-bold transition-colors">
              Đăng nhập tại đây
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
