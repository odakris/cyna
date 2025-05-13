import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { hasPermission, Permission } from "@/lib/permissions"
import { Role } from "@prisma/client"

// Créer un cache simple pour les vérifications de permissions
const permissionCache = new Map()

export const checkPermission = async (permission: Permission) => {
  // Vérifier si la permission est dans le cache
  const cacheKey = permission
  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)
  }
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Vous devez être connecté" },
      { status: 401 }
    )
  }

  if (!hasPermission(session.user.role as Role, permission)) {
    /*console.error(
      `Permission ${permission} refusée pour le rôle ${session.user.role}`
    )*/
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 })
  }

  const result = null // Permission accordée
  // Mettre en cache le résultat (avec une courte durée de vie si nécessaire)
  permissionCache.set(cacheKey, result)
  return result
}
