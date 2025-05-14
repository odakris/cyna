import ContactMessageRespondPage from "@/components/Admin/ContactMessages/Respond/ContactMessageRespondPage"
import { Metadata } from "next"
import { validateId } from "@/lib/utils/utils"

export const metadata: Metadata = {
  title: "Répondre au Message | CYNA Backoffice",
  description: "Répondre au message de contact CYNA",
}

export default async function ContactMessageRespond({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid message ID")
  }
  return <ContactMessageRespondPage messageId={id.toString()} />
}
