"use client"

import { useContactMessageRespond } from "@/hooks/contact-messages/use-contact-messages-respond"
import { ContactMessageRespondSkeleton } from "@/components/Skeletons/ContactMessageSkeletons"
import ContactMessageRespondHeader from "./ContactMessageRespondHeader"
import ContactMessageRespondError from "./ContactMessageRespondError"
import ContactMessageRespondForm from "./ContactMessageRespondForm"

interface ContactMessageRespondPageProps {
  messageId: string
}

export default function ContactMessageRespondPage({
  messageId,
}: ContactMessageRespondPageProps) {
  const {
    message,
    loading,
    error,
    isSubmitted,
    fetchMessage,
    formatDate,
    form,
    onSubmit,
  } = useContactMessageRespond(messageId)

  if (loading) {
    return <ContactMessageRespondSkeleton />
  }

  if (error || !message) {
    return (
      <ContactMessageRespondError error={error} fetchMessage={fetchMessage} />
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
      <ContactMessageRespondHeader messageId={messageId} />

      <ContactMessageRespondForm
        message={message}
        formatDate={formatDate}
        form={form}
        onSubmit={onSubmit}
        isSubmitted={isSubmitted}
      />
    </div>
  )
}
