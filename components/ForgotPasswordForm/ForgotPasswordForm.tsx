"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import emailjs from "@emailjs/browser";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'e-mail est requis" })
    .email({ message: "Fournissez un email valide" }),
});

const ForgotPassword = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Formulaire soumis avec l'e-mail:", data.email);
    setMessage(null);
    setLoading(true);

    try {
      // Étape 1 : Appeler la route API pour générer le resetLink
      console.log("Envoi de la requête à /api/auth/forgot-password...");
      console.log("Corps de la requête:", JSON.stringify({ email: data.email }));
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      console.log("Réponse reçue:", response.status, response.statusText);
      const result = await response.json();
      console.log("Résultat de la réponse:", result);

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue lors de la génération du lien.");
      }

      // Étape 2 : Vérifier les variables EmailJS
      console.log("Vérification des variables EmailJS...");
      console.log("Service ID:", process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID);
      console.log("Template ID:", process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME);
      console.log("Public Key:", process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);

      if (!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
        throw new Error("La clé publique EmailJS est manquante. Vérifiez votre fichier .env.");
      }

      // Étape 3 : Envoyer l'e-mail avec EmailJS
      console.log("Envoi de l'e-mail via EmailJS...");
      const emailParams = {
        to_email: data.email, // Utilisé pour le champ "To" du modèle
        firstName: "Utilisateur", // Remplacez par le vrai prénom si disponible
        message: "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :",
        actionLink: result.resetLink, // Le lien de réinitialisation
      };

      console.log("Paramètres de l'e-mail:", emailParams);

      const emailResponse = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME!,
        emailParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      console.log("E-mail envoyé avec succès:", emailResponse);
      setMessage("Si votre e-mail existe, un lien de réinitialisation a été envoyé.");
    } catch (error: any) {
      console.error("Erreur lors de la requête ou de l'envoi de l'e-mail:", error);
      setMessage(error.message || "Une erreur est survenue lors de la demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Entrez votre e-mail pour recevoir un lien de réinitialisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      placeholder="Email"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {message && (
              <p
                className={
                  message.includes("envoyé") ? "text-green-500" : "text-red-500"
                }
              >
                {message}
              </p>
            )}
            <Button className="w-full" variant={"cyna"} disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;