import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route"
import { ConversationStatus, Role } from "@prisma/client"
import { validateId } from "@/lib/utils/utils"

// Récupérer une conversation spécifique avec ses messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params
    const conversationId = validateId(resolvedParams.id)

    // Vérifier les permissions
    const conversation = await prisma.chatConversation.findUnique({
      where: { id_conversation: conversationId ?? undefined },
      include: { user: true },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Si l'utilisateur n'est pas admin/manager et n'est pas le propriétaire de la conversation
    if (
      !session ||
      (![Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN]
        .toString()
        .includes(session.user.role as string) &&
        conversation.id_user !==
        (session.user.id_user ? session.user.id_user : null))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Récupérer les messages de la conversation
    const messages = await prisma.chatMessage.findMany({
      where: { id_conversation: conversationId ?? undefined },
      orderBy: { created_at: "asc" },
    })

    return NextResponse.json({
      conversation,
      messages,
    })
  } catch (error) {
    // console.error(`Error fetching conversation ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}

// Mettre à jour le statut d'une conversation (pour fermer ou réactiver)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params
    const conversationId = validateId(resolvedParams.id)

    if (conversationId === null || isNaN(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation ID" },
        { status: 400 }
      )
    }

    // Vérifier les permissions (seuls les admins/managers peuvent modifier)
    if (
      !session ||
      ![Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN]
        .toString()
        .includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { status } = await req.json()

    if (
      ![
        ConversationStatus.ACTIVE,
        ConversationStatus.PENDING_ADMIN,
        ConversationStatus.CLOSED,
      ].includes(status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Mettre à jour le statut
    const updatedConversation = await prisma.chatConversation.update({
      where: { id_conversation: conversationId },
      data: { status },
    })

    return NextResponse.json(updatedConversation)
  } catch (error) {
    // console.error(`Error updating conversation ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    )
  }
}

// Supprimer une conversation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params
    const conversationId = validateId(resolvedParams.id)

    if (conversationId === null || isNaN(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation ID" },
        { status: 400 }
      )
    }

    // Vérifier les permissions (seuls les admins/managers peuvent supprimer)
    if (
      !session ||
      ![Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN]
        .toString()
        .includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    // Supprimer la conversation
    const deletedConversation = await prisma.chatConversation.delete({
      where: { id_conversation: conversationId },
    })
    // Supprimer les messages associés
    await prisma.chatMessage.deleteMany({
      where: { id_conversation: conversationId },
    })
    return NextResponse.json(deletedConversation)
  } catch (error) {
    // console.error(`Error deleting conversation ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    )
  }
}
