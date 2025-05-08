import { emailService } from "@/lib/services/email-service"
import { prisma } from "@/lib/prisma"
import { Order } from "@prisma/client"

interface OrderConfirmationDetails {
  orderId: number
  userId: number
  email: string
  firstName?: string
  orderItems: {
    id_product: number
    quantity: number
    unit_price: number
    subscription_type: string
  }[]
  totalAmount: number
  address: {
    address1: string
    address2?: string
    city: string
    postal_code: string
    country: string
    first_name: string
    last_name: string
  }
  invoiceNumber: string
  orderDate: Date
}

class OrderConfirmationEmailService {
  /**
   * Envoie un email de confirmation de commande
   * @param details Détails de la commande
   * @returns true si l'email a été envoyé avec succès
   */
  async sendOrderConfirmationEmail(details: OrderConfirmationDetails): Promise<boolean> {
    try {
      // Récupérer les détails des produits pour des informations supplémentaires (ex. nom du produit)
      const productIds = details.orderItems.map(item => item.id_product)
      const products = await prisma.product.findMany({
        where: { id_product: { in: productIds } },
        select: { id_product: true, name: true }
      })

      // Formatter les éléments de la commande pour l'email
      const formattedItems = details.orderItems.map(item => {
        const product = products.find(p => p.id_product === item.id_product)
        return {
          name: product?.name || `Produit ${item.id_product}`,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subscriptionType: item.subscription_type,
          total: item.quantity * item.unit_price
        }
      })

      // Gestion du mode test pour Resend
      let emailToSend = details.email
      let testModeNote = ''
      if (process.env.NODE_ENV === 'development') {
        emailToSend = 'mcuprojet@gmail.com' // Adresse vérifiée pour le mode test
        testModeNote = `<p style="color: red; font-weight: bold;">[Mode Test] Cet email était destiné à ${details.email}</p>`
      }

      // Construction des détails de l'email
      const emailDetails = {
        orderId: details.orderId,
        orderDate: details.orderDate.toISOString(),
        invoiceNumber: details.invoiceNumber,
        items: formattedItems,
        totalAmount: details.totalAmount,
        shippingAddress: {
          firstName: details.address.first_name,
          lastName: details.address.last_name,
          address1: details.address.address1,
          address2: details.address.address2 || undefined,
          city: details.address.city,
          postalCode: details.address.postal_code,
          country: details.address.country
        }
      }

      // Envoi de l'email de confirmation
      const emailSent = await emailService.sendEmail({
        type: "orderConfirmation",
        to: emailToSend,
        firstName: details.firstName || undefined,
        orderDetails: {
          ...emailDetails,
          testModeNote // Ajout de la note pour le mode test
        }
      })

      if (!emailSent) {
        console.warn("[OrderConfirmationEmailService] Échec de l'envoi de l'email à:", emailToSend)
        return false
      }

      console.log("[OrderConfirmationEmailService] Email envoyé avec succès à:", emailToSend)
      return true
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de confirmation de commande:", error)
      return false
    }
  }
}

// Export d'une instance unique du service
export const orderConfirmationEmailService = new OrderConfirmationEmailService()