"use client"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { updateUserInfo } from "@/lib/services/userService"

export default function PersonalInfoForm({ user }) {
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const handleSubmit = async e => {
    e.preventDefault()

    // Validation des champs
    if (!email || !name) {
      toast.error("Le nom et l'e-mail sont requis.")
      return
    }

    try {
      // Appel à un service backend pour mettre à jour les informations
      await updateUserInfo({ name, email, password, newPassword })
      toast.success("Informations mises à jour avec succès.")
    } catch (error) {
      toast.error(error.message || "Erreur lors de la mise à jour.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Informations personnelles</h2>
      <div>
        <label>Nom complet</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Mot de passe actuel</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label>Nouvel mot de passe</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
      </div>
      <button type="submit">Mettre à jour</button>
    </form>
  )
}
