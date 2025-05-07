import { z } from "zod"
import { orderItemSchema } from "./order-item-schema"
import { OrderStatus } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

export const statusSchema = z.object({
  order_status: z.nativeEnum(OrderStatus, {
    errorMap: (issue, ctx) => ({
      message: `Statut invalide. Les valeurs autorisées sont : ${Object.values(OrderStatus).join(", ")}`,
    }),
  }),
})

export const cartItemSchema = z.object({
  id: z.string().nonempty("L'identifiant du produit est requis"),
  uniqueId: z.string().nonempty("L'identifiant unique est requis"),
  name: z.string().min(1, "Le nom du produit est requis"),
  price: z.number().positive("Le prix doit être positif"),
  quantity: z.number().int().positive("La quantité doit être positive"),
  subscription: z
    .enum(["MONTHLY", "YEARLY", "PER_USER", "PER_MACHINE"])
    .optional()
    .default("MONTHLY"),
  imageUrl: z.string().url().optional(),
})

export const orderInputSchema = z
  .object({
    order_date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    order_status: z.nativeEnum(OrderStatus).optional().default("PENDING"),
    addressId: z.string().nonempty("L'identifiant de l'adresse est requis"),
    paymentId: z.string().nonempty("L'identifiant du paiement est requis"),
    paymentIntentId: z
      .string()
      .nonempty("L'identifiant du paiement Stripe est requis"),
    id_user: z.number().int().positive().optional(),
    guestId: z.string().optional(),
    cartItems: z
      .array(cartItemSchema)
      .min(1, "Au moins un article est requis dans la commande"),
  })
  .refine(data => data.id_user || data.guestId, {
    message: "Au moins un id_user ou guestId doit être fourni",
    path: ["id_user", "guestId"],
  })

export const orderFormSchema = orderInputSchema.transform(data => {
  let subtotal = 0
  data.cartItems.forEach(item => {
    let unitPrice = item.price
    switch (item.subscription || "MONTHLY") {
      case "MONTHLY":
        unitPrice = item.price
        break
      case "YEARLY":
        unitPrice = item.price * 12
        break
      case "PER_USER":
      case "PER_MACHINE":
        unitPrice = item.price
        break
    }
    subtotal += unitPrice * item.quantity
  })

  subtotal = parseFloat(subtotal.toFixed(2))
  const taxes = subtotal * 0.2
  const total_amount = parseFloat((subtotal + taxes).toFixed(2))

  const invoice_number = `INV-${new Date().getFullYear()}${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${new Date()
    .getDate()
    .toString()
    .padStart(2, "0")}-${uuidv4().substring(0, 6).toUpperCase()}`

  return {
    ...data,
    subtotal,
    taxes,
    total_amount,
    invoice_number,
  }
})

// Schéma de base avec les champs fournis par l'utilisateur
export const orderInputSchemaBase = z.object({
  order_date: z.coerce.date().default(() => new Date()),
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
export const orderFormSchemaBackOffice = orderInputSchemaBase.transform(
  data => {
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

    const invoice_number = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}${new Date().getDate().toString().padStart(2, "0")}-${uuidv4().substring(0, 6).toUpperCase()}`

    return {
      ...data,
      subtotal,
      total_amount,
      invoice_number,
    }
  }
)

export type OrderInputValues = z.infer<typeof orderInputSchema>
export type OrderFormValues = z.infer<typeof orderFormSchema>
export type StatusValues = z.infer<typeof statusSchema>
export type OrderFormValuesBackOffice = z.infer<
  typeof orderFormSchemaBackOffice
>
