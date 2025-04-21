// lib/api-permissions.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { hasPermission } from "@/lib/permissions"
import { Permission } from "@/lib/permissions"
import { Role } from "@prisma/client"

export async function checkPermission(
  permission: Permission
): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role as Role | undefined

  if (!userRole || !hasPermission(userRole, permission)) {
    return NextResponse.json(
      { error: "Vous n'avez pas la permission requise pour cette action" },
      { status: 403 }
    )
  }

  return null
}
