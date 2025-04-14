// lib/utils/authorize.ts
import { getServerSession } from "next-auth"
import { authOptions } from "../../app/(app)/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function requireRole(role: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== role) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Non autorisé" }, { status: 403 }),
    }
  }
  return { authorized: true, session }
}
