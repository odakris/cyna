import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ErrorDisplayProps {
  errorMessage: string | null
}

export default function ErrorDisplay({ errorMessage }: ErrorDisplayProps) {
  const router = useRouter()

  return (
    <div className="mx-auto py-4 sm:py-10 px-3 sm:px-6">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2 text-base sm:text-lg">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            Erreur
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {errorMessage || "Commande non trouvée"}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <ArrowLeft className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Retour
          </Button>
          <Button
            onClick={() => router.push("/dashboard/orders")}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Voir toutes les commandes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
