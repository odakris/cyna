import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

interface ErrorMessageProps {
  error: string | null
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="container mx-auto p-6">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Erreur</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard/main-message">Retour à la liste</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
