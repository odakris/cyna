import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, MailQuestion, Mail, MailCheck } from "lucide-react"

interface ContactMessageStatsProps {
  stats: {
    total: number
    unread: number
    unanswered: number
    lastWeek: number
  }
}

export default function ContactMessageStats({
  stats,
}: ContactMessageStatsProps) {
  return (
    <>
      {/* Version desktop - inchangée */}
      <div className="hidden md:grid md:grid-cols-1 md:sm:grid-cols-2 md:md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Messages
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Non lus
              </p>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MailQuestion className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sans réponse
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.unanswered}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                7 derniers jours
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.lastWeek}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <MailCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version mobile - nouvelle version */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Messages
              </p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <MessageSquare className="h-6 w-6 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Non lus
              </p>
              <p className="text-xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <MailQuestion className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Sans réponse
              </p>
              <p className="text-xl font-bold text-amber-600">
                {stats.unanswered}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                7 derniers jours
              </p>
              <p className="text-xl font-bold text-green-600">
                {stats.lastWeek}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <MailCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
