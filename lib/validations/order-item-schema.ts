import { SubscriptionStatus, SubscriptionType } from "@prisma/client"
import { z } from "zod"

export const orderItemSchema = z.object({
  subscription_type: z.nativeEnum(SubscriptionType).default("MONTHLY"),
  subscription_status: z.nativeEnum(SubscriptionStatus).default("ACTIVE"),
  subscription_duration: z.number().int().positive(),
  renewal_date: z.coerce.date().optional(),
  quantity: z.number().int().positive().default(1),
  unit_price: z
    .number()
    .nonnegative()
    .transform(val => parseFloat(val.toFixed(2))),
  id_product: z.number().int().positive(),
  id_order: z.number().int().positive().optional(), // Optionnel lors de la création d'une commande
})

export type OrderItemFormValues = z.infer<typeof orderItemSchema>
