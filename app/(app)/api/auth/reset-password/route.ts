import { NextRequest, NextResponse } from "next/server"
import { passwordResetService } from "@/lib/services/password-reset-service"
import { z } from "zod"

// Schema de validation pour la requête
const resetSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer et valider le corps de la requête
    const body = await request.json()
    const result = resetSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      )
    }

    const { token, newPassword } = result.data

    // Vérifier d'abord si le token est valide
    const tokenCheck = await passwordResetService.verifyResetToken(token)

    if (!tokenCheck.isValid) {
      return NextResponse.json(
        { error: "Le lien de réinitialisation est invalide ou a expiré" },
        { status: 400 }
      )
    }

    // Réinitialiser le mot de passe
    const resetResult = await passwordResetService.resetPassword(
      token,
      newPassword
    )

    if (!resetResult.success) {
      return NextResponse.json({ error: resetResult.message }, { status: 400 })
    }

    return NextResponse.json({ message: resetResult.message }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error)
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la réinitialisation du mot de passe",
      },
      { status: 500 }
    )
  }
}
