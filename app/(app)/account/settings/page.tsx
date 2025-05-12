"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { User } from "next-auth"
import { Address, Order } from "@prisma/client"
import { PaymentMethod } from "@stripe/stripe-js"

interface ExtendedOrder extends Order {
  subscriptions: Array<{
    id_order_item: number
    service_name: string
    subscription_type: string
    unit_price: number
    quantity: number
    renewal_date: string | null
    subscription_status: string
    id_product: number
    imageUrl?: string
  }>
}

export default function AccountSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [clientInfo, setClientInfo] = useState<User | null>(null)
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] =
    useState(false)
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null)
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchClientData = async () => {
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
          setErrorMessage(
            userData.message ||
              "Erreur lors de la récupération des informations utilisateur"
          )

        if (ordersResponse.ok) setOrders(ordersData)
        else
          setErrorMessage(
            ordersData.message || "Erreur lors de la récupération des commandes"
          )

        if (addressesResponse.ok) setAddresses(addressesData)
        else
          setErrorMessage(
            addressesData.message ||
              "Erreur lors de la récupération des adresses"
          )

        if (paymentsResponse.ok) setPaymentMethods(paymentsData)
        else
          setErrorMessage(
            paymentsData.message ||
              "Erreur lors de la récupération des méthodes de paiement"
          )
      } catch (error) {
        console.error("Erreur fetchClientData:", error)
        setErrorMessage(
          "Une erreur est survenue lors de la récupération des données."
        )
      }
    }

    fetchClientData()
  }, [session])

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
    } catch (err) {
      setPasswordError("Erreur lors de la vérification du mot de passe.")
      return false
    }
  }

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
    } catch (err: any) {
      setModalError(
        err.message ||
          "Erreur lors de la suppression de la méthode de paiement."
      )
    }
  }

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
    } catch (err: any) {
      setModalError(
        err.message || "Erreur lors de la suppression de l'adresse."
      )
    }
  }

  const handleUpdateSubscription = async (
    sub: ExtendedOrder["subscriptions"][0]
  ) => {
    if (!session?.user?.id_user) {
      setErrorMessage("Vous devez être connecté pour modifier un abonnement.")
      return
    }

    try {
      // Annuler l'abonnement
      const response = await fetch(
        `/api/users/${session.user.id_user}/subscriptions/${sub.id_order_item}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          credentials: "include",
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Échec de l'annulation de l'abonnement"
        )
      }

      // Ajouter au panier
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

      // Notification et redirection
      toast({
        title: "Abonnement annulé",
        description:
          "L'abonnement a été annulé et ajouté au panier pour modification.",
        variant: "success",
      })
      router.push("/panier")
    } catch (err: any) {
      setErrorMessage(
        err.message || "Erreur lors de la mise à jour de l'abonnement."
      )
      toast({
        title: "Erreur",
        description: err.message || "Une erreur s'est produite.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") return <div>Chargement...</div>
  if (!session?.user) return <div>Accès refusé. Veuillez vous connecter.</div>

  return (
    <div className="p-6 space-y-12">
      {errorMessage && (
        <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
      )}
      {/* Informations personnelles */}
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
              <AvatarFallback>{`${clientInfo?.first_name?.charAt(0) ?? "?"}${clientInfo?.last_name?.charAt(0) ?? "?"}`}</AvatarFallback>
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
        <div className="flex justify-start">
          <Button onClick={() => router.push("/account/editPersonalInfo")}>
            Modifier
          </Button>
        </div>
      </div>

      {/* Abonnements */}
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
                    <Button
                      variant="default"
                      onClick={() => handleUpdateSubscription(sub)}
                      disabled={sub.subscription_status === "CANCELLED"}
                    >
                      Mettre à jour
                    </Button>
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

      {/* Carnet d’adresses */}
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
                  <TableCell>{address.mobile_phone || "N/A"}</TableCell>
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
                          variant="destructive"
                          className="ml-2"
                          onClick={() => {
                            setAddressToDelete(address.id_address)
                            setIsDeleteAddressModalOpen(true)
                          }}
                        >
                          Supprimer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmer la suppression</DialogTitle>
                          <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer l&apos;adresse &quot;
                            {address.address1}, {address.city}&quot; ?
                          </DialogDescription>
                        </DialogHeader>
                        {modalError && (
                          <div className="text-red-600 text-sm mb-4">
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Aucune adresse enregistrée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Méthodes de paiement */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Méthodes de paiement</h2>
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
                  <TableCell>{`${payment.exp_month}/${payment.exp_year}`}</TableCell>
                  <TableCell>
                    {payment.is_default ? (
                      <Badge variant="default">Oui</Badge>
                    ) : (
                      <Badge variant="outline">Non</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/account/payments/${payment.id_payment_info}`}>
                      <Button variant="default">Modifier</Button>
                    </Link>
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
                          variant="destructive"
                          className="ml-2"
                          onClick={() => {
                            setPaymentToDelete(payment.id_payment_info)
                            setIsDeletePaymentModalOpen(true)
                          }}
                        >
                          Supprimer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmer la suppression</DialogTitle>
                          <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la méthode de
                            paiement se terminant par {payment.last_card_digits}{" "}
                            ? Veuillez entrer votre mot de passe.
                          </DialogDescription>
                        </DialogHeader>
                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Mot de passe actuel
                          </label>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {passwordError && (
                            <div className="text-red-600 text-sm mt-2">
                              {passwordError}
                            </div>
                          )}
                        </div>
                        {modalError && (
                          <div className="text-red-600 text-sm mb-4">
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
                              handleDeletePaymentMethod(payment.id_payment_info)
                            }
                          >
                            Supprimer
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
