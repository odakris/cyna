"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  MailCheck,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Schema de validation pour le formulaire
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'e-mail est requis" })
    .email({ message: "Fournissez un email valide" }),
})

type ForgotPasswordFormValues = z.infer<typeof formSchema>

const ForgotPasswordForm = () => {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    setMessage(null)
    setError(null)
    setLoading(true)

    try {
      // Appel API pour demander la réinitialisation
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(
          result.error ||
            "Une erreur est survenue lors de la demande de réinitialisation."
        )
      } else {
        setMessage(
          result.message ||
            "Si votre e-mail existe, un lien de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception."
        )
        form.reset()
      }
    } catch (error) {
      // console.error("Erreur lors de la requête:", error)
      setError(
        "Une erreur est survenue lors de la demande. Veuillez réessayer."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#302082] to-[#FF6B00]"></div>
        {/* Subtle background pattern */}

        <CardHeader className="space-y-1 relative z-10">
          <div className="flex flex-col items-center mb-2">
            <div className="rounded-full bg-amber-50 p-3 mb-4">
              <KeyRound className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#302082] text-center">
              Mot de passe oublié
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600 text-center max-w-sm mx-auto">
            Entrez votre adresse e-mail ci-dessous et nous vous enverrons un
            lien pour réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          {message && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="ml-3">
                  <AlertTitle className="text-green-600 font-semibold text-sm">
                    Email envoyé !
                  </AlertTitle>
                  <AlertDescription className="text-green-700 text-sm mt-1">
                    {message}
                  </AlertDescription>
                </div>
              </div>
              <div className="mt-3 flex justify-center">
                <div className="bg-green-100 rounded-full px-4 py-2 flex items-center gap-2">
                  <MailCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700">
                    Vérifiez votre boîte de réception et vos spams
                  </span>
                </div>
              </div>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-600 font-semibold text-sm ml-2">
                Erreur
              </AlertTitle>
              <AlertDescription className="text-red-700 text-sm ml-2 mt-1">
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Adresse email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="bg-white focus:bg-white border-2 border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors rounded-md"
                        placeholder="votre@email.com"
                        disabled={loading || !!message}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {!message && (
                <Button
                  className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 text-sm font-semibold py-6 mt-4"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien de réinitialisation"
                  )}
                </Button>
              )}
            </form>
          </Form>

          <div className={`relative ${message ? "mt-4" : "mt-8"} text-center`}>
            <div className="absolute inset-0 flex items-center">
              <div className="border-t border-gray-200 w-full"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-2 pb-6 relative z-10">
          <Button
            asChild
            variant="ghost"
            className="text-[#302082] hover:text-[#FF6B00] hover:bg-orange-50 transition-colors flex items-center gap-1 text-sm"
          >
            <Link href="/auth">
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la connexion
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ForgotPasswordForm
