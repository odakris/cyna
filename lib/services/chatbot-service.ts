import { prisma } from "@/lib/prisma"
import { MessageType } from "@prisma/client"

interface BotResponse {
  response: string
  needsHumanSupport: boolean
}

// Définition des catégories de questions et de réponses
type QuestionCategory =
  | "greeting"
  | "products"
  | "pricing"
  | "subscription"
  | "support"
  | "technical"
  | "payment"
  | "contact"
  | "affirmative"
  | "negative"
  | "unknown"

// Base de connaissances pour le chatbot
const knowledgeBase = {
  greeting: {
    patterns: [
      "bonjour",
      "salut",
      "hello",
      "hey",
      "coucou",
      "bonsoir",
      "bonjour !",
      "salut !",
      "hello !",
      "hey !",
      "coucou !",
      "bonsoir !",
    ],
    responses: [
      "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      "Salut ! Que puis-je faire pour vous ?",
      "Bonjour ! Je suis là pour répondre à vos questions sur nos produits et services.",
    ],
  },
  products: {
    patterns: [
      "produit",
      "produits",
      "service",
      "services",
      "offre",
      "offres",
      "solution",
      "solutions",
      "cyber",
      "soc",
      "diagnostic",
      "test d'intrusion",
      "quels produits",
      "quels services",
    ],
    responses: [
      "Nous proposons plusieurs solutions de cybersécurité : Diagnostic Cyber, Test d'intrusion, Micro SOC, SOC Managé, Investigation et Gestion de crise. Souhaitez-vous des détails sur l'un de ces services ?",
      "CYNA offre une gamme complète de services de cybersécurité, de la prévention (Diagnostic, Tests d'intrusion) à la protection (SOC) et à la réponse (Investigation, Gestion de crise). Quel service vous intéresse ?",
    ],
  },
  pricing: {
    patterns: [
      "prix",
      "tarif",
      "tarifs",
      "coût",
      "combien",
      "combien ça coûte",
      "pricing",
      "abonnement",
      "forfait",
      "devis",
    ],
    responses: [
      "Nos tarifs varient selon les services. Le Diagnostic Cyber commence à 4500€, le Test d'intrusion à 4000€, le Micro SOC à 5000€, le SOC Managé à 7000€. Souhaitez-vous un devis personnalisé ?",
      "Nous proposons différentes formules tarifaires adaptées à vos besoins. Les prix commencent à 4000€ pour un test d'intrusion. Pour un devis précis, merci de préciser quel service vous intéresse.",
    ],
  },
  subscription: {
    patterns: [
      "abonnement",
      "souscrire",
      "souscription",
      "forfait",
      "mensuel",
      "annuel",
      "renouvellement",
      "modifier mon abonnement",
      "changer d'abonnement",
    ],
    responses: [
      "Nos services sont disponibles en abonnement mensuel ou annuel. L'abonnement annuel vous permet de bénéficier d'une réduction de 10%. Vous pouvez gérer vos abonnements depuis votre espace client.",
      "Pour modifier votre abonnement, connectez-vous à votre espace client et accédez à la section 'Mes abonnements'. Vous pourrez y changer de formule ou ajuster vos options.",
    ],
  },
  support: {
    patterns: [
      "support",
      "aide",
      "assistance",
      "problème",
      "bug",
      "erreur",
      "difficulté",
      "contact",
      "joindre",
      "parler",
      "humain",
      "conseiller",
      "personne",
    ],
    responses: [
      "Notre équipe de support est disponible du lundi au vendredi de 9h à 18h. Souhaitez-vous que je vous mette en relation avec un conseiller ?",
      "Je peux vous aider avec les questions courantes, mais si vous préférez parler à un conseiller, je peux transférer votre demande à notre équipe de support.",
    ],
    needsHumanSupport: true,
  },
  technical: {
    patterns: [
      "technique",
      "fonctionnement",
      "spécifications",
      "specs",
      "comment ça marche",
      "détails",
      "informations",
      "infos",
      "vulnérabilité",
      "sécurité",
    ],
    responses: [
      "Pour des informations techniques détaillées sur nos solutions, je vous invite à consulter notre documentation en ligne ou à demander à être mis en relation avec un expert technique.",
      "Nos solutions reposent sur des technologies de pointe en matière de détection et prévention des menaces. Pour des détails spécifiques, notre équipe technique sera ravie de vous renseigner.",
    ],
  },
  payment: {
    patterns: [
      "paiement",
      "payer",
      "facturation",
      "facture",
      "carte bancaire",
      "cb",
      "virement",
      "prélèvement",
      "méthode de paiement",
      "moyen de paiement",
    ],
    responses: [
      "Nous acceptons plusieurs méthodes de paiement : carte bancaire, virement bancaire et prélèvement automatique pour les abonnements. Vous pouvez gérer vos moyens de paiement dans votre espace client.",
      "Pour ajouter ou modifier un moyen de paiement, connectez-vous à votre espace client et accédez à la section 'Facturation & Paiement'.",
    ],
  },
  contact: {
    patterns: [
      "contact",
      "email",
      "téléphone",
      "adresse",
      "coordonnées",
      "localisation",
      "bureau",
      "rendez-vous",
      "rencontre",
    ],
    responses: [
      "Vous pouvez nous contacter par email à contact@cyna.fr ou par téléphone au 01 23 45 67 89. Nos bureaux sont situés à Paris, Lyon et Bordeaux. Souhaitez-vous prendre rendez-vous avec un de nos experts ?",
      "Notre équipe commerciale est à votre disposition pour toute demande. Vous pouvez nous contacter via le formulaire sur notre site ou directement par téléphone au 01 23 45 67 89.",
    ],
  },
  affirmative: {
    patterns: [
      "oui",
      "ouais",
      "yes",
      "yep",
      "ok",
      "okay",
      "d'accord",
      "bien sûr",
      "absolument",
      "certainement",
      "tout à fait",
      "effectivement",
      "exact",
      "affirmatif",
      "volontiers",
      "je veux bien",
      "je suis intéressé",
      "ça m'intéresse",
      "c'est ça",
      "exactement",
    ],
    // Les réponses varieront en fonction du contexte - sera géré dynamiquement
    responses: [
      "Parfait ! Quel aspect vous intéresse plus particulièrement ?",
      "Très bien ! Comment puis-je vous aider davantage ?",
    ],
  },
  negative: {
    patterns: [
      "non",
      "nope",
      "no",
      "pas vraiment",
      "pas du tout",
      "aucunement",
      "nullement",
      "jamais",
      "négatif",
      "je ne pense pas",
      "pas intéressé",
      "ça ne m'intéresse pas",
    ],
    // Les réponses varieront en fonction du contexte - sera géré dynamiquement
    responses: [
      "Je comprends. Y a-t-il autre chose dont vous souhaitez discuter ?",
      "D'accord. Puis-je vous aider avec autre chose ?",
    ],
  },
  unknown: {
    responses: [
      "Je ne suis pas sûr de comprendre votre demande. Pouvez-vous reformuler ou préciser votre question ?",
      "Désolé, je n'ai pas saisi votre question. Pourriez-vous la formuler différemment ?",
      "Je ne suis pas en mesure de répondre à cette question. Souhaitez-vous être mis en relation avec un conseiller ?",
    ],
  },
}

// Déterminer la catégorie de la question en tenant compte des réponses courtes
function categorizeQuestion(
  message: string,
  previousMessages: { message_type: string; content: string }[]
): QuestionCategory {
  message = message.toLowerCase().trim()

  // Traiter d'abord les réponses courtes (oui/non)
  // Mais seulement si ce n'est pas la première question
  if (previousMessages.length > 0) {
    // Vérifier si c'est une réponse affirmative
    if (
      knowledgeBase.affirmative.patterns.some(
        pattern =>
          message === pattern ||
          message.startsWith(pattern + " ") ||
          message.includes(" " + pattern + " ")
      )
    ) {
      return "affirmative"
    }

    // Vérifier si c'est une réponse négative
    if (
      knowledgeBase.negative.patterns.some(
        pattern =>
          message === pattern ||
          message.startsWith(pattern + " ") ||
          message.includes(" " + pattern + " ")
      )
    ) {
      return "negative"
    }
  }

  // Ensuite, vérifier les catégories plus spécifiques
  for (const [category, data] of Object.entries(knowledgeBase)) {
    if (
      category === "unknown" ||
      category === "affirmative" ||
      category === "negative"
    )
      continue

    const patterns = (data as any).patterns
    if (
      patterns &&
      patterns.some((pattern: string) => message.includes(pattern))
    ) {
      return category as QuestionCategory
    }
  }

  return "unknown"
}

// Déterminer si un support humain est nécessaire
function needsHumanSupport(
  message: string,
  category: QuestionCategory
): boolean {
  // Si la catégorie est "support", c'est un indicateur clair
  if (category === "support") return true

  // Si la question est longue ou complexe
  if (message.length > 150) return true

  // Si la question contient des mots-clés indiquant une demande de support
  const supportKeywords = [
    "urgent",
    "problème critique",
    "besoin d'aide",
    "parler à quelqu'un",
    "humain",
    "personne",
    "conseiller",
    "service client",
    "support technique",
    "assistance immédiate",
    "appeler",
    "téléphone",
    "contacter",
  ]

  return supportKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  )
}

// Obtenir une réponse contextuelle basée sur l'historique de la conversation
function getContextualResponse(
  category: QuestionCategory,
  message: string,
  previousMessages: { message_type: string; content: string }[]
): string {
  // Si c'est une réponse affirmative ou négative, nous devons la contextualiser
  if (category === "affirmative" || category === "negative") {
    // Récupérer la dernière question du bot (le dernier message de type BOT)
    const lastBotMessages = previousMessages
      .filter(msg => msg.message_type === MessageType.BOT)
      .slice(-2) // Les 2 derniers messages du bot

    if (lastBotMessages.length > 0) {
      const lastBotMessage =
        lastBotMessages[lastBotMessages.length - 1].content.toLowerCase()

      // Réponses contextuelles basées sur la dernière question du bot
      if (category === "affirmative") {
        // Si la dernière question concernait les produits
        if (
          lastBotMessage.includes("service") ||
          lastBotMessage.includes("produit") ||
          lastBotMessage.includes("détails")
        ) {
          return "Excellent ! Tous nos services sont conçus pour offrir une protection optimale. Pour une recommandation personnalisée, pourriez-vous me préciser la taille de votre entreprise et vos priorités en matière de cybersécurité ?"
        }

        // Si la dernière question concernait un devis
        if (
          lastBotMessage.includes("devis") ||
          lastBotMessage.includes("prix") ||
          lastBotMessage.includes("tarif")
        ) {
          return "Parfait ! Pour vous proposer un devis personnalisé, j'aurais besoin de quelques informations supplémentaires. Préférez-vous être contacté par email ou par téléphone ?"
        }

        // Si la dernière question concernait un support humain
        if (
          lastBotMessage.includes("conseiller") ||
          lastBotMessage.includes("relation") ||
          lastBotMessage.includes("support")
        ) {
          return "Je vais transmettre votre demande à notre équipe. Un conseiller va prendre contact avec vous dans les plus brefs délais. Pourriez-vous me préciser la nature de votre demande afin de la transmettre au bon interlocuteur ?"
        }
      } else if (category === "negative") {
        // Réponses négatives contextuelles
        if (
          lastBotMessage.includes("service") ||
          lastBotMessage.includes("produit") ||
          lastBotMessage.includes("détails")
        ) {
          return "Je comprends. Si vous avez d'autres questions ou si vous souhaitez des informations sur nos autres services, n'hésitez pas à me demander."
        }

        if (
          lastBotMessage.includes("devis") ||
          lastBotMessage.includes("prix")
        ) {
          return "Pas de problème. N'hésitez pas à revenir vers nous quand vous le souhaiterez. Puis-je vous aider avec autre chose ?"
        }

        if (
          lastBotMessage.includes("conseiller") ||
          lastBotMessage.includes("relation") ||
          lastBotMessage.includes("support")
        ) {
          return "D'accord. Je reste à votre disposition pour répondre à vos questions. N'hésitez pas à me demander si vous changez d'avis."
        }
      }
    }
  }

  // Pour les produits spécifiques, enrichir la réponse standard
  if (category === "products") {
    // Vérifier si la question concerne un produit spécifique
    const productKeywords = {
      diagnostic:
        "Le Diagnostic Cyber est un audit complet de votre infrastructure pour identifier les vulnérabilités. Prix : à partir de 4500€.",
      "test d'intrusion":
        "Le Test d'intrusion simule des attaques réelles pour évaluer la robustesse de vos systèmes. Prix : à partir de 4000€.",
      "micro soc":
        "Le Micro SOC offre une surveillance continue de votre sécurité, adaptée aux PME. Prix : à partir de 5000€.",
      "soc managé":
        "Le SOC Managé fournit une protection complète avec une équipe dédiée 24/7. Prix : à partir de 7000€.",
      investigation:
        "Notre service d'Investigation permet d'analyser et remédier aux incidents de sécurité. Prix : à partir de 8500€.",
      "gestion de crise":
        "La Gestion de crise cybersécurité vous accompagne lors d'incidents majeurs. Prix : à partir de 9500€.",
    }

    for (const [keyword, description] of Object.entries(productKeywords)) {
      if (message.toLowerCase().includes(keyword)) {
        return description
      }
    }
  }

  // Pour les autres catégories, utiliser les réponses standard
  const responses = knowledgeBase[category].responses
  return responses[Math.floor(Math.random() * responses.length)]
}

// Traiter le message et générer une réponse
export async function processChatbotMessage(
  message: string,
  conversation: { id_conversation: string }
): Promise<BotResponse> {
  // Obtenir l'historique des messages pour le contexte
  const messageHistory = await prisma.chatMessage.findMany({
    where: { id_conversation: conversation.id_conversation },
    orderBy: { created_at: "asc" },
    take: 5, // Limiter à 5 messages pour le contexte
  })

  // Déterminer la catégorie de la question
  const category = categorizeQuestion(message, messageHistory)

  // Vérifier si un support humain est nécessaire
  const requiresHumanSupport = needsHumanSupport(message, category)

  // Générer une réponse contextuelle basée sur la catégorie et l'historique
  const response = getContextualResponse(category, message, messageHistory)

  // Réponse finale
  return {
    response,
    needsHumanSupport: requiresHumanSupport,
  }
}
