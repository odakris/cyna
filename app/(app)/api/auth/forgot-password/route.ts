import { NextRequest, NextResponse } from "next/server"
import { passwordResetService } from "@/lib/services/password-reset-service"
import { checkPermission } from "@/lib/api-permissions"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { email, adminRequest, userId } = body

    // Vérifier si c'est une demande administrative (depuis le backoffice)
    if (adminRequest === true) {
      // Vérifier les permissions administratives
      const permissionCheck = await checkPermission("users:edit")
      if (permissionCheck) {
        return permissionCheck // Retourne une réponse d'erreur si non autorisé
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Adresse email requise" },
        { status: 400 }
      )
    }

    // Demander la réinitialisation de mot de passe
    const result = await passwordResetService.requestPasswordReset(
      email,
      userId
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    // console.error("Erreur lors de la demande de réinitialisation:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
