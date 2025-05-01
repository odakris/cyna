import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Role, User } from "@prisma/client"

export function useUserDetails(id: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const userData: User = await fetch(`/api/users/${id}`).then(res =>
        res.json()
      )

      if (!userData) throw new Error("Utilisateur introuvable")
      setUser(userData)
      setErrorMessage(null)
    } catch (error) {
      console.error("Erreur fetchData:", error)
      setErrorMessage("Erreur lors du chargement des données.")
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'utilisateur.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEdit = () => {
    router.push(`/dashboard/users/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression")
      }

      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      })

      router.push("/dashboard/users")
    } catch (error) {
      console.error("Erreur handleDelete:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      })
    }
  }

  // fonction pour mettre à jour le statut actif du produit
  const handleStatusChange = (newStatus: boolean) => {
    if (user) {
      // Mettre à jour l'état local du produit
      setUser({
        ...user,
        active: newStatus,
        updated_at: new Date(),
      })
    }
  }
  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Fonction pour déterminer la couleur du badge selon le rôle
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case Role.ADMIN:
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case Role.MANAGER:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case Role.CUSTOMER:
      default:
        return "bg-green-100 text-green-800 hover:bg-green-200"
    }
  }

  return {
    user,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleDelete,
    getUserInitials,
    formatDate,
    getRoleBadgeColor,
    handleStatusChange,
  }
}
