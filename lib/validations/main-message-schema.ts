import { z } from "zod"

export const mainMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du message est requis")
    .max(500, "Le message ne peut pas dépasser 500 caractères"),
  active: z.boolean().default(true),
  has_background: z.boolean().default(false),
  background_color: z
    .string()
    .max(20, "La couleur de fond ne peut pas dépasser 20 caractères")
    .nullable()
    .optional(),
  text_color: z
    .string()
    .max(20, "La couleur du texte ne peut pas dépasser 20 caractères")
    .nullable()
    .optional(),
})

export type MainMessageFormValues = z.infer<typeof mainMessageSchema>
