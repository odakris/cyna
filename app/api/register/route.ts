import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    // Vérifiez si l'email existe déjà
    const existingClient = await prisma.client.findUnique({
      where: { email },
    })
    if (existingClient) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hachez le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créez le client dans la base de données
    const client = await prisma.client.create({
      data: {
        last_name: lastName,
        first_name: firstName,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: "Client créé avec succès", client },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    )
  }
}
