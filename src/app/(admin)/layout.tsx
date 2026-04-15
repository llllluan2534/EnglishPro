import AdminSidebar from "@/components/layout/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50/50 px-12 py-10">
        {children}
      </main>
    </div>
  )
}
