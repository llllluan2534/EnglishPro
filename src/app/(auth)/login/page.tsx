'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email hoặc mật khẩu không đúng')
      return
    }

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-slate-300"
        />
        {errors.email && <p className="text-red-500 text-[11px] font-medium ml-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
          <button type="button" className="text-[11px] font-bold text-accent hover:underline">Quên mật khẩu?</button>
        </div>
        <input
          {...register('password')}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-slate-300"
        />
        {errors.password && <p className="text-red-500 text-[11px] font-medium ml-1">{errors.password.message}</p>}
      </div>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-xl border border-red-100 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-foreground text-background rounded-2xl text-sm font-bold hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>

      <p className="text-center text-sm text-slate-400 font-medium pt-4">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-slate-900 hover:text-accent font-bold transition-colors">
          Đăng ký miễn phí
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px] space-y-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200 text-white font-bold text-xs">
            EP
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mừng bạn quay lại</h1>
          <p className="text-slate-400 text-lg font-medium">Tiếp tục hành trình chinh phục tiếng Anh</p>
        </div>

        <div className="bg-white">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-300">Đang tải...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
