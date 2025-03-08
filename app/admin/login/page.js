// app/admin/login/page.js
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Tentative de connexion avec:", email);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    console.log("Résultat de signIn:", result);

    if (result?.ok) {
      console.log("Connecté en tant qu'admin");
      router.push("/admin/dashboard");
    } else {
      setErrorMessage("Échec de la connexion : identifiants incorrects");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1>Connexion au Back-Office</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            name="email"
            className="w-full p-2 border"
            placeholder="Email"
            required
          />
        </div>
        <div>
          <label className="block">Mot de passe</label>
          <input
            type="password"
            name="password"
            className="w-full p-2 border"
            placeholder="Mot de passe"
            required
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white">
          Connexion
        </button>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </form>
    </div>
  );
}