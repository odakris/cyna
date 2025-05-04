import { User } from "@prisma/client"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  XCircle,
  Calendar,
  LockKeyhole,
  Mail,
} from "lucide-react"

interface UserInfoProps {
  user: User
  formatDate: (dateString: string) => string
}

export default function UserInfo({ user, formatDate }: UserInfoProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
            Informations du compte
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Détails et paramètres de l&apos;utilisateur dans le système.
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Authentification à deux facteurs
            </p>
            <p className="text-sm sm:text-base font-semibold flex items-center">
              <LockKeyhole className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              {user.two_factor_enabled ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />{" "}
                  Activée
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircle className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />{" "}
                  Désactivée
                </span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Adresse email vérifiée
            </p>
            <p className="text-sm sm:text-base font-semibold flex items-center">
              <Mail className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              {user.email_verified ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />{" "}
                  Vérifiée
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircle className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Non
                  vérifiée
                </span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Date d&apos;inscription
            </p>
            <p className="text-sm sm:text-base font-medium flex items-center">
              <Calendar className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              {user.created_at ? formatDate(user.created_at.toString()) : "-"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Dernière mise à jour
            </p>
            <p className="text-sm sm:text-base font-medium flex items-center">
              <Calendar className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              {user.updated_at ? formatDate(user.updated_at.toString()) : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
