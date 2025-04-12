import { z } from "zod"

export const addressSchema = z.object({
    first_name: z
        .string()
        .min(2, "Le prénom doit avoir au moins 2 caractères.")
        .max(100, "Le prénom ne peut pas dépasser 100 caractères."),
    last_name: z
        .string()
        .min(2, "Le nom doit avoir au moins 2 caractères.")
        .max(100, "Le nom ne peut pas dépasser 100 caractères."),
    address1: z.string().min(1, "L'adresse est requise"),
    address2: z.string().optional(),
    postal_code: z
        .string()
        .min(4, "Code postal invalide")
        .regex(/^[A-Za-z0-9\s\-]+$/, "Code postal invalide"), // autoriser lettres et chiffres
    city: z.string().min(1, "La ville est requise").regex(/^[A-Za-zÀ-ÿ\s\-]+$/, "Ville invalide"),
    country: z.string().min(1, "Le pays est requis").regex(/^[A-Za-zÀ-ÿ\s\-]+$/, "Pays invalide"),
    region: z.string().optional(),
    mobile_phone: z
        .string()
        .min(8, "Numéro invalide")
        .regex(/^[\d\s+()-]+$/, "Format du téléphone incorrect"),
    is_default_billing: z.number().optional(),
    is_default_shipping: z.number().optional(),
})

// Type TypeScript pour aide au typage
export type AddressFormValues = z.infer<typeof addressSchema>
