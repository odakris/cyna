// lib/email/emailService.ts
import { Resend } from "resend"

interface EmailParams {
  to: string
  subject: string
  html: string
  from?: string
  text?: string
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

export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  try {
    // Vérifier que Resend est configuré
    if (!resend) {
      throw new Error("La clé API Resend n'est pas configurée.")
    }

    const defaultFrom = process.env.EMAIL_FROM || "onboarding@resend.dev"

    const { data, error } = await resend.emails.send({
      from: params.from || defaultFrom,
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: params.subject,
      html: params.html,
      text: params.text,
      attachments: params.attachments,
    })

    if (error) {
      console.error("Erreur Resend:", error)
      throw new Error(`Échec de l'envoi de l'email: ${error.message}`)
    }

    console.log(`Email envoyé avec succès, ID: ${data?.id}`)
    return true
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw error
  }
}
