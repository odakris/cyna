"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { format, parse, isValid } from "date-fns"
import { fr } from "date-fns/locale"

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
  billing_address?: {
    address1: string
    address2: string | null
    city: string
    postal_code: string
    country: string
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [allAvailableYears, setAllAvailableYears] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  )
  const [search, setSearch] = useState("")

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
        } else {
          console.error("Erreur lors de la récupération des catégories")
        }
      } catch (error) {
        console.error("Erreur de récupération des catégories :", error)
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
          ).sort((a, b) => parseInt(b) - parseInt(a))
          setAllAvailableYears(years)
        } else {
          console.error("Erreur lors de la récupération des années")
        }
      } catch (error) {
        console.error("Erreur de récupération des années :", error)
      }
    }

    fetchAllYears()
  }, [session])

  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams()
        if (selectedYear) params.append("year", selectedYear)
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
            } catch (e) {
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
          setOrders(data)
          setError(null)
        } else {
          setError(data.error || "Erreur lors de la récupération des commandes")
          setOrders([])
        }
      } catch (error) {
        console.error(
          "Erreur de récupération de l'historique des commandes :",
          error
        )
        setError("Erreur lors de la récupération des commandes")
        setOrders([])
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

  const groupedOrders = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const year = new Date(order.order_date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(order)
    return acc
  }, {})

  for (const year in groupedOrders) {
    groupedOrders[year].sort(
      (a, b) =>
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    )
  }

  if (status === "loading") return <p>Chargement...</p>
  if (!session?.user)
    return <p>Vous devez être connecté pour voir vos commandes.</p>

  return (
    <div className="p-4 space-y-4 min-h-screen">
      <h1 className="text-2xl font-bold text-center">
        Historique des commandes
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded"
          role="alert"
        >
          <span>{error}</span>
        </div>
      )}

      {/* Filtres */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
        <div className="space-y-4 md:flex md:gap-4 md:space-y-0">
          <div className="flex-1">
            <label className="font-semibold block mb-1 text-sm">Année :</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
            >
              <option value="">Toutes les années</option>
              {allAvailableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="font-semibold block mb-1 text-sm">
              Catégorie de service :
            </label>
            <div className="space-y-1">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`category-${cat.id}`}
                    value={cat.id}
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={e =>
                      handleCategoryChange(cat.id, e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="font-semibold block mb-1 text-sm">Statut :</label>
            <div className="space-y-1">
              {[
                "PENDING",
                "PROCESSING",
                "ACTIVE",
                "COMPLETED",
                "CANCELLED",
                "REFUNDED",
              ].map(status => (
                <label key={status} className="flex items-center gap-2 text-sm">
                  <input
                    className="h-4 w-4"
                    type="checkbox"
                    name={`status-${status}`}
                    value={status}
                    checked={selectedStatus.includes(status)}
                    onChange={e => {
                      const checked = e.target.checked
                      setSelectedStatus(prev =>
                        checked
                          ? [...prev, status]
                          : prev.filter(s => s !== status)
                      )
                    }}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1 text-sm">
            Rechercher par date (ex: 9 mai, avril, mai 2025) :
          </label>
          <input
            type="text"
            placeholder="Date (ex: 9 mai, mai 2025)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
          />
        </div>
      </div>

      {/* Résultat regroupé par année */}
      {orders.length === 0 && !error ? (
        <p className="text-center text-gray-500 text-sm">
          Aucune commande trouvée pour les critères sélectionnés.
        </p>
      ) : (
        Object.entries(groupedOrders)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, ordersInYear]) => (
            <div key={year} className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Année {year}</h2>
              <div className="space-y-4 md:table md:w-full md:text-left md:border">
                <div className="hidden md:table-header-group bg-gray-100">
                  <div className="table-row">
                    <div className="table-cell p-2 text-sm">
                      Date de la commande
                    </div>
                    <div className="table-cell p-2 text-sm">Montant total</div>
                    <div className="table-cell p-2 text-sm">Statut</div>
                    <div className="table-cell p-2 text-sm">
                      Méthode de paiement
                    </div>
                  </div>
                </div>
                <div className="md:table-row-group">
                  {ordersInYear.map(order => (
                    <div
                      key={order.id_order}
                      className="border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:bg-gray-50 md:table-row"
                      onClick={() => openModal(order)}
                    >
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Date de la commande :
                        </span>
                        <span className="text-sm">
                          {format(new Date(order.order_date), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Montant total :
                        </span>
                        <span className="text-sm">{order.total_amount} €</span>
                      </div>
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Statut :
                        </span>
                        <span className="text-sm">{order.order_status}</span>
                      </div>
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Méthode de paiement :
                        </span>
                        <span className="text-sm">
                          {order.payment_method}{" "}
                          {order.last_card_digits
                            ? `(**** ${order.last_card_digits})`
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
      )}

      {/* Modale */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
          <div className="bg-white p-4 rounded-lg w-full max-w-md md:max-w-4xl m-4 shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Fermer la modale"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-3">
              Détails de la commande #{selectedOrder.invoice_number}
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Date de la commande :</strong>{" "}
                {format(new Date(selectedOrder.order_date), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </p>
              <p>
                <strong>Montant total :</strong> {selectedOrder.total_amount} €
              </p>
              <p>
                <strong>Statut :</strong> {selectedOrder.order_status}
              </p>
              <p>
                <strong>Méthode de paiement :</strong>{" "}
                {selectedOrder.payment_method}{" "}
                {selectedOrder.last_card_digits
                  ? `(**** ${selectedOrder.last_card_digits})`
                  : ""}
              </p>
              {selectedOrder.billing_address && (
                <p>
                  <strong>Adresse de facturation :</strong>{" "}
                  {`${selectedOrder.billing_address.address1}${
                    selectedOrder.billing_address.address2
                      ? ", " + selectedOrder.billing_address.address2
                      : ""
                  }, ${selectedOrder.billing_address.city}, ${
                    selectedOrder.billing_address.postal_code
                  }, ${selectedOrder.billing_address.country}`}
                </p>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-base font-medium mb-2">Services associés</h3>
              <div className="space-y-3 md:overflow-x-auto md:table md:border">
                <div className="hidden md:table-header-group bg-gray-200">
                  <div className="table-row">
                    <div className="table-cell p-2 text-sm w-1/5 min-w-[150px]">
                      Service
                    </div>
                    <div className="table-cell p-2 text-sm w-1/5 min-w-[120px]">
                      Type d&apos;abonnement
                    </div>
                    <div className="table-cell p-2 text-sm w-1/5 min-w-[100px]">
                      Prix unitaire
                    </div>
                    <div className="table-cell p-2 text-sm w-1/5 min-w-[100px]">
                      Statut
                    </div>
                    <div className="table-cell p-2 text-sm w-1/5 min-w-[150px]">
                      Date de renouvellement
                    </div>
                  </div>
                </div>
                <div className="md:table-row-group">
                  {selectedOrder.subscriptions.map(item => (
                    <div
                      key={item.id_order_item}
                      className="border rounded-lg p-3 bg-gray-50 md:table-row"
                    >
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Service :
                        </span>
                        <span className="text-sm break-words">
                          {item.service_name}
                        </span>
                      </div>
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Type d&apos;abonnement :
                        </span>
                        <span className="text-sm break-words">
                          {item.subscription_type}
                        </span>
                      </div>
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Prix unitaire :
                        </span>
                        <span className="text-sm">{item.unit_price} €</span>
                      </div>
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Statut :
                        </span>
                        <span className="text-sm break-words">
                          {item.subscription_status}
                        </span>
                      </div>
                      <div className="md:table-cell md:p-2">
                        <span className="block font-medium text-sm md:hidden">
                          Date de renouvellement :
                        </span>
                        <span className="text-sm break-words">
                          {item.renewal_date
                            ? format(
                                new Date(item.renewal_date),
                                "dd MMMM yyyy",
                                { locale: fr }
                              )
                            : "Non défini"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <a
                href={`/api/invoices/${selectedOrder.id_order}`}
                className="text-blue-600 hover:underline text-sm"
                download
              >
                Télécharger la facture
              </a>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
