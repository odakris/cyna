import { NextRequest, NextResponse } from "next/server"
import { passwordResetService } from "@/lib/services/password-reset-service"
import { z } from "zod"

// Schema de validation pour la requête
const verifySchema = z.object({
  token: z.string().min(1, "Le token est requis"),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer et valider le corps de la requête
    const body = await request.json()
    const result = verifySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Token invalide" }, { status: 400 })
    }

    const { token } = result.data

    // Vérifier la validité du token
    const tokenCheck = await passwordResetService.verifyResetToken(token)

    if (!tokenCheck.isValid) {
      return NextResponse.json(
        { error: "Le lien de réinitialisation est invalide ou a expiré" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        valid: true,
        message: "Token valide",
      },
      { status: 200 }
    )
  } catch (error) {
    // console.error("Erreur lors de la vérification du token:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification du token" },
      { status: 500 }
    )
  }
}
