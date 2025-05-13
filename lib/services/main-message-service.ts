import { MainMessage } from "@prisma/client"
import { MainMessageFormValues } from "@/lib/validations/main-message-schema"
import mainMessageRepository from "@/lib/repositories/main-message-repository"

export const getActiveMessage = async (): Promise<MainMessage | null> => {
  try {
    return await mainMessageRepository.findActiveMessage()
  } catch (error) {
    // console.error("Service - Error getting active message:", error)
    throw error
  }
}

export const getAllMessages = async (): Promise<MainMessage[]> => {
  try {
    return await mainMessageRepository.findAll()
  } catch (error) {
    // console.error("Service - Error getting all messages:", error)
    throw error
  }
}

export const getMessageById = async (
  id: number
): Promise<MainMessage | null> => {
  try {
    return await mainMessageRepository.findById(id)
  } catch (error) {
    // console.error(`Service - Error getting message with id ${id}:`, error)
    throw error
  }
}

export const createMessage = async (
  data: MainMessageFormValues
): Promise<MainMessage> => {
  try {
    return await mainMessageRepository.create(data)
  } catch (error) {
    // console.error("Service - Error creating message:", error)
    throw error
  }
}

export const updateMessage = async (
  id: number,
  data: MainMessageFormValues
): Promise<MainMessage> => {
  try {
    const existingMessage = await mainMessageRepository.findById(id)
    if (!existingMessage) {
      throw new Error(`Message avec l'ID ${id} non trouvé`)
    }

    return await mainMessageRepository.update(id, data)
  } catch (error) {
    // console.error(`Service - Error updating message with id ${id}:`, error)
    throw error
  }
}

export const updatePartialMessage = async (
  id: number,
  partialData: Partial<MainMessageFormValues>
): Promise<MainMessage> => {
  try {
    const existingMessage = await mainMessageRepository.findById(id)
    if (!existingMessage) {
      throw new Error(`Message avec l'ID ${id} non trouvé`)
    }

    // Si on active un message, désactiver tous les autres
    if (partialData.active === true) {
      // Cette partie est exécutée uniquement si on active le message
      return await mainMessageRepository.updatePartial(id, partialData)
    } else {
      // Si on désactive le message ou modifie d'autres propriétés, pas besoin de logique spéciale
      return await mainMessageRepository.updatePartial(id, partialData)
    }
  } catch (error) {
    /*console.error(
      `Service - Error partially updating message with id ${id}:`,
      error
    )*/
    throw error
  }
}

export const deleteMessage = async (id: number): Promise<MainMessage> => {
  try {
    const message = await mainMessageRepository.findById(id)
    if (!message) {
      throw new Error(`Message avec l'ID ${id} non trouvé`)
    }

    return await mainMessageRepository.remove(id)
  } catch (error) {
    // console.error(`Service - Error deleting message with id ${id}:`, error)
    throw error
  }
}

const mainMessageService = {
  getActiveMessage,
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  updatePartialMessage,
  deleteMessage,
}

export default mainMessageService
