import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContactMessageRespondHeaderProps {
  messageId: string
}

export default function ContactMessageRespondHeader({
  messageId,
}: ContactMessageRespondHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
        >
          <Link href="/dashboard/contact">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-3xl font-bold">Répondre au message</h1>
      </div>
    </div>
  )
}
