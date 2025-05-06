import { z } from "zod"

export const productFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "Le nom du produit doit avoir au moins 3 caractères.")
      .max(100, "Le nom du produit ne peut pas dépasser 100 caractères."),
    description: z
      .string()
      .min(10, "La description est trop courte.")
      .max(1000, "La description est trop longue."),
    technical_specs: z
      .string()
      .min(10, "Les spécifications techniques sont trop courtes.")
      .max(2000, "Les spécifications techniques sont trop longues."),
    unit_price: z.coerce
      .number()
      .min(0, "Le prix doit être supérieur ou égal à 0.")
      .transform(val => parseFloat(val.toFixed(2))),
    stock: z.coerce
      .number()
      .int("Le stock doit être un nombre entier.")
      .min(0, "Le stock doit être supérieur ou égal à 0."),
    available: z.boolean().optional(),
    id_category: z.coerce
      .number()
      .int("La catégorie est requise.")
      .min(1, "La catégorie est requise."),
    main_image: z.string().nonempty("L'image est requise."),
    updated_at: z.coerce.date().optional(),
    product_caroussel_images: z
      .array(z.string())
      .min(1, "Au moins une image est requise."),
    priority_order: z.coerce
      .number()
      .int("La priorité doit être un nombre entier.")
      .min(1, "La priorité doit être supérieure à 0."),
    active: z.boolean().optional(),
  })
  .refine(
    data => {
      // Un produit avec stock à 0 ne peut pas être disponible
      if (data.stock === 0) {
        return data.available !== true
      }
      return true
    },
    {
      message:
        "Un produit avec un stock à 0 ne peut pas être marqué comme disponible",
      path: ["available"],
    }
  )

export type ProductFormValues = z.infer<typeof productFormSchema>
