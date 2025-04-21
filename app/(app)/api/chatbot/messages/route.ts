import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { processChatbotMessage } from "@/lib/services/chatbot-service"
import { ConversationStatus, MessageType, Role } from "@prisma/client"

// Envoyer un message au chatbot
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
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

    // Si la conversation est fermée, ne pas permettre de nouveaux messages
    if (conversation.status === ConversationStatus.CLOSED) {
      return NextResponse.json(
        { error: "This conversation is closed" },
        { status: 400 }
      )
    }

    // Si c'est une nouvelle conversation d'un utilisateur connecté, mettre à jour l'ID utilisateur
    if (conversation.id_user === null && session?.user?.id) {
      await prisma.chatConversation.update({
        where: { id_conversation: conversationId },
        data: { id_user: parseInt(session.user.id) },
      })
    }

    // Enregistrer le message de l'utilisateur
    const userMessage = await prisma.chatMessage.create({
      data: {
        content,
        message_type: MessageType.USER,
        id_conversation: conversationId,
      },
    })

    // Traiter le message et obtenir une réponse du chatbot
    const { response, needsHumanSupport } = await processChatbotMessage(
      content,
      conversation
    )

    // Si le chatbot détecte que la demande nécessite un support humain
    if (
      needsHumanSupport &&
      conversation.status === ConversationStatus.ACTIVE
    ) {
      // Mettre à jour le statut de la conversation
      await prisma.chatConversation.update({
        where: { id_conversation: conversationId },
        data: { status: ConversationStatus.PENDING_ADMIN },
      })
    }

    // Enregistrer la réponse du chatbot
    const botMessage = await prisma.chatMessage.create({
      data: {
        content: response,
        message_type: MessageType.BOT,
        id_conversation: conversationId,
      },
    })

    return NextResponse.json({
      success: true,
      message: userMessage,
      response: botMessage.content,
      needsHumanSupport,
    })
  } catch (error) {
    console.error("Error processing chatbot message:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}

// Récupérer les messages d'une conversation (pour le backoffice)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    // Vérifier les permissions
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Paramètres de filtrage
    const { searchParams } = req.nextUrl
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a accès à cette conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id_conversation: parseInt(conversationId) },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Si l'utilisateur n'est pas admin et n'est pas le propriétaire de la conversation
    if (
      ![Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN]
        .toString()
        .includes(session.user.role as string) &&
      conversation.id_user !==
        (session.user.id ? parseInt(session.user.id) : null)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Récupérer les messages
    const messages = await prisma.chatMessage.findMany({
      where: { id_conversation: parseInt(conversationId) },
      orderBy: { created_at: "asc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
