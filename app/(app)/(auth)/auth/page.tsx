"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthTabs from "@/components/Auth/AuthTabs"
import { Role } from "@prisma/client"

export default function AuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      // console.log("Session role:", session.user.role) // Debugging log

      if (
        session.user.role === Role.SUPER_ADMIN ||
        session.user.role === Role.ADMIN ||
        session.user.role === Role.MANAGER
      ) {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    }
  }, [session, status, router])

  return (
    <div>
      <AuthTabs />
    </div>
  )
}
