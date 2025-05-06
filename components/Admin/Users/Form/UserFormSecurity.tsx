import { Shield } from "lucide-react"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { UseFormReturn } from "react-hook-form"
import { UserFormValues } from "@/lib/validations/user-schema"
import { Role } from "@prisma/client"

interface UserFormSecurityProps {
  form: UseFormReturn<UserFormValues>
  isSubmitting: boolean
  emailVerified: boolean
  setEmailVerified: (value: boolean) => void
  twoFactorEnabled: boolean
  setTwoFactorEnabled: (value: boolean) => void
  getRoleBadgeColor: (role: string) => string
}

// Descriptions des rôles
const roleDescription = {
  CUSTOMER: "Accès limité aux fonctionnalités de base",
  MANAGER: "Gestion des contenus et des clients",
  ADMIN: "Accès complet à l'administration",
  SUPER_ADMIN: "Contrôle total du système",
}

export default function UserFormSecurity({
  form,
  isSubmitting,
  emailVerified,
  setEmailVerified,
  twoFactorEnabled,
  setTwoFactorEnabled,
  getRoleBadgeColor,
}: UserFormSecurityProps) {
  // Rendu personnalisé pour l'option sélectionnée
  const renderSelectedRole = (role: string) => (
    <div className="flex items-center gap-2">
      <Badge className={getRoleBadgeColor(role)}>{role}</Badge>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {roleDescription[role as keyof typeof roleDescription]}
      </span>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <FormField
        name="role"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base">Rôle</FormLabel>
            <FormControl>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="pl-9 text-sm sm:text-base h-9 sm:h-10">
                    <SelectValue>{renderSelectedRole(field.value)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Role).map(role => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="text-sm sm:text-base"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor(role)}>
                            {role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {
                              roleDescription[
                                role as keyof typeof roleDescription
                              ]
                            }
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormDescription className="text-xs sm:text-sm">
              Définit les permissions et l&apos;accès de l&apos;utilisateur dans
              le système
            </FormDescription>
            <FormMessage className="text-xs sm:text-sm" />
          </FormItem>
        )}
      />

      <FormField
        name="active"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4 mt-4">
            <div className="space-y-0.5">
              <FormLabel className="text-sm sm:text-base">
                Activation de L&apos;utilisateur
              </FormLabel>
              <FormDescription className="text-xs sm:text-sm">
                {field.value
                  ? "L'utilisateur est actif et peut se connecter"
                  : "L'utilisateur est inactif et ne peut pas se connecter"}
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel className="text-sm sm:text-base">
              Email vérifié
            </FormLabel>
            <FormDescription className="text-xs sm:text-sm">
              L&apos;adresse email a-t-elle été vérifiée ?
            </FormDescription>
          </div>
          <Switch
            checked={emailVerified}
            onCheckedChange={setEmailVerified}
            disabled={isSubmitting}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel className="text-sm sm:text-base">
              Authentification à deux facteurs
            </FormLabel>
            <FormDescription className="text-xs sm:text-sm">
              Activer la protection supplémentaire du compte
            </FormDescription>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
