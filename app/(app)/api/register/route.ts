import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { registerApiSchema } from "@/lib/validations/register-schema"
import Stripe from "stripe"
import { emailVerificationService } from "@/lib/services/email-verification-service"

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
})

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // Vérifier que le corps de la requête est valide
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Le corps de la requête est invalide ou mal formé" },
        { status: 400 }
      )
    }

    // Valider les données avec Zod
    const result = registerApiSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, password } = result.data

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer un utilisateur avec tous les champs requis
    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER,
        email_verified: false, // L'email n'est pas encore vérifié
        active: true, // L'utilisateur est actif par défaut
      },
    })

    // Créer un client Stripe
    const stripeCustomer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
    })

    // Stocker l'ID du client Stripe en base de données
    await prisma.user.update({
      where: { id_user: user.id_user },
      data: {
        stripeCustomerId: stripeCustomer.id,
      },
    })

    // Envoyer l'email de vérification
    await emailVerificationService.sendVerificationEmail(
      user.id_user,
      email,
      firstName
    )

    // Retourner une réponse de succès sans les informations sensibles
    return NextResponse.json(
      {
        message:
          "Utilisateur créé avec succès. Un email de vérification a été envoyé.",
        user: {
          id: user.id_user,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    // Gestion sécurisée des erreurs
    if (error instanceof Error) {
      // console.error("Erreur lors de l'inscription:", error.message)
    } else {
      // console.error("Erreur inconnue lors de l'inscription:", error)
    }
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    )
  }
}
