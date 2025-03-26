import { z } from "zod"

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom de la catégorie doit avoir au moins 3 caractères.")
    .max(100, "Le nom de la catégorie ne peut pas dépasser 100 caractères."),
  description: z
    .string()
    .min(10, "La description est trop courte.")
    .max(1000, "La description est trop longue."),
  priority_order: z.coerce
    .number()
    .int("La priorité doit être un nombre entier.")
    .min(1, "La priorité doit être supérieure à 0."),
  image: z.string().nonempty("L'image est requise."),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
