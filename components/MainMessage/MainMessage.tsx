"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MainMessage } from "@prisma/client"

export default function MainMessage() {
  const [message, setMessage] = useState<MainMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/main-message/active")

        if (!response.ok) {
          if (response.status === 404) {
            setMessage(null)
            return
          }
          throw new Error("Erreur lors de la récupération du message")
        }

        const data = await response.json()
        setMessage(data)
      } catch (err) {
        console.error("Erreur lors du chargement du message:", err)
        setError("Impossible de charger le message")
      } finally {
        setLoading(false)
      }
    }

    fetchMessage()
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  // Si pas de message actif ou erreur, ne rien afficher
  if (error || !message) {
    return null
  }

  const bgColor =
    message.has_background && message.background_color
      ? message.background_color
      : "bg-primary/10"

  const textColor = message.text_color ? message.text_color : "text-primary"

  return (
    <Card className={`w-full ${bgColor}`}>
      <CardContent className="py-4 px-6">
        <p className={`text-center font-bold text-4xl ${textColor}`}>
          {message.content}
        </p>
      </CardContent>
    </Card>
  )
}
