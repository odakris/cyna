import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { processChatbotMessage } from "@/lib/services/chatbot-service"
import { ConversationStatus, MessageType } from "@prisma/client"

// Envoyer un message au chatbot
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const data = await req.json()

    // Accepter différents formats de l'ID de conversation
    const { content, conversationId } = data

    console.log("Données reçues:", { content, conversationId })

    if (!content || !conversationId) {
      console.error("Paramètres manquants:", { content, conversationId })
      return NextResponse.json(
        { error: "Message content and conversation ID are required" },
        { status: 400 }
      )
    }

    // Vérifier si la conversation existe
    const conversation = await prisma.chatConversation.findUnique({
      where: {
        id_conversation:
          typeof conversationId === "string"
            ? parseInt(conversationId)
            : conversationId,
      },
    })

    if (!conversation) {
      console.error("Conversation non trouvée:", conversationId)
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
    if (conversation.id_user === null && session?.user?.id_user) {
      await prisma.chatConversation.update({
        where: { id_conversation: conversation.id_conversation },
        data: { id_user: session.user.id_user },
      })
    }

    // Enregistrer le message de l'utilisateur
    const userMessage = await prisma.chatMessage.create({
      data: {
        content,
        message_type: MessageType.USER,
        id_conversation: conversation.id_conversation,
      },
    })

    // Traiter le message et obtenir une réponse du chatbot
    try {
      const response = await processChatbotMessage(content, conversation)

      // Si le chatbot détecte que la demande nécessite un support humain
      if (
        response.needsHumanSupport &&
        conversation.status === ConversationStatus.ACTIVE
      ) {
        // Mettre à jour le statut de la conversation
        await prisma.chatConversation.update({
          where: { id_conversation: conversation.id_conversation },
          data: { status: ConversationStatus.PENDING_ADMIN },
        })
      }

      // Enregistrer la réponse du chatbot
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const botMessage = await prisma.chatMessage.create({
        data: {
          content: response.response,
          message_type: MessageType.BOT,
          id_conversation: conversation.id_conversation,
        },
      })

      return NextResponse.json({
        success: true,
        message: userMessage,
        response: response.response,
        needsHumanSupport: response.needsHumanSupport,
        context: response.context,
        collectedData: response.collectedData,
      })
    } catch (processError) {
      console.error("Erreur dans processChatbotMessage:", processError)

      // Réponse de secours en cas d'erreur
      const fallbackResponse =
        "Je suis désolé, j'ai rencontré un problème technique. Notre équipe peut vous aider directement. Souhaitez-vous être mis en relation avec un conseiller ?"

      // Enregistrer une réponse de secours
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const botMessage = await prisma.chatMessage.create({
        data: {
          content: fallbackResponse,
          message_type: MessageType.BOT,
          id_conversation: conversation.id_conversation,
        },
      })

      return NextResponse.json({
        success: true,
        message: userMessage,
        response: fallbackResponse,
        needsHumanSupport: true,
      })
    }
  } catch (error) {
    console.error("Error processing chatbot message:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}

// Récupérer les messages d'une conversation
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const session = await getServerSession(authOptions)

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
