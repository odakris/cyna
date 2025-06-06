import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai"
import { MessageType } from "@prisma/client"

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

// Initialisation avec la clé API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Configuration du modèle
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
]

// Contexte système optimisé et réduit
const systemPrompt = `Tu es l'assistant virtuel de CYNA, entreprise française spécialisée en cybersécurité.

INFORMATIONS ESSENTIELLES SUR CYNA:
- Entreprise française de cybersécurité fondée en 2015
- Services adaptés aux PME et aux grandes entreprises
- Expertise en prévention, détection et réponse aux incidents

CATÉGORIES ET SERVICES PRINCIPAUX:
1. PRÉVENTION
   - Diagnostic Cyber (4500€): Audit complet de l'infrastructure informatique, analyse des vulnérabilités techniques et organisationnelles, évaluation des politiques existantes, fournit un plan d'action priorisé.
   - Test d'intrusion (4000€): Simulation d'attaques réelles par nos experts en sécurité offensive pour identifier les failles exploitables dans votre environnement numérique (applications web, API, réseaux, infrastructures).
   - Formation Cybersécurité (2500€): Programme qui transforme vos collaborateurs en acteurs proactifs de la sécurité, modules adaptés à tous les niveaux, contenu personnalisé selon votre secteur, simulations de phishing et ateliers pratiques.
   - Audit RGPD (3500€): Analyse exhaustive des pratiques de traitement des données personnelles, évaluation des bases légales, documents, procédures et transferts de données, rapport de non-conformités avec plan d'action correctif.

2. PROTECTION
   - Micro SOC (5000€): Solution de surveillance continue spécialement conçue pour les PME avec infrastructure simple, détection des menaces en temps réel, surveillance en heures ouvrées, alertes contextualisées.
   - SOC Managé (7000€): Protection 24/7/365 avec analystes experts pour grandes entreprises avec infrastructure complexe, technologies avancées, réponse rapide, architecture SIEM/SOAR, veille sur les menaces, chasse proactive.
   - EDR (4800€): Surveillance continue des postes de travail et serveurs, détection des menaces sophistiquées invisibles aux antivirus traditionnels, analyse comportementale en temps réel, agents légers, isolation instantanée des terminaux compromis.
   - XDR (8500€): Plateforme unifiant la détection et réponse à travers tous les vecteurs d'attaque (endpoints, réseau, cloud, emails), visibilité complète sur l'écosystème, détection d'attaques complexes multi-vecteurs, corrélation automatique des alertes.
   - Protection Email & Anti-Phishing (3500€): Analyse IA de chaque message pour détecter phishing, malwares et usurpations d'identité, filtrage multi-couches, analyse des pièces jointes, vérification DMARC/SPF/DKIM, simulations personnalisées.

3. RÉPONSE
   - Investigation, éradication, remédiation (8500€): Réponse méthodique aux incidents de sécurité, analyse forensique de l'étendue de la compromission, collecte de preuves selon normes judiciaires, identification des vecteurs d'attaque, équipe disponible 24/7.
   - Gestion de crise cybersécurité (9500€): Accompagnement lors d'incidents majeurs avec équipe pluridisciplinaire, coordination globale de la réponse, communication interne/externe, relations avec autorités (ANSSI, CNIL), stratégies de continuité d'activité.
   - Cyber Threat Intelligence (6000€): Veille active sur les menaces ciblant votre secteur, analyse des campagnes d'attaques émergentes, alertes précoces sur vulnérabilités, surveillance du dark web et forums cybercriminels.
   - Red Team (10000€): Simulation d'attaques avancées reproduisant méthodes des adversaires sophistiqués, opérations complètes avec ingénierie sociale, exploitation technique et mouvement latéral, test des défenses et capacités de détection/réponse.

QUESTIONS FRÉQUENTES ET COMPARAISONS:
- Différence Micro SOC/SOC Managé: Le Micro SOC (5000€) est pour PME avec surveillance heures ouvrées, le SOC Managé (7000€) est 24/7 pour grandes entreprises avec besoins avancés.
- Différence EDR/XDR: L'EDR (4800€) surveille uniquement les endpoints, le XDR (8500€) intègre données des endpoints, réseau, cloud et emails pour une visibilité complète.
- Durée diagnostic cyber: 5 jours ouvrés en moyenne
- Nos services sont conformes RGPD
- Intervention d'urgence possible sous 4h maximum
- Offre spéciale printemps 2025: 15% de réduction sur tous les services de protection jusqu'au 30 avril

COLLECTE DE CONTACT:
Demande l'email, prénom, nom, sujet et message UNIQUEMENT si l'utilisateur exprime clairement vouloir être contacté.
Collecte DANS CET ORDRE:
1. Email (format valide)
2. Prénom
3. Nom de famille
4. Objet de la demande
5. Détails de la demande

Une fois les informations collectées, inclus cette balise dans ta réponse:
"[COLLECTE_COMPLETE|email=email@exemple.com|first_name=Prénom|last_name=Nom|subject=Sujet|message=Description]"

COMPORTEMENT:
- Sois précis, informatif mais concis dans tes réponses
- Adapte ton niveau technique selon l'utilisateur
- Propose la mise en relation avec un conseiller pour les questions complexes
- Si tu ne comprends pas une question, demande des précisions`
/**
 * Traite un message utilisateur avec l'API Gemini
 */
export async function processChatbotMessageWithGemini(
  message: string,
  conversation: { id_conversation: number | string },
  messageHistory: { message_type: MessageType; content: string }[] = []
): Promise<BotResponse> {
  try {
    // Obtenir le modèle Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings,
      generationConfig: {
        temperature: 0.5, // Réduit de 0.7 à 0.5 pour plus de cohérence
        maxOutputTokens: 800, // Réduit de 1000 à 800
      },
    })

    // Construire le prompt complet avec le contexte système et l'historique limité
    let fullPrompt = systemPrompt + "\n\n"
    fullPrompt += "HISTORIQUE DE LA CONVERSATION (RÉCENT):\n"

    // Limiter à 5 derniers messages maximum pour réduire la consommation de tokens
    const recentHistory = messageHistory.slice(0, 5)
    for (const msg of recentHistory) {
      const prefix =
        msg.message_type === MessageType.USER ? "Utilisateur: " : "Assistant: "
      fullPrompt += prefix + msg.content + "\n"
    }

    // Ajouter le message actuel
    fullPrompt += "\nMESSAGE ACTUEL:\nUtilisateur: " + message + "\n"
    fullPrompt +=
      "\nTA RÉPONSE (sans répéter l'historique ni le préfixe 'Assistant:'):\n"

    // Générer la réponse
    const result = await model.generateContent(fullPrompt)
    let responseText = result.response.text()

    // Nettoyer la réponse - enlever les préfixes et répétitions
    responseText = cleanResponse(responseText, messageHistory, message)

    // Détecter si la collecte est complète - Mise à jour pour inclure prénom et nom
    const collecteCompleteRegex =
      /\[COLLECTE_COMPLETE\|email=([^|]+)\|first_name=([^|]+)\|last_name=([^|]+)\|subject=([^|]+)\|message=([^\]]+)\]/
    const matches = responseText.match(collecteCompleteRegex)

    if (matches && matches.length === 6) {
      // Extraction des données collectées
      const email = matches[1].trim()
      const firstName = matches[2].trim()
      const lastName = matches[3].trim()
      const subject = matches[4].trim()
      const messageDetails = matches[5].trim()

      // Retirer la balise technique du message affiché à l'utilisateur
      const cleanedResponse = responseText.replace(matches[0], "").trim()

      return {
        response:
          cleanedResponse ||
          `Parfait ! Nous avons bien enregistré votre demande concernant "${subject}". Un conseiller va vous contacter prochainement à l'adresse ${email}. Merci pour votre confiance !`,
        needsHumanSupport: true,
        context: "ready_to_submit",
        collectedData: {
          email: email,
          subject: subject,
          message: messageDetails,
          first_name: firstName,
          last_name: lastName,
        },
      }
    }

    // Déterminer le contexte en fonction du contenu de la réponse
    let context = "initial"
    const lowerResponse = responseText.toLowerCase()

    if (
      lowerResponse.includes("email") ||
      lowerResponse.includes("adresse") ||
      lowerResponse.includes("me communiquer") ||
      lowerResponse.includes("coordonnées")
    ) {
      context = "asking_for_email"
    } else if (
      lowerResponse.includes("prénom") ||
      lowerResponse.includes("vous appeler") ||
      lowerResponse.includes("vous nommez")
    ) {
      context = "asking_for_first_name"
    } else if (
      lowerResponse.includes("nom de famille") ||
      lowerResponse.includes("votre nom")
    ) {
      context = "asking_for_last_name"
    } else if (
      lowerResponse.includes("objet") ||
      lowerResponse.includes("sujet") ||
      lowerResponse.includes("concernant quoi")
    ) {
      context = "asking_for_subject"
    } else if (
      lowerResponse.includes("détail") ||
      lowerResponse.includes("préciser") ||
      lowerResponse.includes("plus d'informations") ||
      lowerResponse.includes("expliquer davantage")
    ) {
      context = "asking_for_message"
    }

    // Si la collecte n'est pas encore complète
    return {
      response: responseText,
      needsHumanSupport:
        context !== "initial" ||
        lowerResponse.includes("conseiller") ||
        lowerResponse.includes("contacter"),
      context: context,
    }
  } catch (error) {
    // console.error("Erreur Gemini:", error)

    // Fallback vers la méthode originale en cas d'erreur
    const fallbackService = await import("./chatbot-service")
    return fallbackService.processChatbotMessage(message, conversation)
  }
}

/**
 * Nettoie la réponse de Gemini en supprimant les préfixes et répétitions éventuelles
 */
function cleanResponse(
  response: string,
  history: { message_type: MessageType; content: string }[],
  currentMessage: string
): string {
  let cleaned = response

  // Supprimer toute répétition du message de l'utilisateur
  const userMsgPattern = new RegExp(
    `Utilisateur: ${escapeRegExp(currentMessage)}`,
    "gi"
  )
  cleaned = cleaned.replace(userMsgPattern, "")

  // Supprimer les préfixes "Utilisateur:" ou "Assistant:"
  cleaned = cleaned.replace(/^(Utilisateur|Assistant):\s*/gm, "")

  // Supprimer les répétitions de l'historique
  for (const msg of history) {
    const content = escapeRegExp(msg.content)
    const contentPattern = new RegExp(`${content}`, "gi")
    cleaned = cleaned.replace(contentPattern, "")
  }

  // Supprimer les sections spécifiques au prompt
  cleaned = cleaned.replace(/^TA RÉPONSE.*$/gim, "")
  cleaned = cleaned.replace(/^HISTORIQUE DE LA CONVERSATION:$/gim, "")
  cleaned = cleaned.replace(/^MESSAGE ACTUEL:$/gim, "")

  // Nettoyer les espaces multiples et lignes vides
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n")
  cleaned = cleaned.replace(/\s{2,}/g, " ")

  // Supprimer les espaces en début et fin
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * Fonction utilitaire pour échapper les caractères spéciaux dans une regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
