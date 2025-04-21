"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { MessageType } from "@prisma/client"

interface Message {
  id?: number
  content: string
  type: MessageType
  timestamp?: Date
}

interface ChatbotState {
  messages: Message[]
  isLoading: boolean
  conversationId: number | null
  needsHumanSupport: boolean
}

export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    conversationId: null,
    needsHumanSupport: false,
  })

  const { toast } = useToast()
  const { data: session } = useSession()

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (state.messages.length === 0) {
      setState(prev => ({
        ...prev,
        messages: [
          {
            content:
              "Bonjour ! Je suis l'assistant virtuel de CYNA. Comment puis-je vous aider aujourd'hui ?",
            type: MessageType.BOT,
          },
        ],
      }))
    }
  }, [state.messages.length])

  // Process user message and generate a response
  const sendMessage = async (content: string) => {
    // Add user message to state
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { content, type: MessageType.USER }],
      isLoading: true,
    }))

    try {
      let conversationId = state.conversationId

      // If we don't have a conversation ID yet, create one
      if (!conversationId) {
        const response = await fetch("/api/chatbot/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session?.user?.id || null,
            email: session?.user?.email || null,
          }),
        })

        if (!response.ok) throw new Error("Failed to create conversation")

        const data = await response.json()
        conversationId = data.conversationId

        // Update state with the new conversation ID
        setState(prev => ({
          ...prev,
          conversationId: data.conversationId,
        }))
      }

      // Send the message to our API using the conversationId we just got or already had
      const response = await fetch("/api/chatbot/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          conversationId: conversationId,
          userId: session?.user?.id || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      // Add bot response to state
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          { content: data.response, type: MessageType.BOT },
        ],
        isLoading: false,
        needsHumanSupport: data.needsHumanSupport || false,
      }))

      // If human support is needed, show a notification
      if (data.needsHumanSupport) {
        toast({
          title: "Support humain requis",
          description:
            "Un conseiller va prendre en charge votre demande dès que possible.",
        })
      }
    } catch (error) {
      console.error("Error in chatbot:", error)
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            content:
              "Je suis désolé, j'ai rencontré un problème. Veuillez réessayer plus tard ou contacter notre support.",
            type: MessageType.BOT,
          },
        ],
        isLoading: false,
      }))

      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de l'envoi de votre message.",
        variant: "destructive",
      })
    }
  }

  // Request human support
  const requestHumanSupport = async () => {
    if (!state.conversationId) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord démarrer une conversation.",
        variant: "destructive",
      })
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      messages: [
        ...prev.messages,
        {
          content:
            "J'ai demandé à ce qu'un conseiller prenne en charge votre demande.",
          type: MessageType.BOT,
        },
      ],
    }))

    try {
      const response = await fetch(
        `/api/chatbot/conversations/${state.conversationId}/escalate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) throw new Error("Failed to request human support")

      setState(prev => ({
        ...prev,
        isLoading: false,
        needsHumanSupport: true,
      }))

      toast({
        title: "Demande envoyée",
        description:
          "Un conseiller va prendre en charge votre demande dès que possible.",
      })
    } catch (error) {
      console.error("Error requesting human support:", error)
      setState(prev => ({
        ...prev,
        isLoading: false,
      }))

      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de la demande de support humain.",
        variant: "destructive",
      })
    }
  }

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    needsHumanSupport: state.needsHumanSupport,
    sendMessage,
    requestHumanSupport,
  }
}
