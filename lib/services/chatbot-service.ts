// lib/services/chatbot-service.ts
import { prisma } from "@/lib/prisma"
import { ChatMessage, MessageType } from "@prisma/client"

export interface BotResponse {
  response: string
  needsHumanSupport: boolean
  context?: string
  collectedData?: {
    email?: string
    subject?: string
    message?: string
  }
}

// Types de contexte pour suivre l'état de la conversation
type ConversationContext =
  | "initial"
  | "asking_for_email"
  | "email_provided"
  | "asking_for_subject"
  | "subject_provided"
  | "asking_for_message"
  | "message_provided"
  | "ready_to_submit"
  | "info_products"
  | "info_pricing"
  | "info_specific_product"

/**
 * Traite un message utilisateur et génère une réponse appropriée.
 */
export async function processChatbotMessage(
  message: string,
  conversation: { id_conversation: number | string }
): Promise<BotResponse> {
  try {
    // Convertir l'ID de conversation en nombre si nécessaire
    const conversationId =
      typeof conversation.id_conversation === "string"
        ? parseInt(conversation.id_conversation)
        : conversation.id_conversation

    // Message en minuscules pour faciliter la comparaison
    const lowerMessage = message.toLowerCase().trim()

    // Récupérer l'historique des messages pour le contexte
    const messageHistory = await prisma.chatMessage.findMany({
      where: { id_conversation: conversationId },
      orderBy: { created_at: "desc" }, // Messages les plus récents en premier
      take: 10, // Augmenté pour capturer plus de contexte
    })

    // Récupérer le dernier message du bot pour le contexte
    const lastBotMessage = messageHistory.find(
      (msg: ChatMessage) => msg.message_type === MessageType.BOT
    )
    const lastBotContent = lastBotMessage
      ? lastBotMessage.content.toLowerCase()
      : ""

    // Déterminer le contexte actuel basé sur le dernier message du bot
    let currentContext: ConversationContext = "initial"
    let collectedData: { email?: string; subject?: string; message?: string } =
      {}

    // Détecter le contexte en fonction du contenu du dernier message du bot
    if (
      lastBotContent.includes("adresse email") ||
      lastBotContent.includes("me préciser votre adresse")
    ) {
      currentContext = "asking_for_email"
    } else if (
      lastBotContent.includes("objet de votre demande") ||
      lastBotContent.includes("préciser brièvement l'objet")
    ) {
      currentContext = "asking_for_subject"
    } else if (
      lastBotContent.includes("détailler votre demande") ||
      lastBotContent.includes("plus de détails sur votre demande")
    ) {
      currentContext = "asking_for_message"
    } else if (lastBotContent.includes("souhaitez-vous des détails")) {
      currentContext = "info_products"
    } else if (lastBotContent.includes("tarifs")) {
      currentContext = "info_pricing"
    } else if (
      lastBotContent.includes("diagnostic") ||
      lastBotContent.includes("intrusion") ||
      lastBotContent.includes("soc") ||
      lastBotContent.includes("investigation") ||
      lastBotContent.includes("crise")
    ) {
      currentContext = "info_specific_product"
    }

    // Log pour débogage
    console.log("Contexte actuel:", currentContext)
    console.log("Dernier message du bot:", lastBotContent)

    // Traiter le message en fonction du contexte actuel
    switch (currentContext) {
      case "asking_for_email":
        // Vérifier si c'est un email valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(lowerMessage)) {
          collectedData.email = lowerMessage
          return {
            response:
              "Merci pour votre email. Pourriez-vous préciser brièvement l'objet de votre demande ?",
            needsHumanSupport: true,
            context: "asking_for_subject",
            collectedData,
          }
        } else if (["oui", "ok", "d'accord", "yes"].includes(lowerMessage)) {
          // Si l'utilisateur confirme mais ne donne pas d'email
          return {
            response:
              "Pour vous contacter, j'ai besoin de votre adresse email. Pouvez-vous me l'indiquer ?",
            needsHumanSupport: true,
            context: "asking_for_email",
          }
        } else {
          // Si la réponse ne semble pas être un email, demander de nouveau
          return {
            response:
              "Je n'ai pas reconnu cela comme une adresse email valide. Pourriez-vous me donner votre adresse email (ex: exemple@domaine.com) afin qu'un conseiller puisse vous contacter ?",
            needsHumanSupport: true,
            context: "asking_for_email",
          }
        }

      case "asking_for_subject":
        if (lowerMessage.length < 2) {
          return {
            response:
              "Pourriez-vous fournir un peu plus de détails sur l'objet de votre demande ?",
            needsHumanSupport: true,
            context: "asking_for_subject",
          }
        }

        // Récupérer l'email
        let userEmail = ""

        // Rechercher dans l'historique des messages pour trouver l'email
        const emailBotMessages = messageHistory.filter(
          (msg: ChatMessage) =>
            msg.message_type === MessageType.BOT &&
            (msg.content.toLowerCase().includes("email") ||
              msg.content.toLowerCase().includes("adresse"))
        )

        if (emailBotMessages.length > 0) {
          for (const emailBotMsg of emailBotMessages) {
            const index = messageHistory.indexOf(emailBotMsg)
            // Chercher le premier message utilisateur après ce message bot
            const userMsgsAfterEmailRequest = messageHistory
              .slice(0, index)
              .filter(
                (msg: ChatMessage) => msg.message_type === MessageType.USER
              )

            if (userMsgsAfterEmailRequest.length > 0) {
              const potentialEmail = userMsgsAfterEmailRequest[0].content
              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(potentialEmail)) {
                userEmail = potentialEmail
                break
              }
            }
          }
        }

        if (!userEmail) {
          // Rechercher tout message qui pourrait être un email
          const possibleEmails = messageHistory
            .filter((msg: ChatMessage) => msg.message_type === MessageType.USER)
            .map((msg: ChatMessage) => msg.content)
            .filter((content: string) =>
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)
            )

          if (possibleEmails.length > 0) {
            userEmail = possibleEmails[0]
          }
        }

        // Stocker le sujet et demander le corps du message
        collectedData = {
          email: userEmail || "",
          subject: message.trim(),
        }

        return {
          response:
            "Merci pour ces précisions. Maintenant, pouvez-vous détailler votre demande ? Cela nous aidera à mieux comprendre et répondre à votre besoin.",
          needsHumanSupport: true,
          context: "asking_for_message",
          collectedData,
        }

      case "asking_for_message":
        if (lowerMessage.length < 5) {
          return {
            response:
              "Pourriez-vous fournir un peu plus de détails sur votre demande ?",
            needsHumanSupport: true,
            context: "asking_for_message",
          }
        }

        // Récupérer l'email et le sujet
        let storedEmail = ""
        let storedSubject = ""

        // Vérifier si nous avons déjà l'email dans les messages précédents
        const allUserMessages: string[] = messageHistory
          .filter((msg: ChatMessage) => msg.message_type === MessageType.USER)
          .map((msg: ChatMessage) => msg.content)

        // Rechercher un email dans les messages utilisateur
        const emailCandidates = allUserMessages.filter(content =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)
        )

        if (emailCandidates.length > 0) {
          storedEmail = emailCandidates[0]
        }

        // Chercher le sujet en analysant le dernier message du bot demandant plus de détails
        const detailsRequestMessages = messageHistory.filter(
          (msg: ChatMessage) =>
            msg.message_type === MessageType.BOT &&
            msg.content.toLowerCase().includes("détailler")
        )

        if (detailsRequestMessages.length > 0) {
          const subjectMessagesIndex = messageHistory.indexOf(
            detailsRequestMessages[0]
          )

          // Le sujet devrait être le message utilisateur juste avant cette demande
          for (
            let i = subjectMessagesIndex + 1;
            i < messageHistory.length;
            i++
          ) {
            if (
              messageHistory[i].message_type === MessageType.USER &&
              !emailCandidates.includes(messageHistory[i].content)
            ) {
              storedSubject = messageHistory[i].content
              break
            }
          }
        }

        // Mettre à jour les données collectées avec le message complet
        collectedData = {
          email: storedEmail,
          subject: storedSubject || "Demande via chatbot",
          message: message.trim(),
        }

        return {
          response: `Parfait ! Nous avons bien enregistré votre demande${storedSubject ? ` concernant "${storedSubject}"` : ""}. Un conseiller va vous contacter prochainement${storedEmail ? ` à l'adresse ${storedEmail}` : ""}. Merci pour votre confiance !`,
          needsHumanSupport: true,
          context: "ready_to_submit",
          collectedData,
        }

      case "info_products":
      case "info_specific_product":
        // Si l'utilisateur veut plus d'informations sur un produit
        if (
          [
            "oui",
            "ok",
            "d'accord",
            "yes",
            "plus d'informations",
            "plus de détails",
          ].includes(lowerMessage)
        ) {
          return {
            response:
              "Je vais vous mettre en relation avec l'un de nos conseillers qui pourra vous donner toutes les informations détaillées. Pourriez-vous me préciser votre adresse email afin qu'un expert puisse vous contacter dans les plus brefs délais ?",
            needsHumanSupport: true,
            context: "asking_for_email",
          }
        }
        break
    }

    // Si nous sommes ici, traiter comme un nouveau message sans contexte spécifique

    // SALUTATIONS
    if (
      lowerMessage.includes("bonjour") ||
      lowerMessage.includes("salut") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("bonsoir")
    ) {
      return {
        response: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        needsHumanSupport: false,
        context: "initial",
      }
    }

    // PRODUITS/SERVICES
    if (
      lowerMessage.includes("produit") ||
      lowerMessage.includes("service") ||
      lowerMessage.includes("offre") ||
      lowerMessage.includes("solution")
    ) {
      return {
        response:
          "Nous proposons plusieurs solutions de cybersécurité : Diagnostic Cyber, Test d'intrusion, Micro SOC, SOC Managé, Investigation et Gestion de crise. Souhaitez-vous des détails sur l'un de ces services ?",
        needsHumanSupport: false,
        context: "info_products",
      }
    }

    // TARIFS
    if (
      lowerMessage.includes("tarif") ||
      lowerMessage.includes("prix") ||
      lowerMessage.includes("coût") ||
      lowerMessage.includes("devis") ||
      lowerMessage.includes("combien")
    ) {
      return {
        response:
          "Nos tarifs varient selon les services. Le Diagnostic Cyber commence à 4500€, le Test d'intrusion à 4000€, le Micro SOC à 5000€, le SOC Managé à 7000€. Souhaitez-vous être mis en relation avec un conseiller pour obtenir un devis personnalisé ?",
        needsHumanSupport: true,
        context: "info_pricing",
      }
    }

    // DIAGNOSTIC CYBER
    if (lowerMessage.includes("diagnostic")) {
      return {
        response:
          "Le Diagnostic Cyber est un audit complet de votre infrastructure informatique qui permet d'identifier les vulnérabilités de sécurité. Prix à partir de 4500€. Souhaitez-vous être mis en relation avec un conseiller pour en savoir plus ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // TEST D'INTRUSION
    if (
      lowerMessage.includes("intrusion") ||
      lowerMessage.includes("pentest") ||
      lowerMessage.includes("test")
    ) {
      return {
        response:
          "Le Test d'intrusion simule des attaques réelles pour évaluer la robustesse de vos systèmes. Il permet d'identifier les vulnérabilités exploitables dans votre infrastructure. Prix à partir de 4000€. Souhaitez-vous être mis en relation avec un conseiller ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // SOC (Security Operations Center)
    if (
      lowerMessage.includes("soc") ||
      lowerMessage.includes("security operations")
    ) {
      return {
        response:
          "Nous proposons deux solutions SOC (Security Operations Center) : le Micro SOC adapté aux PME (à partir de 5000€) et le SOC Managé pour les grandes entreprises avec une équipe dédiée 24/7 (à partir de 7000€). Souhaitez-vous discuter avec un conseiller pour déterminer la solution adaptée à vos besoins ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // INVESTIGATION
    if (
      lowerMessage.includes("investigation") ||
      lowerMessage.includes("incident")
    ) {
      return {
        response:
          "Notre service d'Investigation permet d'analyser les incidents de sécurité et d'y remédier efficacement. Prix à partir de 8500€. Souhaitez-vous être mis en relation avec un expert ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // GESTION DE CRISE
    if (lowerMessage.includes("crise") || lowerMessage.includes("urgence")) {
      return {
        response:
          "Notre service de Gestion de crise vous accompagne lors d'incidents majeurs de cybersécurité, avec une équipe dédiée pour minimiser l'impact. Prix à partir de 9500€. Souhaitez-vous être mis en contact avec un spécialiste ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // CONTACT/AIDE/CONSEILLER (mise en relation)
    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("aide") ||
      lowerMessage.includes("conseiller") ||
      lowerMessage.includes("humain") ||
      lowerMessage.includes("parler") ||
      lowerMessage.includes("assistance") ||
      lowerMessage.includes("relation") ||
      lowerMessage.includes("devis") ||
      lowerMessage.includes("personne") ||
      lowerMessage.includes("admin") ||
      (lowerMessage.includes("mettre") && lowerMessage.includes("relation")) ||
      (lowerMessage.includes("besoin") && lowerMessage.includes("aide"))
    ) {
      return {
        response:
          "Je vais vous mettre en relation avec un conseiller CYNA qui pourra répondre à toutes vos questions. Pourriez-vous me préciser votre adresse email afin qu'un expert puisse vous contacter dans les plus brefs délais ?",
        needsHumanSupport: true,
        context: "asking_for_email",
      }
    }

    // AFFIRMATIVE (oui, ok, d'accord)
    if (
      lowerMessage === "oui" ||
      lowerMessage === "ok" ||
      lowerMessage === "oui merci" ||
      lowerMessage === "d'accord" ||
      lowerMessage === "bien sûr" ||
      lowerMessage === "volontiers"
    ) {
      // Si le dernier message contenait une proposition de mise en relation
      if (
        lastBotContent.includes("conseiller") ||
        lastBotContent.includes("relation") ||
        lastBotContent.includes("expert") ||
        lastBotContent.includes("contacter")
      ) {
        return {
          response:
            "Je vais vous mettre en relation avec l'un de nos conseillers. Pourriez-vous me préciser votre adresse email afin qu'un expert puisse vous contacter dans les plus brefs délais ?",
          needsHumanSupport: true,
          context: "asking_for_email",
        }
      }

      // Sinon réponse générique
      return {
        response:
          "Souhaitez-vous des informations spécifiques sur l'un de nos services ou être mis en relation avec un conseiller ?",
        needsHumanSupport: false,
        context: "initial",
      }
    }

    // RÉPONSE PAR DÉFAUT
    return {
      response:
        "Je peux vous renseigner sur nos produits et services de cybersécurité, nos tarifs ou vous mettre en relation avec un conseiller. Comment puis-je vous aider ?",
      needsHumanSupport: false,
      context: "initial",
    }
  } catch (error) {
    console.error("Erreur dans processChatbotMessage:", error)
    return {
      response:
        "Je rencontre un problème technique. Souhaitez-vous être mis en relation avec un conseiller ?",
      needsHumanSupport: true,
      context: "initial",
    }
  }
}
