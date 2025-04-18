"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function AccountSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchClientData = async () => {
      try {
        const [
          userResponse,
          ordersResponse,
          addressesResponse,
          paymentsResponse,
        ] = await Promise.all([
          fetch(`/api/users/${session.user.id}`),
          fetch(`/api/users/${session.user.id}/orders`),
          fetch(`/api/users/${session.user.id}/addresses`),
          fetch(`/api/users/${session.user.id}/payments`),
        ])

        const userData = await userResponse.json()
        const ordersData = await ordersResponse.json()
        const addressesData = await addressesResponse.json()
        const paymentsData = await paymentsResponse.json()

        // console.log("User Data:", userData)
        // console.log("Orders Data:", ordersData)
        // console.log("Addresses Data:", addressesData)
        // console.log("Payments Data:", paymentsData)

        if (userResponse.ok) setClientInfo(userData)
        if (ordersResponse.ok) setOrders(ordersData)
        if (addressesResponse.ok) setAddresses(addressesData)
        if (paymentsResponse.ok) setPaymentMethods(paymentsData)
      } catch (error) {
        console.error("Erreur de récupération des données :", error)
      }
    }

    fetchClientData()
  }, [session])

  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session?.user) {
    return <div>Accès refusé. Veuillez vous connecter.</div>
  }

  return (
    <div className="p-6 space-y-12">
      {/* Section Informations personnelles */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-center">
          Informations personnelles
        </h1>

        <Card className="space-y-4 p-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={clientInfo?.avatar_url}
                alt={`${clientInfo?.first_name} ${clientInfo?.last_name}`}
              />
              <AvatarFallback>
                {`${clientInfo?.first_name?.charAt(0) ?? "?"}${clientInfo?.last_name?.charAt(0) ?? "?"}`}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>
                <strong>Prénom :</strong>{" "}
                {clientInfo?.first_name || "Non défini"}
              </p>
              <p>
                <strong>Nom :</strong> {clientInfo?.last_name || "Non défini"}
              </p>
              <p>
                <strong>Email :</strong> {clientInfo?.email || "Non défini"}
              </p>
            </div>
          </div>
        </Card>

        {/* Bouton Modifier placé en dehors de la Card, aligné à droite */}
        <div className="flex justify-start">
          <Button
            onClick={() => (window.location.href = "/account/editPersonalInfo")}
          >
            Modifier
          </Button>
        </div>
      </div>

      {/* Section Abonnements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Abonnements</h2>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Nom du service</TableHead>
              <TableHead>Type d&apos;abonnement</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Date de renouvellement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mise à jour</TableHead>
              <TableHead>Résiliation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.flatMap(order =>
              order.subscriptions.map(sub => (
                <TableRow key={sub.id_order_item}>
                  <TableCell>{sub.service_name}</TableCell>
                  <TableCell>{sub.subscription_type}</TableCell>
                  <TableCell>{sub.unit_price} €</TableCell>
                  <TableCell>
                    {sub.renewal_date
                      ? new Date(sub.renewal_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.subscription_status === "ACTIVE"
                          ? "default"
                          : sub.subscription_status === "CANCELLED"
                            ? "secondary"
                            : sub.subscription_status === "EXPIRED"
                              ? "secondary"
                              : sub.subscription_status === "PENDING"
                                ? "secondary"
                                : "default"
                      }
                    >
                      {sub.subscription_status === "ACTIVE"
                        ? "Actif"
                        : sub.subscription_status === "CANCELLED"
                          ? "Annulé"
                          : sub.subscription_status === "EXPIRED"
                            ? "Expiré"
                            : sub.subscription_status === "PENDING"
                              ? "En attente"
                              : "Inconnu"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="default">Mettre à jour</Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive">Résilier</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Section Carnet d’adresses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Carnet d’adresses</h2>
        <Link href="/account/addresses/add">
          <Button>Ajouter une adresse</Button>
        </Link>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Code Postal</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.length > 0 ? (
              addresses.map(address => (
                <TableRow key={address.id_address}>
                  <TableCell>{`${address.first_name} ${address.last_name}`}</TableCell>
                  <TableCell>{`${address.address1}${address.address2 ? " " + address.address2 : ""}`}</TableCell>
                  <TableCell>{address.postal_code}</TableCell>
                  <TableCell>{address.city}</TableCell>
                  <TableCell>{address.country}</TableCell>
                  <TableCell>{address.mobile_phone}</TableCell>
                  <TableCell>
                    {address.is_default_billing ? (
                      <Badge variant="default">Facturation</Badge>
                    ) : address.is_default_shipping ? (
                      <Badge variant="secondary">Livraison</Badge>
                    ) : (
                      <Badge variant="outline">Autre</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      onClick={() =>
                        router.push(`/account/addresses/${address.id_address}`)
                      }
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      className="ml-2"
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `/api/users/${session.user.id}/addresses?addressId=${address.id_address}`,
                            { method: "DELETE" }
                          )
                          if (res.ok) {
                            setAddresses(prev =>
                              prev.filter(
                                a => a.id_address !== address.id_address
                              )
                            )
                          } else {
                            console.error("Erreur suppression adresse")
                          }
                        } catch (err) {
                          console.error("Erreur suppression adresse :", err)
                        }
                      }}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Aucune adresse enregistrée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Section Méthodes de paiement */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Méthodes de paiement</h2>

        {/* Bouton Ajouter une carte */}
        <Link href="/account/payments/add">
          <Button>Ajouter une carte</Button>
        </Link>

        <Table className="min-w-full mb-12">
          <TableHeader>
            <TableRow>
              <TableHead>Nom sur la carte</TableHead>
              <TableHead>Numéro</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Par défaut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods.length > 0 ? (
              paymentMethods.map(payment => (
                <TableRow key={payment.id_payment_info}>
                  <TableCell>{payment.card_name}</TableCell>
                  <TableCell>
                    •••• •••• •••• {payment.last_card_digits}
                  </TableCell>
                  <TableCell>{`${payment.expiration_month}/${payment.expiration_year}`}</TableCell>
                  <TableCell>
                    {payment.is_default ? (
                      <Badge variant="default">Oui</Badge>
                    ) : (
                      <Badge variant="outline">Non</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Bouton Modifier */}
                    <Link href={`/account/payments/${payment.id_payment_info}`}>
                      <Button variant="default">Modifier</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Aucune méthode de paiement enregistrée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
