import Link from "next/link"
import { OrderWithItems } from "@/types/Types"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { UserRound } from "lucide-react"

interface OrderCustomerInfoProps {
  order: OrderWithItems
}

export default function OrderCustomerInfo({ order }: OrderCustomerInfoProps) {
  // Récupérer les informations de l'utilisateur de manière sécurisée
  const getUserName = () => {
    // Si on a un prénom et nom, on les utilise
    if (order.user?.first_name && order.user?.last_name) {
      return `${order.user.first_name} ${order.user.last_name}`
    }

    // Si on a seulement l'email, on l'utilise (sans le domaine)
    if (order.user?.email) {
      const emailName = order.user.email.split("@")[0]
      return emailName
    }

    // Dernier recours
    return "Utilisateur inconnu"
  }

  // Récupérer les initiales de l'utilisateur
  const getInitials = () => {
    if (order.user?.first_name && order.user?.last_name) {
      return `${order.user.first_name.charAt(0)}${order.user.last_name.charAt(0)}`
    }

    if (order.user?.email) {
      const emailName = order.user.email.split("@")[0]
      return emailName.substring(0, 2).toUpperCase()
    }

    return "?"
  }

  return (
    <Card>
      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <UserRound className="h-4 w-4 sm:h-5 sm:w-5" />
          Informations client
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Client ID: {order.user?.id_user || "Invité"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarFallback className="text-xs sm:text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm sm:text-base">{getUserName()}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {order.user?.email || "Email non disponible"}
            </p>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="mt-2">
          {order.user?.id_user ? (
            <Button className="w-full text-xs sm:text-sm h-9" asChild>
              <Link href={`/dashboard/users/${order.user.id_user}`}>
                <UserRound className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Voir le profil client
              </Link>
            </Button>
          ) : (
            <Button className="w-full text-xs sm:text-sm h-9" disabled>
              <UserRound className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Utilisateur invité
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
