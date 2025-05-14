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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Home, Edit, Trash2, Plus, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Address = {
  id_address: number
  first_name: string
  last_name: string
  address1: string
  address2?: string | null
  postal_code: string
  city: string
  country: string
  mobile_phone: string
  is_default_billing?: boolean
  is_default_shipping?: boolean
}

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Delete address dialog state
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] =
    useState(false)
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/settings/addresses")
    }
  }, [status, router])

  // Fetch addresses
  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchAddresses = async () => {
      setError(null)
      setLoading(true)

      try {
        // Utilisation correcte de l'API pour récupérer les adresses
        const response = await fetch(
          `/api/users/${session.user.id_user}/addresses`,
          {
            credentials: "include", // Important pour les cookies d'authentification
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || "Erreur lors de la récupération des adresses"
          )
        }

        const addressesData = await response.json()

        // Déchiffrement des adresses si nécessaire
        if (addressesData && addressesData.length > 0) {
          try {
            const addressesToDecrypt = addressesData.map((addr: Address) => ({
              id_address: addr.id_address,
              first_name: addr.first_name || "",
              last_name: addr.last_name || "",
              address1: addr.address1 || "",
              address2: addr.address2 || null,
              postal_code: addr.postal_code || "",
              city: addr.city || "",
              country: addr.country || "",
              mobile_phone: addr.mobile_phone || "",
            }))

            const decryptRes = await fetch("/api/crypt/user/decrypt", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": session.user.id_user.toString(),
              },
              body: JSON.stringify({
                addresses: addressesToDecrypt,
                payments: [],
              }),
            })

            if (decryptRes.ok) {
              const decryptData = await decryptRes.json()

              // Mise à jour des adresses avec les données déchiffrées
              const decryptedAddresses = addressesData.map((addr: Address) => {
                const decryptedAddr = decryptData.addresses.find(
                  (d: any) => d.id_address === addr.id_address
                )

                if (decryptedAddr) {
                  return {
                    ...addr,
                    address1: decryptedAddr.address1,
                    address2: decryptedAddr.address2,
                    postal_code: decryptedAddr.postal_code,
                    city: decryptedAddr.city,
                    country: decryptedAddr.country,
                  }
                }
                return addr
              })

              setAddresses(decryptedAddresses)
            } else {
              setAddresses(addressesData)
            }
          } catch (decryptError) {
            console.error("Error decrypting addresses:", decryptError)
            setAddresses(addressesData)
          }
        } else {
          setAddresses(addressesData)
        }
      } catch (err) {
        setError(
          (err as Error).message ||
            "Une erreur est survenue lors de la récupération des adresses."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [session])

  // Delete address handler
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

      toast({
        title: "Adresse supprimée",
        description: "L'adresse a été supprimée avec succès.",
        variant: "success",
      })
    } catch (err) {
      setModalError(
        (err as Error).message || "Erreur lors de la suppression de l'adresse."
      )
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
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map(i => (
                <div
                  key={i}
                  className="h-48 bg-gray-100 rounded-lg border border-gray-200"
                ></div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50/50 justify-end">
            <div className="h-10 w-48 bg-gray-200 rounded"></div>
          </CardFooter>
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
            <Link href="/auth?redirect=/account/settings/addresses">
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
              <Home className="h-5 w-5" />
              Carnet d&apos;adresses
            </CardTitle>
            <CardDescription>
              Gérez vos adresses de livraison et de facturation
            </CardDescription>
          </div>
          <Button
            asChild
            className="bg-[#302082] hover:bg-[#302082]/90 text-white"
          >
            <Link href="/account/addresses/add">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une adresse
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {addresses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map(address => (
              <Card
                key={address.id_address}
                className="border border-gray-200 hover:border-[#302082]/30 hover:shadow-md transition-all duration-300"
              >
                <CardContent className="pt-6 pb-4">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {address.first_name} {address.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.address1}
                      </p>
                      {address.address2 && (
                        <p className="text-sm text-gray-600">
                          {address.address2}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {address.postal_code} {address.city}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                      {address.mobile_phone && (
                        <p className="text-sm text-gray-600">
                          {address.mobile_phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      {address.is_default_billing && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-600 border-blue-200"
                        >
                          Facturation
                        </Badge>
                      )}
                      {address.is_default_shipping && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200"
                        >
                          Livraison
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50/50 flex justify-end gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-[#302082] text-[#302082] hover:bg-[#302082]/10"
                  >
                    <Link href={`/account/addresses/${address.id_address}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Link>
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
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => {
                          setAddressToDelete(address.id_address)
                          setIsDeleteAddressModalOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                          Êtes-vous sûr de vouloir supprimer l&apos;adresse
                          &quot;
                          {address.address1}, {address.city}&quot; ?
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
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Aucune adresse enregistrée
            </h3>
            <p className="text-gray-500 mb-4">
              Ajoutez une adresse pour faciliter vos achats futurs.
            </p>
            <Button
              asChild
              className="bg-[#302082] hover:bg-[#302082]/90 text-white"
            >
              <Link href="/account/addresses/add">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une adresse
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
