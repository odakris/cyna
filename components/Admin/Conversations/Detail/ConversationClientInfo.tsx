import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { ConversationStatus } from "@prisma/client"
// import { renderStatusBadge } from "../ConversationColumns"

interface ConversationClientInfoProps {
  email: string | null
  user: {
    id_user?: number
    email: string
    first_name: string
    last_name: string
  } | null
  status: ConversationStatus
  created_at: string | Date
  updated_at: string | Date
  formatDate: (date: string | Date) => string
  updateStatus: (status: ConversationStatus) => void
  statusUpdating: boolean
}

export default function ConversationClientInfo({
  email,
  user,
  status,
  created_at,
  updated_at,
  formatDate,
  updateStatus,
  statusUpdating,
}: ConversationClientInfoProps) {
  return (
    <Card>
      <CardHeader className="py-3 sm:py-4 px-3 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">
          Informations client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
            Client
          </h3>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                <AvatarFallback>
                  {user.first_name.charAt(0)}
                  {user.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm sm:text-base">
                  Client anonyme
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {email || "Email inconnu"}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Statut
          </h3>
          <div>{renderStatusBadge(status)}</div>
        </div> */}

        <Separator />

        <div>
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
            Dates
          </h3>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm">
              <span className="font-medium">Créée:</span>{" "}
              {formatDate(created_at)}
            </p>
            <p className="text-xs sm:text-sm">
              <span className="font-medium">Mise à jour:</span>{" "}
              {formatDate(updated_at)}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
            Actions
          </h3>
          <div className="flex flex-col gap-2">
            {/* {status !== ConversationStatus.CLOSED && (
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => updateStatus(ConversationStatus.CLOSED)}
                disabled={statusUpdating}
              >
                <XCircle className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Fermer la conversation
              </Button>
            )} */}

            {status === ConversationStatus.CLOSED && (
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => updateStatus(ConversationStatus.ACTIVE)}
                disabled={statusUpdating}
              >
                <CheckCircle className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Réactiver la conversation
              </Button>
            )}

            {user?.id_user && (
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs sm:text-sm h-8 sm:h-9"
                asChild
              >
                <Link href={`/dashboard/users/${user.id_user}`}>
                  <User className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Voir le profil client
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
