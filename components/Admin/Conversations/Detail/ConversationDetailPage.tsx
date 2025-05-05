"use client"

import { useState } from "react"
import { useConversationDetails } from "@/hooks/chatbot/use-conversation-details"
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
      <div className="container mx-auto p-3 sm:p-6 flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base">Chargement de la conversation...</p>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="container mx-auto p-3 sm:p-6 space-y-4">
        <Button
          asChild
          variant="ghost"
          className="mb-3 sm:mb-4 h-8 sm:h-10 text-xs sm:text-sm"
          onClick={handleBack}
        >
          <div>Retour</div>
        </Button>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              <CardTitle className="text-red-500 text-base sm:text-lg">
                Conversation non trouvée
              </CardTitle>
            </div>
            <CardDescription className="text-red-600 text-xs sm:text-sm">
              {error ||
                "La conversation demandée n'existe pas ou a été supprimée."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-4 sm:pb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      <ConversationDetailHeader
        conversationId={conversation.id_conversation}
        status={conversation.status}
        updateStatus={updateConversationStatus}
        statusUpdating={statusUpdating}
        handleBack={handleBack}
        setShowDeleteDialog={setShowDeleteDialog}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Voulez-vous vraiment supprimer cette conversation ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
