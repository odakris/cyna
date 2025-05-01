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
    <div className="mx-auto py-10">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Erreur
          </CardTitle>
          <CardDescription>
            {errorMessage || "Commande non trouvée"}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button onClick={() => router.push("/dashboard/orders")}>
            Voir toutes les commandes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
