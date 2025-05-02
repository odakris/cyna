import { MainMessage } from "@prisma/client"
import { Calendar, Clock } from "lucide-react"

interface DatesInfoProps {
  message: MainMessage
  formatDate: (dateString?: string) => string
}

export default function DatesInfo({ message, formatDate }: DatesInfoProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Dates</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-2 p-3 rounded-md border">
          <Calendar className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <dt className="font-medium">Créé le</dt>
            <dd className="text-muted-foreground">
              {formatDate(message?.created_at.toString())}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-md border">
          <Clock className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <dt className="font-medium">Dernière mise à jour</dt>
            <dd className="text-muted-foreground">
              {formatDate(message?.updated_at.toString())}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  )
}
