import { Key, Shield } from "lucide-react"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
  isEditing: boolean
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
  isEditing,
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
      <span className="text-xs text-muted-foreground">
        {roleDescription[role as keyof typeof roleDescription]}
      </span>
    </div>
  )

  return (
    <div className="space-y-6">
      <FormField
        name="password"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mot de Passe</FormLabel>
            <FormControl>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  disabled={isSubmitting}
                  className="pl-9"
                  type="password"
                  placeholder={isEditing ? "••••••••" : "Nouveau mot de passe"}
                />
              </div>
            </FormControl>
            <FormDescription>
              {isEditing
                ? "Laissez vide pour conserver le mot de passe actuel"
                : "Minimum 8 caractères avec au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <FormField
        name="role"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rôle</FormLabel>
            <FormControl>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue>{renderSelectedRole(field.value)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Role).map(role => (
                      <SelectItem key={role} value={role}>
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
            <FormDescription>
              Définit les permissions et l&apos;accès de l&apos;utilisateur dans
              le système
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="active"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Activation de L&apos;utilisateur
              </FormLabel>
              <FormDescription>
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
            <FormLabel>Email vérifié</FormLabel>
            <FormDescription>
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
            <FormLabel>Authentification à deux facteurs</FormLabel>
            <FormDescription>
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
