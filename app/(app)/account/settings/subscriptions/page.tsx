"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Clock,
  Edit,
  XCircle,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart, CartItem } from "@/context/CartContext"

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

export default function SubscriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] =
    useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<
    number | null
  >(null)
  const [isUpdateSubscriptionModalOpen, setIsUpdateSubscriptionModalOpen] =
    useState(false)
  const [subscriptionToUpdate, setSubscriptionToUpdate] =
    useState<Subscription | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/settings/subscriptions")
    }
  }, [status, router])

  // Fetch orders with subscriptions
  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchOrders = async () => {
      setError(null)
      setLoading(true)

      try {
        const response = await fetch(
          `/api/users/${session.user.id_user}/orders`
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message ||
              "Erreur lors de la récupération des abonnements"
          )
        }

        const ordersData = await response.json()
        setOrders(ordersData)
      } catch (err) {
        setError(
          (err as Error).message ||
            "Une erreur est survenue lors de la récupération des abonnements."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [session])

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
    } catch (err) {
      setModalError(
        (err as Error).message || "Erreur lors de l'annulation de l'abonnement."
      )
      toast({
        title: "Erreur",
        description: (err as Error).message || "Une erreur s'est produite.",
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
    } catch (err) {
      setError(
        (err as Error).message ||
          "Erreur lors de la mise à jour de l'abonnement."
      )
      toast({
        title: "Erreur",
        description: (err as Error).message || "Une erreur s'est produite.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <Card className="border-2 border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-100 rounded"></div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <p className="font-medium text-red-600">Vous devez être connecté</p>
          <p className="text-sm text-red-600">
            Connectez-vous pour accéder à cette page
          </p>
          <Button
            asChild
            variant="default"
            className="mt-2 bg-[#302082] hover:bg-[#302082]/90"
          >
            <Link href="/auth?redirect=/account/settings/subscriptions">
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const hasSubscriptions = orders.some(order => order.subscriptions.length > 0)
  const hasActiveSubscriptions = orders.some(order =>
    order.subscriptions.some(sub => sub.subscription_status === "ACTIVE")
  )
  const hasInactiveSubscriptions = orders.some(order =>
    order.subscriptions.some(sub => sub.subscription_status !== "ACTIVE")
  )

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b">
        <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Mes abonnements
        </CardTitle>
        <CardDescription>
          Gérez vos abonnements actifs et consultez leur historique
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {hasSubscriptions ? (
          <div className="space-y-6">
            {/* Active Subscriptions */}
            {hasActiveSubscriptions && (
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
                          .filter(sub => sub.subscription_status === "ACTIVE")
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
                                      : sub.subscription_type === "PER_MACHINE"
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
                                      if (!open) setSubscriptionToUpdate(null)
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-[#302082] text-[#302082] hover:bg-[#302082]/10"
                                        onClick={() => {
                                          setSubscriptionToUpdate(sub)
                                          setIsUpdateSubscriptionModalOpen(true)
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
                                          Pour modifier l&apos;abonnement &quot;
                                          {sub.service_name}&quot;, nous allons
                                          ajouter le même service à votre panier
                                          où vous pourrez changer les options
                                          avant de finaliser.
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
                                      subscriptionToCancel === sub.id_order_item
                                    }
                                    onOpenChange={open => {
                                      setIsCancelSubscriptionModalOpen(open)
                                      setModalError(null)
                                      if (!open) setSubscriptionToCancel(null)
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
                                          setIsCancelSubscriptionModalOpen(true)
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
            )}

            {/* Other Subscriptions (Cancelled, Expired, etc.) */}
            {hasInactiveSubscriptions && (
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
                          .filter(sub => sub.subscription_status !== "ACTIVE")
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
                                      : sub.subscription_type === "PER_MACHINE"
                                        ? "Par appareil"
                                        : sub.subscription_type}
                              </TableCell>
                              <TableCell>
                                {sub.unit_price.toFixed(2)} €
                              </TableCell>
                              <TableCell>
                                {sub.subscription_status === "CANCELLED" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-600 border-red-200"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Résilié
                                  </Badge>
                                ) : sub.subscription_status === "EXPIRED" ? (
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
                                  variant="outline"
                                  size="sm"
                                  className="border-[#302082] text-[#302082] hover:bg-[#302082]/10"
                                  onClick={() => {
                                    const price =
                                      sub.subscription_type === "MONTHLY"
                                        ? 49.99
                                        : sub.subscription_type === "YEARLY"
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
                                  <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                                  Racheter
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
  )
}
