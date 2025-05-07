import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"

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
  const { cart, setCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const stripe = useStripe()
  const elements = useElements()

  // State variables
  const [isGuest, setIsGuest] = useState(false)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestUserId, setGuestUserId] = useState<number | null>(null)
  const [guestStripeCustomerId, setGuestStripeCustomerId] = useState<
    string | null
  >(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentInfos, setPaymentInfos] = useState<PaymentInfo[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
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
      return text ? JSON.parse(text) : {}
    } catch (err) {
      console.error("Erreur parsing JSON:", err)
      return { message: "Réponse serveur invalide" }
    }
  }

  // Fetch user data (addresses & payment methods)
  const fetchUserData = async (userId: number) => {
    try {
      const [addressResponse, paymentResponse] = await Promise.all([
        fetch("/api/users/addresses", {
          headers: { "x-user-id": userId.toString() },
        }),
        fetch("/api/users/payment-infos", {
          headers: { "x-user-id": userId.toString() },
        }),
      ])

      if (addressResponse.ok) {
        const addressData = await safeParseJson(addressResponse)
        setAddresses(Array.isArray(addressData) ? addressData : [])
        if (addressData.length > 0) {
          setSelectedAddress(addressData[0].id_address.toString())
        }
      } else {
        const errorData = await safeParseJson(addressResponse)
        setError(
          `Erreur lors du chargement des adresses: ${errorData.message || "Erreur inconnue"}`
        )
      }

      if (paymentResponse.ok) {
        const paymentData = await safeParseJson(paymentResponse)
        setPaymentInfos(Array.isArray(paymentData) ? paymentData : [])
        if (paymentData.length > 0) {
          setSelectedPayment(String(paymentData[0].id_payment_info))
        }
      } else {
        const errorData = await safeParseJson(paymentResponse)
        setError(
          `Erreur lors du chargement des moyens de paiement: ${errorData.message || "Erreur inconnue"}`
        )
      }
    } catch {
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
    })

    if (status === "loading") {
      console.log("[useCheckout] Session still loading, waiting...")
      return
    }

    if (!session) {
      console.log("[useCheckout] No session, setting guest mode")
      setIsGuest(true)
      setSelectedAddress(null)
      setSelectedPayment(null)
      setAddresses([])
      setPaymentInfos([])
      setLoading(false)
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
      setSelectedAddress(null)
      setSelectedPayment(null)
      setAddresses([])
      setPaymentInfos([])
      setLoading(false)
    }
  }, [session, status, cart, stripe])

  // Create guest user if needed
  const createGuestUser = async () => {
    if (!guestEmail) {
      setError("Veuillez entrer un e-mail pour continuer en tant qu'invité")
      return null
    }

    try {
      const guestUserResponse = await fetch("/api/users/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail }),
      })

      if (!guestUserResponse.ok) {
        const errorData = await safeParseJson(guestUserResponse)
        setError(
          `Erreur lors de la création de l'utilisateur invité: ${errorData.message || "Erreur inconnue"}`
        )
        return null
      }

      const guestUser = await safeParseJson(guestUserResponse)
      setGuestUserId(guestUser.id_user)
      setGuestStripeCustomerId(guestUser.stripeCustomerId)

      // Store guest email in localStorage to access it later
      localStorage.setItem("guestEmail", guestEmail)
      localStorage.setItem("guestUserId", guestUser.id_user.toString())

      return guestUser.id_user
    } catch {
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

      const response = await fetch("/api/users/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId ? userId.toString() : "",
        },
        body: JSON.stringify({ ...newAddress, userId }),
      })

      if (response.ok) {
        const savedAddress = await safeParseJson(response)
        setAddresses([...addresses, savedAddress])
        setSelectedAddress(savedAddress.id_address.toString())

        // If guest user, store address in localStorage
        if (isGuest) {
          const guestAddresses = JSON.parse(
            localStorage.getItem("guestAddresses") || "[]"
          )
          guestAddresses.push(savedAddress)
          localStorage.setItem("guestAddresses", JSON.stringify(guestAddresses))
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
      } else {
        const errorData = await safeParseJson(response)
        setError(
          response.status === 405
            ? "Méthode POST non autorisée pour /api/users/addresses. Vérifiez la configuration du serveur."
            : `Erreur lors de l'ajout de l'adresse: ${errorData.message || "Erreur inconnue (code: " + response.status + ")"}`
        )
      }
    } catch {
      setError(
        "Erreur réseau lors de l'ajout de l'adresse. Vérifiez votre connexion et réessayez."
      )
    }
  }

  // Handle saving a new payment method
  const handleSaveNewPayment = async () => {
    console.log("[CheckoutPage] Sauvegarde nouveau moyen de paiement:", {
      card_name: newPayment.card_name,
      userId: session?.user?.id_user || guestUserId || "invité",
    })
    setError(null)

    if (!stripe || !elements) {
      console.error("[CheckoutPage] Stripe non chargé:", { stripe, elements })
      setError("Erreur de chargement de Stripe. Veuillez recharger la page.")
      return
    }

    if (!newPayment.card_name) {
      console.error("[CheckoutPage] Nom de carte manquant")
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
          console.error(
            "[CheckoutPage] Erreur lors de la récupération/création du customerId:",
            error
          )
          setError("Erreur lors de la configuration du client Stripe")
          return
        }
      }

      if (!stripeCustomerId) {
        console.error("[CheckoutPage] stripeCustomerId manquant")
        setError("Erreur: client Stripe non configuré")
        return
      }

      // Reste du code avec le stripeCustomerId maintenant défini
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        console.error("[CheckoutPage] CardElement non trouvé")
        setError(
          "Erreur avec le formulaire de paiement. Veuillez recharger la page."
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
        console.error("[CheckoutPage] Erreur Stripe:", error)
        setError(error.message || "Erreur lors de l'ajout du moyen de paiement")
        return
      }

      // Maintenant on envoie le customerId pour tous les utilisateurs
      await fetch("/api/stripe/attach-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId.toString(),
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId: stripeCustomerId, // Utiliser le customerId récupéré ou créé
        }),
      })

      console.log(
        "[CheckoutPage] Données envoyées à /api/users/payment-infos:",
        {
          userId,
          card_name: newPayment.card_name,
          stripe_payment_id: paymentMethod.id,
          stripe_customer_id: isGuest ? guestStripeCustomerId : undefined,
          last_card_digits: paymentMethod.card ? paymentMethod.card.last4 : "",
          brand: paymentMethod.card?.brand,
          exp_month: paymentMethod.card?.exp_month,
          exp_year: paymentMethod.card?.exp_year,
        }
      )

      const response = await fetch("/api/users/payment-infos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId.toString(),
        },
        body: JSON.stringify({
          userId,
          card_name: newPayment.card_name,
          stripe_payment_id: paymentMethod.id,
          stripe_customer_id: isGuest
            ? guestStripeCustomerId
            : stripeCustomerId,
          last_card_digits: paymentMethod.card ? paymentMethod.card.last4 : "",
          brand: paymentMethod.card?.brand,
          exp_month: paymentMethod.card?.exp_month,
          exp_year: paymentMethod.card?.exp_year,
        }),
      })

      if (response.ok) {
        const savedPayment = await safeParseJson(response)
        setPaymentInfos([...paymentInfos, savedPayment])
        setSelectedPayment(String(savedPayment.id_payment_info))
        console.log("[CheckoutPage] Nouveau moyen de paiement sélectionné:", {
          id_payment_info: savedPayment.id_payment_info,
        })
      } else {
        const errorData = await safeParseJson(response)
        console.error("[CheckoutPage] Erreur API:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        setError(
          response.status === 405
            ? "Méthode POST non autorisée pour /api/users/payment-infos. Vérifiez la configuration du serveur."
            : `Erreur lors de l'ajout du moyen de paiement: ${errorData.message || "Erreur inconnue (code: " + response.status + ")"}`
        )
      }

      setNewPayment({ card_name: "" })
      cardElement.clear()
    } catch (err) {
      console.error("[CheckoutPage] Erreur réseau:", err)
      setError(
        "Erreur réseau lors de l’ajout du moyen de paiement. Vérifiez votre connexion et réessayez."
      )
    }
  }

  // Process payment
  const handleProceedToPayment = async () => {
    setError(null)
    setProcessingPayment(true)

    try {
      if (!cart || cart.length === 0) {
        throw new Error("Votre panier est vide")
      }

      // Normalize cart items
      const normalizedCart = cart
        .map(item => {
          const subscription_type = VALID_SUBSCRIPTION_TYPES.includes(
            item.subscription || ""
          )
            ? item.subscription
            : "MONTHLY"

          return {
            id: item.id || "",
            uniqueId:
              item.uniqueId || `${item.id}-${subscription_type}-${Date.now()}`,
            name: item.name || "Produit inconnu",
            price:
              typeof item.price === "number" && item.price > 0 ? item.price : 0,
            quantity:
              typeof item.quantity === "number" && item.quantity > 0
                ? Math.floor(item.quantity)
                : 1,
            subscription_type,
            subscription: subscription_type,
            imageUrl: item.imageUrl || undefined,
          }
        })
        .filter(item => {
          const isValid =
            item.id &&
            item.price > 0 &&
            item.quantity > 0 &&
            VALID_SUBSCRIPTION_TYPES.includes(
              item.subscription_type?.toString() || ""
            )
          return isValid
        })

      if (normalizedCart.length === 0) {
        throw new Error(
          "Aucun élément valide dans le panier. Veuillez vérifier votre sélection."
        )
      }

      if (
        !selectedAddress ||
        !addresses.some(a => a.id_address.toString() === selectedAddress)
      ) {
        throw new Error("Veuillez sélectionner une adresse valide")
      }

      if (
        !selectedPayment ||
        !paymentInfos.some(p => String(p.id_payment_info) === selectedPayment)
      ) {
        throw new Error("Veuillez sélectionner un moyen de paiement valide")
      }

      let userId = session?.user?.id_user || guestUserId
      if (isGuest && !userId) {
        userId = await createGuestUser()
        if (!userId) {
          throw new Error("Utilisateur non identifié")
        }
      }

      const selectedPaymentInfo = paymentInfos.find(
        (p: PaymentInfo) => String(p.id_payment_info) === selectedPayment
      )

      if (!selectedPaymentInfo || !selectedPaymentInfo.stripe_payment_id) {
        throw new Error(
          "Le moyen de paiement sélectionné est invalide ou non configuré. Veuillez en ajouter un nouveau."
        )
      }

      const addressIdToSend = parseInt(selectedAddress).toString()
      const paymentIdToSend = parseInt(selectedPayment).toString()

      // Initiate checkout
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId ? userId.toString() : "",
        },
        body: JSON.stringify({
          cartItems: normalizedCart,
          addressId: addressIdToSend,
          paymentId: paymentIdToSend,
          guestId: isGuest ? userId : undefined,
          guestEmail: isGuest ? guestEmail : undefined,
          sessionToken: isGuest ? "guest" : userId ? userId.toString() : "",
          stripe_payment_id: selectedPaymentInfo.stripe_payment_id,
        }),
      })

      const responseData = await safeParseJson(response)

      if (!response.ok) {
        throw new Error(
          responseData.message || "Erreur lors du traitement du paiement"
        )
      }

      // Process confirmation
      const confirmationResponse = await fetch(
        `/api/checkout/confirmation?payment_intent_id=${responseData.paymentIntentId}&addressId=${addressIdToSend}&paymentId=${paymentIdToSend}${
          isGuest ? `&guestId=${userId}` : ""
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId ? userId.toString() : "",
          },
          body: JSON.stringify({
            cartItems: normalizedCart,
          }),
        }
      )

      if (!confirmationResponse.ok) {
        const errorData = await safeParseJson(confirmationResponse)
        throw new Error(
          `Erreur lors de la confirmation de la commande: ${errorData.message || "Erreur inconnue"}`
        )
      }

      const confirmationData = await safeParseJson(confirmationResponse)

      // Download invoice if available
      try {
        const invoiceResponse = await fetch(
          `/api/invoices/${confirmationData.id_order}/download`,
          {
            method: "GET",
          }
        )

        if (invoiceResponse.ok) {
          const pdfBlob = await invoiceResponse.blob()
          const url = window.URL.createObjectURL(pdfBlob)
          const link = document.createElement("a")
          link.href = url
          link.download = `facture-${confirmationData.invoice_number || Date.now()}.pdf`
          link.click()
          window.URL.revokeObjectURL(url)
        }
      } catch (err) {
        console.error("Erreur téléchargement facture:", err)
        // Non-blocking error - continue with checkout
      }

      // Clear cart and redirect to success page
      setCart([])
      router.push(`/checkout/success?orderId=${responseData.orderId}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du traitement de la commande"
      )
    } finally {
      setProcessingPayment(false)
    }
  }

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
    error,
    newAddress,
    setNewAddress,
    newPayment,
    setNewPayment,
    cart,
    totalItems,
    totalCartPrice,
    taxes,
    finalTotal,
    handleSaveNewAddress,
    handleSaveNewPayment,
    handleProceedToPayment,
  }
}
