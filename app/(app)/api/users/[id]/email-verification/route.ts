import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import { Resend } from "resend"
import { userFormSchema } from "@/lib/validations/user-schema"
import userService from "@/lib/services/user-service"
import { z } from "zod"
import bcrypt from "bcrypt"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params
    console.log("POST /api/users/[id]/email-verification - Params:", params)

    // Vérifier la session
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? { user: session.user } : "No session")
    if (!session || session.user.id_user.toString() !== params.id) {
        console.error("Unauthorized - Session user ID:", session?.user.id_user, "Requested ID:", params.id)
        return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    try {
        console.log("Parsing request body...")
        const body = await req.json()
        console.log("Request body:", body)

        console.log("Validating data with userFormSchema...")
        const data = userFormSchema.partial().parse(body)
        const id = parseInt(params.id)
        console.log("Parsed ID:", id, "Validated data:", data)

        // Vérifier si l'utilisateur existe
        console.log("Fetching user by ID:", id)
        const user = await userService.getUserById(id)
        if (!user) {
            console.error("User not found - ID:", id)
            return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 })
        }
        console.log("User found:", { id_user: user.id_user, email: user.email })

        // Si current_password et new_password sont fournis, vérifier et mettre à jour le mot de passe
        if (body.currentPassword && body.newPassword) {
            console.log("Password update requested.")

            // Vérifier que l'ancien mot de passe est correct
            const isPasswordValid = await bcrypt.compare(body.currentPassword, user.password)
            if (!isPasswordValid) {
                console.error("Mot de passe actuel incorrect.")
                return NextResponse.json({ message: "Mot de passe actuel incorrect." }, { status: 400 })
            }

            // Hacher le nouveau mot de passe
            const hashedNewPassword = await bcrypt.hash(body.newPassword, 10)
            console.log("New password hashed.")

            // Mettre à jour user.password pour l'enregistrement plus bas
            user.password = hashedNewPassword
        }


        // Vérifier si l'e-mail est déjà utilisé
        if (data.email && data.email !== user.email) {
            console.log("Checking if email is already used:", data.email)
            const existingUser = await userService.getUserByEmail(data.email)
            if (existingUser && existingUser.id_user !== id) {
                console.error("Email already in use:", data.email)
                return NextResponse.json({ message: "Cet e-mail est déjà utilisé" }, { status: 400 })
            }
            console.log("Email is available:", data.email)
        }

        // Mettre à jour prénom/nom immédiatement
        console.log("Updating user - ID:", id, "Data:", {
            first_name: data.first_name || user.first_name,
            last_name: data.last_name || user.last_name,
        })
        await userService.updateUser(id, {
            first_name: data.first_name || user.first_name,
            last_name: data.last_name || user.last_name,
            email: user.email, // l'email ne change pas directement ici
            password: user.password,
            role: user.role,
            email_verified: user.email_verified,
            two_factor_enabled: user.two_factor_enabled,
        })
        console.log("User updated successfully - ID:", id)

        // Si l'e-mail a changé, générer un token et envoyer un email
        if (data.email && data.email !== user.email) {
            console.log("Preparing email verification...")

            if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.NEXTAUTH_URL) {
                console.error("Missing environment variables:", {
                    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
                    EMAIL_FROM: !!process.env.EMAIL_FROM,
                    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
                })
                return NextResponse.json({ message: "Erreur de configuration du serveur" }, { status: 500 })
            }

            const token = uuidv4()
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // expire dans 24h
            console.log("Creating EmailVerification record...")

            await prisma.emailVerification.create({
                data: {
                    userId: id,
                    newEmail: data.email,
                    token,
                    expiresAt,
                },
            })
            console.log("EmailVerification record created successfully.")

            // Envoyer l'e-mail de confirmation
            const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
            console.log("Sending verification email to:", data.email)

            const { data: emailData, error } = await resend.emails.send({
                from: process.env.EMAIL_FROM,
                to: data.email,
                subject: "Vérifiez votre nouvelle adresse e-mail",
                html: `
          <p>Bonjour ${data.first_name || user.first_name} ${data.last_name || user.last_name},</p>
          <p>Veuillez cliquer sur le lien suivant pour vérifier votre nouvelle adresse e-mail :</p>
          <p><a href="${verificationUrl}">Vérifier mon e-mail</a></p>
          <p>Ce lien expire dans 24 heures.</p>
          <p>Si vous n'avez pas demandé ce changement, ignorez cet e-mail.</p>
          <p>Merci,</p>
          <p>L'équipe Cyna SaaS</p>
        `,
            })

            if (error) {
                console.error("Erreur lors de l'envoi de l'e-mail de vérification:", error)
                throw new Error(`Erreur lors de l'envoi de l'e-mail: ${error.message}`)
            }

            console.log(`Verification email sent successfully! Email ID: ${emailData?.id}`)

            return NextResponse.json({ message: "Un e-mail de confirmation a été envoyé à votre nouvelle adresse." })
        }

        return NextResponse.json({ message: "Informations mises à jour avec succès." })

    } catch (error) {
        console.error("Erreur dans POST /api/users/[id]/email-verification:", error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Données invalides", details: error.errors }, { status: 400 })
        }
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
        return NextResponse.json({ message: `Erreur lors de la mise à jour: ${errorMessage}` }, { status: 500 })
    }
}
