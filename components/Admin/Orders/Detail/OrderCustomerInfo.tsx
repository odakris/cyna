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
  return (
    <Card>
      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <UserRound className="h-4 w-4 sm:h-5 sm:w-5" />
          Informations client
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Client ID: {order.user.id_user}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarFallback className="text-xs sm:text-sm">
              {order.user.first_name[0]}
              {order.user.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm sm:text-base">
              {order.user.first_name} {order.user.last_name}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {order.user.email}
            </p>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="mt-2">
          <Button className="w-full text-xs sm:text-sm h-9" asChild>
            <Link href={`/dashboard/users/${order.user.id_user}`}>
              <UserRound className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Voir le profil client
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
