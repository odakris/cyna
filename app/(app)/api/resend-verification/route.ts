// app/api/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server"
import { emailVerificationService } from "@/lib/services/email-verification-service"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const body = await request.json()
    const { email, userId } = body

    if (!email) {
      return NextResponse.json(
        { error: "Adresse email requise" },
        { status: 400 }
      )
    }

    // Si userId n'est pas fourni, chercher l'utilisateur par email
    let user

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id_user: userId },
        select: { id_user: true, first_name: true },
      })
    } else {
      user = await prisma.user.findUnique({
        where: { email },
        select: { id_user: true, first_name: true },
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Utiliser emailVerificationService
    const emailSent = await emailVerificationService.sendVerificationEmail(
      user.id_user,
      email,
      user.first_name ?? undefined
    )

    if (emailSent) {
      return NextResponse.json(
        { success: true, message: "Email de vérification envoyé avec succès" },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: "Échec de l'envoi de l'email" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de vérification:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
