"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  ArrowLeft,
  CalendarIcon,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Loader2,
  MapPin,
  PackageCheck,
  Receipt,
  RefreshCcw,
  UserRound,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { OrderWithItems } from "@/types/Types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { SubscriptionType } from "@prisma/client"
import { Skeleton } from "../../../../../components/ui/skeleton"

// Type pour le statut
type StatusConfig = {
  [key: string]: {
    label: string
    color: string
    bgColor: string
    icon: React.ReactNode
  }
}

// Configuration des statuts
const orderStatusConfig: StatusConfig = {
  PENDING: {
    label: "En attente",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />,
  },
  PROCESSING: {
    label: "En cours",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <RefreshCcw className="h-4 w-4 text-blue-600" />,
  },
  ACTIVE: {
    label: "Active",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <CreditCard className="h-4 w-4 text-blue-600" />,
  },
  PAID: {
    label: "Payée",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <CreditCard className="h-4 w-4 text-green-600" />,
  },
  COMPLETED: {
    label: "Terminée",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <PackageCheck className="h-4 w-4 text-green-600" />,
  },
  CANCELLED: {
    label: "Annulée",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
  },
  REFUNDED: {
    label: "Remboursée",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    icon: <RefreshCcw className="h-4 w-4 text-purple-600" />,
  },
}

// Configuration des statuts d'abonnement
const subscriptionStatusConfig: StatusConfig = {
  PENDING: {
    label: "En attente",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />,
  },
  ACTIVE: {
    label: "Actif",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <PackageCheck className="h-4 w-4 text-green-600" />,
  },
  SUSPENDED: {
    label: "Suspendu",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: <RefreshCcw className="h-4 w-4 text-orange-600" />,
  },
  CANCELLED: {
    label: "Annulé",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
  },
  EXPIRED: {
    label: "Expiré",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    icon: <CalendarIcon className="h-4 w-4 text-gray-600" />,
  },
  RENEWING: {
    label: "Renouvellement",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <RefreshCcw className="h-4 w-4 text-blue-600" />,
  },
}

const OrderDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status}: ${response.statusText}`
          )
        }

        const data = await response.json()
        setOrder(data.order)
        setError(null)
      } catch (error) {
        console.error("Erreur lors du chargement de la commande:", error)
        setError("Impossible de charger les détails de la commande")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const handleUpdateStatus = async () => {
    if (!updateStatus || !order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...order,
          order_status: updateStatus,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setOrder(data.order)
      toast({
        title: "Statut mis à jour",
        description: `La commande est maintenant ${orderStatusConfig[updateStatus]?.label || updateStatus}`,
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
      setUpdateStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto py-6 space-y-6">
        {/* En-tête avec actions - Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24 ml-2" />
            </div>
            <Skeleton className="h-5 w-56 ml-10" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations produits - Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Separator />
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20 ml-auto" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de paiement - Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center pb-2 border-b"
                    >
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>

          {/* Colonne d'informations - Skeleton */}
          <div className="space-y-6">
            {/* Informations client - Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Separator className="my-3" />
                <Skeleton className="h-9 w-full mt-2" />
              </CardContent>
            </Card>

            {/* Adresse de livraison - Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>

            {/* Résumé - Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto py-10">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
            <CardDescription>{error || "Commande non trouvée"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button onClick={() => router.push("/dashboard/orders")}>
              Voir toutes les commandes
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Formatter les dates
  const formattedOrderDate = format(
    new Date(order.order_date),
    "dd MMMM yyyy à HH:mm",
    { locale: fr }
  )

  // Calculer les totaux
  const totalQuantity = order.order_items.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  return (
    <div className="mx-auto py-6 space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Commande #{order.id_order}</h1>
            <Badge
              className={`ml-2 ${orderStatusConfig[order.order_status]?.bgColor} ${orderStatusConfig[order.order_status]?.color}`}
            >
              {orderStatusConfig[order.order_status]?.icon}
              <span className="ml-1">
                {orderStatusConfig[order.order_status]?.label ||
                  order.order_status}
              </span>
            </Badge>
          </div>
          <p className="text-muted-foreground ml-10">
            Passée le {formattedOrderDate}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={updateStatus || order.order_status}
              onValueChange={setUpdateStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Changer le statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                !updateStatus || updateStatus === order.order_status || updating
              }
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour
            </Button>
          </div>

          <Button variant="outline" asChild>
            <Link href={`/dashboard/orders/${order.id_order}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>

          {order.invoice_pdf_url && (
            <Button variant="outline" asChild>
              <a
                href={order.invoice_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger la facture
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations produits */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
              <CardDescription>
                {totalQuantity} article{totalQuantity > 1 ? "s" : ""} • Facture
                #{order.invoice_number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-center">Prix unitaire</TableHead>
                    <TableHead className="text-center">Abonnement</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items.map(item => (
                    <TableRow key={item.id_order_item}>
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-2">
                          {item.product.main_image && (
                            <div className="h-10 w-10 rounded border overflow-hidden flex-shrink-0">
                              <Image
                                src={item.product.main_image}
                                alt={item.product.name}
                                width={100}
                                height={100}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {item.product.id_product}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <Badge variant="outline">
                            {item.subscription_type === SubscriptionType.MONTHLY
                              ? "Mensuel"
                              : item.subscription_type ===
                                  SubscriptionType.YEARLY
                                ? "Annuel"
                                : item.subscription_type}
                          </Badge>
                          <div className="mt-1">
                            <Badge
                              className={`text-xs ${subscriptionStatusConfig[item.subscription_status]?.bgColor} ${subscriptionStatusConfig[item.subscription_status]?.color}`}
                            >
                              {
                                subscriptionStatusConfig[
                                  item.subscription_status
                                ]?.icon
                              }
                              <span className="ml-1">
                                {subscriptionStatusConfig[
                                  item.subscription_status
                                ]?.label || item.subscription_status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(item.unit_price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right">
                      Sous-total
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.subtotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.total_amount)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Informations de paiement et historique */}
          <Tabs defaultValue="payment">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment">Paiement</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="font-medium">Méthode de paiement</div>
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {order.payment_method}
                          {order.last_card_digits &&
                            ` (**** **** **** ${order.last_card_digits})`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="font-medium">Date du paiement</div>
                      <div>{formattedOrderDate}</div>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="font-medium">Statut du paiement</div>
                      <Badge
                        className={`${orderStatusConfig[order.order_status]?.bgColor} ${orderStatusConfig[order.order_status]?.color}`}
                      >
                        {orderStatusConfig[order.order_status]?.icon}
                        <span className="ml-1">
                          {orderStatusConfig[order.order_status]?.label ||
                            order.order_status}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Numéro de facture</div>
                      <div className="flex items-center">
                        <Receipt className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{order.invoice_number}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                {order.invoice_pdf_url && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={order.invoice_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir la facture
                      </a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historique de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div
                          className={`h-2 w-2 mt-2 rounded-full bg-green-500`}
                        />
                        <div>
                          <div className="font-semibold">Commande créée</div>
                          <div className="text-sm text-muted-foreground">
                            {formattedOrderDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div
                          className={`h-2 w-2 mt-2 rounded-full ${order.order_status === "PENDING" ? "bg-gray-300" : "bg-green-500"}`}
                        />
                        <div>
                          <div
                            className={`font-semibold ${order.order_status === "PENDING" ? "text-muted-foreground" : ""}`}
                          >
                            Paiement reçu
                          </div>
                          {order.order_status !== "PENDING" && (
                            <div className="text-sm text-muted-foreground">
                              {formattedOrderDate}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Vous pouvez ajouter d'autres étapes historiques ici */}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Colonne d'informations */}
        <div className="space-y-6">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Informations client
              </CardTitle>
              <CardDescription>Client ID: {order.user.id_user}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {order.user.first_name[0]}
                    {order.user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {order.user.first_name} {order.user.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.user.email}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="mt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/users/${order.user.id_user}`}>
                    <UserRound className="mr-2 h-4 w-4" />
                    Voir le profil client
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Adresse de livraison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.address ? (
                <div className="space-y-1">
                  <p className="font-medium">
                    {order.user.first_name} {order.user.last_name}
                  </p>
                  <p>{order.address.address1}</p>
                  <p>
                    {order.address.postal_code} {order.address.city}
                  </p>
                  <p>{order.address.country}</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Adresse non disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Résumé */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Date de commande:
                  </span>
                  <span>
                    {format(new Date(order.order_date), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Nombre d&apos;articles:
                  </span>
                  <span>{totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Méthode de paiement:
                  </span>
                  <span>{order.payment_method}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(order.total_amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
