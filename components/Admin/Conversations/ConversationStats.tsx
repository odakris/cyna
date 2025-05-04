import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

interface ConversationStatsProps {
  stats: {
    total: number
    active: number
    pending: number
    closed: number
    today: number
  }
}

export default function ConversationStats({ stats }: ConversationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <MessageSquare className="h-8 w-8 text-primary opacity-80" />
        </CardContent>
      </Card>

      {/* <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Actives</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card> */}

      {/* <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              En attente
            </p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
        </CardContent>
      </Card> */}

      {/* <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fermées</p>
            <p className="text-2xl font-bold text-slate-600">{stats.closed}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-slate-600" />
          </div>
        </CardContent>
      </Card> */}

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Aujourd&apos;hui
            </p>
            <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
