import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { hasPermission, Permission } from "@/lib/permissions"
import { Role } from "@prisma/client"

export const checkPermission = async (permission: Permission) => {
  const session = await getServerSession(authOptions)
  console.log("Session dans checkPermission:", session)
  console.log("Permission vérifiée:", permission)
  if (!session?.user) {
    console.error("Session utilisateur absente")
    return NextResponse.json(
      { error: "Vous devez être connecté" },
      { status: 401 }
    )
  }

  console.log("Rôle utilisateur dans checkPermission:", session.user.role)
  if (!hasPermission(session.user.role as Role, permission)) {
    console.error(
      `Permission ${permission} refusée pour le rôle ${session.user.role}`
    )
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 })
  }

  console.log(
    `Permission ${permission} accordée pour le rôle ${session.user.role}`
  )
  return null
}
