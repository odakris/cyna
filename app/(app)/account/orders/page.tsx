"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { format, parse, isValid } from "date-fns"
import { fr } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Package,
  Calendar,
  FileText,
  CreditCard,
  Download,
  Home,
  Filter,
  XCircle,
  CheckCircle,
  Loader2,
  Clock,
} from "lucide-react"
import Link from "next/link"

type OrderItem = {
  id_order_item: number
  id_product: number
  id_category: number
  service_name: string
  subscription_type: string
  subscription_status: string
  subscription_duration: number
  renewal_date: string | null
  quantity: number
  unit_price: number
}

type Address = {
  address1: string
  address2: string | null
  city: string
  postal_code: string
  country: string
}

type Order = {
  id_order: number
  order_date: string
  total_amount: number
  subtotal: number
  order_status: string
  payment_method: string
  last_card_digits: string
  invoice_number: string
  invoice_pdf_url: string | null
  subscriptions: OrderItem[]
  billing_address?: Address
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)

  // Filter states
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [allAvailableYears, setAllAvailableYears] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  )
  const [search, setSearch] = useState("")

  // Refs for order details
  const modalRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/orders")
    }
  }, [status, router])

  const openModal = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        if (res.ok) {
          const validCategories = data
            .filter(
              (cat: { id_category: number; name: string }) =>
                cat.id_category != null && cat.name != null
            )
            .map((cat: { id_category: number; name: string }) => ({
              id: cat.id_category,
              name: cat.name,
            }))
          setCategories(validCategories)
        }
      } catch {
        // console.error("Erreur de récupération des catégories :", error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchAllYears = async () => {
      try {
        const res = await fetch(
          `/api/users/${session.user.id_user}/orders-history`
        )
        const data = await res.json()

        if (res.ok) {
          const years = Array.from(
            new Set(
              data.map((order: Order) =>
                new Date(order.order_date).getFullYear().toString()
              )
            )
          ).sort((a, b) => parseInt(b as string) - parseInt(a as string))
          setAllAvailableYears(years)
        }
      } catch {
        // console.error("Erreur de récupération des années :", error)
      }
    }

    fetchAllYears()
  }, [session])

  useEffect(() => {
    if (!session?.user?.id_user) return

    setLoading(true)
    setError(null)

    const fetchOrders = async () => {
      try {
        // Check if any filters are applied
        const hasFilters =
          selectedYear !== "all" ||
          selectedCategoryIds.length > 0 ||
          selectedStatus.length > 0 ||
          search !== ""

        setFiltersApplied(hasFilters)

        const params = new URLSearchParams()
        if (selectedYear && selectedYear !== "all")
          params.append("year", selectedYear)
        if (selectedCategoryIds.length > 0) {
          params.append("category_ids", selectedCategoryIds.join(","))
        }
        if (selectedStatus.length > 0) {
          params.append("order_status", selectedStatus.join(","))
        }

        // Gestion de la recherche
        if (search) {
          // Nettoyer la saisie
          const cleanedSearch = search.trim().toLowerCase()

          // Essayer de parser comme une date ou des composants de date
          const datePatterns = [
            { pattern: "d MMMM yyyy", example: "9 mai 2025" },
            { pattern: "d/M/yyyy", example: "9/5/2025" },
            { pattern: "d MMMM", example: "9 mai" },
            { pattern: "MMMM yyyy", example: "mai 2025" },
            { pattern: "yyyy", example: "2025" },
            { pattern: "MMMM", example: "mai" },
            { pattern: "d", example: "9" },
          ]

          let parsedDate: Date | null = null
          let matchedPattern: string | null = null

          for (const { pattern } of datePatterns) {
            try {
              parsedDate = parse(cleanedSearch, pattern, new Date(), {
                locale: fr,
              })
              if (isValid(parsedDate)) {
                matchedPattern = pattern
                break
              }
            } catch {
              continue
            }
          }

          if (parsedDate && isValid(parsedDate) && matchedPattern) {
            if (matchedPattern.includes("yyyy")) {
              params.append("year", parsedDate.getFullYear().toString())
            }
            if (matchedPattern.includes("MMMM")) {
              params.append("month", (parsedDate.getMonth() + 1).toString())
            }
            if (matchedPattern.includes("d")) {
              params.append("day", parsedDate.getDate().toString())
            }
          } else {
            // Si ce n'est pas une date, considérer comme un nom de service
            params.append("service_name", cleanedSearch)
          }
        }

        const res = await fetch(
          `/api/users/${session.user.id_user}/orders-history?${params.toString()}`
        )
        const data = await res.json()

        if (res.ok) {
          // Préparer les adresses à déchiffrer
          const addressesToDecrypt = data
            .filter((order: Order) => order.billing_address)
            .map((order: Order) => ({
              id_address: order.id_order.toString(), // Utiliser id_order comme identifiant unique
              first_name: "", // Non utilisé ici, mais requis par l'API
              last_name: "", // Non utilisé
              address1: order.billing_address?.address1 || "",
              address2: order.billing_address?.address2 || null,
              postal_code: order.billing_address?.postal_code || "",
              city: order.billing_address?.city || "",
              country: order.billing_address?.country || "",
              mobile_phone: "", // Non utilisé
            }))

          // Appeler l'API de déchiffrement
          const decryptRes = await fetch("/api/crypt/user/decrypt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": session.user.id_user.toString(),
            },
            body: JSON.stringify({
              addresses: addressesToDecrypt,
              payments: [], // Pas de paiement à déchiffrer ici
            }),
          })

          const decryptData = await decryptRes.json()

          if (decryptRes.ok) {
            // Mettre à jour les commandes avec les adresses déchiffrées
            const decryptedOrders = data.map((order: Order) => {
              const decryptedAddress = decryptData.addresses.find(
                (addr: any) => addr.id_address === order.id_order.toString()
              )
              return {
                ...order,
                billing_address: decryptedAddress
                  ? {
                      address1: decryptedAddress.address1,
                      address2: decryptedAddress.address2,
                      postal_code: decryptedAddress.postal_code,
                      city: decryptedAddress.city,
                      country: decryptedAddress.country,
                    }
                  : order.billing_address,
              }
            })

            setOrders(decryptedOrders)
            setError(null)
          } else {
            setOrders(data) // Fallback : utiliser les données non déchiffrées
            setError("Erreur lors du déchiffrement des adresses")
          }
        } else {
          setError(data.error || "Erreur lors de la récupération des commandes")
          setOrders([])
        }
      } catch {
        setError("Erreur lors de la récupération des commandes")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [session, selectedYear, selectedCategoryIds, selectedStatus, search])

  const handleCategoryChange = (catId: number, checked: boolean) => {
    setSelectedCategoryIds(prev => {
      const newIds = checked
        ? [...prev, catId]
        : prev.filter(id => id !== catId)
      return newIds
    })
  }

  const handleDownloadInvoice = async (orderId: number) => {
    if (!session?.user?.id_user) return

    setDownloadingInvoice(true)

    try {
      const response = await fetch(`/api/invoices/${orderId}/download`)

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement de la facture")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `facture-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError("Erreur lors du téléchargement de la facture")
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const resetFilters = () => {
    setSelectedYear("all")
    setSelectedCategoryIds([])
    setSelectedStatus([])
    setSearch("")
    setFiltersApplied(false)
  }

  // Group orders by year
  const groupedOrders = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const year = new Date(order.order_date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(order)
    return acc
  }, {})

  // Sort orders within each year
  for (const year in groupedOrders) {
    groupedOrders[year].sort(
      (a, b) =>
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    )
  }

  if (status === "loading" || loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#302082] mb-4" />
          <p className="text-lg font-medium text-[#302082]">
            Chargement de vos commandes...
          </p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-600">Vous devez être connecté</p>
            <p className="text-sm text-red-600">
              Connectez-vous pour accéder à vos commandes
            </p>
            <Button
              asChild
              variant="default"
              className="mt-2 bg-[#302082] hover:bg-[#302082]/90"
            >
              <Link href="/auth?redirect=/account/orders">Se connecter</Link>
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
            Historique des commandes
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h1>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start gap-2"
          role="alert"
        >
          <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters section */}
      <Card className="mb-8 border-2 border-gray-100 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-lg font-semibold text-[#302082] flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtrer les commandes
              </CardTitle>
              <CardDescription>
                Affinez votre recherche par date, catégorie ou statut
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Année */}
              <div>
                <Label className="font-medium block mb-2 text-sm">
                  Année :
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les années" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {allAvailableYears.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Statut */}
              <div>
                <Label className="font-medium block mb-2 text-sm">
                  Statut :
                </Label>
                <div className="space-y-2 text-sm">
                  {[
                    { value: "ACTIVE", label: "Actif" },
                    { value: "PENDING", label: "En attente" },
                    { value: "COMPLETED", label: "Terminé" },
                    { value: "CANCELLED", label: "Annulé" },
                  ].map(status => (
                    <div
                      key={status.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={selectedStatus.includes(status.value)}
                        onCheckedChange={checked => {
                          setSelectedStatus(prev =>
                            checked
                              ? [...prev, status.value]
                              : prev.filter(s => s !== status.value)
                          )
                        }}
                      />
                      <label
                        htmlFor={`status-${status.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catégories */}
              {categories.length > 0 && (
                <div className="col-span-1 sm:col-span-2">
                  <Label className="font-medium block mb-2 text-sm">
                    Catégorie :
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${cat.id}`}
                          checked={selectedCategoryIds.includes(cat.id)}
                          onCheckedChange={checked =>
                            handleCategoryChange(cat.id, !!checked)
                          }
                        />
                        <label
                          htmlFor={`category-${cat.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {cat.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search field */}
            <div className="pt-4 border-t border-gray-200">
              <Label className="font-medium block mb-2 text-sm">
                Rechercher :
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par date ou nom de service..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Exemples : &quot;9 mai&quot;, &quot;mai 2025&quot;,
                &quot;Protection&quot;
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-gray-50/50 flex justify-between">
          <div className="text-sm text-gray-500">
            {filtersApplied ? (
              <span className="flex items-center">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filtres appliqués
              </span>
            ) : (
              <span>Tous les résultats</span>
            )}
          </div>

          {filtersApplied && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs h-8"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Réinitialiser les filtres
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Orders list */}
      {orders.length === 0 ? (
        <Card className="border-2 border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {filtersApplied
                ? "Aucune commande ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                : "Vous n'avez pas encore passé de commande. Explorez nos produits pour commencer."}
            </p>
            <div className="flex gap-3">
              {filtersApplied && (
                <Button variant="outline" onClick={resetFilters}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              )}
              <Button asChild className="bg-[#302082] hover:bg-[#302082]/90">
                <Link href="/produit">
                  <Package className="h-4 w-4 mr-2" />
                  Découvrir nos produits
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedOrders)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, ordersInYear]) => (
            <div key={year} className="mb-8">
              <h2 className="text-lg font-bold text-[#302082] mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Commandes {year}
              </h2>

              <div className="space-y-4">
                {ordersInYear.map(order => (
                  <Card
                    key={order.id_order}
                    className="border-gray-200 hover:border-[#302082]/30 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => openModal(order)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {format(new Date(order.order_date), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          Numéro de commande
                        </p>
                        <p className="font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />#
                          {order.invoice_number}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Montant</p>
                        <p className="font-medium flex items-center">
                          <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                          {order.total_amount.toFixed(2)} €
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Statut</p>
                        <div>
                          {order.order_status === "COMPLETED" ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Terminée
                            </Badge>
                          ) : order.order_status === "ACTIVE" ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Active
                            </Badge>
                          ) : order.order_status === "PENDING" ? (
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              En attente
                            </Badge>
                          ) : order.order_status === "CANCELLED" ? (
                            <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-red-200">
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Annulée
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {order.order_status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
      )}

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px]" ref={modalRef}>
            <DialogHeader>
              <DialogTitle className="text-xl text-[#302082] flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Commande #{selectedOrder.invoice_number}
              </DialogTitle>
              <DialogDescription>
                Passée le{" "}
                {format(new Date(selectedOrder.order_date), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Statut
                  </h3>
                  <div>
                    {selectedOrder.order_status === "COMPLETED" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Terminée
                      </Badge>
                    ) : selectedOrder.order_status === "ACTIVE" ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Active
                      </Badge>
                    ) : selectedOrder.order_status === "PENDING" ? (
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        En attente
                      </Badge>
                    ) : selectedOrder.order_status === "CANCELLED" ? (
                      <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-red-200">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Annulée
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {selectedOrder.order_status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Paiement
                  </h3>
                  <p className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                    {selectedOrder.payment_method}
                    {selectedOrder.last_card_digits
                      ? ` **** ${selectedOrder.last_card_digits}`
                      : ""}
                  </p>
                </div>

                {selectedOrder.billing_address && (
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">
                      Adresse de facturation
                    </h3>
                    <p className="flex items-start">
                      <Home className="h-4 w-4 mr-1 text-gray-400 mt-0.5" />
                      <span>
                        {selectedOrder.billing_address.address1}
                        {selectedOrder.billing_address.address2
                          ? `, ${selectedOrder.billing_address.address2}`
                          : ""}
                        ,{selectedOrder.billing_address.postal_code}{" "}
                        {selectedOrder.billing_address.city},
                        {selectedOrder.billing_address.country}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="text-base font-semibold text-[#302082] mb-3">
                  Services commandés
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedOrder.subscriptions.map(item => (
                    <div
                      key={item.id_order_item}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.service_name}</p>
                          <div className="text-sm text-gray-600 space-y-1 mt-1">
                            <p>
                              Type :{" "}
                              {item.subscription_type === "MONTHLY"
                                ? "Mensuel"
                                : item.subscription_type === "YEARLY"
                                  ? "Annuel"
                                  : item.subscription_type === "PER_USER"
                                    ? "Par utilisateur"
                                    : item.subscription_type === "PER_MACHINE"
                                      ? "Par appareil"
                                      : item.subscription_type}
                            </p>
                            <p>
                              Prix unitaire : {item.unit_price.toFixed(2)} €
                            </p>
                            <p>Quantité : {item.quantity}</p>
                            {item.renewal_date && (
                              <p>
                                Renouvellement :{" "}
                                {format(
                                  new Date(item.renewal_date),
                                  "dd MMMM yyyy",
                                  { locale: fr }
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          {item.subscription_status === "ACTIVE" ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                              Actif
                            </Badge>
                          ) : item.subscription_status === "CANCELLED" ? (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-600 border-red-200"
                            >
                              Résilié
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {item.subscription_status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span>{selectedOrder.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span>
                    {(
                      selectedOrder.total_amount - selectedOrder.subtotal
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total TTC</span>
                  <span className="text-[#302082]">
                    {selectedOrder.total_amount.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={closeModal}>
                Fermer
              </Button>
              <Button
                onClick={() => handleDownloadInvoice(selectedOrder.id_order)}
                disabled={downloadingInvoice}
                className="bg-[#302082] hover:bg-[#302082]/90"
              >
                {downloadingInvoice ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger la facture
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
