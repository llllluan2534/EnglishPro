import TeacherSidebar from "@/components/layout/TeacherSidebar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <TeacherSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50/50 px-12 py-10">
        {children}
      </main>
    </div>
  )
}
