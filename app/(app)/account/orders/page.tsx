"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type OrderItem = {
  id_order_item: number
  service_name: string
  subscription_type: string
  unit_price: number
  renewal_date: string
  subscription_status: string
  card_last_digits: string
}

type Order = {
  id: number
  subscriptions: OrderItem[]
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtres
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [search, setSearch] = useState("")

  const openModal = (order: OrderItem) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  useEffect(() => {
    if (!session?.user?.id) return
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/users/${session.user.id}/orders`)
        const data = await res.json()
        if (res.ok) setOrders(data)
      } catch (error) {
        console.error("Erreur de récupération des commandes :", error)
      }
    }

    fetchOrders()
  }, [session])

  const allSubscriptions = orders.flatMap(order => order.subscriptions)

  // Toutes les années disponibles
  const allYears = Array.from(
    new Set(
      allSubscriptions.map(sub =>
        new Date(sub.renewal_date).getFullYear().toString()
      )
    )
  ).sort((a, b) => parseInt(b) - parseInt(a))

  const filteredSubscriptions = allSubscriptions.filter(item => {
    const year = new Date(item.renewal_date).getFullYear().toString()
    const yearFilter = selectedYear ? year === selectedYear : true
    const typeFilter = selectedTypes.length
      ? selectedTypes.includes(item.subscription_type)
      : true
    const statusFilter = selectedStatus.length
      ? selectedStatus.includes(item.subscription_status)
      : true
    const searchFilter = search
      ? item.service_name.toLowerCase().includes(search.toLowerCase()) ||
        year.includes(search)
      : true
    return yearFilter && typeFilter && statusFilter && searchFilter
  })

  // Regroupement par année après filtrage
  const groupedFiltered = filteredSubscriptions.reduce<
    Record<string, OrderItem[]>
  >((acc, item) => {
    const year = new Date(item.renewal_date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(item)
    return acc
  }, {})

  for (const year in groupedFiltered) {
    groupedFiltered[year].sort(
      (a, b) =>
        new Date(b.renewal_date).getTime() - new Date(a.renewal_date).getTime()
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
              {["Prévention", "Protection", "Réponse"].map(type => (
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
              {["Active", "Terminée", "Renouvelée", "Résiliée"].map(status => (
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
              Rechercher par nom ou date :
            </label>
            <input
              type="text"
              placeholder="Nom du service ou date (ex : 2023)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* Résultat regroupé par année */}
      {Object.entries(groupedFiltered)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, items]) => (
          <div key={year} className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Année {year}</h2>
            <table className="w-full text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Service</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Durée</th>
                  <th className="p-2">Montant</th>
                  <th className="p-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id_order_item}
                    className="border-t cursor-pointer hover:bg-gray-50"
                    onClick={() => openModal(item)}
                  >
                    <td className="p-2">{item.service_name}</td>
                    <td className="p-2">
                      {format(new Date(item.renewal_date), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </td>
                    <td className="p-2">{item.subscription_type}</td>
                    <td className="p-2">{item.unit_price} €</td>
                    <td className="p-2">{item.subscription_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* Modale */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-2xl font-semibold">
              <strong>Service : </strong>
              {selectedOrder.service_name}
            </h2>
            <p>
              <strong>Durée de l&apos;abonnement :</strong>{" "}
              {selectedOrder.subscription_type}
            </p>
            <p>
              <strong>Carte bancaire :</strong> **** **** ****{" "}
              {selectedOrder.card_last_digits}
            </p>
            <p>
            <strong>Adresse de facturation :</strong> 
            </p>

            <div className="mt-4">
              <a
                href={`/api/orders/${selectedOrder.id_order_item}/invoice`}
                className="text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Télécharger la facture
              </a>
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
