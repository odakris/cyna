import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface ErrorMessageProps {
  error: string | null
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="container mx-auto p-3 sm:p-6">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500 text-base sm:text-lg">
            Erreur
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild className="text-xs sm:text-sm">
            <Link href="/dashboard/main-message">
              <ArrowLeft className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Retour à la liste
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
