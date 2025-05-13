"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { userFormSchema } from "@/lib/validations/user-schema"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  AlertCircle,
  User,
  Mail,
  KeyRound,
  Save,
  ArrowLeft,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type User = {
  id_user: number
  first_name: string
  last_name: string
  email: string
}

export default function PersonalInfoForm({ user }: { user: User }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error when field is edited
    if (errors[name as keyof typeof formData]) {
      setErrors({
        ...errors,
        [name]: undefined,
      })
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {}

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide"
    }

    // Validate name fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis"
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis"
    }

    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword =
          "Le mot de passe doit contenir au moins 8 caractères"
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "Veuillez confirmer votre nouveau mot de passe"
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
      }

      if (!formData.currentPassword) {
        newErrors.currentPassword = "Le mot de passe actuel est requis"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { first_name, last_name, email, currentPassword, newPassword } =
        formData

      // Valider les données
      const validatedData = userFormSchema
        .partial()
        .parse({ first_name, last_name, email })

      if (newPassword) {
        userFormSchema.shape.password.parse(newPassword)
      }

      const res = await fetch(`/api/users/${user.id_user}/email-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...validatedData,
          currentPassword,
          newPassword,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.message || "Erreur lors de la mise à jour.")
      }

      // Afficher un message de succès
      const message =
        formData.email !== user.email
          ? "Un e-mail de confirmation a été envoyé à votre nouvelle adresse."
          : "Informations mises à jour avec succès."

      toast({
        title: "Modifications enregistrées",
        description: message,
        variant: "success",
      })

      router.push("/account/settings")
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof typeof formData, string>> = {}
        err.errors.forEach(error => {
          const field = error.path[0] as keyof typeof formData
          fieldErrors[field] = error.message
        })
        setErrors(fieldErrors)
      } else {
        toast({
          title: "Erreur",
          description: (err as Error).message || "Une erreur est survenue",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
            <User className="h-5 w-5" />
            Modifier mes informations personnelles
          </CardTitle>
          <CardDescription>
            Mettez à jour vos informations personnelles et votre mot de passe
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            id="personal-info-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Informations personnelles */}
            <div className="space-y-2">
              <h3 className="text-base font-medium text-[#302082] mb-1">
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`pl-9 ${errors.first_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      placeholder="Votre prénom"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.first_name && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.first_name}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`pl-9 ${errors.last_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      placeholder="Votre nom"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.last_name && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.last_name}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-9 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    placeholder="votre@email.com"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && (
                  <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email}
                  </div>
                )}
                {formData.email !== user.email && (
                  <p className="text-xs text-amber-600 mt-1">
                    Si vous modifiez votre email, un lien de confirmation sera
                    envoyé à la nouvelle adresse.
                  </p>
                )}
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="text-base font-medium text-[#302082] mb-1">
                Changer de mot de passe
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Laissez ces champs vides si vous ne souhaitez pas modifier votre
                mot de passe.
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="currentPassword"
                    className="text-sm font-medium"
                  >
                    Mot de passe actuel{" "}
                    {formData.newPassword && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`pl-9 ${errors.currentPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      placeholder="Votre mot de passe actuel"
                    />
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.currentPassword && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium"
                    >
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`pl-9 ${errors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="Nouveau mot de passe"
                      />
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.newPassword && (
                      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.newPassword}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-9 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="Confirmer le mot de passe"
                      />
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.confirmPassword && (
                      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="border-t bg-gray-50/50 flex justify-between">
          <Button
            variant="outline"
            asChild
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Link href="/account/settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>

          <Button
            form="personal-info-form"
            type="submit"
            disabled={loading}
            className="bg-[#302082] hover:bg-[#302082]/90 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
