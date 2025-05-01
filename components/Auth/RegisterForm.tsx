"use client"

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import emailjs from "@emailjs/browser"
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
} from "lucide-react"
import { useState } from "react"

// Composant RegisterForm
const RegisterForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  const handleSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

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

      if (response.ok) {
        // Étape 2 : Envoyer un e-mail de bienvenue avec EmailJS
        const templateParams = {
          firstName: data.firstName,
          email: data.email,
          subject: "Bienvenue sur Cyna !",
          message:
            "Merci de vous être inscrit sur Cyna ! Votre compte a été créé avec succès.",
          actionLink: "", // Pas de lien pour l'inscription
        }

        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC!, // Template générique
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        )

        console.log("E-mail de bienvenue envoyé avec succès !")
        router.push("/") // Redirige vers la page d'accueil après succès
      } else {
        console.error("Erreur lors de l'inscription:", result.error)
        setSubmitError(
          result.error || "Une erreur est survenue lors de l'inscription"
        )
      }
    } catch (error) {
      console.error(
        "Erreur lors de la requête ou de l'envoi de l'e-mail:",
        error
      )
      setSubmitError(
        "Une erreur est survenue lors de l'inscription ou de l'envoi de l'e-mail"
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
                        className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                        placeholder="Prénom"
                        disabled={isSubmitting}
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
                        className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                        placeholder="Nom"
                        disabled={isSubmitting}
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
                      className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                      placeholder="votre@email.com"
                      disabled={isSubmitting}
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
                    <Input
                      type="password"
                      className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                      placeholder="••••••••••"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
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
                    <Input
                      type="password"
                      className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                      placeholder="••••••••••"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

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
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
