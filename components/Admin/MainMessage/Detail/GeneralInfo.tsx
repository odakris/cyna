import { MainMessage } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle2, XCircle } from "lucide-react"

interface GeneralInfoProps {
  message: MainMessage
  toggleActiveStatus: () => Promise<void>
  isUpdating: boolean
}

export default function GeneralInfo({
  message,
  toggleActiveStatus,
  isUpdating,
}: GeneralInfoProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Informations Générales</h3>
      <dl className="grid grid-cols-[150px_1fr] gap-2 items-center">
        <dt className="font-medium text-muted-foreground">ID:</dt>
        <dd>#{message?.id_main_message}</dd>

        <dt className="font-medium text-muted-foreground">Contenu:</dt>
        <dd className="break-words">{message?.content}</dd>

        <dt className="font-medium text-muted-foreground">Statut:</dt>
        <dd className="flex items-center gap-4">
          {message?.active ? (
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 hover:bg-green-200"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" /> Actif
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              <XCircle className="mr-1 h-3 w-3" /> Inactif
            </Badge>
          )}
          <Switch
            checked={message?.active || false}
            onCheckedChange={toggleActiveStatus}
            disabled={isUpdating}
          />
        </dd>
      </dl>
    </div>
  )
}
