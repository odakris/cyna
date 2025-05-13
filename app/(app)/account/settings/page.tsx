"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCart, CartItem } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Home,
  CreditCard,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

type Address = {
  id_address: number
  first_name: string
  last_name: string
  address1: string
  address2?: string | null
  postal_code: string
  city: string
  country: string
  mobile_phone: string
  is_default_billing?: boolean
  is_default_shipping?: boolean
}

type PaymentMethod = {
  id_payment_info: number
  card_name: string
  last_card_digits: string
  exp_month?: number
  exp_year?: number
  brand?: string
  is_default?: boolean
}

type Subscription = {
  id_order_item: number
  service_name: string
  subscription_type: string
  unit_price: number
  quantity: number
  renewal_date: string | null
  subscription_status: string
  id_product: number
  imageUrl?: string
}

type ExtendedOrder = {
  id_order: number
  subscriptions: Subscription[]
}

export default function AccountSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToCart } = useCart()
  const { toast } = useToast()

  // Get any hash in URL
  const hash =
    searchParams.get("section") ||
    window.location.hash.substring(1) ||
    "profile"

  // References for scrolling to sections
  const addressesRef = useRef<HTMLElement>(null)
  const paymentsRef = useRef<HTMLElement>(null)
  const subscriptionsRef = useRef<HTMLElement>(null)

  // State
  const [activeTab, setActiveTab] = useState<string>(hash || "profile")
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] =
    useState(false)
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null)
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null)
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] =
    useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<
    number | null
  >(null)
  const [isUpdateSubscriptionModalOpen, setIsUpdateSubscriptionModalOpen] =
    useState(false)
  const [subscriptionToUpdate, setSubscriptionToUpdate] =
    useState<Subscription | null>(null)

  // Modal error and password states
  const [modalError, setModalError] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/settings")
    }
  }, [status, router])

  // Handle tab changes
  useEffect(() => {
    // The tab state should include the hash
    setActiveTab(hash || "profile")

    // Scroll to the appropriate section based on hash
    setTimeout(() => {
      if (hash === "addresses" && addressesRef.current) {
        addressesRef.current.scrollIntoView({ behavior: "smooth" })
      } else if (hash === "payments" && paymentsRef.current) {
        paymentsRef.current.scrollIntoView({ behavior: "smooth" })
      } else if (hash === "subscriptions" && subscriptionsRef.current) {
        subscriptionsRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }, [hash])

  // Fetch user data
  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchClientData = async () => {
      setError(null)

      try {
        const [
          userResponse,
          ordersResponse,
          addressesResponse,
          paymentsResponse,
        ] = await Promise.all([
          fetch(`/api/users/${session.user.id_user}`, {
            credentials: "include",
          }),
          fetch(`/api/users/${session.user.id_user}/orders`, {
            credentials: "include",
          }),
          fetch(`/api/users/${session.user.id_user}/addresses`, {
            credentials: "include",
          }),
          fetch(`/api/users/${session.user.id_user}/payments`, {
            credentials: "include",
          }),
        ])

        const userData = await userResponse.json()
        const ordersData = await ordersResponse.json()
        const addressesData = await addressesResponse.json()
        const paymentsData = await paymentsResponse.json()

        if (userResponse.ok) setClientInfo(userData)
        else
          setError(
            userData.message ||
              "Erreur lors de la récupération des informations utilisateur"
          )

        if (ordersResponse.ok) setOrders(ordersData)
        else
          setError(
            ordersData.message || "Erreur lors de la récupération des commandes"
          )

        if (addressesResponse.ok) setAddresses(addressesData)
        else
          setError(
            addressesData.message ||
              "Erreur lors de la récupération des adresses"
          )

        if (paymentsResponse.ok) setPaymentMethods(paymentsData)
        else
          setError(
            paymentsData.message ||
              "Erreur lors de la récupération des méthodes de paiement"
          )
      } catch {
        setError("Une erreur est survenue lors de la récupération des données.")
      }
    }

    fetchClientData()
  }, [session])

  // Password validation function
  const checkPassword = async (password: string) => {
    try {
      const response = await fetch("/api/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, userId: session?.user?.id_user }),
      })
      if (!response.ok)
        throw new Error("Erreur lors de la vérification du mot de passe.")
      const data = await response.json()
      return data.isValid
    } catch {
      setPasswordError("Erreur lors de la vérification du mot de passe.")
      return false
    }
  }

  // Delete payment method handler
  const handleDeletePaymentMethod = async (paymentId: number) => {
    if (!session?.user?.id_user) {
      setModalError(
        "Vous devez être connecté pour supprimer une méthode de paiement."
      )
      return
    }
    if (!password) {
      setPasswordError("Veuillez entrer votre mot de passe actuel.")
      return
    }
    const isPasswordValid = await checkPassword(password)
    if (!isPasswordValid) {
      setPasswordError("Mot de passe incorrect.")
      return
    }

    try {
      const response = await fetch(
        `/api/users/${session.user.id_user}/payments/${paymentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ||
            "Erreur lors de la suppression de la méthode de paiement."
        )
      }
      setPaymentMethods(prev =>
        prev.filter(payment => payment.id_payment_info !== paymentId)
      )
      setModalError(null)
      setPassword("")
      setIsDeletePaymentModalOpen(false)
      setPaymentToDelete(null)
      setPasswordError(null)

      toast({
        title: "Méthode de paiement supprimée",
        description: "La méthode de paiement a été supprimée avec succès.",
        variant: "success",
      })
    } catch (err: any) {
      setModalError(
        err.message ||
          "Erreur lors de la suppression de la méthode de paiement."
      )
    }
  }

  // Delete address handler
  const handleDeleteAddress = async (addressId: number) => {
    if (!session?.user?.id_user) {
      setModalError("Vous devez être connecté pour supprimer une adresse.")
      return
    }
    try {
      const res = await fetch(
        `/api/users/${session.user.id_user}/addresses?addressId=${addressId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.message || "Erreur lors de la suppression de l'adresse."
        )
      }
      setAddresses(prev => prev.filter(a => a.id_address !== addressId))
      setModalError(null)
      setIsDeleteAddressModalOpen(false)
      setAddressToDelete(null)

      toast({
        title: "Adresse supprimée",
        description: "L'adresse a été supprimée avec succès.",
        variant: "success",
      })
    } catch (err: any) {
      setModalError(
        err.message || "Erreur lors de la suppression de l'adresse."
      )
    }
  }

  // Cancel subscription handler
  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!session?.user?.id_user) {
      setModalError("Vous devez être connecté pour annuler un abonnement.")
      return
    }

    try {
      const response = await fetch(
        `/api/users/${session.user.id_user}/subscriptions/${subscriptionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription_status: "CANCELLED" }),
          credentials: "include",
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Échec de l'annulation de l'abonnement."
        )
      }

      setOrders(prev =>
        prev.map(order => ({
          ...order,
          subscriptions: order.subscriptions.map(sub =>
            sub.id_order_item === subscriptionId
              ? { ...sub, subscription_status: "CANCELLED" }
              : sub
          ),
        }))
      )

      toast({
        title: "Abonnement annulé",
        description: "L'abonnement a été annulé avec succès.",
        variant: "success",
      })

      setModalError(null)
      setIsCancelSubscriptionModalOpen(false)
      setSubscriptionToCancel(null)
    } catch (err: any) {
      setModalError(
        err.message || "Erreur lors de l'annulation de l'abonnement."
      )
      toast({
        title: "Erreur",
        description: err.message || "Une erreur s'est produite.",
        variant: "destructive",
      })
    }
  }

  // Update subscription handler
  const handleUpdateSubscription = async (sub: Subscription) => {
    if (!session?.user?.id_user) {
      setError("Vous devez être connecté pour modifier un abonnement.")
      return
    }

    try {
      const response = await fetch(
        `/api/users/${session.user.id_user}/subscriptions/${sub.id_order_item}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription_status: "CANCELLED" }),
          credentials: "include",
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Échec de l'annulation de l'abonnement"
        )
      }

      const price =
        sub.subscription_type === "MONTHLY"
          ? 49.99
          : sub.subscription_type === "YEARLY"
            ? 499.9 / 12
            : sub.subscription_type === "PER_MACHINE"
              ? 19.99
              : sub.unit_price

      const cartItem: CartItem = {
        id: sub.id_product.toString(),
        name: sub.service_name,
        price,
        quantity: sub.quantity,
        subscription: sub.subscription_type,
        uniqueId: `${sub.id_product}-${sub.subscription_type}-${Date.now()}`,
        imageUrl: sub.imageUrl,
      }

      addToCart(cartItem)

      toast({
        title: "Abonnement ajouté au panier",
        description:
          "L'abonnement a été annulé et ajouté au panier pour modification.",
        variant: "success",
      })

      setIsUpdateSubscriptionModalOpen(false)
      setSubscriptionToUpdate(null)
      router.push("/panier")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de l'abonnement.")
      toast({
        title: "Erreur",
        description: err.message || "Une erreur s'est produite.",
        variant: "destructive",
      })
    }
  }

  // Not authenticated state
  if (!session?.user) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-600">Accès refusé</p>
            <p className="text-sm text-red-600">
              Connectez-vous pour accéder à cette page
            </p>
            <Button
              asChild
              variant="default"
              className="mt-2 bg-[#302082] hover:bg-[#302082]/90"
            >
              <Link href="/auth?redirect=/account/settings">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] relative pb-2 inline-block">
            Paramètres du compte
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm flex gap-2 items-start">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation tabs */}
      <Tabs
        value={activeTab}
        onValueChange={value => {
          setActiveTab(value)
          router.push(`/account/settings#${value}`, { scroll: false })
        }}
        className="space-y-6"
      >
        <div className="border-b">
          <TabsList className="w-full flex overflow-x-auto hide-scrollbar bg-transparent h-auto p-0">
            <TabsTrigger
              value="profile"
              className="py-3 px-5 border-b-2 border-transparent data-[state=active]:border-[#302082] data-[state=active]:text-[#302082] font-medium rounded-none"
            >
              <User className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
              <span className="inline sm:hidden">Profil</span>
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="py-3 px-5 border-b-2 border-transparent data-[state=active]:border-[#302082] data-[state=active]:text-[#302082] font-medium rounded-none"
            >
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Adresses</span>
              <span className="inline sm:hidden">Adresses</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="py-3 px-5 border-b-2 border-transparent data-[state=active]:border-[#302082] data-[state=active]:text-[#302082] font-medium rounded-none"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Moyens de paiement</span>
              <span className="inline sm:hidden">Paiement</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="py-3 px-5 border-b-2 border-transparent data-[state=active]:border-[#302082] data-[state=active]:text-[#302082] font-medium rounded-none"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Abonnements</span>
              <span className="inline sm:hidden">Abonnements</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-2 border-[#302082]/20">
                  <AvatarImage
                    src={clientInfo?.avatar_url || ""}
                    alt={`${clientInfo?.first_name || ""} ${clientInfo?.last_name || ""}`}
                  />
                  <AvatarFallback className="bg-[#302082]/10 text-[#302082] text-xl">
                    {clientInfo?.first_name?.charAt(0) || ""}
                    {clientInfo?.last_name?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-4 w-full text-center md:text-left">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {clientInfo?.first_name || ""}{" "}
                      {clientInfo?.last_name || ""}
                    </h3>
                    <p className="text-gray-600">{clientInfo?.email || ""}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-500">
                        Date d&apos;inscription
                      </div>
                      <div>
                        {clientInfo?.created_at
                          ? new Date(clientInfo.created_at).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-500">
                        Dernière connexion
                      </div>
                      <div>
                        {clientInfo?.last_login
                          ? new Date(clientInfo.last_login).toLocaleDateString()
                          : "Aujourd'hui"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 justify-end">
              <Button
                asChild
                className="bg-[#302082] hover:bg-[#302082]/90 text-white"
              >
                <Link href="/account/editPersonalInfo">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier mes informations
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-6" ref={addressesRef}>
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Carnet d'adresses
                  </CardTitle>
                  <CardDescription>
                    Gérez vos adresses de livraison et de facturation
                  </CardDescription>
                </div>
                <Button
                  asChild
                  className="bg-[#302082] hover:bg-[#302082]/90 text-white"
                >
                  <Link href="/account/addresses/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une adresse
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              {addresses.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map(address => (
                    <Card
                      key={address.id_address}
                      className="border border-gray-200 hover:border-[#302082]/30 hover:shadow-md transition-all duration-300"
                    >
                      <CardContent className="pt-6 pb-4">
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {address.first_name} {address.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.address1}
                            </p>
                            {address.address2 && (
                              <p className="text-sm text-gray-600">
                                {address.address2}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              {address.postal_code} {address.city}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.country}
                            </p>
                            {address.mobile_phone && (
                              <p className="text-sm text-gray-600">
                                {address.mobile_phone}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            {address.is_default_billing && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-600 border-blue-200"
                              >
                                Facturation
                              </Badge>
                            )}
                            {address.is_default_shipping && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-600 border-green-200"
                              >
                                Livraison
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50/50 flex justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-[#302082] text-[#302082] hover:bg-[#302082]/10"
                        >
                          <Link
                            href={`/account/addresses/${address.id_address}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Link>
                        </Button>

                        <Dialog
                          open={
                            isDeleteAddressModalOpen &&
                            addressToDelete === address.id_address
                          }
                          onOpenChange={open => {
                            setIsDeleteAddressModalOpen(open)
                            setModalError(null)
                            if (!open) setAddressToDelete(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                setAddressToDelete(address.id_address)
                                setIsDeleteAddressModalOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Confirmer la suppression
                              </DialogTitle>
                              <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer
                                l&apos;adresse &quot;
                                {address.address1}, {address.city}&quot; ?
                              </DialogDescription>
                            </DialogHeader>
                            {modalError && (
                              <div className="text-red-600 text-sm mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                {modalError}
                              </div>
                            )}
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsDeleteAddressModalOpen(false)
                                  setAddressToDelete(null)
                                  setModalError(null)
                                }}
                              >
                                Annuler
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteAddress(address.id_address)
                                }
                              >
                                Supprimer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Aucune adresse enregistrée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ajoutez une adresse pour faciliter vos achats futurs.
                  </p>
                  <Button
                    asChild
                    className="bg-[#302082] hover:bg-[#302082]/90 text-white"
                  >
                    <Link href="/account/addresses/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une adresse
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6" ref={paymentsRef}>
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Moyens de paiement
                  </CardTitle>
                  <CardDescription>
                    Gérez vos cartes bancaires et méthodes de paiement
                  </CardDescription>
                </div>
                <Button
                  asChild
                  className="bg-[#302082] hover:bg-[#302082]/90 text-white"
                >
                  <Link href="/account/payments/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une carte
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              {paymentMethods.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {paymentMethods.map(payment => (
                    <Card
                      key={payment.id_payment_info}
                      className="border border-gray-200 hover:border-[#302082]/30 hover:shadow-md transition-all duration-300"
                    >
                      <CardContent className="pt-6 pb-4">
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{payment.card_name}</p>
                            <p className="text-sm text-gray-600">
                              •••• •••• •••• {payment.last_card_digits}
                            </p>
                            {payment.exp_month && payment.exp_year && (
                              <p className="text-sm text-gray-600">
                                Exp:{" "}
                                {payment.exp_month.toString().padStart(2, "0")}/
                                {payment.exp_year}
                              </p>
                            )}
                            <p className="text-sm capitalize text-gray-600">
                              {payment.brand || "Card"}
                            </p>
                          </div>
                          <div>
                            {payment.is_default && (
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                Par défaut
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50/50 flex justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-[#302082] text-[#302082] hover:bg-[#302082]/10"
                        >
                          <Link
                            href={`/account/payments/${payment.id_payment_info}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Link>
                        </Button>

                        <Dialog
                          open={
                            isDeletePaymentModalOpen &&
                            paymentToDelete === payment.id_payment_info
                          }
                          onOpenChange={open => {
                            setIsDeletePaymentModalOpen(open)
                            setModalError(null)
                            setPasswordError(null)
                            setPassword("")
                            if (!open) setPaymentToDelete(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                setPaymentToDelete(payment.id_payment_info)
                                setIsDeletePaymentModalOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Confirmer la suppression
                              </DialogTitle>
                              <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la carte se
                                terminant par {payment.last_card_digits} ?
                                Veuillez entrer votre mot de passe pour
                                confirmer.
                              </DialogDescription>
                            </DialogHeader>
                            <div>
                              <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Mot de passe actuel{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-[#302082] focus:border-[#302082]"
                                placeholder="Entrez votre mot de passe"
                              />
                              {passwordError && (
                                <div className="text-red-600 text-xs mt-2 flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  {passwordError}
                                </div>
                              )}
                            </div>
                            {modalError && (
                              <div className="text-red-600 text-sm mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                {modalError}
                              </div>
                            )}
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsDeletePaymentModalOpen(false)
                                  setPaymentToDelete(null)
                                  setModalError(null)
                                  setPasswordError(null)
                                  setPassword("")
                                }}
                              >
                                Annuler
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDeletePaymentMethod(
                                    payment.id_payment_info
                                  )
                                }
                              >
                                Supprimer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Aucun moyen de paiement enregistré
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ajoutez une carte bancaire pour faciliter vos achats futurs.
                  </p>
                  <Button
                    asChild
                    className="bg-[#302082] hover:bg-[#302082]/90 text-white"
                  >
                    <Link href="/account/payments/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une carte
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent
          value="subscriptions"
          className="space-y-6"
          ref={subscriptionsRef}
        >
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Mes abonnements
              </CardTitle>
              <CardDescription>
                Gérez vos abonnements actifs et consultez leur historique
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              {orders.length > 0 &&
              orders.some(order => order.subscriptions.length > 0) ? (
                <div className="space-y-6">
                  {/* Active Subscriptions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Abonnements actifs
                    </h3>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full border border-gray-200 rounded-md">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="whitespace-nowrap">
                              Service
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Type
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Prix
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Renouvellement
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Statut
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.flatMap(order =>
                            order.subscriptions
                              .filter(
                                sub => sub.subscription_status === "ACTIVE"
                              )
                              .map(sub => (
                                <TableRow key={sub.id_order_item}>
                                  <TableCell className="font-medium">
                                    {sub.service_name}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {sub.subscription_type === "MONTHLY"
                                      ? "Mensuel"
                                      : sub.subscription_type === "YEARLY"
                                        ? "Annuel"
                                        : sub.subscription_type === "PER_USER"
                                          ? "Par utilisateur"
                                          : sub.subscription_type ===
                                              "PER_MACHINE"
                                            ? "Par appareil"
                                            : sub.subscription_type}
                                  </TableCell>
                                  <TableCell>
                                    {sub.unit_price.toFixed(2)} €
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {sub.renewal_date
                                      ? new Date(
                                          sub.renewal_date
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className="bg-green-100 text-green-700 border-green-300">
                                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                      Actif
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    <div className="flex gap-2">
                                      <Dialog
                                        open={
                                          isUpdateSubscriptionModalOpen &&
                                          subscriptionToUpdate?.id_order_item ===
                                            sub.id_order_item
                                        }
                                        onOpenChange={open => {
                                          setIsUpdateSubscriptionModalOpen(open)
                                          setModalError(null)
                                          if (!open)
                                            setSubscriptionToUpdate(null)
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-[#302082] text-[#302082] hover:bg-[#302082]/10"
                                            onClick={() => {
                                              setSubscriptionToUpdate(sub)
                                              setIsUpdateSubscriptionModalOpen(
                                                true
                                              )
                                            }}
                                          >
                                            <Edit className="h-3.5 w-3.5 mr-1" />
                                            Modifier
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Modifier l&apos;abonnement
                                            </DialogTitle>
                                            <DialogDescription>
                                              Pour modifier l&apos;abonnement
                                              &quot;
                                              {sub.service_name}&quot;, nous
                                              allons ajouter le même service à
                                              votre panier où vous pourrez
                                              changer les options avant de
                                              finaliser.
                                            </DialogDescription>
                                          </DialogHeader>
                                          {modalError && (
                                            <div className="text-red-600 text-sm mb-4 flex items-center gap-2">
                                              <AlertTriangle className="h-4 w-4" />
                                              {modalError}
                                            </div>
                                          )}
                                          <DialogFooter>
                                            <Button
                                              variant="outline"
                                              onClick={() => {
                                                setIsUpdateSubscriptionModalOpen(
                                                  false
                                                )
                                                setSubscriptionToUpdate(null)
                                                setModalError(null)
                                              }}
                                            >
                                              Annuler
                                            </Button>
                                            <Button
                                              variant="default"
                                              className="bg-[#302082] hover:bg-[#302082]/90"
                                              onClick={() =>
                                                handleUpdateSubscription(sub)
                                              }
                                            >
                                              Continuer
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>

                                      <Dialog
                                        open={
                                          isCancelSubscriptionModalOpen &&
                                          subscriptionToCancel ===
                                            sub.id_order_item
                                        }
                                        onOpenChange={open => {
                                          setIsCancelSubscriptionModalOpen(open)
                                          setModalError(null)
                                          if (!open)
                                            setSubscriptionToCancel(null)
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-500 text-red-500 hover:bg-red-50"
                                            onClick={() => {
                                              setSubscriptionToCancel(
                                                sub.id_order_item
                                              )
                                              setIsCancelSubscriptionModalOpen(
                                                true
                                              )
                                            }}
                                          >
                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                            Résilier
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Confirmer la résiliation
                                            </DialogTitle>
                                            <DialogDescription>
                                              Êtes-vous sûr de vouloir résilier
                                              l&apos;abonnement à &quot;
                                              {sub.service_name}
                                              &quot; ? Cette action est
                                              irréversible.
                                            </DialogDescription>
                                          </DialogHeader>
                                          {modalError && (
                                            <div className="text-red-600 text-sm mb-4 flex items-center gap-2">
                                              <AlertTriangle className="h-4 w-4" />
                                              {modalError}
                                            </div>
                                          )}
                                          <DialogFooter>
                                            <Button
                                              variant="outline"
                                              onClick={() => {
                                                setIsCancelSubscriptionModalOpen(
                                                  false
                                                )
                                                setSubscriptionToCancel(null)
                                                setModalError(null)
                                              }}
                                            >
                                              Annuler
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={() =>
                                                handleCancelSubscription(
                                                  sub.id_order_item
                                                )
                                              }
                                            >
                                              Résilier
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Other Subscriptions (Cancelled, Expired, etc.) */}
                  {orders.some(order =>
                    order.subscriptions.some(
                      sub => sub.subscription_status !== "ACTIVE"
                    )
                  ) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Abonnements inactifs
                      </h3>
                      <div className="overflow-x-auto">
                        <Table className="min-w-full border border-gray-200 rounded-md">
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="whitespace-nowrap">
                                Service
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Type
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Prix
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Statut
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.flatMap(order =>
                              order.subscriptions
                                .filter(
                                  sub => sub.subscription_status !== "ACTIVE"
                                )
                                .map(sub => (
                                  <TableRow key={sub.id_order_item}>
                                    <TableCell className="font-medium">
                                      {sub.service_name}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {sub.subscription_type === "MONTHLY"
                                        ? "Mensuel"
                                        : sub.subscription_type === "YEARLY"
                                          ? "Annuel"
                                          : sub.subscription_type === "PER_USER"
                                            ? "Par utilisateur"
                                            : sub.subscription_type ===
                                                "PER_MACHINE"
                                              ? "Par appareil"
                                              : sub.subscription_type}
                                    </TableCell>
                                    <TableCell>
                                      {sub.unit_price.toFixed(2)} €
                                    </TableCell>
                                    <TableCell>
                                      {sub.subscription_status ===
                                      "CANCELLED" ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-red-50 text-red-600 border-red-200"
                                        >
                                          <XCircle className="h-3.5 w-3.5 mr-1" />
                                          Résilié
                                        </Badge>
                                      ) : sub.subscription_status ===
                                        "EXPIRED" ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-gray-100 text-gray-600 border-gray-300"
                                        >
                                          <Clock className="h-3.5 w-3.5 mr-1" />
                                          Expiré
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">
                                          {sub.subscription_status}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="border-[#302082] text-[#302082] hover:bg-[#302082]/10"
                                        onClick={() => {
                                          const price =
                                            sub.subscription_type === "MONTHLY"
                                              ? 49.99
                                              : sub.subscription_type ===
                                                  "YEARLY"
                                                ? 499.9 / 12
                                                : sub.subscription_type ===
                                                    "PER_MACHINE"
                                                  ? 19.99
                                                  : sub.unit_price

                                          const cartItem: CartItem = {
                                            id: sub.id_product.toString(),
                                            name: sub.service_name,
                                            price,
                                            quantity: sub.quantity,
                                            subscription: sub.subscription_type,
                                            uniqueId: `${sub.id_product}-${sub.subscription_type}-${Date.now()}`,
                                            imageUrl: sub.imageUrl,
                                          }

                                          addToCart(cartItem)

                                          toast({
                                            title: "Produit ajouté au panier",
                                            description:
                                              "Vous pouvez maintenant finaliser votre commande",
                                            variant: "success",
                                          })

                                          router.push("/panier")
                                        }}
                                      >
                                        <Link href="/panier">
                                          <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                                          Racheter
                                        </Link>
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Aucun abonnement actif
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vous n&apos;avez pas encore souscrit à nos services.
                  </p>
                  <Button
                    asChild
                    className="bg-[#302082] hover:bg-[#302082]/90 text-white"
                  >
                    <Link href="/produit">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Découvrir nos services
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
