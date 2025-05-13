"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { MessageType } from "@prisma/client"

interface Message {
  id?: number
  content: string
  type: MessageType
}

interface MessageData {
  response: string
  needsHumanSupport: boolean
  collectedData?: {
    email?: string
    subject?: string
    message?: string
    first_name?: string
    last_name?: string
  }
  context?: string
}

export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [needsHumanSupport, setNeedsHumanSupport] = useState(false)
  const [useGemini, setUseGemini] = useState(true) // Nouvel état pour basculer entre Gemini et l'ancien système

  // Pour stocker les données collectées lors de la conversation
  const collectedDataRef = useRef({
    email: "",
    subject: "",
    message: "",
    first_name: "",
    last_name: "",
  })

  const { toast } = useToast()
  const { data: session } = useSession()

  // Initialiser avec un message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          content:
            "Bonjour ! Je suis l'assistant virtuel IA de CYNA. Comment puis-je vous aider aujourd'hui ?",
          type: MessageType.BOT,
        },
      ])
    }
  }, [messages.length])

  // Si l'utilisateur est connecté, pré-remplir son email
  useEffect(() => {
    if (session?.user?.email) {
      collectedDataRef.current.email = session.user.email || ""
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
            userId: session?.user?.id_user || null,
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

        // 2. Envoyer le message avec le nouvel ID - Choisir l'API (Gemini ou standard)
        const messageRoute = useGemini
          ? "/api/chatbot/gemini"
          : "/api/chatbot/messages"
        const messageResponse = await fetch(messageRoute, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            conversationId: newConvId,
          }),
        })

        if (!messageResponse.ok) {
          // Si Gemini échoue, essayer l'ancien système
          if (useGemini) {
            console.log("Gemini API a échoué, passage au système standard")
            setUseGemini(false)
            const fallbackResponse = await fetch("/api/chatbot/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content,
                conversationId: newConvId,
              }),
            })

            if (!fallbackResponse.ok) {
              throw new Error(
                "Impossible d'envoyer le message, même avec le système de secours"
              )
            }

            const fallbackData = await fallbackResponse.json()
            handleMessageResponse(fallbackData)
            return
          } else {
            throw new Error("Impossible d'envoyer le message")
          }
        }

        const messageData = await messageResponse.json()
        handleMessageResponse(messageData)
      } else {
        // Conversation déjà existante
        const messageRoute = useGemini
          ? "/api/chatbot/gemini"
          : "/api/chatbot/messages"
        const messageResponse = await fetch(messageRoute, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            conversationId,
          }),
        })

        if (!messageResponse.ok) {
          // Si Gemini échoue, essayer l'ancien système
          if (useGemini) {
            console.log("Gemini API a échoué, passage au système standard")
            setUseGemini(false)
            const fallbackResponse = await fetch("/api/chatbot/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content,
                conversationId,
              }),
            })

            if (!fallbackResponse.ok) {
              throw new Error(
                "Impossible d'envoyer le message, même avec le système de secours"
              )
            }

            const fallbackData = await fallbackResponse.json()
            handleMessageResponse(fallbackData)
            return
          } else {
            throw new Error("Impossible d'envoyer le message")
          }
        }

        const messageData = await messageResponse.json()
        handleMessageResponse(messageData)
      }
    } catch (error) {
      // console.error("Erreur chatbot:", error)

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

  const handleMessageResponse = (messageData: MessageData) => {
    // Ajouter la réponse du bot
    setMessages(prev => [
      ...prev,
      { content: messageData.response, type: MessageType.BOT },
    ])

    // Mettre à jour si besoin de support humain
    setNeedsHumanSupport(messageData.needsHumanSupport)

    // Mettre à jour les données collectées si présentes
    if (messageData.collectedData) {
      if (messageData.collectedData.email) {
        collectedDataRef.current.email = messageData.collectedData.email
      }
      if (messageData.collectedData.subject) {
        collectedDataRef.current.subject = messageData.collectedData.subject
      }
      if (messageData.collectedData.message) {
        collectedDataRef.current.message = messageData.collectedData.message
      }
      if (messageData.collectedData.first_name) {
        collectedDataRef.current.first_name =
          messageData.collectedData.first_name
      }
      if (messageData.collectedData.last_name) {
        collectedDataRef.current.last_name = messageData.collectedData.last_name
      }

      console.log("Données reçues du chatbot:", messageData.collectedData)

      console.log("Données collectées avant envoi:", {
        email: collectedDataRef.current.email,
        subject: collectedDataRef.current.subject,
        message: collectedDataRef.current.message,
        first_name: collectedDataRef.current.first_name,
        last_name: collectedDataRef.current.last_name,
      })

      // Vérifier si toutes les données nécessaires sont collectées
      if (
        messageData.context === "ready_to_submit" &&
        collectedDataRef.current.email &&
        collectedDataRef.current.subject &&
        collectedDataRef.current.message &&
        collectedDataRef.current.first_name &&
        collectedDataRef.current.last_name
      ) {
        console.log("Données avant envoi:", {
          email: collectedDataRef.current.email,
          subject: collectedDataRef.current.subject,
          message: collectedDataRef.current.message,
          first_name: collectedDataRef.current.first_name,
          last_name: collectedDataRef.current.last_name,
        })
        // Modification de l'ordre pour que le prénom n'apparaisse pas à la place du sujet
        submitContactForm(
          collectedDataRef.current.email,
          collectedDataRef.current.subject,
          collectedDataRef.current.message,
          collectedDataRef.current.first_name,
          collectedDataRef.current.last_name
        )
      }
    }
  }

  // Soumettre le formulaire de contact
  const submitContactForm = async (
    email: string,
    subject: string,
    message: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      // Vérifier que nous avons les informations nécessaires
      if (!email || !subject || !message || !firstName || !lastName) {
        /*console.error("Données manquantes pour le formulaire de contact:", {
          email,
          subject,
          message,
          firstName,
          lastName,
        })*/
        return
      }

      console.log("Données envoyées à l'API:", {
        email: email,
        subject: subject,
        message: message,
        first_name: firstName,
        last_name: lastName,
      })

      console.log("Envoi du formulaire avec les données:", {
        email,
        subject,
        message,
        firstName,
        lastName,
      })

      // S'assurer que l'email est une chaîne de caractères valide
      // et pas le message lui-même (bug potentiel)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      let finalEmail = email

      // Si l'email n'est pas valide mais que l'utilisateur est connecté, utiliser son email
      if (!emailRegex.test(email) && session?.user?.email) {
        finalEmail = session.user.email
        console.log(
          "Email non valide, utilisation de l'email de session:",
          finalEmail
        )
      }
      // Si l'email est toujours invalide, afficher un message d'erreur
      else if (!emailRegex.test(email)) {
        setMessages(prev => [
          ...prev,
          {
            content:
              "Je n'ai pas pu déterminer votre adresse email. Veuillez réessayer ou utiliser le formulaire de contact directement.",
            type: MessageType.BOT,
          },
        ])
        return
      }

      const response = await fetch("/api/contact-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: finalEmail,
          subject: `[Via Chatbot IA] ${subject}`,
          message: message,
          first_name: firstName,
          last_name: lastName,
          id_user: session?.user?.id_user
            ? parseInt(session.user.id_user.toString())
            : null,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        // console.error("Erreur API:", response.status, errorText)
        throw new Error("Erreur lors de l'envoi du formulaire de contact")
      }

      // Vider les données collectées
      collectedDataRef.current = {
        email: "",
        subject: "",
        message: "",
        first_name: "",
        last_name: "",
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
        variant: "success",
        title: "Demande envoyée",
        description: "Votre demande a été transmise à notre équipe.",
      })
    } catch (error) {
      // console.error("Erreur lors de l'envoi du formulaire:", error)

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
