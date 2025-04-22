"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { MessageType } from "@prisma/client"

interface Message {
  id?: number
  content: string
  type: MessageType
}

export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [needsHumanSupport, setNeedsHumanSupport] = useState(false)

  // Pour stocker les données collectées lors de la conversation
  const [collectedData, setCollectedData] = useState({
    email: "",
    subject: "",
  })

  const { toast } = useToast()
  const { data: session } = useSession()

  // Initialiser avec un message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          content:
            "Bonjour ! Je suis l'assistant virtuel de CYNA. Comment puis-je vous aider aujourd'hui ?",
          type: MessageType.BOT,
        },
      ])
    }
  }, [messages.length])

  // Si l'utilisateur est connecté, pré-remplir son email
  useEffect(() => {
    if (session?.user?.email) {
      setCollectedData(prev => ({
        ...prev,
        email: session.user.email || "",
      }))
    }
  }, [session?.user?.email])

  // Envoyer un message
  const sendMessage = async (content: string) => {
    // Ajouter le message de l'utilisateur à l'interface
    setMessages(prev => [...prev, { content, type: MessageType.USER }])
    setIsLoading(true)

    try {
      // 1. Si pas de conversation, en créer une
      if (!conversationId) {
        const createResponse = await fetch("/api/chatbot/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session?.user?.id || null,
            email: session?.user?.email || null,
          }),
        })

        if (!createResponse.ok) {
          throw new Error("Impossible de créer une conversation")
        }

        const createData = await createResponse.json()
        const newConvId = createData.conversationId

        if (!newConvId) {
          throw new Error("ID de conversation invalide")
        }

        // Mettre à jour l'état avec le nouvel ID
        setConversationId(newConvId)

        // 2. Envoyer le message avec le nouvel ID
        const messageResponse = await fetch("/api/chatbot/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            conversationId: newConvId,
          }),
        })

        if (!messageResponse.ok) {
          throw new Error("Impossible d'envoyer le message")
        }

        const messageData = await messageResponse.json()

        // Ajouter la réponse du bot
        setMessages(prev => [
          ...prev,
          { content: messageData.response, type: MessageType.BOT },
        ])

        // Mettre à jour si besoin de support humain
        setNeedsHumanSupport(messageData.needsHumanSupport)

        // Mettre à jour les données collectées si présentes
        if (messageData.collectedData) {
          setCollectedData(prev => ({
            ...prev,
            ...messageData.collectedData,
          }))

          // Si toutes les données sont collectées et prêtes à être soumises
          if (
            messageData.context === "ready_to_submit" &&
            messageData.collectedData.email &&
            messageData.collectedData.subject
          ) {
            submitContactForm(
              messageData.collectedData.email,
              messageData.collectedData.subject,
              content
            )
          }
        }
      } else {
        // Conversation déjà existante
        const messageResponse = await fetch("/api/chatbot/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            conversationId,
          }),
        })

        if (!messageResponse.ok) {
          throw new Error("Impossible d'envoyer le message")
        }

        const messageData = await messageResponse.json()

        // Ajouter la réponse du bot
        setMessages(prev => [
          ...prev,
          { content: messageData.response, type: MessageType.BOT },
        ])

        // Mettre à jour si besoin de support humain
        setNeedsHumanSupport(messageData.needsHumanSupport)

        // Mettre à jour les données collectées si présentes
        if (messageData.collectedData) {
          setCollectedData(prev => ({
            ...prev,
            ...messageData.collectedData,
          }))

          // Si toutes les données sont collectées et prêtes à être soumises
          if (
            messageData.context === "ready_to_submit" &&
            messageData.collectedData.email &&
            messageData.collectedData.subject
          ) {
            submitContactForm(
              messageData.collectedData.email,
              messageData.collectedData.subject,
              content
            )
          }
        }
      }
    } catch (error) {
      console.error("Erreur chatbot:", error)

      // Afficher un message d'erreur à l'utilisateur
      setMessages(prev => [
        ...prev,
        {
          content:
            "Je suis désolé, j'ai rencontré un problème technique. Veuillez réessayer ou contacter notre support.",
          type: MessageType.BOT,
        },
      ])

      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de l'envoi de votre message.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Soumettre le formulaire de contact
  const submitContactForm = async (
    email: string,
    subject: string,
    message: string
  ) => {
    try {
      // Vérifier que nous avons les informations nécessaires
      if (!email || !subject || !message) {
        console.error("Données manquantes pour le formulaire de contact:", {
          email,
          subject,
          message,
        })
        return
      }

      console.log("Envoi du formulaire avec les données:", {
        email,
        subject,
        message,
      })

      const response = await fetch("/api/contact-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          subject: `[Via Chatbot] ${subject}`,
          message: message,
          id_user: session?.user?.id ? parseInt(session.user.id) : null,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erreur API:", response.status, errorText)
        throw new Error("Erreur lors de l'envoi du formulaire de contact")
      }

      // Informer l'utilisateur que sa demande a été enregistrée
      setMessages(prev => [
        ...prev,
        {
          content:
            "Votre demande a été enregistrée avec succès. Un conseiller va vous contacter très prochainement !",
          type: MessageType.BOT,
        },
      ])

      toast({
        title: "Demande envoyée",
        description: "Votre demande a été transmise à notre équipe.",
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error)

      setMessages(prev => [
        ...prev,
        {
          content:
            "Je suis désolé, une erreur s'est produite lors de l'enregistrement de votre demande. Veuillez réessayer ou contacter notre support directement.",
          type: MessageType.BOT,
        },
      ])

      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de l'envoi de votre demande.",
        variant: "destructive",
      })
    }
  }

  // Demander explicitement à parler à un conseiller
  const requestHumanSupport = async () => {
    // Envoyer un message au bot pour demander un support humain
    await sendMessage("Je souhaite parler à un conseiller")
  }

  return {
    messages,
    isLoading,
    needsHumanSupport,
    sendMessage,
    requestHumanSupport,
  }
}
