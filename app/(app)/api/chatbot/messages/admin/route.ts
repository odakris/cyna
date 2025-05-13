import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { ConversationStatus, MessageType, Role } from "@prisma/client"

// Route pour que les administrateurs puissent répondre à une conversation
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    // Vérifier les permissions (seuls les admins/managers peuvent répondre)
    if (
      !session ||
      ![Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN]
        .toString()
        .includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { content, conversationId } = await req.json()

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: "Message content and conversation ID are required" },
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

    // Créer le message de l'administrateur
    const adminMessage = await prisma.chatMessage.create({
      data: {
        content,
        message_type: MessageType.ADMIN,
        id_conversation: conversationId,
      },
    })

    // Si la conversation était en attente, la passer en active
    if (conversation.status === ConversationStatus.PENDING_ADMIN) {
      await prisma.chatConversation.update({
        where: { id_conversation: conversationId },
        data: { status: ConversationStatus.ACTIVE },
      })
    }

    return NextResponse.json({
      success: true,
      message: adminMessage,
    })
  } catch (error) {
    // console.error("Error sending admin message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
