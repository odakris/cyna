"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  RegisterFormValues,
  registerFormSchema,
} from "@/lib/validations/register-schema"
import {
  User,
  Mail,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
  Shield,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

const RegisterForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Calculer la force du mot de passe à chaque changement
  useEffect(() => {
    const password = form.watch("password")
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0

    // Longueur - jusqu'à 25%
    strength += Math.min(password.length * 2.5, 25)

    // Complexité - jusqu'à 75% supplémentaires
    if (/[A-Z]/.test(password)) strength += 15 // Majuscules
    if (/[a-z]/.test(password)) strength += 15 // Minuscules
    if (/[0-9]/.test(password)) strength += 15 // Chiffres
    if (/[^A-Za-z0-9]/.test(password)) strength += 15 // Caractères spéciaux
    if (password.length > 10) strength += 15 // Longueur supplémentaire

    setPasswordStrength(Math.min(strength, 100))
  }, [form.watch("password")])

  // Fonction pour obtenir la couleur de la barre de progression
  const getStrengthColor = () => {
    if (passwordStrength < 30) return "red-500"
    if (passwordStrength < 60) return "yellow-500"
    return "green-500"
  }

  // Fonction pour obtenir le texte de force du mot de passe
  const getStrengthText = () => {
    if (passwordStrength < 30) return "Faible"
    if (passwordStrength < 60) return "Moyen"
    if (passwordStrength < 80) return "Bon"
    return "Excellent"
  }

  const handleSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      // Étape 1 : Inscription via l'API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Erreur lors de l'inscription:", result.error)
        setSubmitError(
          typeof result.error === "string"
            ? result.error
            : "Une erreur est survenue lors de l'inscription"
        )
        return
      }

      // Afficher le message de succès
      setSuccessMessage(
        "Votre compte a été créé avec succès ! Un email de vérification vous a été envoyé. " +
          "Veuillez vérifier votre boîte de réception pour activer votre compte."
      )

      // Réinitialiser le formulaire
      form.reset()

      // Option: rediriger vers la page de connexion après un délai
      setTimeout(() => {
        router.push("/auth")
      }, 5000)
    } catch (error) {
      console.error("Erreur lors de la requête:", error)
      setSubmitError(
        "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-bold text-[#302082]">
          Inscription
        </CardTitle>
        <CardDescription className="text-gray-500">
          Créez votre compte pour rejoindre CYNA
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-600 font-semibold">
              Inscription réussie !
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {submitError && (
              <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-600 text-sm border border-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{submitError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PRÉNOM */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Prénom
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-50 focus:bg-white border-2 border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                        placeholder="Prénom"
                        disabled={isSubmitting || !!successMessage}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* NOM */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nom
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-50 focus:bg-white border-2 border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                        placeholder="Nom"
                        disabled={isSubmitting || !!successMessage}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* EMAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="bg-gray-50 focus:bg-white border-2 border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                      placeholder="votre@email.com"
                      disabled={isSubmitting || !!successMessage}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* MOT DE PASSE */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Mot de passe
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="password"
                        className="bg-gray-50 focus:bg-white border-2 border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors pr-10"
                        placeholder="••••••••••"
                        disabled={isSubmitting || !!successMessage}
                        {...field}
                      />
                      <Shield className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </FormControl>

                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Force du mot de passe:
                      </span>
                      <span
                        className={`font-medium ${
                          passwordStrength < 30
                            ? "text-red-500"
                            : passwordStrength < 60
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}
                      >
                        {getStrengthText()}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength}
                      className="h-1.5 w-full bg-gray-200 rounded-full"
                      indicatorClassName={`bg-${getStrengthColor()}`}
                    />
                    <ul className="text-xs text-gray-500 mt-2 space-y-1 pl-5 list-disc">
                      <li
                        className={
                          field.value && field.value.length >= 8
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Au moins 8 caractères
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(field.value) ? "text-green-600" : ""
                        }
                      >
                        Au moins une majuscule
                      </li>
                      <li
                        className={
                          /[a-z]/.test(field.value) ? "text-green-600" : ""
                        }
                      >
                        Au moins une minuscule
                      </li>
                      <li
                        className={
                          /[0-9]/.test(field.value) ? "text-green-600" : ""
                        }
                      >
                        Au moins un chiffre
                      </li>
                    </ul>
                  </div>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* CONFIRMATION DU MOT DE PASSE */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Confirmer le mot de passe
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="password"
                        className="bg-gray-50 focus:bg-white border-2 border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors pr-10"
                        placeholder="••••••••••"
                        disabled={isSubmitting || !!successMessage}
                        {...field}
                      />
                      <Shield className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {!successMessage && (
              <Button
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 text-sm font-semibold py-5 mt-2"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
