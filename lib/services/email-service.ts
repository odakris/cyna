import { Resend } from "resend"

// Types d'emails supportés par le service
export type EmailType =
  | "welcome"
  | "verification"
  | "resetPassword"
  | "emailChange"
  | "generic"

// Structure commune pour les emails
interface BaseEmailProps {
  to: string
  firstName?: string
}

// Props spécifiques pour chaque type d'email
// Removed WelcomeEmailProps as it is equivalent to BaseEmailProps

interface VerificationEmailProps extends BaseEmailProps {
  verificationLink: string
}

interface ResetPasswordEmailProps extends BaseEmailProps {
  resetLink: string
}

interface EmailChangeProps extends BaseEmailProps {
  verificationLink: string
  newEmail: string
}

interface GenericEmailProps extends BaseEmailProps {
  subject: string
  message: string
  actionLink?: string
  actionText?: string
}

// Type union pour tous les types d'emails
export type EmailProps =
  | (BaseEmailProps & { type: "welcome" })
  | (VerificationEmailProps & { type: "verification" })
  | (ResetPasswordEmailProps & { type: "resetPassword" })
  | (EmailChangeProps & { type: "emailChange" })
  | (GenericEmailProps & { type: "generic" })

// Paramètres avancés d'email (optionnels)
export interface EmailOptions {
  from?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

// Initialisation de Resend avec la clé API
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Configuration par défaut
const CONFIG = {
  from: process.env.EMAIL_FROM || "no-reply@cyna.fr",
  appName: "CYNA",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}

/**
 * Service principal d'envoi d'emails
 */
class EmailService {
  /**
   * Envoie un email selon le type spécifié
   */
  async sendEmail(props: EmailProps, options?: EmailOptions): Promise<boolean> {
    // Vérification de la configuration de Resend
    if (!resend) {
      console.error("ERREUR: La clé API Resend n'est pas configurée.")
      return false
    }

    try {
      // Construction du contenu de l'email selon le type
      const { subject, html, text } = this.buildEmailContent(props)

      // Envoi de l'email avec Resend
      const { data, error } = await resend.emails.send({
        from: options?.from || CONFIG.from,
        to: props.to,
        cc: options?.cc,
        bcc: options?.bcc,
        subject: subject,
        html: html,
        text: text,
        attachments: options?.attachments,
      })

      if (error) {
        console.error("Erreur Resend:", error)
        throw new Error(`Échec de l'envoi de l'email: ${error.message}`)
      }

      console.log(`Email envoyé avec succès, ID: ${data?.id}`)
      return true
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error)
      return false
    }
  }

  /**
   * Construit le contenu de l'email selon le type
   */
  private buildEmailContent(props: EmailProps): {
    subject: string
    html: string
    text: string
  } {
    const firstName = props.firstName || "Utilisateur"

    switch (props.type) {
      case "welcome":
        return {
          subject: `Bienvenue sur ${CONFIG.appName} !`,
          html: this.getWelcomeEmailHtml(firstName),
          text: this.getWelcomeEmailText(firstName),
        }

      case "verification":
        return {
          subject: `Vérification de votre adresse email | ${CONFIG.appName}`,
          html: this.getVerificationEmailHtml(
            firstName,
            props.verificationLink
          ),
          text: this.getVerificationEmailText(
            firstName,
            props.verificationLink
          ),
        }

      case "resetPassword":
        return {
          subject: `Réinitialisation de votre mot de passe | ${CONFIG.appName}`,
          html: this.getResetPasswordEmailHtml(firstName, props.resetLink),
          text: this.getResetPasswordEmailText(firstName, props.resetLink),
        }

      case "emailChange":
        return {
          subject: `Confirmation de changement d'email | ${CONFIG.appName}`,
          html: this.getEmailChangeHtml(
            firstName,
            props.newEmail,
            props.verificationLink
          ),
          text: this.getEmailChangeText(
            firstName,
            props.newEmail,
            props.verificationLink
          ),
        }

      case "generic":
        return {
          subject: props.subject,
          html: this.getGenericEmailHtml(
            firstName,
            props.message,
            props.actionLink,
            props.actionText
          ),
          text: this.getGenericEmailText(
            firstName,
            props.message,
            props.actionLink
          ),
        }

      default:
        throw new Error("Type d'email non supporté")
    }
  }

  // Templates HTML pour chaque type d'email
  private getWelcomeEmailHtml(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bienvenue sur ${CONFIG.appName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #302082; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { display: inline-block; background-color: #FF6B00; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue sur ${CONFIG.appName} !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName},</p>
            <p>Nous sommes ravis de vous accueillir sur ${CONFIG.appName}. Votre compte a été créé avec succès.</p>
            <p>Vous pouvez dès maintenant accéder à nos services en vous connectant à votre compte.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${CONFIG.appUrl}" class="button">Accéder à mon compte</a>
            </p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <p>Cordialement,</p>
            <p>L'équipe ${CONFIG.appName}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getVerificationEmailHtml(
    firstName: string,
    verificationLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Vérification de votre adresse email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #302082; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { display: inline-block; background-color: #FF6B00; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vérification de votre adresse email</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName},</p>
            <p>Merci de vous être inscrit sur ${CONFIG.appName}. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="button">Vérifier mon adresse email</a>
            </p>
            <p>Ce lien est valable pendant 24 heures. Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
            <p>Cordialement,</p>
            <p>L'équipe ${CONFIG.appName}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getResetPasswordEmailHtml(
    firstName: string,
    resetLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Réinitialisation de votre mot de passe</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #302082; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { display: inline-block; background-color: #FF6B00; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de votre mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            <p>Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé à réinitialiser votre mot de passe, veuillez ignorer cet email.</p>
            <p>Cordialement,</p>
            <p>L'équipe ${CONFIG.appName}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getEmailChangeHtml(
    firstName: string,
    newEmail: string,
    verificationLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmation de changement d'email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #302082; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { display: inline-block; background-color: #FF6B00; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirmation de changement d'email</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName},</p>
            <p>Vous avez demandé à changer votre adresse email pour : <strong>${newEmail}</strong></p>
            <p>Cliquez sur le bouton ci-dessous pour confirmer ce changement :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="button">Confirmer mon nouvel email</a>
            </p>
            <p>Ce lien est valable pendant 24 heures. Si vous n'avez pas demandé à changer votre adresse email, veuillez ignorer cet email et sécuriser votre compte.</p>
            <p>Cordialement,</p>
            <p>L'équipe ${CONFIG.appName}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getGenericEmailHtml(
    firstName: string,
    message: string,
    actionLink?: string,
    actionText?: string
  ): string {
    const buttonHtml = actionLink
      ? `
      <p style="text-align: center; margin: 30px 0;">
        <a href="${actionLink}" class="button">${actionText || "Cliquez ici"}</a>
      </p>
    `
      : ""

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Information ${CONFIG.appName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #302082; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { display: inline-block; background-color: #FF6B00; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Information ${CONFIG.appName}</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName},</p>
            <p>${message}</p>
            ${buttonHtml}
            <p>Cordialement,</p>
            <p>L'équipe ${CONFIG.appName}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Versions texte simple des emails pour les clients qui ne supportent pas le HTML
  private getWelcomeEmailText(firstName: string): string {
    return `
Bienvenue sur ${CONFIG.appName} !

Bonjour ${firstName},

Nous sommes ravis de vous accueillir sur ${CONFIG.appName}. Votre compte a été créé avec succès.

Vous pouvez dès maintenant accéder à nos services en vous connectant à votre compte :
${CONFIG.appUrl}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe ${CONFIG.appName}

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }

  private getVerificationEmailText(
    firstName: string,
    verificationLink: string
  ): string {
    return `
Vérification de votre adresse email - ${CONFIG.appName}

Bonjour ${firstName},

Merci de vous être inscrit sur ${CONFIG.appName}. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :

${verificationLink}

Ce lien est valable pendant 24 heures. Si vous n'avez pas créé de compte, veuillez ignorer cet email.

Cordialement,
L'équipe ${CONFIG.appName}

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }

  private getResetPasswordEmailText(
    firstName: string,
    resetLink: string
  ): string {
    return `
Réinitialisation de votre mot de passe - ${CONFIG.appName}

Bonjour ${firstName},

Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :

${resetLink}

Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé à réinitialiser votre mot de passe, veuillez ignorer cet email.

Cordialement,
L'équipe ${CONFIG.appName}

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }

  private getEmailChangeText(
    firstName: string,
    newEmail: string,
    verificationLink: string
  ): string {
    return `
Confirmation de changement d'email - ${CONFIG.appName}

Bonjour ${firstName},

Vous avez demandé à changer votre adresse email pour : ${newEmail}

Cliquez sur le lien ci-dessous pour confirmer ce changement :

${verificationLink}

Ce lien est valable pendant 24 heures. Si vous n'avez pas demandé à changer votre adresse email, veuillez ignorer cet email et sécuriser votre compte.

Cordialement,
L'équipe ${CONFIG.appName}

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }

  private getGenericEmailText(
    firstName: string,
    message: string,
    actionLink?: string
  ): string {
    const actionSection = actionLink ? `\n${actionLink}\n` : ""

    return `
Information ${CONFIG.appName}

Bonjour ${firstName},

${message}
${actionSection}
Cordialement,
L'équipe ${CONFIG.appName}

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }
}

// Export de l'instance unique du service
export const emailService = new EmailService()
