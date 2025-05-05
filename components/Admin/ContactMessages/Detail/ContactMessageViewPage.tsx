"use client"

import { useContactMessageDetails } from "@/hooks/contact-messages/use-contact-messages-details"
import { ContactMessageDetailSkeleton } from "@/components/Skeletons/ContactMessageSkeletons"
import ContactMessageHeader from "./ContactMessageHeader"
import ContactMessageContent from "./ContactMessageContent"
import ContactMessageError from "./ContactMessageError"
import ContactMessageDeleteDialog from "./ContactMessageDeleteDialog"

interface ContactMessageViewPageProps {
  messageId: string
}

export default function ContactMessageViewPage({
  messageId,
}: ContactMessageViewPageProps) {
  const {
    message,
    loading,
    error,
    showDeleteDialog,
    setShowDeleteDialog,
    fetchMessage,
    handleDelete,
    formatDate,
  } = useContactMessageDetails(messageId)

  if (loading) {
    return <ContactMessageDetailSkeleton />
  }

  if (error || !message) {
    return <ContactMessageError error={error} fetchMessage={fetchMessage} />
  }

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
      <ContactMessageHeader
        setShowDeleteDialog={setShowDeleteDialog}
        messageId={messageId}
      />

      <ContactMessageContent message={message} formatDate={formatDate} />

      <ContactMessageDeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  )
}
