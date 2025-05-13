import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../(app)/api/auth/[...nextauth]/route"
import { getUserById } from "@/lib/services/user-service"

export async function POST(req: Request) {
  try {
    console.log("[check-password] Requête reçue")

    const body = await req.text()
    console.log("[check-password] Corps brut reçu :", body)

    let password: string
    try {
      const json = JSON.parse(body)
      password = json.password
      console.log("[check-password] Mot de passe extrait")
    } catch (parseErr) {
      // console.error("[check-password] Erreur JSON :", parseErr)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    console.log("[check-password] Session :", session)

    if (!session?.user?.id_user) {
      console.warn("[check-password] Utilisateur non connecté")
      return NextResponse.json({ isValid: false }, { status: 401 })
    }

    const user = await getUserById(session.user.id_user)
    if (!user) {
      console.warn("[check-password] Utilisateur introuvable")
      return NextResponse.json({ isValid: false }, { status: 404 })
    }

    if (!user.password) {  // Assurez-vous d'utiliser 'password' ici
      // console.error("[check-password] Mot de passe non trouvé pour l'utilisateur")
      return NextResponse.json({ isValid: false }, { status: 500 })
    }

    console.log("[check-password] Comparaison des mots de passe")
    const isValid = await bcrypt.compare(password, user.password)  // Utilisez 'user.password' ici

    console.log("[check-password] Résultat :", isValid)
    return NextResponse.json({ isValid })
  } catch (err) {
    // console.error("[check-password] Erreur serveur :", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
