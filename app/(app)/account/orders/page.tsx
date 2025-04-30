"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type OrderItem = {
  id_order_item: number
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
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
    if (!session?.user?.id_user) return

    const fetchOrders = async () => {
      try {
        // Construire les paramètres de requête pour les filtres
        const params = new URLSearchParams()
        if (selectedYear) params.append("year", selectedYear)
        if (selectedTypes.length > 0)
          params.append("subscription_type", selectedTypes.join(","))
        if (selectedStatus.length > 0)
          params.append("status", selectedStatus.join(","))
        if (search) params.append("search", search)

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
  }, [session, selectedYear, selectedTypes, selectedStatus, search])

  // Toutes les années disponibles (basé sur order_date des commandes)
  const allYears = Array.from(
    new Set(
      orders.map(order => new Date(order.order_date).getFullYear().toString())
    )
  ).sort((a, b) => parseInt(b) - parseInt(a))

  // Regroupement par année
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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mx-auto">
        Historique des commandes
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Filtres */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="font-semibold block mb-1">Année :</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="">Toutes les années</option>
              {allYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="font-semibold block mb-2">
              Type de service :
            </label>
            <div className="flex flex-col gap-2">
              {["MONTHLY", "YEARLY", "PER_USER", "PER_MACHINE"].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={type}
                    checked={selectedTypes.includes(type)}
                    onChange={e => {
                      const checked = e.target.checked
                      setSelectedTypes(prev =>
                        checked ? [...prev, type] : prev.filter(t => t !== type)
                      )
                    }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="font-semibold block mb-2">Statut :</label>
            <div className="flex flex-col gap-2">
              {[
                "PENDING",
                "ACTIVE",
                "SUSPENDED",
                "CANCELLED",
                "EXPIRED",
                "RENEWING",
              ].map(status => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
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

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="font-semibold block mb-1">
              Rechercher par nom de service :
            </label>
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* Résultat regroupé par année */}
      {orders.length === 0 && !error ? (
        <p className="text-center text-gray-500">
          Aucune commande trouvée pour les critères sélectionnés.
        </p>
      ) : (
        Object.entries(groupedOrders)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, ordersInYear]) => (
            <div key={year} className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Année {year}</h2>
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Date de la commande</th>
                    <th className="p-2">Montant total</th>
                    <th className="p-2">Statut</th>
                    <th className="p-2">Méthode de paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersInYear.map(order => (
                    <tr
                      key={order.id_order}
                      className="border-t cursor-pointer hover:bg-gray-50"
                      onClick={() => openModal(order)}
                    >
                      <td className="p-2">
                        {format(new Date(order.order_date), "dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </td>
                      <td className="p-2">{order.total_amount} €</td>
                      <td className="p-2">{order.order_status}</td>
                      <td className="p-2">
                        {order.payment_method}{" "}
                        {order.last_card_digits
                          ? `(**** ${order.last_card_digits})`
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
      )}

      {/* Modale */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/2 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">
              Détails de la commande #{selectedOrder.invoice_number}
            </h2>
            <div className="space-y-2">
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
                  {`${selectedOrder.billing_address.address1}${selectedOrder.billing_address.address2 ? ", " + selectedOrder.billing_address.address2 : ""}, ${selectedOrder.billing_address.city}, ${selectedOrder.billing_address.postal_code}, ${selectedOrder.billing_address.country}`}
                </p>
              )}
            </div>

            {/* Liste des services associés à la commande */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Services associés</h3>
              <table className="w-full text-left border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2">Service</th>
                    <th className="p-2">Type d&apos;abonnement</th>
                    <th className="p-2">Prix unitaire</th>
                    <th className="p-2">Statut</th>
                    <th className="p-2">Date de renouvellement</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.subscriptions.map(item => (
                    <tr key={item.id_order_item} className="border-t">
                      <td className="p-2">{item.service_name}</td>
                      <td className="p-2">{item.subscription_type}</td>
                      <td className="p-2">{item.unit_price} €</td>
                      <td className="p-2">{item.subscription_status}</td>
                      <td className="p-2">
                        {item.renewal_date
                          ? format(
                              new Date(item.renewal_date),
                              "dd MMMM yyyy",
                              {
                                locale: fr,
                              }
                            )
                          : "Non défini"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              {selectedOrder.invoice_pdf_url && (
                <a
                  href={selectedOrder.invoice_pdf_url}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Télécharger la facture
                </a>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded"
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
