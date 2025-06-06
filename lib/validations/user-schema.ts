import { z } from "zod"

// Schéma commun pour les propriétés partagées
const baseUserSchema = z.object({
  first_name: z
    .string()
    .min(2, "Le prénom doit avoir au moins 2 caractères.")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères."),
  last_name: z
    .string()
    .min(2, "Le nom doit avoir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  email: z
    .string()
    .email("L'adresse email n'est pas valide.")
    .max(255, "L'email ne peut pas dépasser 255 caractères."),
  role: z
    .enum(["SUPER_ADMIN", "ADMIN", "CUSTOMER", "MANAGER"])
    .default("CUSTOMER"),
  email_verified: z.boolean().optional().default(false),
  verify_token: z.string().optional(),
  two_factor_enabled: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})

// Le mot de passe requis pour la création
const requiredPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Le mot de passe doit avoir au moins 8 caractères.")
    .max(255, "Le mot de passe ne peut pas dépasser 255 caractères.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)."
    ),
})

// Le mot de passe optionnel pour l'édition
const optionalPasswordSchema = z.object({
  password: z.string().optional(),
})

// Schéma pour la création d'utilisateurs (mot de passe requis)
export const userCreateSchema = baseUserSchema.merge(requiredPasswordSchema)

// Schéma pour l'édition d'utilisateurs (mot de passe optionnel)
export const userFormSchema = baseUserSchema.merge(optionalPasswordSchema)

export type UserFormValues = z.infer<typeof userFormSchema>
