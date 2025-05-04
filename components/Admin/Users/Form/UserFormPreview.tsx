import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, Power } from "lucide-react"

interface UserFormPreviewProps {
  firstName: string
  lastName: string
  email: string
  role: string
  emailVerified: boolean
  twoFactorEnabled: boolean
  active: boolean
  getUserInitials: (firstName: string, lastName: string) => string
  getRoleBadgeColor: (role: string) => string
}

export default function UserFormPreview({
  firstName,
  lastName,
  email,
  role,
  emailVerified,
  twoFactorEnabled,
  active,
  getUserInitials,
  getRoleBadgeColor,
}: UserFormPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-4">
      <Avatar className="h-20 sm:h-24 w-20 sm:w-24 mb-3 sm:mb-4 border-4 border-background shadow-lg">
        <AvatarImage
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${firstName}%20${lastName}&backgroundColor=4f46e5`}
          alt={`${firstName} ${lastName}`}
        />
        <AvatarFallback className="text-lg sm:text-xl font-bold">
          {getUserInitials(firstName, lastName)}
        </AvatarFallback>
      </Avatar>

      <h3 className="text-base sm:text-lg font-semibold">
        {firstName || "Prénom"} {lastName || "Nom"}
      </h3>

      <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-all text-center">
        {email || "email@exemple.com"}
      </p>

      <Badge
        className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm ${getRoleBadgeColor(role)}`}
      >
        {role}
      </Badge>

      <Separator className="my-3 sm:my-4" />

      <div className="w-full space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Email vérifié
          </span>
          <Badge
            className={`px-1.5 sm:px-2 py-0.5 text-xs ${
              emailVerified
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            {emailVerified ? "Oui" : "Non"}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Authentification 2FA
          </span>
          <Badge
            className={`px-1.5 sm:px-2 py-0.5 text-xs ${
              twoFactorEnabled
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            {twoFactorEnabled ? "Activée" : "Désactivée"}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm flex items-center gap-1">
            <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Statut
          </span>
          <Badge
            className={`px-1.5 sm:px-2 py-0.5 text-xs ${
              active ? "bg-green-600 text-white" : "bg-gray-600 text-white"
            }`}
          >
            {active ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
