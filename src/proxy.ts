import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Chưa đăng nhập → redirect về login
  if (!session) {
    if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/learn') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Học sinh cố truy cập trang giáo viên
  if (session?.user?.role === 'STUDENT' && pathname.startsWith('/teacher')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Giáo viên cố truy cập trang admin
  if (session?.user?.role === 'TEACHER' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/teacher/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)'],
}