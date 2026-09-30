export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full min-h-screen bg-[#FBF6EC]">
      {children}
    </div>
  )
}
