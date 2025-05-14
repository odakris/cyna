import { Resend } from "resend"

// Types d'emails supportés par le service
export type EmailType =
  | "welcome"
  | "verification"
  | "resetPassword"
  | "emailChange"
  | "generic"
  | "orderConfirmation"

// Structure commune pour les emails
interface BaseEmailProps {
  to: string
  firstName?: string
}

// Props spécifiques pour chaque type d'email
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

interface OrderConfirmationEmailProps extends BaseEmailProps {
  orderDetails: {
    orderId: number
    orderDate: string
    invoiceNumber: string
    items: Array<{
      name: string
      quantity: number
      unitPrice: number
      subscriptionType: string
      total: number
    }>
    totalAmount: number
    shippingAddress: {
      firstName: string
      lastName: string
      address1: string
      address2?: string
      city: string
      postalCode: string
      country: string
    }
    testModeNote?: string // Ajout pour le mode test
  }
}

// Type union pour tous les types d'emails
export type EmailProps =
  | (BaseEmailProps & { type: "welcome" })
  | (VerificationEmailProps & { type: "verification" })
  | (ResetPasswordEmailProps & { type: "resetPassword" })
  | (EmailChangeProps & { type: "emailChange" })
  | (GenericEmailProps & { type: "generic" })
  | (OrderConfirmationEmailProps & { type: "orderConfirmation" })

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
      // console.error("ERREUR: La clé API Resend n'est pas configurée.")
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
        // console.error("Erreur Resend:", error)
        throw new Error(`Échec de l'envoi de l'email: ${error.message}`)
      }

      console.log(`Email envoyé avec succès, ID: ${data?.id}`)
      return true
    } catch (error) {
      // console.error("Erreur lors de l'envoi de l'email:", error)
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

      case "orderConfirmation":
        return {
          subject: `Confirmation de votre commande #${props.orderDetails.orderId} | ${CONFIG.appName}`,
          html: this.getOrderConfirmationEmailHtml(
            firstName,
            props.orderDetails
          ),
          text: this.getOrderConfirmationEmailText(
            firstName,
            props.orderDetails
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

  private getOrderConfirmationEmailHtml(
    firstName: string,
    orderDetails: OrderConfirmationEmailProps["orderDetails"]
  ): string {
    const itemsHtml = orderDetails.items
      .map(
        item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPrice.toFixed(2)} €</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.subscriptionType}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.total.toFixed(2)} €</td>
      </tr>
    `
      )
      .join("")

    const address2Html = orderDetails.shippingAddress.address2
      ? `<p>${orderDetails.shippingAddress.address2}</p>`
      : ""

    const testModeNoteHtml = orderDetails.testModeNote
      ? orderDetails.testModeNote
      : ""

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmation de commande #${orderDetails.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #302082; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { display: inline-block; background-color: #FF6B00; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirmation de commande #${orderDetails.orderId}</h1>
          </div>
          <div class="content">
            ${testModeNoteHtml}
            <p>Bonjour ${firstName},</p>
            <p>Merci pour votre commande sur ${CONFIG.appName}. Voici les détails de votre commande :</p>
            <h3>Détails de la commande</h3>
            <p><strong>Numéro de commande :</strong> ${orderDetails.invoiceNumber}</p>
            <p><strong>Date de commande :</strong> ${new Date(orderDetails.orderDate).toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th style="text-align: center;">Quantité</th>
                  <th style="text-align: right;">Prix unitaire</th>
                  <th style="text-align: center;">Type</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <p><strong>Total :</strong> ${orderDetails.totalAmount.toFixed(2)} €</p>
            <h3>Adresse de livraison</h3>
            <p>${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}</p>
            <p>${orderDetails.shippingAddress.address1}</p>
            ${address2Html}
            <p>${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.postalCode}</p>
            <p>${orderDetails.shippingAddress.country}</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${CONFIG.appUrl}/orders" class="button">Voir mes commandes</a>
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

  private getOrderConfirmationEmailText(
    firstName: string,
    orderDetails: OrderConfirmationEmailProps["orderDetails"]
  ): string {
    const itemsText = orderDetails.items
      .map(
        item =>
          `- ${item.name}: ${item.quantity} x ${item.unitPrice.toFixed(2)} € (${item.subscriptionType}) = ${item.total.toFixed(2)} €`
      )
      .join("\n")

    const address2Text = orderDetails.shippingAddress.address2
      ? `${orderDetails.shippingAddress.address2}\n`
      : ""

    const testModeNoteText = orderDetails.testModeNote
      ? `${orderDetails.testModeNote.replace(/<[^>]+>/g, "")}\n\n`
      : ""

    return `
Confirmation de commande #${orderDetails.orderId} - ${CONFIG.appName}

${testModeNoteText}Bonjour ${firstName},

Merci pour votre commande sur ${CONFIG.appName}. Voici les détails de votre commande :

Détails de la commande
---------------------
Numéro de commande : ${orderDetails.invoiceNumber}
Date de commande : ${new Date(orderDetails.orderDate).toLocaleDateString()}

Articles :
${itemsText}

Total : ${orderDetails.totalAmount.toFixed(2)} €

Adresse de livraison
--------------------
${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}
${orderDetails.shippingAddress.address1}
${address2Text}${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.postalCode}
${orderDetails.shippingAddress.country}

Vous pouvez consulter vos commandes ici :
${CONFIG.appUrl}/orders

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe ${CONFIG.appName}

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }
}

// Export de l'instance unique du service
export const emailService = new EmailService()
