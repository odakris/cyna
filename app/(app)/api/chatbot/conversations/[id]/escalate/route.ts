import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { ConversationStatus } from "@prisma/client"

// Route pour escalader une conversation vers un support humain
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await getServerSession(authOptions)
    const conversationId = parseInt(params.id)

    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation ID" },
        { status: 400 }
      )
    }

    // Vérifier si la conversation existe
    const conversation = await prisma.chatConversation.findUnique({
      where: { id_conversation: conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Mettre à jour le statut pour indiquer qu'un humain est nécessaire
    const updatedConversation = await prisma.chatConversation.update({
      where: { id_conversation: conversationId },
      data: { status: ConversationStatus.PENDING_ADMIN },
    })

    // Ajouter un message système pour indiquer l'escalade
    await prisma.chatMessage.create({
      data: {
        content:
          "Cette conversation a été escaladée vers un conseiller. Un membre de notre équipe vous répondra dès que possible.",
        message_type: "BOT",
        id_conversation: conversationId,
      },
    })

    // Notifier les administrateurs (dans un système réel, cela pourrait être fait via un système de notifications)
    // Pour ce PoC, nous allons simplement enregistrer dans les logs

    console.log(`Conversation ${conversationId} escalated to human support`)

    return NextResponse.json({
      success: true,
      message: "Conversation escalated to human support",
      conversation: updatedConversation,
    })
  } catch (error) {
    console.error(`Error escalating conversation ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to escalate conversation" },
      { status: 500 }
    )
  }
}
