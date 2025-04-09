import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { Role } from "@/types/Types"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password } = body

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

    // Créer un utilisateur avec le rôle "client"
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.CLIENT,
      },
    })

    // Créer un enregistrement dans la table Client lié à l'utilisateur
    const client = await prisma.client.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        id_user: user.id_user,
      },
    })

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", user, client },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
