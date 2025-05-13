import { emailService } from "@/lib/services/email-service"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

class EmailVerificationService {
  /**
   * Génère un token de vérification d'email et envoie un email
   * @param userId ID de l'utilisateur
   * @param email Email à vérifier
   * @param firstName Prénom de l'utilisateur
   * @returns true si l'email a été envoyé avec succès
   */
  async sendVerificationEmail(
    userId: number,
    email: string,
    firstName?: string
  ): Promise<boolean> {
    try {
      // Génération d'un token unique
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire dans 24 heures

      // Suppression des tokens existants pour cet utilisateur
      await prisma.emailVerification.deleteMany({
        where: { userId },
      })

      // Création d'un nouveau token de vérification
      await prisma.emailVerification.create({
        data: {
          userId,
          newEmail: email,
          token,
          expiresAt,
        },
      })

      // Construction du lien de vérification
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-token?token=${token}`

      // Envoi de l'email de vérification
      return await emailService.sendEmail({
        type: "verification",
        to: email,
        firstName: firstName || undefined,
        verificationLink,
      })
    } catch (error) {
      // console.error("Erreur lors de l'envoi de l'email de vérification:", error)
      return false
    }
  }

  /**
   * Vérifie un token d'email et met à jour l'utilisateur
   * @param token Token de vérification
   * @returns Objet indiquant le succès/échec et un message explicatif
   */
  async verifyEmail(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Vérification du token: ${token}`)

      // Recherche du token de vérification
      const verification = await prisma.emailVerification.findUnique({
        where: { token },
        include: { user: true },
      })

      console.log(
        "Résultat de la recherche:",
        verification
          ? {
              userId: verification.userId,
              newEmail: verification.newEmail,
              expiresAt: verification.expiresAt,
            }
          : "Token non trouvé"
      )

      // Vérification de la validité du token
      if (!verification) {
        return {
          success: false,
          message: "Le lien de vérification est invalide.",
        }
      }

      // Vérification de l'expiration du token
      if (verification.expiresAt < new Date()) {
        console.log("Token expiré le:", verification.expiresAt)
        await prisma.emailVerification.delete({ where: { token } })
        return { success: false, message: "Le lien de vérification a expiré." }
      }

      try {
        // Mise à jour de l'email de l'utilisateur et marquage comme vérifié
        const updatedUser = await prisma.user.update({
          where: { id_user: verification.userId },
          data: {
            email: verification.newEmail,
            email_verified: true,
          },
        })

        console.log("Utilisateur mis à jour:", {
          id: updatedUser.id_user,
          email: updatedUser.email,
          verified: updatedUser.email_verified,
        })

        // Suppression du token après validation
        await prisma.emailVerification.delete({ where: { token } })
        console.log("Token supprimé avec succès")

        return {
          success: true,
          message: "Votre adresse email a été vérifiée avec succès !",
        }
      } catch (updateError) {
        /*console.error(
          "Erreur lors de la mise à jour de l'utilisateur:",
          updateError
        )*/
        return {
          success: false,
          message:
            "Une erreur est survenue lors de la validation de votre email.",
        }
      }
    } catch (error) {
      // console.error("Erreur lors de la vérification de l'email:", error)
      return {
        success: false,
        message:
          "Une erreur est survenue lors de la vérification de votre email.",
      }
    }
  }

  /**
   * Lance le processus de changement d'email pour un utilisateur existant
   * @param userId ID de l'utilisateur
   * @param currentEmail Email actuel
   * @param newEmail Nouvel email
   * @param firstName Prénom de l'utilisateur
   * @returns true si l'email a été envoyé avec succès
   */
  async initiateEmailChange(
    userId: number,
    currentEmail: string,
    newEmail: string,
    firstName?: string
  ): Promise<boolean> {
    try {
      // Vérification que le nouvel email n'est pas déjà utilisé
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      })

      if (existingUser && existingUser.id_user !== userId) {
        throw new Error("Cet email est déjà utilisé par un autre compte.")
      }

      // Génération d'un token unique
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire dans 24 heures

      // Suppression des tokens existants pour cet utilisateur
      await prisma.emailVerification.deleteMany({
        where: { userId },
      })

      // Création d'un nouveau token de vérification
      await prisma.emailVerification.create({
        data: {
          userId,
          newEmail,
          token,
          expiresAt,
        },
      })

      // Construction du lien de vérification
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

      // Envoi de l'email de confirmation
      return await emailService.sendEmail({
        type: "emailChange",
        to: newEmail,
        firstName: firstName || undefined,
        newEmail,
        verificationLink,
      })
    } catch (error) {
      /*console.error(
        "Erreur lors de l'initialisation du changement d'email:",
        error
      )*/
      return false
    }
  }
}

// Export d'une instance unique du service
export const emailVerificationService = new EmailVerificationService()
