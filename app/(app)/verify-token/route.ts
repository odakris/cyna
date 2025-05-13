import { NextRequest, NextResponse } from "next/server"
import { emailVerificationService } from "@/lib/services/email-verification-service"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Obtenir le token de l'URL
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      // console.error("Token manquant dans l'URL de vérification")
      return NextResponse.redirect(
        new URL("/email-verification-error", request.url)
      )
    }

    console.log(`Vérification du token: ${token.substring(0, 10)}...`)

    // Vérifier l'email
    const result = await emailVerificationService.verifyEmail(token)
    console.log("Résultat de la vérification:", result)

    if (result.success) {
      // Rediriger vers la page de succès
      return NextResponse.redirect(
        new URL("/email-verification-success", request.url)
      )
    } else {
      // Rediriger vers la page d'erreur
      return NextResponse.redirect(
        new URL("/email-verification-error", request.url)
      )
    }
  } catch (error) {
    // console.error("Erreur lors de la vérification:", error)
    return NextResponse.redirect(
      new URL("/email-verification-error", request.url)
    )
  }
}
