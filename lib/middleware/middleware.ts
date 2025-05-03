import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { Role } from "@prisma/client"

// Définition de la hiérarchie des rôles
const roleHierarchy: Record<Role, number> = {
  CUSTOMER: 0,
  MANAGER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

// Vérification si un rôle a accès à un niveau de permission requis
const hasRoleAccess = (userRole: Role, requiredRole: Role): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si l'utilisateur est authentifié
  if (token) {
    // Redirection des utilisateurs authentifiés depuis /auth
    if (pathname === "/auth") {
      const redirectUrl = hasRoleAccess(token.role as Role, Role.MANAGER)
        ? "/dashboard"
        : "/"
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    // Protection des routes /dashboard pour les non-managers/admins
    if (
      pathname.startsWith("/dashboard") &&
      !hasRoleAccess(token.role as Role, Role.MANAGER)
    ) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  } else {
    // Redirection des utilisateurs non authentifiés essayant d'accéder aux routes protégées
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/auth", "/dashboard/:path*"], // Appliquer aux routes /auth et /dashboard
}
