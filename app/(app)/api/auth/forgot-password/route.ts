import { NextRequest, NextResponse } from "next/server"
import { passwordResetService } from "@/lib/services/password-reset-service"
import { z } from "zod"

// Schema de validation pour la requête
const requestSchema = z.object({
  email: z.string().email("Adresse email invalide"),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer et valider le corps de la requête
    const body = await request.json()
    const result = requestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const { email } = result.data

    // Traiter la demande de réinitialisation
    const resetResult = await passwordResetService.requestPasswordReset(email)

    // Toujours renvoyer un succès, même si l'email n'existe pas (sécurité)
    return NextResponse.json(
      { message: resetResult.message },
      { status: resetResult.success ? 200 : 400 }
    )
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error)
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la demande de réinitialisation",
      },
      { status: 500 }
    )
  }
}
