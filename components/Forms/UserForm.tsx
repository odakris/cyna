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
import { Save } from "lucide-react"
import { userFormSchema, UserFormValues } from "@/lib/validations/user-schema"
import { UserFormSkeleton } from "@/components/Skeletons/UserSkeletons"
import UserFormHeader from "@/components/Admin/Users/Form/UserFormHeader"
import UserFormBasicInfo from "@/components/Admin/Users/Form/UserFormBasicInfo"
import UserFormSecurity from "@/components/Admin/Users/Form/UserFormSecurity"
import UserFormPreview from "@/components/Admin/Users/Form/UserFormPreview"
import UserFormError from "@/components/Admin/Users/Form/UserFormError"

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

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
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
        password: values.password.trim(),
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

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || "Erreur lors de la création de l'utilisateur"
          )
        }

        const newUser = await response.json()

        toast({
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

  // Récupérer les valeurs actuelles du formulaire
  const watchedRole = form.watch("role")
  const watchedFirstName = form.watch("first_name")
  const watchedLastName = form.watch("last_name")
  const watchedEmail = form.watch("email")
  const watchedActive = form.watch("active")

  if (loading) {
    return <UserFormSkeleton />
  }

  if (errorMessage && isEditing) {
    return <UserFormError errorMessage={errorMessage} isEditing={isEditing} />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale avec formulaire */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <UserFormHeader
                isEditing={isEditing}
                userName={
                  user ? `${user.first_name} ${user.last_name}` : undefined
                }
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Informations de base de l&apos;utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserFormBasicInfo form={form} isSubmitting={isSubmitting} />
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
                  <UserFormSecurity
                    form={form}
                    isSubmitting={isSubmitting}
                    isEditing={isEditing}
                    emailVerified={emailVerified}
                    setEmailVerified={setEmailVerified}
                    twoFactorEnabled={twoFactorEnabled}
                    setTwoFactorEnabled={setTwoFactorEnabled}
                    getRoleBadgeColor={getRoleBadgeColor}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => router.push("/dashboard/users")}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant={"cyna"}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1">
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

        {/* Colonne d'aperçu */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du profil</CardTitle>
              <CardDescription>
                Prévisualisation de l&apos;utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
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
