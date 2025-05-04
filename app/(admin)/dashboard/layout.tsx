// app/(admin)/dashboard/layout.tsx
import { ReactNode } from "react"
import AdminSideBar from "@/components/Admin/AdminSideBar"
import AdminWelcomeLabel from "@/components/Admin/AdminWelcomeLabel"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import MessageNotificationProvider from "@/components/Admin/MessageNotificationProvider"

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas accès au tableau de bord." />
      }
    >
      <MessageNotificationProvider>
        <div className="flex min-h-screen bg-slate-50">
          <AdminSideBar />
          <main className="flex-1 ml-52">
            <div className="mx-auto p-6">
              <AdminWelcomeLabel />
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </MessageNotificationProvider>
    </RoleGuard>
  )
}
