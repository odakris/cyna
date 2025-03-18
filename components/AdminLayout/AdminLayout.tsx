// components/AdminLayout/AdminLayout.tsx
"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { Role } from "@prisma/client"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Ne redirige pas si déjà sur /auth ou si la session est en chargement
    if (pathname === "/auth" || status === "loading") return

    if (
      status === "unauthenticated" ||
      (session && session.user.role !== Role.ADMIN)
    ) {
      router.push("/auth")
    }
  }, [status, session, router, pathname])

  if (status === "loading") return <p>Chargement...</p>

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Back-Office</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/dashboard"
                className="block p-2 hover:bg-gray-700"
              >
                Tableau de bord
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className="block p-2 hover:bg-gray-700"
              >
                Produits
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left p-2 hover:bg-gray-700"
              >
                Déconnexion
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  )
}
