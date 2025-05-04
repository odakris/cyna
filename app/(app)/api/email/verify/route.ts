import { NextRequest, NextResponse } from "next/server"
import { emailVerificationService } from "@/lib/services/email-verification-service"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("API de vérification d'email appelée")

    // Récupérer et valider le corps de la requête
    let body
    try {
      body = await request.json()
      console.log("📨 Corps de la requête:", body)
    } catch (error) {
      console.error("Erreur de parsing JSON:", error)
      return NextResponse.json(
        { success: false, message: "Format de requête invalide" },
        { status: 400 }
      )
    }

    // Vérifier que le token est présent
    if (!body || !body.token) {
      console.error("Token manquant dans la requête")
      return NextResponse.json(
        { success: false, message: "Token manquant" },
        { status: 400 }
      )
    }

    const { token } = body
    console.log(`Vérification du token: ${token.substring(0, 10)}...`)

    // Vérifier l'email avec le token fourni
    const verificationResult = await emailVerificationService.verifyEmail(token)
    console.log("Résultat de vérification:", verificationResult)

    // Retourner le résultat
    return NextResponse.json(verificationResult, {
      status: verificationResult.success ? 200 : 400,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la vérification de l'email",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}
