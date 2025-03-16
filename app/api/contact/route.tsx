import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { email, subject, message } = await req.json()

  if (!email || !subject || !message) {
    return NextResponse.json(
      { message: "Tous les champs sont requis" },
      { status: 400 }
    )
  }

  try {
    const newMessage = await prisma.message_Contact.create({
      data: { email, subject, message },
    })

    return NextResponse.json(
      { message: "Message enregistré avec succès", newMessage },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du message :", error)
    return NextResponse.json(
      { message: "Erreur serveur", error },
      { status: 500 }
    )
  }
}
