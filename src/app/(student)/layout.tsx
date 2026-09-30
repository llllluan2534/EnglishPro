import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StudentSidebar from '@/components/layout/StudentSidebar'
import StudentPageWrapper from '@/components/layout/StudentPageWrapper'

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
    <div className="flex h-screen bg-[#FBF6EC] flex-col md:flex-row">
      <StudentSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <StudentPageWrapper>
          {children}
        </StudentPageWrapper>
      </main>
    </div>
  )
}
