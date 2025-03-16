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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, SignInResponse } from "next-auth/react";

// Définir le schéma de validation avec Zod
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Fournissez un email valide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

// Type pour les données du formulaire inféré à partir du schéma Zod
type FormData = z.infer<typeof formSchema>;

// Interface pour les props du composant
interface LoginFormProps {
  redirectTo?: string; // URL de redirection après connexion (optionnel)
  title?: string; // Titre personnalisé du formulaire (optionnel)
}

// Composant LoginForm avec typage explicite
const LoginForm: React.FC<LoginFormProps> = ({
  redirectTo = "/",
  title = "Connexion",
}) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialisation du formulaire avec typage explicite
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Gestion de la soumission du formulaire avec typage explicite
  const handleSubmit = async (data: FormData): Promise<void> => {
    setErrorMessage(null);

    try {
      const result: SignInResponse | undefined = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setErrorMessage("Email ou mot de passe incorrect");
      } else if (result?.ok) {
        router.push(redirectTo);
      } else {
        setErrorMessage("Une erreur inattendue est survenue");
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la connexion:", error);
      setErrorMessage("Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Connectez-vous avec vos identifiants</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {errorMessage && (
              <p className="text-red-500 text-sm text-center">{errorMessage}</p>
            )}
            {/* Champ Email */}
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
            {/* Champ Mot de passe */}
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
            <Button className="w-full" variant="cyna">
              Connexion
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;