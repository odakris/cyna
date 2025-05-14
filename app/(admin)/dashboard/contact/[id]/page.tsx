import ContactMessageViewPage from "@/components/Admin/ContactMessages/Detail/ContactMessageViewPage"
import { validateId } from "@/lib/utils/utils"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Détails du Message | CYNA Backoffice",
  description: "Détails du message de contact CYNA",
}

export default async function ContactMessageView({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid message ID")
  }
  return <ContactMessageViewPage messageId={id.toString()} />
}
