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
} from "@/components/ui/card"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Mail, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react"

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
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto mt-10 border-border/40 shadow-sm animate-in fade-in duration-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle>Contactez-nous</CardTitle>
          </div>
          <CardDescription>
            Envoyez-nous un message et nous vous répondrons dès que possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isSubmitted ? (
            <div className="flex items-center gap-2 text-green-600 font-medium p-4 bg-green-50 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span>Votre message a été envoyé avec succès.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Adresse e-mail
                </label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="votre.email@example.com"
                  className="mt-1"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-foreground"
                >
                  Sujet du message
                </label>
                <Input
                  id="subject"
                  {...register("subject")}
                  placeholder="Objet de votre message"
                  className="mt-1"
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground"
                >
                  Votre message
                </label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Écrivez votre message ici..."
                  rows={6}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                variant={"cyna"}
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
