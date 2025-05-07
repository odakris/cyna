import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

interface ErrorStateProps {
  error: string | null
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <Card className="border-2 border-red-100 shadow-md">
        <CardHeader className="bg-red-50 border-b pb-4">
          <CardTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Erreur
          </CardTitle>
          <CardDescription className="text-red-600">
            Impossible d&apos;afficher votre commande
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-red-600 mb-6">
            {error ||
              "Commande non trouvée. Veuillez vérifier l'identifiant de commande."}
          </p>
          <Button asChild className="bg-[#302082] hover:bg-[#302082]/90">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
