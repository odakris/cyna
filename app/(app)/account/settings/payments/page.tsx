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
import { CreditCard, Edit, Trash2, Plus, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type PaymentMethod = {
  id_payment_info: number
  card_name: string
  last_card_digits: string
  exp_month?: number
  exp_year?: number
  brand?: string
  is_default?: boolean
}

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Delete payment method dialog state
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/settings/payments")
    }
  }, [status, router])

  // Fetch payment methods
  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchPaymentMethods = async () => {
      setError(null)
      setLoading(true)

      try {
        const response = await fetch(
          `/api/users/${session.user.id_user}/payments`,
          {
            credentials: "include", // Important pour les cookies d'authentification
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message ||
              "Erreur lors de la récupération des moyens de paiement"
          )
        }

        const paymentsData = await response.json()

        // Déchiffrement des moyens de paiement si nécessaire
        if (paymentsData && paymentsData.length > 0) {
          try {
            const paymentsToDecrypt = paymentsData.map(
              (payment: PaymentMethod) => ({
                id_payment_info: payment.id_payment_info,
                card_name: payment.card_name || "",
                last_card_digits: payment.last_card_digits || "",
                exp_month: payment.exp_month || 0,
                exp_year: payment.exp_year || 0,
              })
            )

            const decryptRes = await fetch("/api/crypt/user/decrypt", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": session.user.id_user.toString(),
              },
              body: JSON.stringify({
                addresses: [],
                payments: paymentsToDecrypt,
              }),
            })

            if (decryptRes.ok) {
              const decryptData = await decryptRes.json()

              // Mise à jour des moyens de paiement avec les données déchiffrées
              const decryptedPayments = paymentsData.map(
                (payment: PaymentMethod) => {
                  const decryptedPayment = decryptData.payments.find(
                    (p: any) => p.id_payment_info === payment.id_payment_info
                  )

                  if (decryptedPayment) {
                    return {
                      ...payment,
                      card_name: decryptedPayment.card_name,
                      last_card_digits: decryptedPayment.last_card_digits,
                      exp_month: decryptedPayment.exp_month,
                      exp_year: decryptedPayment.exp_year,
                    }
                  }
                  return payment
                }
              )

              setPaymentMethods(decryptedPayments)
            } else {
              setPaymentMethods(paymentsData)
            }
          } catch (decryptError) {
            console.error("Error decrypting payments:", decryptError)
            setPaymentMethods(paymentsData)
          }
        } else {
          setPaymentMethods(paymentsData)
        }
      } catch (err) {
        setError(
          (err as Error).message ||
            "Une erreur est survenue lors de la récupération des moyens de paiement."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [session])

  // Password validation function
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
    } catch {
      setPasswordError("Erreur lors de la vérification du mot de passe.")
      return false
    }
  }

  // Delete payment method handler
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

      toast({
        title: "Méthode de paiement supprimée",
        description: "La méthode de paiement a été supprimée avec succès.",
        variant: "success",
      })
    } catch (err) {
      setModalError(
        (err as Error).message ||
          "Erreur lors de la suppression de la méthode de paiement."
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
            <Link href="/auth?redirect=/account/settings/payments">
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
              <CreditCard className="h-5 w-5" />
              Moyens de paiement
            </CardTitle>
            <CardDescription>
              Gérez vos cartes bancaires et méthodes de paiement
            </CardDescription>
          </div>
          <Button
            asChild
            className="bg-[#302082] hover:bg-[#302082]/90 text-white"
          >
            <Link href="/account/payments/add">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une carte
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

        {paymentMethods.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {paymentMethods.map(payment => (
              <Card
                key={payment.id_payment_info}
                className="border border-gray-200 hover:border-[#302082]/30 hover:shadow-md transition-all duration-300"
              >
                <CardContent className="pt-6 pb-4">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{payment.card_name}</p>
                      <p className="text-sm text-gray-600">
                        •••• •••• •••• {payment.last_card_digits}
                      </p>
                      {payment.exp_month && payment.exp_year && (
                        <p className="text-sm text-gray-600">
                          Exp: {payment.exp_month.toString().padStart(2, "0")}/
                          {payment.exp_year}
                        </p>
                      )}
                      <p className="text-sm capitalize text-gray-600">
                        {payment.brand || "Card"}
                      </p>
                    </div>
                    <div>
                      {payment.is_default && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Par défaut
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
                    <Link href={`/account/payments/${payment.id_payment_info}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Link>
                  </Button>

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
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => {
                          setPaymentToDelete(payment.id_payment_info)
                          setIsDeletePaymentModalOpen(true)
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
                          Êtes-vous sûr de vouloir supprimer la carte se
                          terminant par {payment.last_card_digits} ? Veuillez
                          entrer votre mot de passe pour confirmer.
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Mot de passe actuel{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-[#302082] focus:border-[#302082]"
                          placeholder="Entrez votre mot de passe"
                        />
                        {passwordError && (
                          <div className="text-red-600 text-xs mt-2 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {passwordError}
                          </div>
                        )}
                      </div>
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
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Aucun moyen de paiement enregistré
            </h3>
            <p className="text-gray-500 mb-4">
              Ajoutez une carte bancaire pour faciliter vos achats futurs.
            </p>
            <Button
              asChild
              className="bg-[#302082] hover:bg-[#302082]/90 text-white"
            >
              <Link href="/account/payments/add">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une carte
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
