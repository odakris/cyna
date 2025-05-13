// hooks/contact-messages/use-unread-messages-notification.ts
import { useState, useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"

export function useUnreadMessagesNotification() {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false)
  const previousCountRef = useRef<number>(0)
  const { toast } = useToast()
  const pathname = usePathname()

  // Utiliser useCallback pour mémoriser la fonction
  const checkUnreadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/contact-message/stats")
      if (response.ok) {
        const stats = await response.json()
        setUnreadCount(stats.unread)

        // Si le nombre de messages non lus a augmenté depuis la dernière vérification
        if (
          stats.unread > previousCountRef.current &&
          previousCountRef.current !== 0
        ) {
          setHasNewMessages(true)

          // N'afficher la notification que si l'utilisateur n'est pas déjà sur la page des messages
          if (!pathname.includes("/dashboard/contact")) {
            toast({
              title: "Nouveau message de contact",
              description: `Vous avez reçu ${stats.unread - previousCountRef.current} nouveau(x) message(s)`,
              variant: "default",
              duration: 5000,
            })
          }
        }

        previousCountRef.current = stats.unread
      }
    } catch (error) {
      /*console.error(
        "Erreur lors de la vérification des messages non lus:",
        error
      )*/
    }
  }, [toast, pathname]) // Inclure les dépendances de la fonction

  // Vérifier les messages non lus au chargement initial
  useEffect(() => {
    checkUnreadMessages()

    // Configurer une vérification périodique (toutes les 60 secondes)
    const interval = setInterval(checkUnreadMessages, 60000)

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval)
  }, [checkUnreadMessages]) // Maintenant on peut inclure checkUnreadMessages sans créer de boucle

  // Réinitialiser le statut "hasNewMessages" lorsque l'utilisateur visite la page des messages
  useEffect(() => {
    if (pathname.includes("/dashboard/contact")) {
      setHasNewMessages(false)
    }
  }, [pathname])

  return { unreadCount, hasNewMessages, checkUnreadMessages }
}
