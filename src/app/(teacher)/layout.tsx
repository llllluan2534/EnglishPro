import TeacherSidebar from "@/components/layout/TeacherSidebar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FBF6EC]">
      <TeacherSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
