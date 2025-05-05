import { MainMessage } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle2, XCircle } from "lucide-react"

interface AppearanceInfoProps {
  message: MainMessage
  toggleBackgroundStatus: () => Promise<void>
  isUpdating: boolean
}

export default function AppearanceInfo({
  message,
  toggleBackgroundStatus,
  isUpdating,
}: AppearanceInfoProps) {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        Apparence
      </h3>
      <dl className="grid grid-cols-[100px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-center text-sm">
        <dt className="font-medium text-muted-foreground">Arrière-plan:</dt>
        <dd className="flex items-center gap-4">
          {message?.has_background ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" /> Activé
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-700 border-gray-200"
            >
              <XCircle className="mr-1 h-3 w-3" /> Désactivé
            </Badge>
          )}
          <Switch
            checked={message?.has_background || false}
            onCheckedChange={toggleBackgroundStatus}
            disabled={isUpdating}
          />
        </dd>

        <dt className="font-medium text-muted-foreground">
          Couleur d&apos;arrière-plan:
        </dt>
        <dd>
          {message?.background_color ? (
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded ${message.background_color}`}
              ></div>
              <span>{message.background_color}</span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">Non définie</span>
          )}
        </dd>

        <dt className="font-medium text-muted-foreground">Couleur du texte:</dt>
        <dd>
          {message?.text_color ? (
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded bg-gray-100 ${message.text_color}`}
              ></div>
              <span>{message.text_color}</span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">Par défaut</span>
          )}
        </dd>
      </dl>
    </div>
  )
}
