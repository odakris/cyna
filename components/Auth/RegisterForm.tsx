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
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";

// Schéma de validation avec vérification du mot de passe
const formSchema = z
  .object({
    firstName: z.string().min(1, { message: "Le prénom est requis" }),
    lastName: z.string().min(1, { message: "Le nom est requis" }),
    email: z
      .string()
      .min(1, { message: "L'email est requis" })
      .email({ message: "Fournissez un email valide" }),
    password: z
      .string()
      .min(6, { message: "Le mot de passe doit avoir au moins 6 caractères" }),
    confirmPassword: z
      .string()
      .min(6, { message: "La confirmation du mot de passe est requise" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const RegisterForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
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
      });

      const result = await response.json();

      if (response.ok) {
        // Étape 2 : Envoyer un e-mail de bienvenue avec EmailJS
        const templateParams = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        };

        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, // Service ID
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME!, // Template ID pour l'inscription
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! // Public Key
        );

        console.log("E-mail de bienvenue envoyé avec succès !");
        router.push("/"); // Redirige vers la page d'accueil après succès
      } else {
        console.error("Erreur lors de l'inscription:", result.error);
        form.setError("email", { type: "manual", message: result.error });
      }
    } catch (error) {
      console.error("Erreur lors de la requête ou de l'envoi de l'e-mail:", error);
      form.setError("email", {
        type: "manual",
        message: "Une erreur est survenue lors de l'inscription ou de l'envoi de l'e-mail",
      });
    }
  };

  // Exemple commenté pour la gestion des commandes (à implémenter plus tard)
  /*
  const handleOrderConfirmation = async (orderData: {
    orderId: string;
    productName: string;
    price: number;
    email: string;
    firstName: string;
  }) => {
    try {
      const templateParams = {
        firstName: orderData.firstName,
        email: orderData.email,
        orderId: orderData.orderId,
        productName: orderData.productName,
        price: orderData.price.toFixed(2),
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER!, // Assurez-vous d'avoir ce Template ID dans .env
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      console.log("E-mail de confirmation de commande envoyé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail de commande:", error);
      throw new Error("Échec de l'envoi de l'e-mail de confirmation de commande");
    }
  };
  */

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>
          Fournissez les informations suivantes pour vous inscrire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* PRÉNOM */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Prénom
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      placeholder="Prénom"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* NOM */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Nom
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      placeholder="Nom"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* EMAIL */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* MOT DE PASSE */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Mot de passe
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      placeholder="Mot de passe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* CONFIRMATION DU MOT DE PASSE */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Confirmer le mot de passe
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      placeholder="Confirmez votre mot de passe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" variant={"cyna"}>
              S'inscrire
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;