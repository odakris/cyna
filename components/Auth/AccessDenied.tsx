// components/Auth/AccessDenied.tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import Link from "next/link"

interface AccessDeniedProps {
  message?: string
}

const AccessDenied = ({
  message = "Vous n'avez pas les permissions requises pour accéder à cette ressource.",
}: AccessDeniedProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">Accès refusé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Retour au dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AccessDenied
