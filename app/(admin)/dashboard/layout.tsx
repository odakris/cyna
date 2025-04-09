// app/dashboard/layout.tsx (ou app/(admin)/dashboard/layout.tsx selon votre structure)
import AdminSideBar from "@/components/Admin/AdminSideBar"
import AdminWelcomeLabel from "@/components/Admin/AdminWelcomeLabel"

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSideBar />
      <main className="flex-1 w-0">
        <div className="mx-auto p-6">
          <AdminWelcomeLabel />
          <div className="mt-6 bg-white rounded-lg shadow p-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
