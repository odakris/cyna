import { z } from "zod"
import { orderItemSchema } from "./order-item-schema"
import { OrderStatus } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

// Schéma pour valider la mise à jour du statut de la commande
export const statusSchema = z.object({
  order_status: z.nativeEnum(OrderStatus, {
    errorMap: (issue, ctx) => ({
      message: `Statut invalide. Les valeurs autorisées sont : ${Object.values(OrderStatus).join(", ")}`,
    }),
  }),
})

// Schéma de base avec les champs fournis par l'utilisateur
export const orderInputSchema = z.object({
  order_date: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
  order_status: z.nativeEnum(OrderStatus).optional().default("PENDING"),
  payment_method: z.string().min(2).max(50),
  last_card_digits: z.string().length(4).optional(),
  invoice_pdf_url: z.string().url().max(255).optional(),
  id_user: z.number().int().positive(),
  id_address: z.number().int().positive(),
  order_items: z
    .array(orderItemSchema)
    .min(1, "Au moins un article est requis dans la commande."),
})

// Schéma complet incluant les champs calculés automatiquement
export const orderFormSchema = orderInputSchema.transform(data => {
  // Calculer le montant total et le sous-total à partir des éléments de commande
  let subtotal = 0
  data.order_items.forEach(item => {
    subtotal += item.unit_price * item.quantity
  })

  // Arrondir à 2 décimales
  subtotal = parseFloat(subtotal.toFixed(2))

  // Pour l'instant, total_amount est égal au subtotal
  // Vous pourriez ajouter des taxes, des frais de livraison, etc.
  const total_amount = subtotal

  // Générer un numéro de facture unique s'il n'est pas fourni
  const invoice_number = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}${new Date().getDate().toString().padStart(2, "0")}-${uuidv4().substring(0, 6).toUpperCase()}`

  return {
    ...data,
    subtotal,
    total_amount,
    invoice_number,
  }
})

export type OrderInputValues = z.infer<typeof orderInputSchema>
export type OrderFormValues = z.infer<typeof orderFormSchema>
export type StatusValues = z.infer<typeof statusSchema>
