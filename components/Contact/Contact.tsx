"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import emailjs from "@emailjs/browser"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TextareaAutosize } from "@mui/material"

// ✅ Schéma de validation Zod
const formSchema = z.object({
  username: z.string().email({ message: "Email invalide" }),
  sujet: z.string().min(2, { message: "Le sujet doit contenir au moins 2 caractères." }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }),
})

export default function Contact() {
  // Initialisation de react-hook-form avec validation Zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      sujet: "",
      message: "",
    },
  })

  // Fonction de soumission du formulaire
  const onSubmit = (data: any) => {
    console.log("Formulaire soumis avec :", data) // 🔥 Vérifie dans la console

    // ✅ Paramètres EmailJS
    const templateParams = {
      user_email: data.username,
      sujet: data.sujet,
      message: data.message,
    }

    emailjs.send("formulaire-contact", "template_6vb978r", templateParams, "qKSPTT_1bii3Yniqd") // changer le template id après en avoir crée un, leur site bug pour l'instant
      .then(() => {
        alert("Message envoyé avec succès ! ✅")
        form.reset() // Réinitialise le formulaire après envoi
      })
      .catch((error) => {
        console.error("Erreur d'envoi :", error)
      })
  }

  return (
    <>
      <div className="relative w-full max-w-lg mx-auto mb-6 text-center">
        <p className="text-2xl font-bold py-10">Formulaire de contact</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Champ Email */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Votre email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Champ Sujet */}
          <FormField
            control={form.control}
            name="sujet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sujet du message</FormLabel>
                <FormControl>
                  <Input placeholder="Sujet du message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Champ Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <TextareaAutosize
                    {...field}
                    placeholder="Tapez votre message..."
                    minRows={3}
                    maxRows={7}
                    className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bouton Submit */}
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Envoyer
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
