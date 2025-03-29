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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
          const response = await fetch(`/api/users/${session.user.id}`)
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

          // Vérifier si la réponse est vide ou invalide
          if (!response.ok) {
            const errorData = await response.text() // Lire la réponse brute
            console.error("Erreur API:", response.status, errorData)
            return
          }

          const data = await response.json()
          setOrders(data) // On récupère les abonnements de l'utilisateur
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
          <Avatar className="space-x-4">
            <AvatarImage
              src={clientInfo.avatar_url}
              alt={`${clientInfo.first_name} ${clientInfo.last_name}`}
            />
            <AvatarFallback>{`${clientInfo.first_name.charAt(0)}${clientInfo.last_name.charAt(0)}`}</AvatarFallback>
          </Avatar>
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
        <Button onClick={handleEditClick} variant="default" className="mt-4">
          Modifier
        </Button>
      </Card>

      {/* Affichage des abonnements */}
      <h2 className="text-xl font-bold mt-6">Abonnements</h2>
      <Button variant="secondary" className="mt-4">
        Voir l&apos;historique des commandes
      </Button>

      {/* Table des abonnements */}
      <Table className="min-w-full mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Nom du service</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Durée d&apos;abonnement</TableHead>
            <TableHead>Date d&apos;expiration</TableHead>
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
                  variant={order.status = "default"}
                >
                  {order.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="default" className="py-1 px-3 rounded">
                      Renouveler
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Renouveler l&apos;abonnement</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="default" className="py-1 px-3 rounded">
                      Mettre à jour
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mettre à jour l&apos;abonnement</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="default" className="py-1 px-3 rounded">
                      Résilier
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Résilier l&apos;abonnement</TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
