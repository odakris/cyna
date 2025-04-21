"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ChevronRight, RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import RoleGuard from "@/components/Auth/RoleGuard"
import { ConversationStatus, MessageType, Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"

interface Conversation {
  id_conversation: number
  status: string
  created_at: string
  updated_at: string
  email: string | null
  user: {
    email: string
    first_name: string
    last_name: string
  } | null
  messages: {
    id_message: number
    content: string
    message_type: string
    created_at: string
  }[]
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const router = useRouter()

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/chatbot/conversations?status=${filter === "all" ? "" : filter}`
      )
      if (!response.ok) throw new Error("Failed to fetch conversations")

      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [filter])

  const handleViewConversation = (id: number) => {
    router.push(`/dashboard/conversations/${id}`)
  }

  // Formatter la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filtrer les conversations par recherche
  const filteredConversations = conversations.filter(conv => {
    if (!search) return true

    const email = conv.email || conv.user?.email || ""
    const name = conv.user
      ? `${conv.user.first_name} ${conv.user.last_name}`
      : ""

    return (
      email.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Afficher le statut avec un badge
  const renderStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Actif
          </Badge>
        )
      case "PENDING_ADMIN":
        return <Badge className="bg-amber-500">En attente</Badge>
      case "CLOSED":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-800">
            Fermé
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Afficher le dernier message
  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const message = conversation.messages[0]
      return {
        content:
          message.content.length > 50
            ? message.content.substring(0, 50) + "..."
            : message.content,
        type: message.message_type,
      }
    }
    return { content: "Pas de message", type: MessageType.BOT }
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de voir les conversations." />
      }
    >
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Conversations</h1>
            </div>
            <p className="text-muted-foreground">
              Gérez les conversations du chatbot avec les clients
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchConversations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email ou nom..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 w-full"
              />
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Statut</SelectLabel>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value={ConversationStatus.ACTIVE}>
                    Actifs
                  </SelectItem>
                  <SelectItem value={ConversationStatus.PENDING_ADMIN}>
                    En attente
                  </SelectItem>
                  <SelectItem value={ConversationStatus.CLOSED}>
                    Fermés
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Liste des conversations</CardTitle>
            <CardDescription>
              {filter === ConversationStatus.PENDING_ADMIN
                ? "Conversations nécessitant l'intervention d'un conseiller"
                : "Toutes les conversations du chatbot"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                <h3 className="mt-4 text-lg font-semibold">
                  Aucune conversation trouvée
                </h3>
                <p className="text-muted-foreground">
                  {search
                    ? "Aucun résultat pour cette recherche"
                    : "Aucune conversation disponible"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Dernier message</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map(conversation => (
                    <TableRow
                      key={conversation.id_conversation}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {conversation.user ? (
                          <div>
                            <div>
                              {conversation.user.first_name}{" "}
                              {conversation.user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {conversation.user.email}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div>Client anonyme</div>
                            <div className="text-sm text-muted-foreground">
                              {conversation.email || "Email inconnu"}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {getLastMessage(conversation).type === "USER"
                                ? "Client"
                                : getLastMessage(conversation).type === "ADMIN"
                                  ? "Admin"
                                  : "Bot"}
                            </Badge>
                            <span className="text-sm truncate">
                              {getLastMessage(conversation).content}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderStatus(conversation.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            Créée: {formatDate(conversation.created_at)}
                          </div>
                          <div className="text-muted-foreground">
                            Mise à jour: {formatDate(conversation.updated_at)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleViewConversation(conversation.id_conversation)
                          }
                        >
                          Voir
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
