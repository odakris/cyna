// app/account/settings/page.tsx
"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Importation des composants de ton dossier ui
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { Tooltip } from "@/components/ui/tooltip"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AccountSettingsPage() {
  const { data: session, status } = useSession()
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchClientInfo = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user/${session.user.email}`)
          const data = await response.json()
          if (response.ok) {
            setClientInfo(data)
          } else {
            console.error("Erreur:", data.error)
          }
        } catch (error) {
          console.error(
            "Erreur de récupération des informations du client:",
            error
          )
        }
      }
    }

    const fetchOrders = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/orders/${session.user.email}`)
          const data = await response.json()
          if (response.ok) {
            setOrders(data) // On récupère les abonnements de l'utilisateur
          } else {
            console.error("Erreur:", data.error)
          }
        } catch (error) {
          console.error("Erreur de récupération des abonnements:", error)
        }
      }
    }

    if (session?.user) {
      fetchClientInfo()
      fetchOrders()
    }
  }, [session])

  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session?.user || !clientInfo) {
    return <div>Accès refusé. Veuillez vous connecter.</div>
  }

  const handleEditClick = () => {
    router.push("/account/edit")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mes paramètres</h1>

      {/* Card avec les informations du client */}
      <Card className="space-y-4 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Avatar
            src={clientInfo.avatar_url}
            alt={`${clientInfo.first_name} ${clientInfo.last_name}`}
          />
          <div>
            <p>
              <strong>Prénom :</strong> {clientInfo.first_name || "Non défini"}
            </p>
            <p>
              <strong>Nom :</strong> {clientInfo.last_name || "Non défini"}
            </p>
            <p>
              <strong>Email :</strong> {clientInfo.email || "Non défini"}
            </p>
          </div>
        </div>
        <Button onClick={handleEditClick} variant="primary" className="mt-4">
          Modifier
        </Button>
      </Card>

      {/* Affichage des abonnements */}
      <h2 className="text-xl font-bold mt-6">Abonnements</h2>
      <Button variant="secondary" className="mt-4">
        Voir l'historique des commandes
      </Button>

      {/* Table des abonnements */}
      <Table className="min-w-full mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Nom du service</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Durée d'abonnement</TableHead>
            <TableHead>Date d'expiration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Renouvellement</TableHead>
            <TableHead>Mise à jour</TableHead>
            <TableHead>Résiliation</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id_order}>
              <TableCell>
                {order.orderedProducts && order.orderedProducts.length > 0
                  ? order.orderedProducts[0]?.product?.name || "Service inconnu"
                  : "Aucun service"}
              </TableCell>
              <TableCell>{order.total_amount}</TableCell>
              <TableCell>{order.subscription_duration}</TableCell>
              <TableCell>
                {new Date(order.order_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={order.status === "active" ? "success" : "danger"}
                >
                  {order.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell>
                <Tooltip content="Renouveler l'abonnement">
                  <Button variant="success" className="py-1 px-3 rounded">
                    Renouveler
                  </Button>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip content="Mettre à jour l'abonnement">
                  <Button variant="warning" className="py-1 px-3 rounded">
                    Mettre à jour
                  </Button>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip content="Résilier l'abonnement">
                  <Button variant="danger" className="py-1 px-3 rounded">
                    Résilier
                  </Button>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
