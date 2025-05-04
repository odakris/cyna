// lib/controllers/contact-message-controller.ts
import { NextRequest, NextResponse } from "next/server"
import contactMessageService from "@/lib/services/contact-message-service"

export const getAll = async (): Promise<NextResponse> => {
  try {
    const messages = await contactMessageService.getAllMessages()
    return NextResponse.json(messages)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const getById = async (id: number): Promise<NextResponse> => {
  try {
    const message = await contactMessageService.getMessageById(id)

    if (!message) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const getUnread = async (): Promise<NextResponse> => {
  try {
    const messages = await contactMessageService.getUnreadMessages()
    return NextResponse.json(messages)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const create = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()

    // Validation simple
    if (
      !body.first_name ||
      !body.last_name ||
      !body.email ||
      !body.subject ||
      !body.message
    ) {
      return NextResponse.json(
        { error: "Prénom, nom, email, sujet et message sont requis" },
        { status: 400 }
      )
    }

    const createdMessage = await contactMessageService.createMessage({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      id_user: body.id_user || null,
    })

    return NextResponse.json(createdMessage, { status: 201 })
  } catch (error) {
    console.error("Controller - Error creating contact message:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const markAsRead = async (id: number): Promise<NextResponse> => {
  try {
    const updatedMessage = await contactMessageService.markMessageAsRead(id)
    return NextResponse.json(updatedMessage)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const respond = async (
  request: NextRequest,
  session?: { user?: { email: string; firstName: string; lastName: string } }
): Promise<NextResponse> => {
  try {
    const body = await request.json()

    if (!body.id_message || !body.response) {
      return NextResponse.json(
        { error: "ID du message et réponse sont requis" },
        { status: 400 }
      )
    }

    // Récupérer les infos de l'admin si disponibles
    const adminInfo = session?.user
      ? {
          email: session.user.email,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
        }
      : undefined

    const updatedMessage = await contactMessageService.respondToMessage(
      {
        id_message: body.id_message,
        response: body.response,
      },
      adminInfo
    )

    return NextResponse.json({
      message: "Réponse envoyée avec succès",
      data: updatedMessage,
    })
  } catch (error) {
    console.error("Controller - Error responding to message:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const remove = async (id: number): Promise<NextResponse> => {
  try {
    const deletedMessage = await contactMessageService.deleteMessage(id)
    return NextResponse.json(deletedMessage)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const getStats = async (): Promise<NextResponse> => {
  try {
    const stats = await contactMessageService.getMessageStats()
    return NextResponse.json(stats)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

const contactMessageController = {
  getAll,
  getById,
  getUnread,
  create,
  markAsRead,
  respond,
  remove,
  getStats,
}

export default contactMessageController
