import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/services/email-service"
import crypto from "crypto"
import bcrypt from "bcryptjs"

class PasswordResetService {
  /**
   * Demande de réinitialisation de mot de passe
   * @param email Email de l'utilisateur
   * @param userId ID de l'utilisateur (optionnel, pour les demandes administratives)
   * @returns Objet contenant les informations de réinitialisation
   */
  async requestPasswordReset(
    email: string,
    userId?: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier les variables d'environnement critiques
      if (!process.env.RESEND_API_KEY) {
        console.error(
          "[PasswordResetService] Erreur: RESEND_API_KEY non configurée"
        )
        return {
          success: false,
          message: "Erreur serveur: configuration email manquante",
        }
      }
      if (!process.env.NEXT_PUBLIC_APP_URL) {
        console.error(
          "[PasswordResetService] Erreur: NEXT_PUBLIC_APP_URL non configurée"
        )
        return {
          success: false,
          message: "Erreur serveur: configuration URL manquante",
        }
      }

      // Chercher l'utilisateur par ID si fourni, sinon par email
      const user = userId
        ? await prisma.user.findUnique({
            where: { id_user: userId },
            select: {
              id_user: true,
              first_name: true,
              email: true,
              active: true,
            },
          })
        : await prisma.user.findUnique({
            where: { email },
            select: {
              id_user: true,
              first_name: true,
              email: true,
              active: true,
            },
          })

      // Ne pas révéler si l'utilisateur existe pour des raisons de sécurité
      if (!user || !user.active) {
        return {
          success: true,
          message:
            "Si l'email existe, un lien de réinitialisation a été envoyé.",
        }
      }

      // Supprimer les anciens tokens de réinitialisation pour cet utilisateur
      await prisma.passwordResetToken.deleteMany({
        where: { id_user: user.id_user },
      })

      // Générer un token unique
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // Expire dans 1 heure

      // Enregistrer le token dans la base de données
      await prisma.passwordResetToken.create({
        data: {
          token,
          id_user: user.id_user,
          expires_at: expiresAt,
        },
      })

      // Générer le lien de réinitialisation
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

      // Gestion du mode test/développement
      let emailToSend = user.email
      let testModeNote = ""
      if (process.env.NODE_ENV === "development") {
        emailToSend = "mcuprojet@gmail.com" // Adresse vérifiée pour le mode test
        testModeNote = `<p style="color: red; font-weight: bold;">[Mode Test] Cet email était destiné à ${user.email}</p>`
      }

      // Envoyer l'email avec le lien de réinitialisation
      const emailSent = await emailService.sendEmail({
        type: "resetPassword",
        to: emailToSend,
        firstName: user.first_name || undefined,
        resetLink,
      })

      if (!emailSent) {
        console.warn(
          "[PasswordResetService] Échec de l'envoi de l'email de réinitialisation à:",
          emailToSend
        )
        return {
          success: false,
          message: "Échec de l'envoi de l'email de réinitialisation",
        }
      }

      console.log(
        "[PasswordResetService] Email de réinitialisation envoyé avec succès à:",
        emailToSend
      )
      return {
        success: true,
        message: "Si l'email existe, un lien de réinitialisation a été envoyé.",
      }
    } catch (error) {
      console.error(
        "[PasswordResetService] Erreur lors de la demande de réinitialisation:",
        error
      )
      return {
        success: false,
        message:
          "Une erreur est survenue lors de la demande de réinitialisation.",
      }
    }
  }

  /**
   * Vérifie la validité d'un token de réinitialisation
   * @param token Token de réinitialisation
   * @returns Objet indiquant si le token est valide
   */
  async verifyResetToken(
    token: string
  ): Promise<{ isValid: boolean; userId?: number }> {
    try {
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          expires_at: { gt: new Date() },
        },
      })

      if (!resetToken) {
        return { isValid: false }
      }

      return {
        isValid: true,
        userId: resetToken.id_user,
      }
    } catch (error) {
      console.error(
        "[PasswordResetService] Erreur lors de la vérification du token:",
        error
      )
      return { isValid: false }
    }
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   * @param token Token de réinitialisation
   * @param newPassword Nouveau mot de passe
   * @returns Objet indiquant le succès/échec et un message explicatif
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier si le token est valide et non expiré
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          expires_at: { gt: new Date() },
        },
      })

      if (!resetToken) {
        return {
          success: false,
          message: "Le lien de réinitialisation est invalide ou a expiré.",
        }
      }

      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Mettre à jour le mot de passe de l'utilisateur
      await prisma.user.update({
        where: { id_user: resetToken.id_user },
        data: { password: hashedPassword },
      })

      // Supprimer tous les tokens de réinitialisation de cet utilisateur
      await prisma.passwordResetToken.deleteMany({
        where: { id_user: resetToken.id_user },
      })

      return {
        success: true,
        message: "Votre mot de passe a été réinitialisé avec succès.",
      }
    } catch (error) {
      console.error(
        "[PasswordResetService] Erreur lors de la réinitialisation du mot de passe:",
        error
      )
      return {
        success: false,
        message:
          "Une erreur est survenue lors de la réinitialisation du mot de passe.",
      }
    }
  }
}

// Export d'une instance unique du service
export const passwordResetService = new PasswordResetService()
