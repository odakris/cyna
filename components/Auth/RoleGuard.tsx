"use client"

// components/Auth/RoleGuard.tsx
import { useSession } from "next-auth/react"
import { ReactNode } from "react"
import { Role } from "@prisma/client"
import AccessDenied from "./AccessDenied"

// Définition de la hiérarchie des rôles
export const roleHierarchy: Record<Role, number> = {
  CUSTOMER: 0,
  MANAGER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

interface RoleGuardProps {
  children: ReactNode
  requiredRole: Role
  fallback?: ReactNode
}

export const hasRoleAccess = (
  userRole: Role | undefined,
  requiredRole: Role
): boolean => {
  if (!userRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

const RoleGuard = ({ children, requiredRole, fallback }: RoleGuardProps) => {
  const { data: session, status } = useSession()

  const userRole = session?.user?.role as Role | undefined
  const hasAccess = hasRoleAccess(userRole, requiredRole)

  // Afficher un chargement si le statut est "loading"
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Chargement...
      </div>
    )
  }

  // Si l'utilisateur n'a pas accès, afficher le fallback ou le composant AccessDenied par défaut
  if (!hasAccess) {
    // Au lieu de rediriger, afficher simplement le composant fallback ou AccessDenied
    return fallback ? <>{fallback}</> : <AccessDenied />
  }

  // Si l'utilisateur a accès, afficher le contenu
  return <>{children}</>
}

export default RoleGuard
