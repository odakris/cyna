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
    first_name?: string
    last_name?: string
  }
}

// Types de contexte pour suivre l'état de la conversation
type ConversationContext =
  | "initial"
  | "asking_for_email"
  | "email_provided"
  | "asking_for_first_name"
  | "first_name_provided"
  | "asking_for_last_name"
  | "last_name_provided"
  | "asking_for_subject"
  | "subject_provided"
  | "asking_for_message"
  | "message_provided"
  | "ready_to_submit"
  | "info_products"
  | "info_pricing"
  | "info_specific_product"
  | "info_category"
  | "info_offers"
  | "compare_products"
  | "service_support"

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
    let collectedData: {
      email?: string
      subject?: string
      message?: string
      first_name?: string
      last_name?: string
    } = {}

    // Détecter le contexte en fonction du contenu du dernier message du bot
    if (
      lastBotContent.includes("adresse email") ||
      lastBotContent.includes("me préciser votre adresse")
    ) {
      currentContext = "asking_for_email"
    } else if (
      lastBotContent.includes("prénom") ||
      lastBotContent.includes("me préciser votre prénom")
    ) {
      currentContext = "asking_for_first_name"
    } else if (
      lastBotContent.includes("nom de famille") ||
      lastBotContent.includes("votre nom")
    ) {
      currentContext = "asking_for_last_name"
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
      lastBotContent.includes("crise") ||
      lastBotContent.includes("edr") ||
      lastBotContent.includes("xdr") ||
      lastBotContent.includes("phishing") ||
      lastBotContent.includes("threat") ||
      lastBotContent.includes("rgpd") ||
      lastBotContent.includes("red team") ||
      lastBotContent.includes("formation")
    ) {
      currentContext = "info_specific_product"
    } else if (
      lastBotContent.includes("prévention") ||
      lastBotContent.includes("protection") ||
      lastBotContent.includes("réponse")
    ) {
      currentContext = "info_category"
    } else if (
      lastBotContent.includes("offre") ||
      lastBotContent.includes("promotion") ||
      lastBotContent.includes("réduction")
    ) {
      currentContext = "info_offers"
    } else if (lastBotContent.includes("comparaison")) {
      currentContext = "compare_products"
    } else if (
      lastBotContent.includes("support") ||
      lastBotContent.includes("assistance") ||
      lastBotContent.includes("technique")
    ) {
      currentContext = "service_support"
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
              "Merci pour votre email. Pourriez-vous me préciser votre prénom ?",
            needsHumanSupport: true,
            context: "asking_for_first_name",
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

      case "asking_for_first_name":
        if (lowerMessage.length < 2) {
          return {
            response:
              "Pourriez-vous fournir un prénom valide s'il vous plaît ?",
            needsHumanSupport: true,
            context: "asking_for_first_name",
          }
        }

        // Récupérer l'email depuis l'historique des messages
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

        // Stocker le prénom et demander le nom
        collectedData = {
          email: userEmail || "",
          first_name: message.trim(),
        }

        return {
          response: "Merci. Et quel est votre nom de famille ?",
          needsHumanSupport: true,
          context: "asking_for_last_name",
          collectedData,
        }

      case "asking_for_last_name":
        if (lowerMessage.length < 2) {
          return {
            response:
              "Pourriez-vous fournir un nom de famille valide s'il vous plaît ?",
            needsHumanSupport: true,
            context: "asking_for_last_name",
          }
        }

        // Récupérer l'email et le prénom
        let storedEmail = ""
        let storedFirstName = ""

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

        // Chercher le prénom en analysant les messages
        const firstNameRequest = messageHistory.filter(
          (msg: ChatMessage) =>
            msg.message_type === MessageType.BOT &&
            msg.content.toLowerCase().includes("prénom")
        )

        if (firstNameRequest.length > 0) {
          const firstNameIndex = messageHistory.indexOf(firstNameRequest[0])

          // Le prénom devrait être dans le message utilisateur suivant
          for (let i = 0; i < messageHistory.length; i++) {
            if (
              messageHistory[i].message_type === MessageType.USER &&
              i < firstNameIndex &&
              !emailCandidates.includes(messageHistory[i].content) &&
              messageHistory[i].content.length >= 2
            ) {
              storedFirstName = messageHistory[i].content
              break
            }
          }
        }

        // Stocker le nom et demander l'objet du message
        collectedData = {
          email: storedEmail || "",
          first_name: storedFirstName || "",
          last_name: message.trim(),
        }

        return {
          response:
            "Merci pour ces informations. Pourriez-vous préciser brièvement l'objet de votre demande ?",
          needsHumanSupport: true,
          context: "asking_for_subject",
          collectedData,
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

        // Récupérer les informations déjà collectées
        let storedEmail2 = ""
        let storedFirstName2 = ""
        let storedLastName = ""

        // Rechercher dans l'historique pour ces informations
        // (Code similaire à celui pour récupérer l'email et le prénom)
        const emailCandidates2 = messageHistory
          .filter((msg: ChatMessage) => msg.message_type === MessageType.USER)
          .map((msg: ChatMessage) => msg.content)
          .filter((content: string) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)
          )

        if (emailCandidates2.length > 0) {
          storedEmail2 = emailCandidates2[0]
        }

        // Logique pour trouver le prénom et le nom
        // Cette partie est simplifiée, mais devrait être plus robuste en production
        const userMessages = messageHistory
          .filter((msg: ChatMessage) => msg.message_type === MessageType.USER)
          .map((msg: ChatMessage) => msg.content)
          .filter(
            (content: string) =>
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content) && content.length >= 2
          )

        if (userMessages.length >= 2) {
          // Supposons que les deux derniers messages non-email sont le prénom et le nom
          storedFirstName2 = userMessages[1] // L'avant-dernier est probablement le prénom
          storedLastName = userMessages[0] // Le dernier est probablement le nom
        }

        // Stocker le sujet et demander le corps du message
        collectedData = {
          email: storedEmail2 || "",
          first_name: storedFirstName2 || "",
          last_name: storedLastName || "",
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

        // Récupérer toutes les informations précédemment collectées
        let storedEmail3 = ""
        let storedFirstName3 = ""
        let storedLastName3 = ""
        let storedSubject = ""

        // Récupération de l'email (comme précédemment)
        const allUserMessages3 = messageHistory
          .filter((msg: ChatMessage) => msg.message_type === MessageType.USER)
          .map((msg: ChatMessage) => msg.content)

        const emailCandidates3 = allUserMessages3.filter(content =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)
        )

        if (emailCandidates3.length > 0) {
          storedEmail3 = emailCandidates3[0]
        }

        // Cette logique pourrait être améliorée pour une récupération plus précise
        // Dans une vraie application, on pourrait stocker ces informations dans un état de session
        const nonEmailMessages = allUserMessages3.filter(
          msg => !emailCandidates3.includes(msg) && msg.length >= 2
        )

        if (nonEmailMessages.length >= 3) {
          // On prend les 3 derniers messages non-email comme prénom, nom et sujet
          storedSubject = nonEmailMessages[nonEmailMessages.length - 3]
          storedLastName3 = nonEmailMessages[nonEmailMessages.length - 2]
          storedFirstName3 = nonEmailMessages[nonEmailMessages.length - 1]
        }

        // Chercher le sujet en analysant le dernier message du bot demandant plus de détails
        const detailsRequestMessages = messageHistory.filter(
          (msg: ChatMessage) =>
            msg.message_type === MessageType.BOT &&
            msg.content.toLowerCase().includes("détailler")
        )

        if (detailsRequestMessages.length > 0 && !storedSubject) {
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
              !emailCandidates3.includes(messageHistory[i].content)
            ) {
              storedSubject = messageHistory[i].content
              break
            }
          }
        }

        // Mettre à jour les données collectées avec le message complet
        collectedData = {
          email: storedEmail3 || "",
          first_name: storedFirstName3 || "",
          last_name: storedLastName3 || "",
          subject: storedSubject || "Demande via chatbot",
          message: message.trim(),
        }

        // Construire une réponse qui mentionne toutes les informations collectées
        const responseDetails = []
        if (storedEmail3) responseDetails.push(`à l'adresse ${storedEmail3}`)
        if (storedFirstName3 && storedLastName3)
          responseDetails.push(`pour ${storedFirstName3} ${storedLastName3}`)
        if (storedSubject) responseDetails.push(`concernant "${storedSubject}"`)

        const detailsText =
          responseDetails.length > 0 ? " " + responseDetails.join(" ") : ""

        return {
          response: `Parfait ! Nous avons bien enregistré votre demande${detailsText}. Un conseiller va vous contacter prochainement. Merci pour votre confiance !`,
          needsHumanSupport: true,
          context: "ready_to_submit",
          collectedData,
        }

      case "info_products":
      case "info_specific_product":
      case "info_category":
      case "info_offers":
      case "compare_products":
      case "service_support":
        // Si l'utilisateur veut plus d'informations
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

    // CATÉGORIES
    if (
      lowerMessage.includes("catégorie") ||
      lowerMessage.includes("types de") ||
      lowerMessage.includes("quels services") ||
      lowerMessage.includes("quels produits")
    ) {
      return {
        response:
          "Nous proposons trois grandes catégories de solutions de cybersécurité : Prévention (diagnostic, tests d'intrusion, formation, audit RGPD), Protection (SOC, EDR, XDR, anti-phishing) et Réponse (investigation, gestion de crise, Threat Intelligence, Red Team). Quelle catégorie vous intéresse le plus ?",
        needsHumanSupport: false,
        context: "info_category",
      }
    }

    // PRÉVENTION
    if (
      lowerMessage.includes("prévention") ||
      lowerMessage.includes("anticiper") ||
      lowerMessage.includes("éviter")
    ) {
      return {
        response:
          "Notre catégorie Prévention comprend plusieurs services : le Diagnostic Cyber (4500€), le Test d'intrusion (4000€), la Formation Cybersécurité (2500€) et l'Audit de conformité RGPD (3500€). Ces services vous aident à identifier et corriger les vulnérabilités avant qu'elles ne soient exploitées. Souhaitez-vous des informations sur l'un de ces services en particulier ?",
        needsHumanSupport: false,
        context: "info_category",
      }
    }

    // PROTECTION
    if (
      lowerMessage.includes("protection") ||
      lowerMessage.includes("défendre") ||
      lowerMessage.includes("sécuriser")
    ) {
      return {
        response:
          "Notre catégorie Protection comprend : Micro SOC (5000€), SOC Managé (7000€), EDR - Endpoint Detection and Response (4800€), XDR - Extended Detection and Response (8500€) et Protection Email & Anti-Phishing (3500€). Ces solutions constituent votre ligne de défense active contre les cybermenaces. Souhaitez-vous des détails sur l'un de ces services ?",
        needsHumanSupport: false,
        context: "info_category",
      }
    }

    // RÉPONSE
    if (
      lowerMessage.includes("réponse") ||
      lowerMessage.includes("réaction") ||
      lowerMessage.includes("après attaque") ||
      lowerMessage.includes("incident")
    ) {
      return {
        response:
          "Notre catégorie Réponse comprend : Investigation, éradication, remédiation (8500€), Gestion de crise cybersécurité (9500€), Cyber Threat Intelligence (6000€) et Red Team - Simulation d'attaques avancées (10000€). Ces services vous accompagnent suite à un incident de sécurité ou pour tester votre résistance. Lequel vous intéresse particulièrement ?",
        needsHumanSupport: false,
        context: "info_category",
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
          "Nous proposons plusieurs solutions de cybersécurité réparties en 3 catégories : Prévention (Diagnostic Cyber, Test d'intrusion, Formation, Audit RGPD), Protection (Micro SOC, SOC Managé, EDR, XDR, Anti-Phishing) et Réponse (Investigation, Gestion de crise, Threat Intelligence, Red Team). Souhaitez-vous des détails sur l'une de ces catégories ou services ?",
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
          "Nos tarifs varient selon les services. En Prévention : Diagnostic Cyber (4500€), Test d'intrusion (4000€), Formation (2500€), Audit RGPD (3500€). En Protection : Micro SOC (5000€), SOC Managé (7000€), EDR (4800€), XDR (8500€), Anti-Phishing (3500€). En Réponse : Investigation (8500€), Gestion de crise (9500€), Threat Intelligence (6000€), Red Team (10000€). Souhaitez-vous un devis personnalisé ?",
        needsHumanSupport: true,
        context: "info_pricing",
      }
    }

    // PROMOTIONS ET OFFRES SPÉCIALES
    if (
      lowerMessage.includes("promotion") ||
      lowerMessage.includes("offre spéciale") ||
      lowerMessage.includes("réduction") ||
      lowerMessage.includes("remise") ||
      lowerMessage.includes("promo")
    ) {
      return {
        response:
          "Nous avons actuellement une offre spéciale printemps 2025 avec 15% de réduction sur tous nos services de protection jusqu'au 30 avril ! Cette offre est applicable sur nos solutions Micro SOC, SOC Managé, EDR, XDR et Protection Email & Anti-Phishing. Souhaitez-vous en savoir plus ou être mis en relation avec un conseiller pour en bénéficier ?",
        needsHumanSupport: true,
        context: "info_offers",
      }
    }

    // COMPARAISON DE PRODUITS
    if (
      lowerMessage.includes("comparer") ||
      lowerMessage.includes("différence") ||
      lowerMessage.includes("versus") ||
      lowerMessage.includes("vs") ||
      (lowerMessage.includes("ou") &&
        (lowerMessage.includes("soc") ||
          lowerMessage.includes("edr") ||
          lowerMessage.includes("xdr")))
    ) {
      // Détection de comparaison entre SOC
      if (
        (lowerMessage.includes("micro soc") &&
          lowerMessage.includes("soc managé")) ||
        (lowerMessage.includes("micro") && lowerMessage.includes("managé"))
      ) {
        return {
          response:
            "Le Micro SOC (5000€) est conçu pour les PME avec une infrastructure simple et offre une surveillance en heures ouvrées, tandis que le SOC Managé (7000€) est une solution 24/7 pour les grandes entreprises avec une infrastructure complexe et des besoins de sécurité avancés. Souhaitez-vous plus de détails sur ces différences ?",
          needsHumanSupport: true,
          context: "compare_products",
        }
      }

      // Détection de comparaison entre EDR et XDR
      if (lowerMessage.includes("edr") && lowerMessage.includes("xdr")) {
        return {
          response:
            "L'EDR (4800€) surveille uniquement les endpoints (postes de travail, serveurs) tandis que le XDR (8500€) offre une protection étendue en intégrant les données des endpoints, du réseau, du cloud et des emails pour une visibilité complète sur tout votre écosystème numérique. Le XDR permet de détecter des attaques complexes multi-vecteurs invisibles aux solutions EDR. Souhaitez-vous être mis en relation avec un expert pour une analyse de vos besoins ?",
          needsHumanSupport: true,
          context: "compare_products",
        }
      }

      return {
        response:
          "Je peux vous aider à comparer nos différentes solutions. Pourriez-vous me préciser quels services ou produits spécifiques vous souhaitez comparer ?",
        needsHumanSupport: false,
        context: "compare_products",
      }
    }

    // DIAGNOSTIC CYBER
    if (lowerMessage.includes("diagnostic")) {
      return {
        response:
          "Le Diagnostic Cyber est un audit complet de votre infrastructure informatique qui permet d'identifier les vulnérabilités de sécurité. Il inclut l'analyse des vulnérabilités techniques et organisationnelles, l'évaluation des politiques existantes, et fournit un plan d'action priorisé. Prix à partir de 4500€. Souhaitez-vous être mis en relation avec un conseiller pour en savoir plus ?",
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
          "Le Test d'intrusion simule des attaques réelles pour évaluer la robustesse de vos systèmes. Nos experts en sécurité offensive identifient les failles exploitables dans votre environnement numérique avec des tests ciblés sur applications web, API, réseaux et infrastructures. Prix à partir de 4000€. Souhaitez-vous être mis en relation avec un conseiller ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // FORMATION CYBERSÉCURITÉ
    if (
      lowerMessage.includes("formation") ||
      lowerMessage.includes("sensibilisation") ||
      lowerMessage.includes("apprendre") ||
      lowerMessage.includes("former")
    ) {
      return {
        response:
          "Notre programme de Formation Cybersécurité transforme vos collaborateurs en acteurs proactifs de la sécurité. Nous proposons des modules adaptés à tous les niveaux avec du contenu personnalisé selon votre secteur d'activité. La formation inclut des simulations de phishing et des ateliers pratiques. Prix à partir de 2500€. Souhaitez-vous en savoir plus ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // AUDIT RGPD
    if (
      lowerMessage.includes("rgpd") ||
      lowerMessage.includes("gdpr") ||
      lowerMessage.includes("règlement") ||
      lowerMessage.includes("données personnelles") ||
      lowerMessage.includes("conformité")
    ) {
      return {
        response:
          "Notre Audit de conformité RGPD analyse vos pratiques de traitement des données personnelles pour garantir leur alignement avec la réglementation européenne. Nous évaluons vos bases légales, documents, procédures et transferts de données. Vous recevrez un rapport de non-conformités avec un plan d'action correctif. Prix à partir de 3500€. Souhaitez-vous plus d'informations ?",
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
          "Nous proposons deux solutions SOC (Security Operations Center) : le Micro SOC adapté aux PME (à partir de 5000€) avec surveillance en heures ouvrées, et le SOC Managé pour les grandes entreprises avec une équipe dédiée 24/7/365 (à partir de 7000€) incluant une chasse proactive aux menaces et une gestion des incidents. Souhaitez-vous discuter avec un conseiller pour déterminer la solution adaptée à vos besoins ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // MICRO SOC
    if (lowerMessage.includes("micro soc")) {
      return {
        response:
          "Notre Micro SOC est une solution de surveillance continue spécialement conçue pour les PME. Elle détecte les menaces en temps réel en analysant les comportements suspects et inclut la collecte des logs système, réseau et applicatifs avec une interface intuitive et des alertes contextualisées. Prix à partir de 5000€. Souhaitez-vous plus de détails ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // SOC MANAGÉ
    if (
      lowerMessage.includes("soc managé") ||
      lowerMessage.includes("soc géré") ||
      lowerMessage.includes("security operations center managé")
    ) {
      return {
        response:
          "Notre SOC Managé offre une protection continue avec des analystes experts opérant 24/7. Il combine technologies avancées et intelligence humaine pour une détection et réponse rapides. Notre solution inclut une architecture SIEM/SOAR, une veille sur les menaces, et une chasse proactive. Prix à partir de 7000€. Souhaitez-vous être contacté par un spécialiste ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // EDR (Endpoint Detection and Response)
    if (
      lowerMessage.includes("edr") ||
      lowerMessage.includes("endpoint") ||
      lowerMessage.includes("poste de travail")
    ) {
      return {
        response:
          "Notre solution EDR (Endpoint Detection and Response) surveille en continu vos postes de travail et serveurs pour détecter les menaces sophistiquées. Contrairement aux antivirus traditionnels, notre EDR analyse les comportements en temps réel avec des agents légers et une isolation instantanée des terminaux compromis. Prix à partir de 4800€. Souhaitez-vous une démonstration ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // XDR (Extended Detection and Response)
    if (lowerMessage.includes("xdr") || lowerMessage.includes("extended")) {
      return {
        response:
          "Notre plateforme XDR (Extended Detection and Response) unifie la détection et la réponse à travers tous vos vecteurs d'attaque (endpoints, réseau, cloud, emails). Cette approche holistique permet de détecter les attaques complexes traversant plusieurs systèmes avec une corrélation automatique des alertes et une visualisation complète de la chaîne d'attaque. Prix à partir de 8500€. Souhaitez-vous en savoir plus ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // ANTI-PHISHING
    if (
      lowerMessage.includes("phishing") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("hameçonnage") ||
      lowerMessage.includes("courriel")
    ) {
      return {
        response:
          "Notre Protection Email & Anti-Phishing utilise l'intelligence artificielle pour analyser chaque message et détecter les tentatives de phishing, les malwares et les usurpations d'identité. Nous proposons un filtrage multi-couches, une analyse des pièces jointes, une vérification DMARC/SPF/DKIM et des simulations personnalisées. Prix à partir de 3500€. Souhaitez-vous être contacté par un expert ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // INVESTIGATION
    if (
      lowerMessage.includes("investigation") ||
      lowerMessage.includes("incident") ||
      lowerMessage.includes("compromission") ||
      lowerMessage.includes("remédiation") ||
      lowerMessage.includes("forensique")
    ) {
      return {
        response:
          "Notre service d'Investigation, éradication et remédiation fournit une réponse méthodique aux incidents de sécurité. Nos experts en forensique numérique analysent l'étendue de la compromission, collectent les preuves selon les normes judiciaires, et identifient les vecteurs d'attaque avec une équipe disponible 24/7. Prix à partir de 8500€. Avez-vous besoin d'assistance immédiate ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // GESTION DE CRISE
    if (lowerMessage.includes("crise") || lowerMessage.includes("urgence")) {
      return {
        response:
          "Notre service de Gestion de crise cybersécurité vous accompagne lors d'incidents majeurs avec une équipe pluridisciplinaire. Nous prenons en charge la coordination globale de la réponse, la communication interne/externe, les relations avec les autorités (ANSSI, CNIL) et les stratégies de continuité d'activité. Prix à partir de 9500€. Souhaitez-vous être contacté en urgence ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // CYBER THREAT INTELLIGENCE
    if (
      lowerMessage.includes("threat") ||
      lowerMessage.includes("intelligence") ||
      lowerMessage.includes("menace") ||
      lowerMessage.includes("renseignement") ||
      lowerMessage.includes("cti")
    ) {
      return {
        response:
          "Notre service de Cyber Threat Intelligence (CTI) transforme le renseignement sur les menaces en avantage stratégique. Nous surveillons activement le paysage des menaces ciblant votre secteur avec une veille sur le dark web, une analyse des campagnes d'attaques émergentes et des alertes précoces sur les vulnérabilités. Prix à partir de 6000€. Souhaitez-vous plus d'informations ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // RED TEAM
    if (
      lowerMessage.includes("red team") ||
      lowerMessage.includes("équipe rouge") ||
      lowerMessage.includes("simulation d'attaque") ||
      lowerMessage.includes("attaque simulée")
    ) {
      return {
        response:
          "Notre service Red Team reproduit les méthodes d'attaque des adversaires sophistiqués. Contrairement aux tests d'intrusion traditionnels, nos opérations sont des simulations complètes avec ingénierie sociale, exploitation technique et mouvement latéral. Nous testons vos défenses techniques et vos capacités de détection et réponse. Prix à partir de 10000€. Souhaitez-vous échanger avec un expert ?",
        needsHumanSupport: true,
        context: "info_specific_product",
      }
    }

    // SUPPORT TECHNIQUE / SERVICE APRÈS-VENTE
    if (
      lowerMessage.includes("support") ||
      lowerMessage.includes("après-vente") ||
      lowerMessage.includes("assistance technique") ||
      lowerMessage.includes("problème technique") ||
      lowerMessage.includes("difficulté")
    ) {
      return {
        response:
          "Notre équipe de support technique est disponible pour vous aider avec tout problème lié à nos services. Pour une assistance rapide, pourriez-vous me préciser le service concerné et la nature de votre demande ? Souhaitez-vous être mis en relation avec un de nos techniciens ?",
        needsHumanSupport: true,
        context: "service_support",
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
          "Souhaitez-vous des informations spécifiques sur l'une de nos catégories de services (Prévention, Protection, Réponse) ou être mis en relation avec un conseiller ?",
        needsHumanSupport: false,
        context: "initial",
      }
    }

    // RÉPONSE PAR DÉFAUT
    return {
      response:
        "Je peux vous renseigner sur nos solutions de cybersécurité réparties en 3 catégories : Prévention (Diagnostic, Tests, Formation, RGPD), Protection (SOC, EDR, XDR, Anti-Phishing) et Réponse (Investigation, Gestion de crise, Threat Intelligence, Red Team). Comment puis-je vous aider ?",
      needsHumanSupport: false,
      context: "initial",
    }
  } catch (error) {
    // console.error("Erreur dans processChatbotMessage:", error)
    return {
      response:
        "Je rencontre un problème technique. Souhaitez-vous être mis en relation avec un conseiller ?",
      needsHumanSupport: true,
      context: "initial",
    }
  }
}
