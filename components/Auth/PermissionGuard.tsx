// components/Auth/PermissionGuard.tsx
import { useSession } from "next-auth/react"
import { ReactNode } from "react"
import { Permission, hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"

interface PermissionGuardProps {
  children: ReactNode
  permission: Permission
  fallback?: ReactNode
}

const PermissionGuard = ({
  children,
  permission,
  fallback,
}: PermissionGuardProps) => {
  const { data: session } = useSession()
  const userRole = session?.user?.role as Role | undefined

  if (!userRole || !hasPermission(userRole, permission)) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

export default PermissionGuard
