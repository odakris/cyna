"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import { userFormSchema, UserFormValues } from "@/lib/validations/user-schema"
import { Role } from "@prisma/client"
import {
  User,
  Mail,
  Key,
  Shield,
  UserCog,
  Save,
  Lock,
  PencilLine,
} from "lucide-react"

interface UserFormProps {
  initialData?: UserFormValues
  isEditing?: boolean
  userId?: number
}

// Fonction pour traduire les rôles en français avec descriptions
const roleDescription = {
  CUSTOMER: "Accès limité aux fonctionnalités de base",
  MANAGER: "Gestion des contenus et des clients",
  ADMIN: "Accès complet à l'administration",
  SUPER_ADMIN: "Contrôle total du système",
}

// Fonction pour obtenir la couleur du badge selon le rôle
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    case "ADMIN":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "MANAGER":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "CUSTOMER":
    default:
      return "bg-green-100 text-green-800 hover:bg-green-200"
  }
}

export function UserForm({
  initialData,
  isEditing = false,
  userId,
}: UserFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [emailVerified, setEmailVerified] = useState<boolean>(
    initialData?.email_verified || false
  )
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    initialData?.two_factor_enabled || false
  )

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      password: initialData?.password || "",
      role: initialData?.role || "CUSTOMER",
      email_verified: initialData?.email_verified || false,
      two_factor_enabled: initialData?.two_factor_enabled || false,
    },
  })

  // Récupérer les valeurs actuelles du formulaire
  const watchedRole = form.watch("role")
  const watchedFirstName = form.watch("first_name")
  const watchedLastName = form.watch("last_name")

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "U"
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true)
      // Formatage des valeurs
      const formattedValues = {
        ...values,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        password: values.password.trim(),
        role: values.role,
        email_verified: emailVerified,
        two_factor_enabled: twoFactorEnabled,
      }

      console.log("formattedValues:", formattedValues)

      if (isEditing && userId) {
        // Mise à jour d'un utilisateur existant
        const response = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message ||
              "Erreur lors de la mise à jour de l'utilisateur"
          )
        }

        toast({
          title: "Utilisateur mis à jour avec succès !",
          description: "Les informations ont été mises à jour.",
        })

        // Redirection vers la page de détails de l'utilisateur mis à jour
        router.push(`/dashboard/users/${userId}`)
      } else {
        // Création d'un nouvel utilisateur
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || "Erreur lors de la création de l'utilisateur"
          )
        }

        // Récupérer l'ID du nouvel utilisateur depuis la réponse
        const newUser = await response.json()

        toast({
          title: "Utilisateur créé avec succès !",
          description: "Un nouvel utilisateur a été ajouté au système.",
        })

        // Redirection vers la page de détails du nouvel utilisateur
        if (newUser && newUser.id_user) {
          router.push(`/dashboard/users/${newUser.id_user}`)
        } else {
          // Fallback si l'ID n'est pas disponible
          router.push("/dashboard/users")
        }
      }
    } catch (error) {
      console.error("Erreur onSubmit:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : `Erreur lors de la ${isEditing ? "mise à jour" : "création"} de l'utilisateur.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale avec formulaire */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PencilLine className="h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Informations de base de l&apos;utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="first_name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                disabled={isSubmitting}
                                className="pl-9"
                                placeholder="Prénom de l'utilisateur"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="last_name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                disabled={isSubmitting}
                                className="pl-9"
                                placeholder="Nom de famille"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              className="pl-9"
                              placeholder="adresse@exemple.com"
                              type="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sécurité et accès</CardTitle>
                  <CardDescription>
                    Paramètres de sécurité et niveau d&apos;accès
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                              placeholder={
                                isEditing ? "••••••••" : "Nouveau mot de passe"
                              }
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
                            <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className="pl-9">
                                <SelectValue placeholder="Sélectionner un rôle" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(Role).map(role => (
                                  <SelectItem key={role} value={role}>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={`${getRoleBadgeColor(role)}`}
                                      >
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
                          Définit les permissions et l&apos;accès de
                          l&apos;utilisateur dans le système
                        </FormDescription>
                        <FormMessage />
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
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => router.push("/dashboard/users")}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-1">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Enregistrement...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Save className="h-4 w-4" />
                        {isEditing ? "Mettre à jour" : "Créer l'utilisateur"}
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
        {/* Colonne de gauche avec aperçu */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du profil</CardTitle>
              <CardDescription>
                Prévisualisation de l&apos;utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-lg">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${watchedFirstName}%20${watchedLastName}&backgroundColor=4f46e5`}
                  alt={`${watchedFirstName} ${watchedLastName}`}
                />
                <AvatarFallback className="text-xl font-bold">
                  {getUserInitials(watchedFirstName, watchedLastName)}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-lg font-semibold">
                {watchedFirstName || "Prénom"} {watchedLastName || "Nom"}
              </h3>

              <p className="text-sm text-muted-foreground mb-2">
                {form.watch("email") || "email@exemple.com"}
              </p>

              <Badge className={`px-3 py-1 ${getRoleBadgeColor(watchedRole)}`}>
                {watchedRole}
              </Badge>

              <Separator className="my-4" />

              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Mail className="h-4 w-4" /> Email vérifié
                  </span>
                  <Badge
                    variant={emailVerified ? "default" : "outline"}
                    className="px-2 py-0.5 text-xs"
                  >
                    {emailVerified ? "Oui" : "Non"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Lock className="h-4 w-4" /> Authentification 2FA
                  </span>
                  <Badge
                    variant={twoFactorEnabled ? "default" : "outline"}
                    className="px-2 py-0.5 text-xs"
                  >
                    {twoFactorEnabled ? "Activée" : "Désactivée"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
