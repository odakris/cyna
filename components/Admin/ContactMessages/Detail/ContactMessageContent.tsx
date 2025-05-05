import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
  MessageSquare,
  CornerDownRight,
} from "lucide-react"
import { ContactMessage } from "@/components/Admin/ContactMessages/ContactMessageColumns"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ContactMessageContentProps {
  message: ContactMessage
  formatDate: (dateString: string | Date) => string
}

export default function ContactMessageContent({
  message,
  formatDate,
}: ContactMessageContentProps) {
  // Fonction pour obtenir les initiales
  const getInitials = (firstname?: string, lastname?: string) => {
    if (firstname && lastname) {
      return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
    }
    return message.email.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
          <div className="flex gap-3 sm:gap-4 items-start">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mt-1">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(
                  message.user?.firstname ?? undefined,
                  message.user?.lastname ?? undefined
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg sm:text-xl">
                {message.subject}
              </CardTitle>
              <div className="flex items-center mt-1 space-x-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <CardDescription className="text-sm sm:text-base">
                  {message.email}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start sm:items-end w-full sm:w-auto">
            <Badge
              variant="outline"
              className={
                message.is_responded
                  ? "bg-green-100 text-green-800"
                  : message.is_read
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
              }
            >
              {message.is_responded ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                  Répondu
                </>
              ) : message.is_read ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3 text-gray-600" /> Lu
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3 text-blue-600" /> Non lu
                </>
              )}
            </Badge>
            <div className="flex items-center mt-1 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{formatDate(message.sent_date)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1" />
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg w-full">
            <p className="whitespace-pre-wrap text-sm sm:text-base">
              {message.message}
            </p>
          </div>
        </div>

        {message.response && message.response_date && (
          <div className="flex items-start gap-2 pt-3 sm:pt-4">
            <CornerDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1" />
            <div className="border-l-4 border-green-500 pl-3 sm:pl-4 w-full">
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-1">
                  <span className="font-medium text-green-700 text-sm sm:text-base">
                    Réponse
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(message.response_date)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm sm:text-base">
                  {message.response}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-muted/30 py-3 border-t text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>
            {message.is_responded
              ? `Répondu le ${formatDate(message.response_date!)}`
              : `Envoyé le ${formatDate(message.sent_date)}`}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
