"use client"

import { useState } from "react"
import { useConversationDetails } from "@/hooks/use-conversation-details"
import { useRouter } from "next/navigation"
import ConversationDetailHeader from "./ConversationDetailHeader"
import ConversationMessages from "./ConversationMessages"
import ConversationClientInfo from "./ConversationClientInfo"
import { AlertTriangle, Loader2 } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface ConversationDetailPageProps {
  conversationId: string
}

export default function ConversationDetailPage({
  conversationId,
}: ConversationDetailPageProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    conversation,
    messages,
    loading,
    error,
    input,
    setInput,
    sending,
    statusUpdating,
    updateConversationStatus,
    handleSendMessage,
    handleDelete,
    formatDate,
    formatMessageTime,
  } = useConversationDetails(conversationId)

  // Fonction pour retourner à la liste
  const handleBack = () => {
    router.push("/dashboard/conversations")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Chargement de la conversation...</p>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button asChild variant="ghost" className="mb-4" onClick={handleBack}>
          <div>Retour</div>
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
              {error ||
                "La conversation demandée n'existe pas ou a été supprimée."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-6">
            <Button variant="outline" onClick={handleBack}>
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      <ConversationDetailHeader
        conversationId={conversation.id_conversation}
        status={conversation.status}
        updateStatus={updateConversationStatus}
        statusUpdating={statusUpdating}
        handleBack={handleBack}
        setShowDeleteDialog={setShowDeleteDialog}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ConversationMessages
          messages={messages}
          formatMessageTime={formatMessageTime}
          status={conversation.status}
          updateStatus={updateConversationStatus}
          statusUpdating={statusUpdating}
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          sending={sending}
        />

        <ConversationClientInfo
          email={conversation.email}
          user={conversation.user}
          status={conversation.status}
          created_at={conversation.created_at}
          updated_at={conversation.updated_at}
          formatDate={formatDate}
          updateStatus={updateConversationStatus}
          statusUpdating={statusUpdating}
        />
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer cette conversation ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
