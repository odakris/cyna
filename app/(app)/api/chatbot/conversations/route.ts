// Route pour créer une nouvelle conversation
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { ConversationStatus, MessageType, Role } from "@prisma/client"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const { userId, email } = await req.json()

    // Créer une nouvelle conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        status: ConversationStatus.ACTIVE,
        email: email || session?.user?.email || null,
        id_user: session?.user?.id_user
          ? session.user.id_user
          : userId
            ? parseInt(userId)
            : null,
      },
    })

    // Ajouter un message de bienvenue
    await prisma.chatMessage.create({
      data: {
        content:
          "Bonjour ! Je suis l'assistant virtuel de CYNA. Comment puis-je vous aider aujourd'hui ?",
        message_type: MessageType.BOT,
        id_conversation: conversation.id_conversation,
      },
    })

    return NextResponse.json({
      success: true,
      conversationId: conversation.id_conversation,
    })
  } catch (error) {
    console.error("Error creating chatbot conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}

// Route pour récupérer toutes les conversations (pour le backoffice)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Vérification des permissions (seuls les admins/managers peuvent voir)
    const session = await getServerSession(authOptions)

    if (
      !session ||
      ![Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN]
        .toString()
        .includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Paramètres de filtrage
    const { searchParams } = req.nextUrl
    const status = searchParams.get("status") || undefined
    const limit = parseInt(searchParams.get("limit") || "50")

    // Récupérer les conversations
    const conversations = await prisma.chatConversation.findMany({
      where: {
        status: status as ConversationStatus | undefined,
      },
      include: {
        user: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        messages: {
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updated_at: "desc",
      },
      take: limit,
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching chatbot conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
