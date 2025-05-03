"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  contactMessageSchema,
  ContactMessageFormValues,
} from "@/lib/validations/contact-message-schema"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  AlertTriangle,
  Loader2,
  CheckCircle,
  MessageSquare,
  Send,
} from "lucide-react"

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactMessageFormValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
    },
  })

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const { toast } = useToast()

  const onSubmit = async (data: ContactMessageFormValues) => {
    try {
      const response = await fetch("/api/contact-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'envoi du message")
      }

      setIsSubmitted(true)
      reset()
      toast({
        title: "Succès",
        variant: "success",
        description: "Votre message a été envoyé avec succès.",
      })

      // Reset submission state after a delay for better UX
      setTimeout(() => setIsSubmitted(false), 3000)
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite. Veuillez réessayer.",
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-2 relative pb-2 inline-block">
          Contactez-nous
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Notre équipe est là pour vous aider. Envoyez-nous votre message et
          nous vous répondrons dans les plus brefs délais.
        </p>
      </div>

      <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#302082] via-[#5845B9] to-[#FF6B00]"></div>

        <CardHeader className="space-y-1 border-b bg-gray-50/50 pb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#302082]" />
            <CardTitle className="text-xl font-bold text-[#302082]">
              Formulaire de contact
            </CardTitle>
          </div>
          <CardDescription className="text-gray-500">
            Remplissez le formulaire ci-dessous pour nous envoyer un message
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-700">
                Message envoyé avec succès !
              </h3>
              <p className="text-gray-600">
                Nous avons bien reçu votre message et nous vous répondrons dans
                les plus brefs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#302082] flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Adresse e-mail
                </label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="votre@email.com"
                  className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="subject"
                  className="text-sm font-semibold text-[#302082] flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Sujet du message
                </label>
                <Input
                  id="subject"
                  {...register("subject")}
                  placeholder="Objet de votre message"
                  className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="message"
                  className="text-sm font-semibold text-[#302082] flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Votre message
                </label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Écrivez votre message ici..."
                  rows={6}
                  className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors resize-none"
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 text-sm font-semibold py-5 mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-between bg-gray-50/50 border-t text-xs text-gray-500 py-4 px-6">
          <p>Vos données sont sécurisées</p>
          <p>CYNA &copy; {new Date().getFullYear()}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
