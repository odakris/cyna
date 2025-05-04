import { ReactNode } from "react"
import AdminSideBar from "@/components/Admin/AdminSideBar"
import AdminWelcomeLabel from "@/components/Admin/AdminWelcomeLabel"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import MessageNotificationProvider from "@/components/Admin/MessageNotificationProvider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas accès au tableau de bord." />
      }
    >
      <MessageNotificationProvider>
        <div className="flex min-h-screen bg-slate-50 relative">
          {/* Sidebar - passe le rôle à AdminSideBar */}
          <AdminSideBar role={role} />

          {/* Main content avec marge responsive */}
          <main className="flex-1 transition-all duration-300 ease-in-out md:ml-52 w-full">
            <div className="mx-auto p-2 sm:p-3 md:p-6 max-w-full">
              {/* Padding ajusté pour le contenu */}
              <div className="pt-12 pb-2 md:pt-0 md:pb-0">
                <AdminWelcomeLabel />
                <div className="mt-3 sm:mt-4 md:mt-6 bg-white rounded-lg shadow p-2 sm:p-3 md:p-6">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </MessageNotificationProvider>
    </RoleGuard>
  )
}
