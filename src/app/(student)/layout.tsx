import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StudentSidebar from '@/components/layout/StudentSidebar'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  if (session.user.role !== 'STUDENT') {
    // Nếu là giáo viên thì về dashboard giáo viên
    if (session.user.role === 'TEACHER') {
      redirect('/teacher/dashboard')
    }
    // Admin thì về admin dashboard
    if (session.user.role === 'ADMIN') {
      redirect('/admin/dashboard')
    }
  }

  return (
    <div className="flex h-screen bg-[#FDFDFF]">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 sm:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}
