import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ContactMessageErrorProps {
  error: string | null
  fetchMessage: () => Promise<void>
}

export default function ContactMessageError({
  error,
  fetchMessage,
}: ContactMessageErrorProps) {
  return (
    <Card className="mx-auto max-w-lg mt-8 border-red-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-500">Erreur</CardTitle>
        </div>
        <CardDescription>{error || "Message non trouvé"}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={fetchMessage}>Réessayer</Button>
      </CardContent>
    </Card>
  )
}
