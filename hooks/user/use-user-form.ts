import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Role, User } from "@prisma/client"
import { UserFormValues } from "@/lib/validations/user-schema"

export function useUserForm(userId?: string) {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(userId ? true : false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<UserFormValues | null>(null)
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false)
  const [userActive, setUserActive] = useState<boolean>(false)

  useEffect(() => {
    // Si nous avons un ID, nous sommes en mode édition et devons charger les données
    const fetchData = async () => {
      if (!userId) return

      try {
        setLoading(true)
        const userData = await fetch(`/api/users/${userId}`).then(res =>
          res.json()
        )

        if (!userData) throw new Error("Utilisateur introuvable")

        setUser(userData)
        setEmailVerified(userData.email_verified)
        setTwoFactorEnabled(userData.two_factor_enabled)
        setUserActive(userData.active)

        // Conversion de User en UserFormValues
        const formData: UserFormValues = {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          password: "", // Mot de passe vide pour l'édition
          role: userData.role,
          email_verified: userData.email_verified,
          two_factor_enabled: userData.two_factor_enabled,
          active: userData.active,
        }

        setInitialData(formData)
        setErrorMessage(null)
      } catch (error) {
        // console.error("Erreur fetchData:", error)
        setErrorMessage("Erreur lors du chargement des données.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de l'utilisateur.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, toast])

  // En mode création, initialiser avec des valeurs par défaut
  useEffect(() => {
    if (!userId) {
      const defaultData: UserFormValues = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
        email_verified: false,
        two_factor_enabled: false,
        active: true,
      }
      setInitialData(defaultData)
    }
  }, [userId])

  // Fonction pour activer/désactiver un utilisateur
  const toggleUserStatus = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/users/${userId}/active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la modification du statut de l'utilisateur"
        )
      }

      const updatedUser = await response.json()
      setUserActive(updatedUser.active)

      toast({
        title: "Statut modifié",
        variant: "success",
        description: `L'utilisateur est maintenant ${updatedUser.active ? "actif" : "inactif"}.`,
      })

      return updatedUser
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

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

  const getUserInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "U"
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return {
    user,
    loading,
    errorMessage,
    initialData,
    emailVerified,
    setEmailVerified,
    twoFactorEnabled,
    userActive,
    setUserActive,
    toggleUserStatus,
    setTwoFactorEnabled,
    getRoleBadgeColor,
    getUserInitials,
    isEditing: !!userId,
  }
}
