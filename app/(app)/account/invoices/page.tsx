"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  FileText,
  Search,
  CreditCard,
  AlertTriangle,
  Loader2,
} from "lucide-react"

type Invoice = {
  id_order: number
  invoice_number: string
  order_date: string
  total_amount: number
  order_status: string
  payment_method: string
  hasDownloadFailed?: boolean
}

export default function InvoicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [downloadingInvoice, setDownloadingInvoice] = useState<number | null>(
    null
  )

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/invoices")
    }
  }, [status, router])

  // Fetch invoices
  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchInvoices = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/users/${session.user.id_user}/invoices`
        )

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des factures")
        }

        const data = await response.json()
        setInvoices(data)
        setFilteredInvoices(data)
      } catch {
        setError(
          "Une erreur est survenue lors de la récupération des factures."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [session])

  // Filter invoices based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInvoices(invoices)
      return
    }

    const lowercasedTerm = searchTerm.toLowerCase()

    const filtered = invoices.filter(
      invoice =>
        invoice.invoice_number.toLowerCase().includes(lowercasedTerm) ||
        invoice.payment_method.toLowerCase().includes(lowercasedTerm) ||
        format(new Date(invoice.order_date), "dd MMMM yyyy", { locale: fr })
          .toLowerCase()
          .includes(lowercasedTerm)
    )

    setFilteredInvoices(filtered)
  }, [searchTerm, invoices])

  // Handle invoice download
  const handleDownloadInvoice = async (orderId: number) => {
    setDownloadingInvoice(orderId)

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

      // Mark download success
      setInvoices(prevInvoices =>
        prevInvoices.map(invoice =>
          invoice.id_order === orderId
            ? { ...invoice, hasDownloadFailed: false }
            : invoice
        )
      )
    } catch {
      // Mark download failure
      setInvoices(prevInvoices =>
        prevInvoices.map(invoice =>
          invoice.id_order === orderId
            ? { ...invoice, hasDownloadFailed: true }
            : invoice
        )
      )

      setError("Erreur lors du téléchargement de la facture")
    } finally {
      setDownloadingInvoice(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#302082]" />
          <p className="mt-4 text-lg font-medium text-[#302082]">
            Chargement des factures...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-3 relative pb-2 inline-block">
          Mes factures
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez et téléchargez toutes vos factures. Les factures sont
          générées automatiquement pour chaque commande.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Une erreur est survenue</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <Card className="mb-8 border-2 border-gray-100 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg font-semibold text-[#302082] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Liste des factures
          </CardTitle>
          <CardDescription>
            Recherchez et téléchargez vos factures
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Invoices table */}
          {filteredInvoices.length > 0 ? (
            <div className="overflow-hidden overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map(invoice => (
                    <TableRow key={invoice.id_order}>
                      <TableCell className="font-medium">
                        #{invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.order_date), "dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>{invoice.total_amount.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Badge
                          className={`
                            ${
                              invoice.order_status === "COMPLETED"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : invoice.order_status === "ACTIVE"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : invoice.order_status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : invoice.order_status === "CANCELLED"
                                      ? "bg-red-100 text-red-600 border-red-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          `}
                        >
                          {invoice.order_status === "COMPLETED"
                            ? "Terminée"
                            : invoice.order_status === "ACTIVE"
                              ? "Active"
                              : invoice.order_status === "PENDING"
                                ? "En attente"
                                : invoice.order_status === "CANCELLED"
                                  ? "Annulée"
                                  : invoice.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1.5 text-gray-400" />
                        {invoice.payment_method}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleDownloadInvoice(invoice.id_order)
                            }
                            disabled={downloadingInvoice === invoice.id_order}
                            className={`${
                              invoice.hasDownloadFailed
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-[#302082] hover:bg-[#302082]/90"
                            }`}
                          >
                            {downloadingInvoice === invoice.id_order ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Téléchargement...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Télécharger
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/account/orders?order=${invoice.id_order}`}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Détails
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Aucune facture trouvée
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm
                  ? `Aucune facture ne correspond à votre recherche "${searchTerm}"`
                  : "Vous n'avez pas encore de factures. Elles apparaîtront ici une fois que vous aurez passé une commande."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ section */}
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg font-semibold text-[#302082]">
            Questions fréquentes sur les factures
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[#302082] mb-1">
                Comment télécharger une facture ?
              </h3>
              <p className="text-sm text-gray-600">
                Cliquez simplement sur le bouton &quot;Télécharger&quot; à côté
                de la facture que vous souhaitez obtenir. La facture sera
                téléchargée au format PDF sur votre appareil.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-[#302082] mb-1">
                Que faire si je ne trouve pas une facture ?
              </h3>
              <p className="text-sm text-gray-600">
                Vérifiez que la commande a bien été finalisée. Si vous ne
                trouvez toujours pas votre facture, n&apos;hésitez pas à
                contacter notre service client qui pourra vous aider.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-[#302082] mb-1">
                Comment modifier les informations de facturation ?
              </h3>
              <p className="text-sm text-gray-600">
                Vous pouvez modifier vos informations de facturation dans la
                section &quot;Adresses&quot; de votre compte. Ces modifications
                seront prises en compte pour vos prochaines commandes.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-[#302082] mb-1">
                Puis-je obtenir une facture au nom de mon entreprise ?
              </h3>
              <p className="text-sm text-gray-600">
                Oui, il vous suffit d&apos;ajouter une adresse de facturation
                avec les coordonnées de votre entreprise et de la sélectionner
                lors de votre commande.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
