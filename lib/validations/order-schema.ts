import { z } from "zod"
import { orderItemSchema } from "./order-item-schema"
import { OrderStatus } from "@prisma/client"

export const orderFormSchema = z.object({
  order_date: z.coerce.date().default(() => new Date()),
  total_amount: z
    .number()
    .nonnegative()
    .transform(val => parseFloat(val.toFixed(2))),
  subtotal: z
    .number()
    .nonnegative()
    .default(0)
    .transform(val => parseFloat(val.toFixed(2))),
  order_status: z.nativeEnum(OrderStatus).default("PENDING"),
  payment_method: z.string().min(2).max(50),
  last_card_digits: z.string().length(4).optional(),
  invoice_number: z.string().min(5).max(50),
  invoice_pdf_url: z.string().url().max(255).optional(),
  id_user: z.number().int().positive(),
  id_address: z.number().int().positive(),
  order_items: z
    .array(orderItemSchema)
    .min(1, "Au moins un article est requis dans la commande."),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>
