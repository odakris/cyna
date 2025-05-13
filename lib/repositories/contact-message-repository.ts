// lib/repositories/contact-message-repository.ts
import { ContactMessage } from "@prisma/client"
import { prisma } from "../prisma"

export const findAll = async (): Promise<ContactMessage[]> => {
  try {
    return prisma.contactMessage.findMany({
      orderBy: {
        sent_date: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    })
  } catch (error) {
    // console.error("Repository - Error fetching all contact messages:", error)
    throw error
  }
}

export const findById = async (id: number): Promise<ContactMessage | null> => {
  try {
    return prisma.contactMessage.findUnique({
      where: { id_message: id },
      include: {
        user: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    })
  } catch (error) {
    /*console.error(
      `Repository - Error fetching contact message with id ${id}:`,
      error
    )*/
    throw error
  }
}

export const findUnread = async (): Promise<ContactMessage[]> => {
  try {
    return prisma.contactMessage.findMany({
      where: { is_read: false },
      orderBy: {
        sent_date: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    })
  } catch (error) {
    // console.error("Repository - Error fetching unread contact messages:", error)
    throw error
  }
}

export const create = async (data: {
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  id_user?: number | null
}): Promise<ContactMessage> => {
  try {
    return prisma.contactMessage.create({
      data: {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
        sent_date: new Date(),
        is_read: false,
        is_responded: false,
        ...(data.id_user ? { id_user: data.id_user } : {}),
      },
    })
  } catch (error) {
    // console.error("Repository - Error creating contact message:", error)
    throw error
  }
}

export const markAsRead = async (id: number): Promise<ContactMessage> => {
  try {
    return prisma.contactMessage.update({
      where: { id_message: id },
      data: {
        is_read: true,
      },
    })
  } catch (error) {
    /*console.error(
      `Repository - Error marking message as read with id ${id}:`,
      error
    )*/
    throw error
  }
}

export const saveResponse = async (data: {
  id_message: number
  response: string
}): Promise<ContactMessage> => {
  try {
    return prisma.contactMessage.update({
      where: { id_message: data.id_message },
      data: {
        is_responded: true,
        response: data.response,
        response_date: new Date(),
        is_read: true,
      },
    })
  } catch (error) {
    // console.error(`Repository - Error saving response to message:`, error)
    throw error
  }
}

export const remove = async (id: number): Promise<ContactMessage> => {
  try {
    return prisma.contactMessage.delete({
      where: { id_message: id },
    })
  } catch (error) {
    /*console.error(
      `Repository - Error deleting contact message with id ${id}:`,
      error
    )*/
    throw error
  }
}

export const getStats = async (): Promise<{
  total: number
  unread: number
  unanswered: number
  lastWeek: number
}> => {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [total, unread, unanswered, lastWeek] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({
        where: { is_read: false },
      }),
      prisma.contactMessage.count({
        where: { is_responded: false },
      }),
      prisma.contactMessage.count({
        where: {
          sent_date: {
            gte: oneWeekAgo,
          },
        },
      }),
    ])

    return {
      total,
      unread,
      unanswered,
      lastWeek,
    }
  } catch (error) {
    // console.error("Erreur lors du calcul des statistiques:", error)
    throw error
  }
}

const contactMessageRepository = {
  findAll,
  findById,
  findUnread,
  create,
  markAsRead,
  saveResponse,
  remove,
  getStats,
}

export default contactMessageRepository
