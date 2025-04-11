"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token manquant. Veuillez utiliser le lien envoyé par e-mail.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Mot de passe réinitialisé avec succès. Redirection vers la connexion...");
        setTimeout(() => router.push("/auth"), 3000);
      } else {
        throw new Error(result.error || "Une erreur est survenue lors de la réinitialisation.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Réinitialiser le mot de passe</CardTitle>
        <CardDescription>Entrez votre nouveau mot de passe.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading || !token}
              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              placeholder="Nouveau mot de passe"
            />
          </div>
          <div>
            <label className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
              Confirmer le mot de passe
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || !token}
              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              placeholder="Confirmer le mot de passe"
            />
          </div>
          {message && <p className="text-green-500">{message}</p>}
          {error && <p className="text-red-500">{error}</p>}
          <Button className="w-full" variant="cyna" disabled={loading || !token}>
            {loading ? "Réinitialisation en cours..." : "Réinitialiser"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}