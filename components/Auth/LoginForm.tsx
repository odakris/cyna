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
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
})

type FormData = z.infer<typeof formSchema>

const LoginForm: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  const handleSubmit = async (data: FormData) => {
    setErrorMessage(null)
    setIsLoading(true)
    console.log("LoginForm - Données envoyées:", data)

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    })

    setIsLoading(false)

    if (result?.error) {
      switch (result.error) {
        case "Email et mot de passe requis":
          setErrorMessage("Veuillez remplir tous les champs.")
          break
        case "Utilisateur non trouvé":
          setErrorMessage("Aucun compte n'est associé à cet email.")
          break
        case "Mot de passe incorrect":
          setErrorMessage("Mot de passe incorrect.")
          break
        case "Compte inactif":
          setErrorMessage(
            "Ce compte a été désactivé. Veuillez contacter l'administrateur."
          )
          break
        default:
          setErrorMessage("Une erreur est survenue lors de la connexion.")
      }
      console.log("LoginForm - Erreur de connexion:", result.error)
    } else {
      console.log("LoginForm - Connexion réussie:", result)
      router.push("/")
    }
  }

  return (
    <Card className="border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-bold text-[#302082]">
          Connexion
        </CardTitle>
        <CardDescription className="text-gray-500">
          Connectez-vous à votre compte CYNA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {errorMessage && (
              <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-600 text-sm border border-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
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
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm font-semibold text-[#302082] flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Mot de passe
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#FF6B00] hover:text-[#302082] hover:underline transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                      placeholder="••••••••••"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 text-sm font-semibold py-5 mt-2"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LoginForm
