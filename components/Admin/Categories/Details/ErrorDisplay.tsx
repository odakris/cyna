import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, ShieldAlert } from "lucide-react"

interface ErrorDisplayProps {
  errorMessage: string | null
}

export default function ErrorDisplay({ errorMessage }: ErrorDisplayProps) {
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">
              Détails de la Catégorie
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Consulter les informations de la catégorie
            </p>
          </div>
        </div>
      </div>

      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            <CardTitle className="text-red-500 text-base sm:text-lg">
              Erreur
            </CardTitle>
          </div>
          <CardDescription className="text-red-600 text-xs sm:text-sm">
            {errorMessage || "Catégorie introuvable"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-2 pb-6">
          <Button asChild variant="outline" className="text-xs sm:text-sm">
            <Link href="/dashboard/categories">
              <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Retour à la liste
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
