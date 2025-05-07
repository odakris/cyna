"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useUserForm } from "@/hooks/user/use-user-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Save, InfoIcon, AlertCircle } from "lucide-react"
import { userFormSchema, UserFormValues } from "@/lib/validations/user-schema"
import { UserFormSkeleton } from "@/components/Skeletons/UserSkeletons"
import UserFormHeader from "@/components/Admin/Users/Form/UserFormHeader"
import UserFormBasicInfo from "@/components/Admin/Users/Form/UserFormBasicInfo"
import UserFormSecurity from "@/components/Admin/Users/Form/UserFormSecurity"
import UserFormPreview from "@/components/Admin/Users/Form/UserFormPreview"
import UserFormError from "@/components/Admin/Users/Form/UserFormError"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UserFormPageProps {
  userId?: string
}

export default function UserForm({ userId }: UserFormPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const {
    user,
    loading,
    errorMessage,
    initialData,
    emailVerified,
    setEmailVerified,
    twoFactorEnabled,
    setTwoFactorEnabled,
    getRoleBadgeColor,
    getUserInitials,
    isEditing,
  } = useUserForm(userId)

  // Utiliser le schéma de validation approprié (sans mot de passe requis)
  const validationSchema = userFormSchema

  const form = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      password: "", // Ce champ reste pour la création, mais est optionnel en édition
      role: "CUSTOMER",
      active: true,
      email_verified: false,
      two_factor_enabled: false,
    },
  })

  // Mettre à jour le formulaire quand initialData change
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true)

      // Formatage des valeurs
      const formattedValues = {
        ...values,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        password: values.password?.trim() || "",
        role: values.role,
        email_verified: emailVerified,
        two_factor_enabled: twoFactorEnabled,
        active: values.active,
      }

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
          variant: "success",
          title: "Utilisateur mis à jour avec succès !",
          description: "Les informations ont été mises à jour.",
        })

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

        // Lire le corps de la réponse UNE SEULE FOIS et stocker le résultat
        const responseData = await response.json()

        // Vérifier le statut de la réponse APRÈS avoir lu le corps
        if (!response.ok) {
          // Utiliser les informations d'erreur du corps de la réponse
          if (
            responseData.error &&
            responseData.error.includes("existe déjà")
          ) {
            throw new Error(`Email déjà utilisé: ${responseData.error}`)
          } else {
            throw new Error(
              responseData.error ||
                "Erreur lors de la création de l'utilisateur"
            )
          }
        }

        // Si la réponse est OK, utiliser les données déjà extraites
        const newUser = responseData

        toast({
          variant: "success",
          title: "Utilisateur créé avec succès !",
          description: "Un nouvel utilisateur a été ajouté au système.",
        })

        if (newUser && newUser.id_user) {
          router.push(`/dashboard/users/${newUser.id_user}`)
        } else {
          router.push("/dashboard/users")
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Email déjà utilisé")) {
          toast({
            title: "Email déjà utilisé",
            description: error.message.replace("Email déjà utilisé: ", ""),
            variant: "destructive",
          })
        } else {
          toast({
            title: "Erreur",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur inconnue s'est produite",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Récupérer les valeurs actuelles du formulaire
  const watchedRole = form.watch("role")
  const watchedFirstName = form.watch("first_name")
  const watchedLastName = form.watch("last_name")
  const watchedEmail = form.watch("email")
  const watchedActive = form.watch("active")
  const formErrors = form.formState.errors

  // Liste des erreurs à afficher
  const errorMessages = Object.entries(formErrors).map(([field, error]) => {
    const fieldLabels: { [key: string]: string } = {
      first_name: "Prénom",
      last_name: "Nom",
      email: "Email",
      password: "Mot de passe",
      role: "Rôle",
    }

    return {
      field: fieldLabels[field] || field,
      message: error?.message || "Valeur invalide",
    }
  })

  if (loading) {
    return <UserFormSkeleton />
  }

  if (errorMessage && isEditing) {
    return <UserFormError errorMessage={errorMessage} isEditing={isEditing} />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Colonne principale avec formulaire */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <UserFormHeader
                isEditing={isEditing}
                userName={
                  user ? `${user.first_name} ${user.last_name}` : undefined
                }
              />

              {/* Alerte pour les erreurs de validation */}
              {errorMessages.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreurs dans le formulaire</AlertTitle>
                  <AlertDescription>
                    Veuillez corriger les erreurs suivantes :
                    <ul className="list-disc pl-5 mt-2">
                      {errorMessages.map((error, index) => (
                        <li key={index}>
                          <strong>{error.field}</strong>: {error.message}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {isEditing && (
                <Alert
                  variant="default"
                  className="bg-blue-50 border-blue-200 text-blue-700"
                >
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    Pour des raisons de sécurité, les administrateurs ne peuvent
                    pas modifier les mots de passe des utilisateurs. Un lien de
                    réinitialisation peut être envoyé depuis la page de détails
                    de l&apos;utilisateur.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    Informations personnelles
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Informations de base de l&apos;utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <UserFormBasicInfo form={form} isSubmitting={isSubmitting} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    Sécurité et accès
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Paramètres de sécurité et niveau d&apos;accès
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                  <UserFormSecurity
                    form={form}
                    isSubmitting={isSubmitting}
                    emailVerified={emailVerified}
                    setEmailVerified={setEmailVerified}
                    twoFactorEnabled={twoFactorEnabled}
                    setTwoFactorEnabled={setTwoFactorEnabled}
                    getRoleBadgeColor={getRoleBadgeColor}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4 border-t px-3 sm:px-6 py-3 sm:py-4 flex-col sm:flex-row">
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => router.push("/dashboard/users")}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant={"cyna"}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1">
                        Enregistrement...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {isEditing ? "Mettre à jour" : "Créer l'utilisateur"}
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        {/* Colonne d'aperçu */}
        <div className="hidden lg:block lg:col-span-1">
          <Card>
            <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                Aperçu du profil
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Prévisualisation de l&apos;utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="sm:px-6">
              <UserFormPreview
                firstName={watchedFirstName}
                lastName={watchedLastName}
                email={watchedEmail}
                role={watchedRole}
                emailVerified={emailVerified}
                twoFactorEnabled={twoFactorEnabled}
                getUserInitials={getUserInitials}
                getRoleBadgeColor={getRoleBadgeColor}
                active={watchedActive}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
