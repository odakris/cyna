import { z } from "zod"

export const heroCarouselSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne peut pas dépasser 255 caractères"),
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .nullable()
    .optional(),
  image_url: z
    .string()
    .min(1, "L'URL de l'image est requise")
    .max(255, "L'URL ne peut pas dépasser 255 caractères"),
  button_text: z
    .string()
    .max(100, "Le texte du bouton ne peut pas dépasser 100 caractères")
    .nullable()
    .optional(),
  button_link: z
    .string()
    .max(255, "Le lien du bouton ne peut pas dépasser 255 caractères")
    .nullable()
    .optional(),
  active: z.boolean().default(true),
  priority_order: z.number().int().min(1).default(1),
  updated_at: z.coerce.date().optional(),
})

export type HeroCarouselFormValues = z.infer<typeof heroCarouselSchema>
