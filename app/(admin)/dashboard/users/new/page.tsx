import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { UserForm } from "@/components/Forms/UserForm"
import { Button } from "../../../../../components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

export default function CreateProductPage() {
  // const { toast } = useToast()
  // const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // if (loading) {
  //   return (
  //     <div className="max-w-4xl mx-auto p-6 space-y-6">
  //       <Skeleton className="h-10 w-1/3" />
  //       <Card>
  //         <CardHeader>
  //           <Skeleton className="h-6 w-1/4" />
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <Skeleton className="h-10 w-full" />
  //           <Skeleton className="h-10 w-full" />
  //           <Skeleton className="h-20 w-full" />
  //           <Skeleton className="h-20 w-full" />
  //           <Skeleton className="h-10 w-full" />
  //           <Skeleton className="h-10 w-full" />
  //           <Skeleton className="h-10 w-full" />
  //           <Skeleton className="h-10 w-full" />
  //           <Skeleton className="h-10 w-32" />
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  // if (errorMessage) {
  //   return (
  //     <div className="max-w-4xl mx-auto p-6 space-y-6">
  //       <h1 className="text-3xl font-bold">Créer un Nouvel Utilisateur</h1>
  //       <p className="text-red-500">{errorMessage}</p>
  //       <Button asChild variant="outline">
  //         <Link href="/dashboard/users">Retour</Link>
  //       </Button>
  //     </div>
  //   )
  // }

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Ajouter un Utilisateur</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  )
}
