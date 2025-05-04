// lib/validations/contact-message-schema.ts
import { z } from "zod"

export const contactMessageSchema = z.object({
  first_name: z
    .string()
    .min(1, "Le prénom est requis")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères"),
  last_name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  subject: z
    .string()
    .min(1, "Le sujet est requis")
    .max(200, "Le sujet ne peut pas dépasser 200 caractères"),
  message: z
    .string()
    .min(1, "Le message est requis")
    .max(5000, "Le message ne peut pas dépasser 5000 caractères"),
  id_user: z.number().int().nullable().optional(),
})

export const contactMessageResponseSchema = z.object({
  id_message: z.number().int().min(1, "ID du message invalide"),
  response: z
    .string()
    .min(1, "La réponse est requise")
    .max(5000, "La réponse ne peut pas dépasser 5000 caractères"),
})

export type ContactMessageFormValues = z.infer<typeof contactMessageSchema>
export type ContactMessageResponseValues = z.infer<
  typeof contactMessageResponseSchema
>
