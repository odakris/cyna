import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import userService from "@/lib/services/user-service"

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json()
        if (!token) {
            return NextResponse.json({ message: "Token manquant" }, { status: 400 })
        }

        // Rechercher la demande de vérification
        const verification = await prisma.emailVerification.findUnique({
            where: { token },
            include: { user: true },
        })

        if (!verification) {
            return NextResponse.json({ message: "Token invalide" }, { status: 400 })
        }

        if (verification.expiresAt < new Date()) {
            await prisma.emailVerification.delete({ where: { token } })
            return NextResponse.json({ message: "Token expiré" }, { status: 400 })
        }

        // Mettre à jour l'e-mail de l'utilisateur
        await userService.updateUser(verification.userId, {
            first_name: verification.user.first_name,
            last_name: verification.user.last_name,
            email: verification.newEmail,
            password: verification.user.password,
            role: verification.user.role,
            email_verified: true,
            two_factor_enabled: verification.user.two_factor_enabled,
        })

        // Supprimer la demande de vérification
        await prisma.emailVerification.delete({ where: { token } })

        return NextResponse.json({ message: "E-mail vérifié avec succès" })
    } catch (error) {
        console.error("Erreur dans POST /api/verify-email:", error)
        return NextResponse.json({ message: "Erreur lors de la vérification" }, { status: 500 })
    }
}
