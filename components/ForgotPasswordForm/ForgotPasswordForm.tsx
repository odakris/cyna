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
import { useState, useEffect } from "react"
import emailjs from "@emailjs/browser"
import {
  Mail,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'e-mail est requis" })
    .email({ message: "Fournissez un email valide" }),
})

const ForgotPassword = () => {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Initialiser EmailJS au montage du composant
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
    } else {
      console.error("Clé publique EmailJS manquante")
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setMessage(null)
    setError(null)
    setLoading(true)

    try {
      // Étape 1 : Appeler la route API pour générer le resetLink
      console.log("Envoi de la requête à /api/auth/forgot-password...")
      console.log("Corps de la requête:", JSON.stringify({ email: data.email }))
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      console.log("Réponse reçue:", response.status, response.statusText)
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La réponse du serveur n'est pas un JSON valide")
      }

      const result = await response.json()
      console.log("Résultat de la réponse:", result)

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Une erreur est survenue lors de la génération du lien."
        )
      }

      // Étape 2 : Vérifier les variables EmailJS
      console.log("Vérification des variables EmailJS...")
      console.log("Service ID:", process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID)
      console.log(
        "Template ID:",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC
      )
      console.log("Public Key:", process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)

      if (
        !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
        !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC ||
        !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      ) {
        throw new Error(
          "Les variables EmailJS sont manquantes. Vérifiez votre fichier .env."
        )
      }

      // Étape 3 : Envoyer l'e-mail avec EmailJS
      console.log("Envoi de l'e-mail via EmailJS...")
      const emailParams = {
        to_email: data.email,
        firstName: "Utilisateur",
        message:
          "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :",
        actionLink: result.resetLink,
      }

      console.log("Paramètres de l'e-mail:", emailParams)

      const emailResponse = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC,
        emailParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )

      console.log("E-mail envoyé avec succès:", emailResponse)
      setMessage(
        "Si votre e-mail existe, un lien de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception."
      )
    } catch (err) {
      console.error("Erreur lors de la requête ou de l'envoi de l'e-mail:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la demande."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in duration-300">
      <Card className="border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#302082] to-[#FF6B00]"></div>

        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-[#FF6B00] mr-2" />
            <CardTitle className="text-xl font-bold text-[#302082]">
              Mot de passe oublié
            </CardTitle>
          </div>
          <CardDescription className="text-gray-500">
            Entrez votre adresse e-mail pour recevoir un lien de
            réinitialisation
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {message && (
                <div className="bg-green-50 p-3 rounded-md flex items-start gap-2 text-green-600 text-sm border border-green-200">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p>{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-600 text-sm border border-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

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
                        className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                        placeholder="votre@email.com"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 text-sm font-semibold py-5 mt-2"
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
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4">
          <Link
            href="/auth"
            className="text-sm text-[#302082] hover:text-[#FF6B00] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ForgotPassword
