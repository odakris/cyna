import { prisma } from "../prisma"
import { TransactionClient } from "@/types/Types"
import { MainMessageFormValues } from "@/lib/validations/main-message-schema"
import { MainMessage } from "@prisma/client"

export const findActiveMessage = async (): Promise<MainMessage | null> => {
  try {
    return await prisma.mainMessage.findFirst({
      where: { active: true },
      orderBy: { updated_at: "desc" },
    })
  } catch (error) {
    // console.error("Repository - Error fetching active message:", error)
    throw error
  }
}

export const findAll = async (): Promise<MainMessage[]> => {
  try {
    return await prisma.mainMessage.findMany({
      orderBy: { updated_at: "desc" },
    })
  } catch (error) {
    // console.error("Repository - Error fetching all messages:", error)
    throw error
  }
}

export const findById = async (id: number): Promise<MainMessage | null> => {
  try {
    return await prisma.mainMessage.findUnique({
      where: { id_main_message: id },
    })
  } catch (error) {
    // console.error(`Repository - Error fetching message with id ${id}:`, error)
    throw error
  }
}

export const create = async (
  data: MainMessageFormValues
): Promise<MainMessage> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Si le nouveau message est actif, désactiver tous les autres messages
      if (data.active) {
        await tx.mainMessage.updateMany({
          where: { active: true },
          data: { active: false },
        })
      }

      return await tx.mainMessage.create({
        data: {
          content: data.content.trim(),
          active: data.active,
          has_background: data.has_background,
          background_color: data.background_color || null,
          text_color: data.text_color || null,
        },
      })
    })
  } catch (error) {
    // console.error("Repository - Error creating message:", error)
    throw error
  }
}

export const update = async (
  id: number,
  data: MainMessageFormValues
): Promise<MainMessage> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si le message avec l'ID existe
      const messageExists = await tx.mainMessage.findUnique({
        where: { id_main_message: id },
      })

      if (!messageExists) {
        throw new Error(`Le message avec l'ID ${id} n'existe pas`)
      }

      // Si le message mis à jour est activé, désactiver tous les autres messages
      if (data.active) {
        await tx.mainMessage.updateMany({
          where: {
            id_main_message: { not: id },
            active: true,
          },
          data: { active: false },
        })
      }

      return await tx.mainMessage.update({
        where: { id_main_message: id },
        data: {
          content: data.content.trim(),
          active: data.active,
          has_background: data.has_background,
          background_color: data.background_color || null,
          text_color: data.text_color || null,
          updated_at: new Date(),
        },
      })
    })
  } catch (error) {
    // console.error(`Repository - Error updating message with id ${id}:`, error)
    throw error
  }
}

export const updatePartial = async (
  id: number,
  data: Partial<MainMessageFormValues>
): Promise<MainMessage> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si le message avec l'ID existe
      const messageExists = await tx.mainMessage.findUnique({
        where: { id_main_message: id },
      })

      if (!messageExists) {
        throw new Error(`Le message avec l'ID ${id} n'existe pas`)
      }

      // Si le message est activé, désactiver tous les autres messages
      // Mais uniquement si data.active est défini et true
      if (data.active === true) {
        await tx.mainMessage.updateMany({
          where: {
            id_main_message: { not: id },
            active: true,
          },
          data: { active: false },
        })
      }

      const updateData: Partial<MainMessage> = {
        updated_at: new Date(),
      }

      if (data.content !== undefined) {
        updateData.content = data.content.trim()
      }

      if (data.active !== undefined) {
        updateData.active = data.active
      }

      if (data.has_background !== undefined) {
        updateData.has_background = data.has_background
      }

      if (data.background_color !== undefined) {
        updateData.background_color = data.background_color || null
      }

      if (data.text_color !== undefined) {
        updateData.text_color = data.text_color || null
      }

      return await tx.mainMessage.update({
        where: { id_main_message: id },
        data: updateData,
      })
    })
  } catch (error) {
    /*console.error(
      `Repository - Error partially updating message with id ${id}:`,
      error
    )*/
    throw error
  }
}

export const remove = async (id: number): Promise<MainMessage> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si le message avec l'ID existe
      const messageExists = await tx.mainMessage.findUnique({
        where: { id_main_message: id },
      })

      if (!messageExists) {
        throw new Error(`Le message avec l'ID ${id} n'existe pas`)
      }

      return tx.mainMessage.delete({
        where: { id_main_message: id },
      })
    })
  } catch (error) {
    // console.error(`Repository - Error deleting message with id ${id}:`, error)
    throw error
  }
}

const mainMessageRepository = {
  findActiveMessage,
  findAll,
  findById,
  create,
  update,
  updatePartial,
  remove,
}

export default mainMessageRepository
