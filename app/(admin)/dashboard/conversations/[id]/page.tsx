"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import RoleGuard from "@/components/Auth/RoleGuard"
import { ConversationStatus, MessageType, Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"

interface Message {
  id_message: number
  content: string
  message_type: string
  created_at: string
}

interface Conversation {
  id_conversation: number
  status: string
  created_at: string
  updated_at: string
  email: string | null
  id_user: number | null
  user: {
    email: string
    first_name: string
    last_name: string
  } | null
}

export default function ConversationDetailPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [input, setInput] = useState("")

  const fetchConversation = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chatbot/conversations/${id}`)
      if (!response.ok) throw new Error("Failed to fetch conversation")

      const data = await response.json()
      setConversation(data.conversation)
      setMessages(data.messages)
    } catch (error) {
      console.error("Error fetching conversation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    if (id) {
      fetchConversation()
    }
  }, [id, fetchConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || !conversation) return

    try {
      setSending(true)
      const response = await fetch("/api/chatbot/messages/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          conversationId: conversation.id_conversation,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      // Add the new message to the list
      setMessages([
        ...messages,
        {
          id_message: data.message.id_message,
          content: data.message.content,
          message_type: data.message.message_type,
          created_at: data.message.created_at,
        },
      ])

      // Clear the input
      setInput("")

      // Update conversation status if it was PENDING_ADMIN
      if (conversation.status === ConversationStatus.PENDING_ADMIN) {
        setConversation({
          ...conversation,
          status: ConversationStatus.ACTIVE,
        })
      }

      toast({
        title: "Message envoyé",
        description: "Votre réponse a été envoyée avec succès",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const updateConversationStatus = async (status: string) => {
    if (!conversation) return

    try {
      setStatusUpdating(true)
      const response = await fetch(
        `/api/chatbot/conversations/${conversation.id_conversation}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) throw new Error("Failed to update conversation status")

      const updatedConversation = await response.json()
      setConversation(updatedConversation)

      toast({
        title: "Statut mis à jour",
        description: `La conversation est maintenant ${status === ConversationStatus.ACTIVE ? "active" : status === ConversationStatus.CLOSED ? "fermée" : "en attente"}`,
      })
    } catch (error) {
      console.error("Error updating conversation status:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    } finally {
      setStatusUpdating(false)
    }
  }

  // Formatter la date
  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "numeric",
    })
  }

  // Formatter la date complète
  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Rendu de l'avatar en fonction du type de message
  const renderAvatar = (type: string) => {
    switch (type) {
      case "USER":
        return (
          <Avatar>
            <AvatarFallback className="bg-primary/10">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )
      case "BOT":
        return (
          <Avatar>
            {/* <AvatarImage src="/logo.svg" alt="Bot" /> */}
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )
      case "ADMIN":
        return (
          <Avatar>
            <AvatarFallback className="bg-green-100 text-green-800">
              <Shield className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )
      default:
        return (
          <Avatar>
            <AvatarFallback>
              <MessageSquare className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )
    }
  }

  // Rendu du badge de statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case ConversationStatus.ACTIVE:
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" /> Actif
          </Badge>
        )
      case ConversationStatus.PENDING_ADMIN:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Clock className="mr-1 h-3 w-3" /> En attente
          </Badge>
        )
      case ConversationStatus.CLOSED:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-800">
            <XCircle className="mr-1 h-3 w-3" /> Fermé
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Chargement de la conversation...</p>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard/conversations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Link>
        </Button>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">
                Conversation non trouvée
              </CardTitle>
            </div>
            <CardDescription className="text-red-600">
              La conversation demandée n&apos;existe pas ou a été supprimée.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-6">
            <Button asChild variant="outline">
              <Link href="/dashboard/conversations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de voir les conversations." />
      }
    >
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-1">
            <Link href="/dashboard/conversations">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            {statusUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Select
                  value={conversation.status}
                  onValueChange={updateConversationStatus}
                  disabled={statusUpdating}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="PENDING_ADMIN">En attente</SelectItem>
                    <SelectItem value="CLOSED">Fermé</SelectItem>
                  </SelectContent>
                </Select>
                {renderStatusBadge(conversation.status)}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Conversation</CardTitle>
                {renderStatusBadge(conversation.status)}
              </div>
              <CardDescription>
                ID: {conversation.id_conversation} • Créée le{" "}
                {formatFullDate(conversation.created_at)}
              </CardDescription>
            </CardHeader>

            <ScrollArea className="h-[500px] px-4">
              <div className="flex flex-col gap-4 py-4">
                {messages.map(message => (
                  <div
                    key={message.id_message}
                    className={`flex gap-3 ${
                      message.message_type === MessageType.USER
                        ? "justify-start"
                        : "justify-start"
                    }`}
                  >
                    {renderAvatar(message.message_type)}

                    <div className="flex flex-col max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.message_type === MessageType.USER
                            ? "Client"
                            : message.message_type === MessageType.BOT
                              ? "Bot"
                              : "Conseiller"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>

                      <div
                        className={`px-4 py-3 rounded-lg ${
                          message.message_type === MessageType.USER
                            ? "bg-muted"
                            : message.message_type === MessageType.BOT
                              ? "bg-primary/10"
                              : "bg-green-100 dark:bg-green-900/20"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <CardFooter className="pt-6 pb-8 border-t">
              {conversation.status === "CLOSED" ? (
                <div className="w-full text-center py-4 text-muted-foreground">
                  <XCircle className="mx-auto h-6 w-6 mb-2 opacity-70" />
                  <p>Cette conversation est fermée</p>
                  <Button
                    className="mt-2"
                    variant="outline"
                    onClick={() => updateConversationStatus("ACTIVE")}
                    disabled={statusUpdating}
                  >
                    Réactiver la conversation
                  </Button>
                </div>
              ) : (
                <div className="flex w-full space-x-2">
                  <Input
                    placeholder="Tapez votre réponse..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={
                      sending ||
                      conversation.status === ConversationStatus.CLOSED
                    }
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      sending ||
                      !input.trim() ||
                      conversation.status === ConversationStatus.CLOSED
                    }
                  >
                    {sending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Envoyer
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Client
                </h3>
                {conversation.user ? (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {conversation.user.first_name.charAt(0)}
                        {conversation.user.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {conversation.user.first_name}{" "}
                        {conversation.user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {conversation.user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Client anonyme</p>
                      <p className="text-sm text-muted-foreground">
                        {conversation.email || "Email inconnu"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Statut
                </h3>
                <div>{renderStatusBadge(conversation.status)}</div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Dates
                </h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Créée:</span>{" "}
                    {formatFullDate(conversation.created_at)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Mise à jour:</span>{" "}
                    {formatFullDate(conversation.updated_at)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Actions
                </h3>
                <div className="flex flex-col gap-2">
                  {conversation.status !== ConversationStatus.CLOSED && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() =>
                        updateConversationStatus(ConversationStatus.CLOSED)
                      }
                      disabled={statusUpdating}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Fermer la conversation
                    </Button>
                  )}

                  {conversation.status === ConversationStatus.CLOSED && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() =>
                        updateConversationStatus(ConversationStatus.ACTIVE)
                      }
                      disabled={statusUpdating}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Réactiver la conversation
                    </Button>
                  )}

                  {conversation.id_user && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      asChild
                    >
                      <Link href={`/dashboard/users/${conversation.id_user}`}>
                        <User className="mr-2 h-4 w-4" />
                        Voir le profil client
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
