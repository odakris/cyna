// lib/services/contact-message-service.ts
import { ContactMessage } from "@prisma/client"
import contactMessageRepository from "@/lib/repositories/contact-message-repository"
import { sendEmail } from "@/lib/services/email-service"

export const getAllMessages = async (): Promise<ContactMessage[]> => {
  try {
    return await contactMessageRepository.findAll()
  } catch (error) {
    console.error("Service - Error getting all contact messages:", error)
    throw error
  }
}

export const getMessageById = async (
  id: number
): Promise<ContactMessage | null> => {
  try {
    const message = await contactMessageRepository.findById(id)

    // Si le message existe et n'est pas encore lu, le marquer comme lu
    if (message && !message.is_read) {
      await contactMessageRepository.markAsRead(id)
      // Retourner le message mis à jour
      return {
        ...message,
        is_read: true,
      }
    }

    return message
  } catch (error) {
    console.error(
      `Service - Error getting contact message with id ${id}:`,
      error
    )
    throw error
  }
}

export const getUnreadMessages = async (): Promise<ContactMessage[]> => {
  try {
    return await contactMessageRepository.findUnread()
  } catch (error) {
    console.error("Service - Error getting unread contact messages:", error)
    throw error
  }
}

export const createMessage = async (data: {
  email: string
  subject: string
  message: string
  id_user?: number | null
}): Promise<ContactMessage> => {
  try {
    return await contactMessageRepository.create(data)
  } catch (error) {
    console.error("Service - Error creating contact message:", error)
    throw error
  }
}

export const markMessageAsRead = async (
  id: number
): Promise<ContactMessage> => {
  try {
    const existingMessage = await contactMessageRepository.findById(id)
    if (!existingMessage) {
      throw new Error(`Message avec l'ID ${id} non trouvé`)
    }

    return await contactMessageRepository.markAsRead(id)
  } catch (error) {
    console.error(
      `Service - Error marking message as read with id ${id}:`,
      error
    )
    throw error
  }
}

export const respondToMessage = async (
  data: { id_message: number; response: string },
  adminInfo?: { email: string; firstName?: string; lastName?: string }
): Promise<ContactMessage> => {
  try {
    const { id_message, response } = data

    // Récupérer le message original
    const message = await contactMessageRepository.findById(id_message)
    if (!message) {
      throw new Error(`Message avec l'ID ${id_message} non trouvé`)
    }

    // Sauvegarder la réponse dans la base de données
    const updatedMessage = await contactMessageRepository.saveResponse(data)

    // Créer la signature de l'admin
    const adminSignature =
      adminInfo && adminInfo.firstName && adminInfo.lastName
        ? `${adminInfo.firstName} ${adminInfo.lastName}`
        : adminInfo && adminInfo.email
          ? adminInfo.email
          : "L'équipe de support"

    // Envoyer l'email de réponse si le service d'email est disponible
    try {
      await sendEmail({
        to: message.email,
        subject: `RE: ${message.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Réponse à votre message</h2>
            <div style="padding: 20px; border-radius: 5px; background-color: #f9f9f9;">
              ${response.replace(/\n/g, "<br>")}
            </div>
            <p style="margin-top: 20px;">Cordialement,<br>${adminSignature}<br>${process.env.NEXT_PUBLIC_SITE_NAME || "Notre équipe"}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <h3>Votre message original</h3>
            <div style="padding: 10px; border-left: 3px solid #ccc;">
              <strong>Sujet:</strong> ${message.subject}<br>
              <strong>Date:</strong> ${new Date(message.sent_date).toLocaleString("fr-FR")}<br>
              <p>${message.message.replace(/\n/g, "<br>")}</p>
            </div>
            <p style="color: #777; font-size: 12px; margin-top: 30px;">
              Ceci est une réponse à votre message envoyé via notre formulaire de contact. 
              Si vous avez d'autres questions, n'hésitez pas à nous contacter.
            </p>
          </div>
        `,
        text: `Réponse à votre message:\n\n${response}\n\nCordialement,\n${adminSignature}\n${process.env.NEXT_PUBLIC_SITE_NAME || "Notre équipe"}\n\n---\n\nVotre message original:\nSujet: ${message.subject}\nDate: ${new Date(message.sent_date).toLocaleString("fr-FR")}\n\n${message.message}`,
      })
    } catch (emailError) {
      // Consignez l'erreur mais ne la propagez pas, car nous avons déjà mis à jour la base de données
      console.error("Erreur lors de l'envoi de l'email de réponse:", emailError)
    }

    return updatedMessage
  } catch (error) {
    console.error(`Service - Error responding to message:`, error)
    throw error
  }
}

export const deleteMessage = async (id: number): Promise<ContactMessage> => {
  try {
    const message = await contactMessageRepository.findById(id)
    if (!message) {
      throw new Error(`Message avec l'ID ${id} non trouvé`)
    }

    // Supprimer le message
    return await contactMessageRepository.remove(id)
  } catch (error) {
    console.error(
      `Service - Error deleting contact message with id ${id}:`,
      error
    )
    throw error
  }
}

export const getMessageStats = async (): Promise<{
  total: number
  unread: number
  unanswered: number
  lastWeek: number
}> => {
  try {
    return await contactMessageRepository.getStats()
  } catch (error) {
    console.error("Service - Error getting contact message stats:", error)
    throw error
  }
}

const contactMessageService = {
  getAllMessages,
  getMessageById,
  getUnreadMessages,
  createMessage,
  markMessageAsRead,
  respondToMessage,
  deleteMessage,
  getMessageStats,
}

export default contactMessageService
