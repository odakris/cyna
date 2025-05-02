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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-5 w-5" />
          Informations client
        </CardTitle>
        <CardDescription>Client ID: {order.user.id_user}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {order.user.first_name[0]}
              {order.user.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {order.user.first_name} {order.user.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="mt-2">
          <Button className="w-full" asChild>
            <Link href={`/dashboard/users/${order.user.id_user}`}>
              <UserRound className="mr-2 h-4 w-4" />
              Voir le profil client
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
