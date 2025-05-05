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
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          <CardTitle className="text-red-500 text-base sm:text-lg">
            Erreur
          </CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {error || "Message non trouvé"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pt-2 pb-6">
        <Button onClick={fetchMessage} className="text-sm">
          Réessayer
        </Button>
      </CardContent>
    </Card>
  )
}
