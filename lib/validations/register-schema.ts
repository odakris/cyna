import { z } from "zod";

// Définitions communes pour les champs partagés
const firstNameSchema = z
  .string()
  .min(2, "Le prénom doit avoir au moins 2 caractères.")
  .max(100, "Le prénom ne peut pas dépasser 100 caractères.")
  .nonempty("Le prénom est requis.");

const lastNameSchema = z
  .string()
  .min(2, "Le nom de famille doit avoir au moins 2 caractères.")
  .max(100, "Le nom de famille ne peut pas dépasser 100 caractères.")
  .nonempty("Le nom de famille est requis.");

const emailSchema = z
  .string()
  .email("L'adresse email doit être valide.")
  .max(255, "L'adresse email ne peut pas dépasser 255 caractères.")
  .nonempty("L'adresse email est requise.");

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit avoir au moins 8 caractères.")
  .max(255, "Le mot de passe ne peut pas dépasser 255 caractères.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)."
  )
  .nonempty("Le mot de passe est requis.");

// Schéma de validation pour le formulaire d'inscription (côté client)
export const registerFormSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(8, "La confirmation du mot de passe doit avoir au moins 8 caractères.")
      .max(255, "La confirmation du mot de passe ne peut pas dépasser 255 caractères.")
      .nonempty("La confirmation du mot de passe est requise."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma de validation pour l'API d'inscription (côté serveur, sans confirmPassword)
export const registerApiSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Types dérivés des schémas pour une utilisation dans le code
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type RegisterApiValues = z.infer<typeof registerApiSchema>;