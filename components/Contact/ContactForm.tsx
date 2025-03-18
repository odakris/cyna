"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

const contactSchema = z.object({
  email: z
    .string()
    .email("Adresse e-mail invalide")
    .nonempty("L'email est requis"),
  subject: z.string().nonempty("Le sujet est requis"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères"),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const onSubmit = async (data: ContactFormValues) => {
    // console.log("Données envoyées au serveur :", data)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message")
      }

      setIsSubmitted(true)
      setErrorMessage("")
      reset()
    } catch (error) {
      console.error(error)
      setErrorMessage("Une erreur s'est produite. Veuillez réessayer.")
    }
  }

  return (
    <Card className="max-w-5xl mx-auto mt-10 p-4">
      <CardHeader>
        <CardTitle>Contactez-nous</CardTitle>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-green-600 font-medium">
            Votre message a été envoyé avec succès.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <div>
              <label className="block font-medium">Adresse e-mail</label>
              <Input {...register("email")} placeholder="Votre email" />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block font-medium">Sujet du message</label>
              <Input {...register("subject")} placeholder="Sujet" />
              {errors.subject && (
                <p className="text-red-500 text-sm">{errors.subject.message}</p>
              )}
            </div>
            <div>
              <label className="block font-medium">Votre message</label>
              <Textarea
                {...register("message")}
                placeholder="Tapez votre message ici..."
              />
              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" variant={"cyna"}>
              Envoyer
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
