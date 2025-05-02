import { useState, useEffect, useCallback } from "react"
import { User } from "@prisma/client"

// Type pour les statistiques des utilisateurs
type UserStats = {
  total: number
  verified: number
  unverified: number
  adminCount: number
}

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tous")
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    verified: 0,
    unverified: 0,
    adminCount: 0,
  })

  // Fonction pour récupérer les utilisateurs
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: User[] = await response.json()
      setUsers(data)

      // Calculer les statistiques
      const newStats = {
        total: data.length,
        verified: data.filter(u => u.email_verified).length,
        unverified: data.filter(u => !u.email_verified).length,
        adminCount: data.filter(
          u => u.role === "ADMIN" || u.role === "SUPER_ADMIN"
        ).length,
      }
      setStats(newStats)

      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchUsers:", error)
      setError("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour supprimer des utilisateurs
  const deleteUsers = async (userIds: number[]) => {
    try {
      const failedDeletions: number[] = []

      for (const id of userIds) {
        const response = await fetch(`/api/users/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          failedDeletions.push(id)
          const errorData = await response.json()
          console.error(`Erreur de suppression pour l'ID ${id}:`, errorData)
        }
      }

      // Recharger les utilisateurs après suppression
      await fetchUsers()

      if (failedDeletions.length > 0) {
        return {
          success: false,
          message: `Impossible de supprimer ${failedDeletions.length} utilisateur(s). Ils peuvent avoir des commandes associées.`,
        }
      }

      return { success: true }
    } catch (error: unknown) {
      console.error("Erreur deleteUsers:", error)
      throw error
    }
  }

  // Charger les utilisateurs lors du montage du composant
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    setError,
    fetchUsers,
    deleteUsers,
    activeTab,
    setActiveTab,
    stats,
  }
}
