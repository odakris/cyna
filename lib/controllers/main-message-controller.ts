import { NextRequest, NextResponse } from "next/server"
import mainMessageService from "@/lib/services/main-message-service"
import { mainMessageSchema } from "@/lib/validations/main-message-schema"
import { ZodError } from "zod"

export const getActive = async (): Promise<NextResponse> => {
  try {
    const message = await mainMessageService.getActiveMessage()
    return NextResponse.json(message)
  } catch (error) {
    console.error("Controller - Error getting active message:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const getAll = async (): Promise<NextResponse> => {
  try {
    const messages = await mainMessageService.getAllMessages()
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Controller - Error getting all messages:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const getById = async (id: number): Promise<NextResponse> => {
  try {
    const message = await mainMessageService.getMessageById(id)

    if (!message) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error(`Controller - Error getting message ${id}:`, error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const create = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = mainMessageSchema.parse(body)
    const createdMessage = await mainMessageService.createMessage(data)

    return NextResponse.json(createdMessage, { status: 201 })
  } catch (error) {
    console.error("Controller - Error creating message:", error)
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const update = async (
  id: number,
  request: NextRequest
): Promise<NextResponse> => {
  try {
    const message = await mainMessageService.getMessageById(id)

    if (!message) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 })
    }

    const body = await request.json()
    const data = mainMessageSchema.parse(body)
    const updatedMessage = await mainMessageService.updateMessage(id, data)

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error(`Controller - Error updating message ${id}:`, error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const updatePartial = async (
  id: number,
  request: NextRequest
): Promise<NextResponse> => {
  try {
    const message = await mainMessageService.getMessageById(id)

    if (!message) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Controller - Error parsing JSON:", error)
      return NextResponse.json(
        { error: "Corps de requête JSON invalide" },
        { status: 400 }
      )
    }

    const partialData = mainMessageSchema.partial().parse(body)
    const updatedMessage = await mainMessageService.updatePartialMessage(
      id,
      partialData
    )

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error(`Controller - Error patching message ${id}:`, error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const remove = async (id: number): Promise<NextResponse> => {
  try {
    const deletedMessage = await mainMessageService.deleteMessage(id)
    return NextResponse.json(deletedMessage)
  } catch (error) {
    console.error(`Controller - Error deleting message ${id}:`, error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

const mainMessageController = {
  getActive,
  getAll,
  getById,
  create,
  update,
  updatePartial,
  remove,
}

export default mainMessageController
