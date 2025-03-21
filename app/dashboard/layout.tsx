import AdminSideBar from "../../components/Admin/AdminSideBar"
import AdminWelcomeLabel from "../../components/Admin/AdminWelcomeLabel"

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-min-screen">
      <AdminSideBar />
      <main className="flex-1 p-4">
        <AdminWelcomeLabel />
        {children}
      </main>
    </div>
  )
}
