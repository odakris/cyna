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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Détails de l&apos;Utilisateur</h1>
          <p className="text-muted-foreground">
            Consulter les informations de l&apos;utilisateur
          </p>
        </div>
      </div>

      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Erreur</CardTitle>
          </div>
          <CardDescription className="text-red-600">
            {errorMessage || "Utilisateur introuvable"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-2 pb-6">
          <Button asChild variant="outline">
            <Link href="/dashboard/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
