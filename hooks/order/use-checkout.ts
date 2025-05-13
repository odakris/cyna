import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

// Log pour confirmer le chargement du module
console.log("[useCheckout] Module chargé")

// Types
export interface Address {
  id_address: string
  first_name: string
  last_name: string
  address1: string
  address2: string | null
  postal_code: string
  region?: string | null
  city: string
  country: string
  mobile_phone: string
}

export interface PaymentInfo {
  id_payment_info: string | number
  card_name: string
  last_card_digits: string
  stripe_payment_id?: string
  stripe_customer_id?: string
  brand?: string
}

export interface CartItem {
  uniqueId: string
  id: string | number
  name: string
  price: number
  quantity: number
  subscription?: string
  imageUrl?: string
}

// Define valid subscription types
const VALID_SUBSCRIPTION_TYPES = [
  "MONTHLY",
  "YEARLY",
  "PER_USER",
  "PER_MACHINE",
]

export function useCheckout() {
  const { data: session, status } = useSession()
  const { cart: contextCart, setCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const stripe = useStripe()
  const elements = useElements()

  // Sécuriser cart pour garantir qu'il est toujours un tableau
  const cart = Array.isArray(contextCart) ? contextCart : []

  // State variables
  const [isGuest, setIsGuest] = useState(false)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestUserId, setGuestUserId] = useState<number | null>(null)
  const [guestStripeCustomerId, setGuestStripeCustomerId] = useState<
    string | null
  >(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentInfos, setPaymentInfos] = useState<PaymentInfo[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentInfo | null>(null)
  const [activeTab, setActiveTab] = useState<string>("address")
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAddress, setNewAddress] = useState({
    first_name: "",
    last_name: "",
    address1: "",
    address2: "",
    postal_code: "",
    region: "",
    city: "",
    country: "",
    mobile_phone: "",
  })
  const [newPayment, setNewPayment] = useState({
    card_name: "",
  })

  // Calculate cart totals
  const totalItems = cart.reduce((count, item) => count + item.quantity, 0)

  const totalCartPrice = cart.reduce((sum, item) => {
    let unitPrice = item.price
    switch (item.subscription || "MONTHLY") {
      case "MONTHLY":
        unitPrice = item.price
        break
      case "YEARLY":
        unitPrice = item.price * 12
        break
      case "PER_USER":
        unitPrice = item.price
        break
      case "PER_MACHINE":
        unitPrice = item.price
        break
      default:
        unitPrice = item.price
    }
    return sum + unitPrice * item.quantity
  }, 0)

  const taxes = totalCartPrice * 0.2
  const finalTotal = totalCartPrice + taxes

  // Handle query parameters for error messages
  useEffect(() => {
    const errorMsg = searchParams.get("error")
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
  }, [searchParams])

  // Safely parse JSON response
  const safeParseJson = async (response: Response) => {
    try {
      const text = await response.text()
      console.log("[useCheckout] Réponse brute pour", response.url, ":", text)
      return text ? JSON.parse(text) : {}
    } catch (err) {
      // console.error("[useCheckout] Erreur parsing JSON:", err)
      return { message: "Réponse serveur invalide" }
    }
  }

  // Fetch guest data from localStorage
  const fetchGuestData = async () => {
    try {
      const guestAddresses = JSON.parse(localStorage.getItem("guestAddresses") || "[]")
      const guestPayments = JSON.parse(localStorage.getItem("guestPaymentInfos") || "[]")

      console.log("[useCheckout] Données brutes invité:", { guestAddresses, guestPayments })

      setAddresses(Array.isArray(guestAddresses) ? guestAddresses : [])
      setPaymentInfos(Array.isArray(guestPayments) ? guestPayments : [])

      if (guestAddresses.length > 0) {
        setSelectedAddress(guestAddresses[0])
      }
      if (guestPayments.length > 0) {
        setSelectedPayment(guestPayments[0])
      }
    } catch (err) {
      // console.error("[useCheckout] Erreur dans fetchGuestData:", err)
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données invité")
    } finally {
      setLoading(false)
    }
  }

  // Fetch user data (addresses & payment methods)
  const fetchUserData = async (userId: number) => {
    try {
      const [addressResponse, paymentResponse] = await Promise.all([
        fetch(`/api/users/${userId}/addresses`, {
          headers: { "x-user-id": userId.toString(), "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(`/api/users/${userId}/payments`, {
          headers: { "x-user-id": userId.toString(), "Content-Type": "application/json" },
          credentials: "include",
        }),
      ])

      if (addressResponse.ok) {
        const addressData = await safeParseJson(addressResponse)
        console.log("[useCheckout] Adresses reçues:", addressData)
        setAddresses(Array.isArray(addressData) ? addressData : [])
        if (addressData.length > 0) {
          setSelectedAddress(addressData[0])
        }
      } else {
        const errorData = await safeParseJson(addressResponse)
        // console.error("[useCheckout] Erreur récupération adresses:", errorData)
        setError(
          `Erreur lors du chargement des adresses: ${errorData.message || "Erreur inconnue"}`
        )
      }

      if (paymentResponse.ok) {
        const paymentData = await safeParseJson(paymentResponse)
        console.log("[useCheckout] Moyens de paiement reçus:", paymentData)
        setPaymentInfos(Array.isArray(paymentData) ? paymentData : [])
        if (paymentData.length > 0) {
          setSelectedPayment(paymentData[0])
        }
      } else {
        const errorData = await safeParseJson(paymentResponse)
        // console.error("[useCheckout] Erreur récupération moyens de paiement:", errorData)
        setError(
          `Erreur lors du chargement des moyens de paiement: ${errorData.message || "Erreur inconnue"}`
        )
      }
    } catch (err) {
      // console.error("[useCheckout] Erreur dans fetchUserData:", err)
      setError(
        "Erreur réseau lors du chargement des données utilisateur. Veuillez réessayer."
      )
    } finally {
      setLoading(false)
    }
  }

  // Initialize component based on session status
  useEffect(() => {
    console.log("[useCheckout] Initializing with:", {
      sessionStatus: status,
      stripeAvailable: !!stripe,
      cartItems: cart.length,
      cartContent: cart,
      setProcessingPaymentType: typeof setProcessingPayment,
    })

    if (status === "loading") {
      console.log("[useCheckout] Session still loading, waiting...")
      return
    }

    if (!session) {
      console.log("[useCheckout] No session, setting guest mode")
      setIsGuest(true)
      fetchGuestData()
      return
    }

    // Wait for stripe to be available
    if (!stripe) {
      console.log(
        "[useCheckout] Stripe not yet available, waiting for initialization..."
      )
      return
    }

    const userId = session?.user?.id_user
    if (userId) {
      console.log("[useCheckout] Fetching user data for userId:", userId)
      setIsGuest(false)
      fetchUserData(userId)
    } else {
      console.log("[useCheckout] No userId, setting guest mode")
      setIsGuest(true)
      fetchGuestData()
    }
  }, [session, status, cart, stripe])

  // Create guest user if needed
  const createGuestUser = async () => {
    if (!guestEmail) {
      setError("Veuillez entrer un e-mail pour continuer en tant qu'invité")
      return null
    }

    try {
      console.log('[useCheckout] Création utilisateur invité:', { guestEmail })
      const guestUserResponse = await fetch("/api/users/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail }),
        credentials: "include", // Ajout pour s'assurer que le cookie est inclus
      })

      console.log('[useCheckout] Réponse de /api/users/guest:', {
        status: guestUserResponse.status,
        statusText: guestUserResponse.statusText,
        headers: Object.fromEntries(guestUserResponse.headers.entries()),
      })

      if (!guestUserResponse.ok) {
        const errorData = await safeParseJson(guestUserResponse)
        console.error('[useCheckout] Erreur lors de la création de l’utilisateur invité:', errorData)
        setError(
          `Erreur lors de la création de l'utilisateur invité: ${errorData.message || "Erreur inconnue"}`
        )
        return null
      }

      const guestUser = await safeParseJson(guestUserResponse)
      console.log('[useCheckout] Utilisateur invité créé:', {
        id_user: guestUser.id_user,
        email: guestUser.email,
        stripeCustomerId: guestUser.stripeCustomerId,
      })

      setGuestUserId(guestUser.id_user)
      setGuestStripeCustomerId(guestUser.stripeCustomerId)

      // Forcer la mise à jour de la session en appelant /api/auth/session
      console.log('[useCheckout] Forcer la mise à jour de la session')
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      })
      const sessionData = await safeParseJson(sessionResponse)
      console.log('[useCheckout] Résultat de /api/auth/session:', sessionData)

      // Store guest email in localStorage to access it later
      localStorage.setItem("guestEmail", guestEmail)
      localStorage.setItem("guestUserId", guestUser.id_user.toString())

      return guestUser.id_user
    } catch (err) {
      // console.error("[useCheckout] Erreur dans createGuestUser:", err)
      setError(
        "Erreur réseau lors de la création de l'utilisateur invité. Vérifiez votre connexion et réessayez."
      )
      return null
    }
  }

  // Handle saving a new address
  const handleSaveNewAddress = async () => {
    setError(null)

    // Validate required fields
    if (
      !newAddress.first_name ||
      !newAddress.last_name ||
      !newAddress.address1 ||
      !newAddress.postal_code ||
      !newAddress.city ||
      !newAddress.country ||
      !newAddress.mobile_phone
    ) {
      setError("Veuillez remplir tous les champs obligatoires de l'adresse")
      return
    }

    try {
      let userId = session?.user?.id_user || guestUserId
      if (isGuest && !userId) {
        userId = await createGuestUser()
        if (!userId) return
      }

      if (!userId) {
        setError("Utilisateur non identifié")
        return
      }

      if (isGuest) {
        // Mode invité : Stocker directement
        const addressWithId = { ...newAddress, id_address: `guest_${uuidv4()}` }
        const guestAddresses = JSON.parse(localStorage.getItem("guestAddresses") || "[]")
        guestAddresses.push(addressWithId)
        localStorage.setItem("guestAddresses", JSON.stringify(guestAddresses))

        setAddresses([...guestAddresses])
        setSelectedAddress(addressWithId)
      } else {
        // Mode connecté
        const response = await fetch(`/api/users/${userId}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId.toString(),
          },
          body: JSON.stringify(newAddress),
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await safeParseJson(response)
          throw new Error(
            response.status === 405
              ? "Méthode POST non autorisée pour /api/users/addresses. Vérifiez la configuration du serveur."
              : `Erreur lors de l'ajout de l'adresse: ${errorData.message || "Erreur inconnue (code: " + response.status + ")"}`
          )
        }

        const savedAddress = await safeParseJson(response)
        console.log("[useCheckout] Adresse enregistrée:", savedAddress)

        setAddresses([...addresses, savedAddress])
        setSelectedAddress(savedAddress)
      }

      toast({
        title: "Adresse ajoutée",
        description: "Votre nouvelle adresse a été ajoutée avec succès.",
        variant: "success",
      })

      // Reset form and move to payment tab
      setNewAddress({
        first_name: "",
        last_name: "",
        address1: "",
        address2: "",
        postal_code: "",
        region: "",
        city: "",
        country: "",
        mobile_phone: "",
      })

      // Advance to payment tab if there are no payment methods
      if (paymentInfos.length === 0) {
        setActiveTab("payment")
      }
    } catch (err) {
      // console.error("[useCheckout] Erreur dans handleSaveNewAddress:", err)
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement de l'adresse"
      )
    }
  }

  // Handle saving a new payment method
  const handleSaveNewPayment = async () => {
    console.log("[useCheckout] Sauvegarde nouveau moyen de paiement:", {
      card_name: newPayment.card_name,
      userId: session?.user?.id_user || guestUserId || "invité",
    })
    setError(null)

    if (!stripe || !elements) {
      // console.error("[useCheckout] Stripe non chargé:", { stripe, elements })
      setError("Erreur de chargement de Stripe. Veuillez recharger la page.")
      return
    }

    if (!newPayment.card_name) {
      // console.error("[useCheckout] Nom de carte manquant")
      setError("Veuillez entrer un nom pour la carte")
      return
    }

    try {
      let userId = session?.user?.id_user || guestUserId
      if (isGuest && !userId) {
        userId = await createGuestUser()
        if (!userId) return
      }

      if (!userId) {
        setError("Utilisateur non identifié")
        return
      }

      // Récupérer ou créer le stripeCustomerId pour tous les utilisateurs
      let stripeCustomerId = isGuest ? guestStripeCustomerId : null

      if (!stripeCustomerId) {
        // Pour les utilisateurs réguliers, récupérer leur stripeCustomerId
        try {
          const userResponse = await fetch(`/api/users/${userId}`, {
            headers: { "x-user-id": userId.toString() },
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.stripeCustomerId) {
              stripeCustomerId = userData.stripeCustomerId
            } else {
              // Si l'utilisateur n'a pas de stripeCustomerId, en créer un
              const createCustomerResponse = await fetch(
                "/api/stripe/create-customer",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId.toString(),
                  },
                  body: JSON.stringify({
                    email: session?.user?.email || guestEmail,
                    name: newPayment.card_name,
                  }),
                }
              )

              if (createCustomerResponse.ok) {
                const customerData = await createCustomerResponse.json()
                stripeCustomerId = customerData.customerId

                // Mettre à jour l'utilisateur avec le nouveau stripeCustomerId
                await fetch(`/api/users/${userId}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId.toString(),
                  },
                  body: JSON.stringify({
                    stripeCustomerId,
                  }),
                })
              } else {
                throw new Error("Impossible de créer un compte client Stripe")
              }
            }
          } else {
            throw new Error(
              "Impossible de récupérer les informations utilisateur"
            )
          }
        } catch (error) {
          /*console.error(
            "[useCheckout] Erreur lors de la récupération/création du customerId:",
            error
          )*/
          setError("Erreur lors de la configuration du client Stripe")
          return
        }
      }

      if (!stripeCustomerId) {
        // console.error("[useCheckout] stripeCustomerId manquant")
        setError("Erreur: client Stripe non configuré")
        return
      }

      // Reste du code avec le stripeCustomerId maintenant défini
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        // console.error("[useCheckout] CardElement non trouvé")
        setError(
          "Erreur avec |le formulaire de paiement. Veuillez recharger la page."
        )
        return
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: newPayment.card_name,
          email: isGuest ? guestEmail : undefined,
        },
      })

      if (error) {
        // console.error("[useCheckout] Erreur Stripe:", error)
        setError(error.message || "Erreur lors de l'ajout du moyen de paiement")
        return
      }

      // Attacher le paymentMethod au client Stripe
      await fetch("/api/stripe/attach-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId.toString(),
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId: stripeCustomerId,
        }),
      })

      const paymentData = {
        userId,
        card_name: newPayment.card_name,
        stripe_payment_id: paymentMethod.id,
        stripe_customer_id: stripeCustomerId,
        last_card_digits: paymentMethod.card ? paymentMethod.card.last4 : "",
        brand: paymentMethod.card?.brand,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year,
      }

      console.log("[useCheckout] Données envoyées pour le paiement:", paymentData)

      if (isGuest) {
        // Mode invité : Stocker directement
        const paymentWithId = {
          ...paymentData,
          id_payment_info: `guest_${uuidv4()}`,
        }
        const guestPayments = JSON.parse(localStorage.getItem("guestPaymentInfos") || "[]")
        guestPayments.push(paymentWithId)
        localStorage.setItem("guestPaymentInfos", JSON.stringify(guestPayments))

        setPaymentInfos([...guestPayments])
        setSelectedPayment(paymentWithId)
      } else {
        // Mode connecté
        const response = await fetch(`/api/users/${userId}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId.toString(),
          },
          body: JSON.stringify(paymentData),
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await safeParseJson(response)
          throw new Error(
            response.status === 405
              ? "Méthode POST non autorisée pour /api/users/payments. Vérifiez la configuration du serveur."
              : `Erreur lors de l'ajout du moyen de paiement: ${errorData.message || "Erreur inconnue (code: " + response.status + ")"}`
          )
        }

        const savedPayment = await safeParseJson(response)
        console.log("[useCheckout] Paiement enregistré:", savedPayment)

        setPaymentInfos([...paymentInfos, savedPayment])
        setSelectedPayment(savedPayment)
      }

      toast({
        title: "Moyen de paiement ajouté",
        description: "Votre nouveau moyen de paiement a été ajouté avec succès.",
        variant: "success",
      })

      setNewPayment({ card_name: "" })
      cardElement.clear()
      setActiveTab("review")
    } catch (err) {
      // console.error("[useCheckout] Erreur dans handleSaveNewPayment:", err)
      setError(
        err instanceof Error ? err.message : "Erreur lors de l’ajout du moyen de paiement"
      )
    }
  }

  // Log avant le retour pour vérifier les valeurs
  console.log('[useCheckout] Retour des valeurs:', {
    setProcessingPaymentType: typeof setProcessingPayment,
    processingPayment,
    isGuest,
    cartLength: cart.length,
    selectedAddressId: selectedAddress?.id_address,
    selectedPaymentId: selectedPayment?.id_payment_info,
  })

  return {
    isGuest,
    guestEmail,
    setGuestEmail,
    guestUserId,
    guestStripeCustomerId,
    addresses,
    paymentInfos,
    selectedAddress,
    setSelectedAddress,
    selectedPayment,
    setSelectedPayment,
    activeTab,
    setActiveTab,
    loading,
    processingPayment,
    setProcessingPayment,
    error,
    setError,
    newAddress,
    setNewAddress,
    newPayment,
    setNewPayment,
    cart,
    setCart,
    totalItems,
    totalCartPrice,
    taxes,
    finalTotal,
    handleSaveNewAddress,
    handleSaveNewPayment,
  }
}