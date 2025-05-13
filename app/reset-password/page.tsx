"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
  XCircle,
  CheckCircle,
  ArrowLeft,
  LockKeyhole,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// Schema de validation pour le formulaire
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

const ResetPasswordPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [countdown, setCountdown] = useState(3)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Countdown effect for redirect after success
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (success && countdown === 0) {
      router.push("/auth")
    }
  }, [success, countdown, router])

  // Password strength calculation - FIXED
  useEffect(() => {
    const password = form.watch("password")
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    // Length - up to 25%
    strength += Math.min(password.length * 2.5, 25)

    // Complexity - up to 75% additional
    if (/[A-Z]/.test(password)) strength += 15 // Uppercase
    if (/[a-z]/.test(password)) strength += 15 // Lowercase
    if (/[0-9]/.test(password)) strength += 15 // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 15 // Special chars
    if (password.length > 10) strength += 15 // Extra length

    setPasswordStrength(Math.min(strength, 100))
  }, [form.watch("password")])

  // Vérifier la validité du token au chargement de la page
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const tokenParam = searchParams.get("token")
        setToken(tokenParam)

        if (!tokenParam) {
          setError("Token de réinitialisation manquant.")
          setIsVerifying(false)
          return
        }

        // Appel API pour vérifier le token
        const response = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: tokenParam }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.error ||
              "Le lien de réinitialisation est invalide ou a expiré."
          )
          setIsVerifying(false)
          setIsTokenValid(false)
          return
        }

        setIsTokenValid(true)
        setIsVerifying(false)
      } catch (error) {
        // console.error("Erreur lors de la vérification du token:", error)
        setError(
          "Une erreur est survenue lors de la vérification du lien de réinitialisation."
        )
        setIsVerifying(false)
        setIsTokenValid(false)
      }
    }

    verifyToken()
  }, [searchParams])

  const handleSubmit = async (data: ResetPasswordValues) => {
    if (!token) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          newPassword: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(
          result.error ||
            "Une erreur est survenue lors de la réinitialisation du mot de passe."
        )
      } else {
        setSuccess(true)
      }
    } catch (error) {
      // console.error("Erreur lors de la réinitialisation:", error)
      setError(
        "Une erreur est survenue lors de la réinitialisation du mot de passe."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Password strength indicator color
  const getStrengthColor = () => {
    if (passwordStrength < 30) return "red-500"
    if (passwordStrength < 60) return "yellow-500"
    return "green-500"
  }

  // Password strength text
  const getStrengthText = () => {
    if (passwordStrength < 30) return "Faible"
    if (passwordStrength < 60) return "Moyen"
    if (passwordStrength < 80) return "Bon"
    return "Excellent"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#302082]/5 blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FF6B00]/5 blur-3xl z-0" />

      <Card className="border-2 border-gray-100 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#302082] to-[#FF6B00]" />

        {isVerifying ? (
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#302082]/10 animate-ping"></div>
                <div className="relative bg-[#302082]/20 p-4 rounded-full">
                  <Loader2 className="h-10 w-10 text-[#302082] animate-spin" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl text-[#302082] font-bold">
              Vérification en cours...
            </CardTitle>
            <CardDescription className="mt-4 text-gray-600">
              Veuillez patienter pendant que nous vérifions votre lien de
              réinitialisation.
            </CardDescription>

            <div className="mt-6">
              <Progress
                value={passwordStrength}
                className="h-1.5 w-full bg-gray-200 rounded-full"
                indicatorClassName={`bg-${getStrengthColor()}`}
              />
            </div>
          </CardHeader>
        ) : !isTokenValid ? (
          <>
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center  p-4 rounded-full">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>

              <CardTitle className="text-2xl text-red-600 font-bold">
                Lien invalide
              </CardTitle>
              <CardDescription className="mt-4 text-gray-600">
                {error ||
                  "Le lien de réinitialisation est invalide ou a expiré."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center py-6">
              <Button
                asChild
                className="bg-[#302082] hover:bg-[#302082]/90 text-white px-6"
                size="lg"
              >
                <Link
                  href="/forgot-password"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Demander un nouveau lien
                </Link>
              </Button>
            </CardFooter>
          </>
        ) : success ? (
          <>
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>

              <CardTitle className="text-2xl text-green-600 font-bold">
                Mot de passe réinitialisé !
              </CardTitle>
              <CardDescription className="mt-4 text-gray-600">
                Votre mot de passe a été réinitialisé avec succès. Vous allez
                être redirigé vers la page de connexion dans {countdown}s.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center py-6">
              <Button
                asChild
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 px-6"
                size="lg"
              >
                <Link href="/auth">Se connecter maintenant</Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 pt-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-[#302082]/10 p-3 rounded-full">
                  <LockKeyhole className="h-8 w-8 text-[#302082]" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-[#302082] text-center">
                Réinitialisation du mot de passe
              </CardTitle>
              <CardDescription className="text-gray-500 text-center">
                Veuillez choisir un nouveau mot de passe pour votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-600 font-semibold text-sm">
                    Erreur
                  </AlertTitle>
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Nouveau mot de passe
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="password"
                              className="bg-gray-50 focus:bg-white border-2 border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors pr-10"
                              placeholder="••••••••••"
                              disabled={isSubmitting}
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
                                /[A-Z]/.test(field.value)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              Au moins une majuscule
                            </li>
                            <li
                              className={
                                /[a-z]/.test(field.value)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              Au moins une minuscule
                            </li>
                            <li
                              className={
                                /[0-9]/.test(field.value)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              Au moins un chiffre
                            </li>
                            <li
                              className={
                                /[@$!%*?&]/.test(field.value)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              Au moins un caractère spécial
                            </li>
                          </ul>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

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
                              disabled={isSubmitting}
                              {...field}
                            />
                            <Shield className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 text-sm font-semibold py-6"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Réinitialisation en cours...
                      </>
                    ) : (
                      "Réinitialiser mon mot de passe"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-center text-sm text-gray-500 pt-4 pb-6">
          <span className="flex items-center gap-1">
            <span className="font-bold text-[#302082]">CYNA</span> -{" "}
            {new Date().getFullYear()}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ResetPasswordPage
