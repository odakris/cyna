import { z } from "zod"

export const userFormSchema = z.object({
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
  password: z.string(),
  // .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  // .max(255, "Le mot de passe ne peut pas dépasser 255 caractères.")
  // .regex(
  //   /[A-Z]/,
  //   "Le mot de passe doit contenir au moins une lettre majuscule."
  // )
  // .regex(
  //   /[a-z]/,
  //   "Le mot de passe doit contenir au moins une lettre minuscule."
  // )
  // .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
  // .regex(
  //   /[^A-Za-z0-9]/,
  //   "Le mot de passe doit contenir au moins un caractère spécial."
  // ),
  role: z
    .enum(["SUPER_ADMIN", "ADMIN", "CUSTOMER", "MANAGER"])
    .default("CUSTOMER"),
  email_verified: z.boolean().optional().default(false),
  verify_token: z.string().optional(),
  two_factor_enabled: z.boolean().optional().default(false),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})

export type UserFormValues = z.infer<typeof userFormSchema>
