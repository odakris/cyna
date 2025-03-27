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
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Ajout pour redirection

const formSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type FormData = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Ajout pour redirection

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (data: FormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    console.log("LoginForm - Données envoyées:", data); // Log des données

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (result?.error) {
      switch (result.error) {
        case "Email et mot de passe requis":
          setErrorMessage("Veuillez remplir tous les champs.");
          break;
        case "Utilisateur non trouvé":
          setErrorMessage("Aucun compte n'est associé à cet email.");
          break;
        case "Mot de passe incorrect":
          setErrorMessage("Mot de passe incorrect.");
          break;
        default:
          setErrorMessage("Une erreur est survenue lors de la connexion.");
      }
      console.log("LoginForm - Erreur de connexion:", result.error);
    } else {
      // Succès : rediriger vers une page (par exemple, la page d'accueil)
      console.log("LoginForm - Connexion réussie:", result);
      router.push("/"); // Redirection après succès
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Connectez-vous avec vos identifiants</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {errorMessage && (
              <p className="text-red-500 text-sm text-center">{errorMessage}</p>
            )}
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
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black"
                      placeholder="Email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black"
                      placeholder="Mot de passe"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-500 hover:underline dark:text-blue-400"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </FormItem>
              )}
            />
            <Button className="w-full" variant="cyna" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Connexion"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;