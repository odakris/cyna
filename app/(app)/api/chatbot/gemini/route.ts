// app/(app)/api/chatbot/gemini/route.ts
import { NextRequest, NextResponse } from "next/server"
import { processChatbotMessageWithGemini } from "@/lib/services/gemini-service"
import { prisma } from "@/lib/prisma"
import { MessageType, ConversationStatus } from "@prisma/client"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { content, conversationId } = await req.json()

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: "Message content and conversation ID are required" },
        { status: 400 }
      )
    }

    // Vérifier si la conversation existe
    const conversation = await prisma.chatConversation.findUnique({
      where: { id_conversation: parseInt(conversationId.toString()) },
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

    // Récupérer l'historique des messages
    const messageHistory = await prisma.chatMessage.findMany({
      where: { id_conversation: parseInt(conversationId.toString()) },
      orderBy: { created_at: "asc" },
    })

    // Enregistrer d'abord le message de l'utilisateur
    const userMessage = await prisma.chatMessage.create({
      data: {
        content,
        message_type: MessageType.USER,
        id_conversation: parseInt(conversationId.toString()),
      },
    })

    // Traiter avec Gemini
    let response
    try {
      response = await processChatbotMessageWithGemini(
        content,
        { id_conversation: conversationId },
        messageHistory
      )
    } catch (aiError) {
      console.error(
        "Erreur Gemini, fallback vers le système standard:",
        aiError
      )
      // Fallback vers le service standard
      const chatbotService = await import("@/lib/services/chatbot-service")
      response = await chatbotService.processChatbotMessage(content, {
        id_conversation: conversationId,
      })
    }

    // Vérifier si un support humain est nécessaire
    if (
      response.needsHumanSupport &&
      conversation.status === ConversationStatus.ACTIVE
    ) {
      await prisma.chatConversation.update({
        where: { id_conversation: parseInt(conversationId.toString()) },
        data: { status: ConversationStatus.PENDING_ADMIN },
      })
    }

    // Enregistrer la réponse du bot
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const botMessage = await prisma.chatMessage.create({
      data: {
        content: response.response,
        message_type: MessageType.BOT,
        id_conversation: parseInt(conversationId.toString()),
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
  } catch (error) {
    console.error("Error processing Gemini request:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}
