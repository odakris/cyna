"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateUserInfo } from "@/lib/services/userService";
import { User } from "@/types/Types";

export default function PersonalInfoForm({ user }: { user: User }) {
  const { toast } = useToast(); // Notifications
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
  });

  const [loading, setLoading] = useState(false);

  // Gestion des changements dans les inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserInfo(formData);
      toast({
        title: "Succès",
        description: "Vos informations ont été mises à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: (error instanceof Error ? error.message : "Impossible de mettre à jour."),
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Prénom</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
