"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCheckout } from "@/hooks/order/use-checkout"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { PDFDocument, rgb } from "pdf-lib"

// Components
import { GuestEmailForm } from "@/components/Checkout/GuestEmailForm"
import { CheckoutAddress } from "@/components/Checkout/CheckoutAddress"
import { CheckoutPayment } from "@/components/Checkout/CheckoutPayment"
import { CheckoutReview } from "@/components/Checkout/CheckoutReview"
import { CartSummary } from "@/components/Checkout/CartSummary"
import { EmptyCart } from "@/components/Checkout/EmptyCart"
import { LoadingState } from "@/components/Checkout/LoadingState"

// Stripe configuration
const stripeKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  ""

console.log("Stripe Public Key:", stripeKey)

// Vérification de la clé en mode développement
if (process.env.NODE_ENV === "development" && !stripeKey) {
  console.warn(
    "Avertissement: Clé Stripe manquante. Vérifiez votre fichier .env"
  )
}

// Initialisation de Stripe avec des vérifications supplémentaires
const stripePromise =
  stripeKey && stripeKey.startsWith("pk_") ? loadStripe(stripeKey) : null

interface Address {
  id_address: string
  first_name: string
  last_name: string
  address1: string
  address2?: string
  postal_code: string
  city: string
  country: string
  mobile_phone: string
  email?: string
  user_id?: number
}

interface PaymentInfo {
  id_payment_info: string
  card_name: string
  last_card_digits: string
  stripe_payment_id?: string
}

// Base URL pour les appels API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Fonction pour déchiffrer l'adresse
async function decryptAddress(address: Address, userId?: number, isGuest: boolean = false): Promise<Address> {
  console.log("[Checkout] Vérification du déchiffrement de l'adresse:", { address });

  // Vérifier si l'adresse est chiffrée
  const isEncrypted = address.first_name.includes(":") || address.address1.includes(":");
  if (!isEncrypted) {
    console.log("[Checkout] Adresse déjà déchiffrée");
    return address;
  }

  console.log("[Checkout] Début du déchiffrement de l'adresse");
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (userId && !isGuest) {
      headers["x-user-id"] = userId.toString();
    }

    const decryptRoute = isGuest ? '/api/crypt/guest/decrypt' : '/api/crypt/user/decrypt';
    const response = await fetch(`${API_BASE_URL}${decryptRoute}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        addresses: [{ ...address, id_address: address.id_address || `order_${Date.now()}` }],
        payments: [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Checkout] Échec du déchiffrement:", { status: response.status, errorText });
      throw new Error(`Échec du déchiffrement: ${errorText}`);
    }

    const { addresses: decryptedAddresses } = await response.json();
    const decryptedAddress = decryptedAddresses[0];

    if (!decryptedAddress) {
      throw new Error("Aucune adresse déchiffrée retournée");
    }

    console.log("[Checkout] Adresse déchiffrée:", decryptedAddress);
    return {
      id_address: decryptedAddress.id_address,
      first_name: decryptedAddress.first_name,
      last_name: decryptedAddress.last_name,
      address1: decryptedAddress.address1,
      address2: decryptedAddress.address2,
      postal_code: decryptedAddress.postal_code,
      city: decryptedAddress.city,
      country: decryptedAddress.country,
      mobile_phone: decryptedAddress.mobile_phone,
      email: decryptedAddress.email,
      user_id: decryptedAddress.user_id,
    };
  } catch (err) {
    console.error("[Checkout] Erreur lors du déchiffrement:", {
      message: err instanceof Error ? err.message : "Erreur inconnue",
      stack: err instanceof Error ? err.stack : undefined,
    });
    // Retourner une adresse de secours pour éviter de casser le PDF
    return {
      ...address,
      first_name: '[Déchiffrement échoué]',
      last_name: '[Déchiffrement échoué]',
      address1: '[Déchiffrement échoué]',
      postal_code: '[Déchiffrement échoué]',
      city: '[Déchiffrement échoué]',
      country: '[Déchiffrement échoué]',
      mobile_phone: '[Déchiffrement échoué]',
    };
  }
}

function CheckoutContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkoutHook = useCheckout()
  const {
    isGuest,
    guestEmail,
    setGuestEmail,
    addresses,
    paymentInfos,
    selectedAddress,
    setSelectedAddress,
    selectedPayment,
    setSelectedPayment,
    activeTab,
    setActiveTab,
    loading,
    processingPayment,
    setProcessingPayment,
    newAddress,
    setNewAddress,
    newPayment,
    setNewPayment,
    cart,
    setCart,
    totalCartPrice,
    taxes,
    finalTotal,
    handleSaveNewAddress,
    handleSaveNewPayment,
  } = checkoutHook

  // Log immédiat des valeurs retournées par useCheckout pour débogage
  useEffect(() => {
    console.log('[Checkout] Valeurs retournées par useCheckout:', {
      checkoutHookKeys: Object.keys(checkoutHook),
      setProcessingPaymentType: typeof setProcessingPayment,
      isGuest,
      guestEmail,
      addressesCount: addresses.length,
      paymentInfosCount: paymentInfos.length,
      selectedAddressId: selectedAddress?.id_address,
      selectedPaymentId: selectedPayment?.id_payment_info,
      loading,
      processingPayment,
    })
  }, [checkoutHook])

  // Log des valeurs pour débogage
  useEffect(() => {
    console.log('[Checkout] État initial:', {
      loading,
      selectedAddress,
      selectedPayment,
      addressesCount: addresses.length,
      paymentInfosCount: paymentInfos.length,
      isGuest,
      guestEmail,
      sessionUserId: session?.user?.id_user,
      setProcessingPaymentType: typeof setProcessingPayment,
    })
    if (!loading && addresses.length > 0 && !selectedAddress) {
      console.warn('[Checkout] Aucune adresse sélectionnée malgré des adresses disponibles:', addresses)
    }
    if (!loading && paymentInfos.length > 0 && !selectedPayment) {
      console.warn('[Checkout] Aucun paiement sélectionné malgré des paiements disponibles:', paymentInfos)
    }
  }, [
    loading,
    addresses,
    paymentInfos,
    selectedAddress,
    selectedPayment,
    isGuest,
    guestEmail,
    session,
    setProcessingPayment,
  ])

  // Vérifier si Stripe est correctement initialisé
  useEffect(() => {
    if (!stripePromise) {
      setStripeError(
        "La configuration Stripe est manquante ou incorrecte. Veuillez contacter l'administrateur."
      )
    }
  }, [])

  const decryptGuestData = async (addressId: string, paymentId: string) => {
    console.log('[Checkout] Début du déchiffrement des données invité', { addressId, paymentId })
    try {
      const guestAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]')
      const guestPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]')

      console.log('[Checkout] guestAddresses:', guestAddresses)
      console.log('[Checkout] guestPaymentInfos:', guestPayments)

      const decryptResponse = await fetch(`${API_BASE_URL}/api/crypt/guest/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: guestAddresses, payments: guestPayments }),
      })

      if (!decryptResponse.ok) {
        const errorText = await decryptResponse.text()
        console.error('[Checkout] Échec du déchiffrement:', { status: decryptResponse.status, errorText })
        throw new Error(`Échec du déchiffrement des données invité: ${errorText}`)
      }

      const { addresses: decryptedAddresses, payments: decryptedPayments } = await decryptResponse.json()
      console.log('[Checkout] Données déchiffrées:', { decryptedAddresses, decryptedPayments })

      const addressData = decryptedAddresses.find((addr: Address) => addr.id_address === addressId)
      const paymentData = decryptedPayments.find((pay: PaymentInfo) => pay.id_payment_info === paymentId)

      console.log('[Checkout] Données invité trouvées:', { addressData, paymentData })

      if (!addressData) {
        throw new Error('Adresse introuvable dans les données déchiffrées')
      }
      if (!paymentData) {
        throw new Error(`Moyen de paiement introuvable pour paymentId: ${paymentId}`)
      }

      if (addressData.first_name.includes(':')) {
        console.warn('[Checkout] first_name non déchiffré:', addressData.first_name)
      }
      if (paymentData.card_name.includes(':')) {
        console.warn('[Checkout] card_name non déchiffré:', paymentData.card_name)
      }

      return { addressData, paymentData }
    } catch (err) {
      console.error('[Checkout] Erreur lors du déchiffrement:', {
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        stack: err instanceof Error ? err.stack : undefined,
      })
      throw err
    }
  }

  const handleProceedToPayment = async () => {
    console.log('[Checkout] handleProceedToPayment appelé', {
      processingPayment,
      setProcessingPaymentType: typeof setProcessingPayment,
      selectedAddressId: selectedAddress?.id_address,
      selectedPaymentId: selectedPayment?.id_payment_info,
      checkoutHookKeys: Object.keys(checkoutHook),
    })

    if (processingPayment) {
      console.log('[Checkout] Paiement déjà en cours, ignoré')
      return
    }

    if (typeof setProcessingPayment !== 'function') {
      console.error('[Checkout] setProcessingPayment n’est pas une fonction', {
        setProcessingPayment,
        checkoutHookKeys: Object.keys(checkoutHook),
      })
      setError('Erreur interne: impossible de traiter le paiement')
      return
    }

    setProcessingPayment(true)
    console.log('[Checkout] État avant vérification:', {
      selectedAddress,
      selectedPayment,
      hasIdAddress: !!selectedAddress?.id_address,
      hasIdPaymentInfo: !!selectedPayment?.id_payment_info,
    })

    if (!selectedAddress?.id_address || !selectedPayment?.id_payment_info) {
      setError('Veuillez sélectionner une adresse et un moyen de paiement')
      console.error('[Checkout] Validation échouée:', {
        id_address: selectedAddress?.id_address,
        id_payment_info: selectedPayment?.id_payment_info,
      })
      setProcessingPayment(false)
      return
    }

    console.log('[Checkout] Début de handleProceedToPayment', {
      totalCartPrice,
      taxes,
      addressId: selectedAddress.id_address,
      paymentId: selectedPayment.id_payment_info,
    })

    try {
      let addressData = selectedAddress
      let paymentData = selectedPayment

      // Déchiffrer les données selon le type d'utilisateur
      if (isGuest) {
        console.log('[Checkout] Mode invité, lancement du déchiffrement')
        const decrypted = await decryptGuestData(selectedAddress.id_address, selectedPayment.id_payment_info)
        addressData = decrypted.addressData
        paymentData = decrypted.paymentData
      } else {
        console.log('[Checkout] Mode utilisateur connecté, lancement du déchiffrement')
        addressData = await decryptAddress(selectedAddress, session?.user?.id_user, false)
      }

      const userId = isGuest ? localStorage.getItem('guestUserId') : session?.user?.id_user
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (!isGuest && userId) {
        headers['x-user-id'] = userId.toString()
        console.log('[Checkout] Envoi de x-user-id:', userId)
      } else if (isGuest && localStorage.getItem('guestUserId')) {
        headers['x-guest-id'] = localStorage.getItem('guestUserId')!
        console.log('[Checkout] Envoi de x-guest-id:', localStorage.getItem('guestUserId'))
      } else {
        throw new Error('Aucun ID utilisateur ou invité disponible')
      }

      const validSubscriptions = ['MONTHLY', 'YEARLY', 'PER_USER', 'PER_MACHINE']
      const formattedCartItems = cart.map(item => ({
        ...item,
        subscription_type: validSubscriptions.includes(item.subscription || 'MONTHLY')
          ? item.subscription || 'MONTHLY'
          : 'MONTHLY',
      }))

      console.log('[Checkout] Envoi à /api/checkout', {
        cartItems: formattedCartItems,
        addressId: selectedAddress.id_address,
        paymentId: selectedPayment.id_payment_info,
        totalAmount: totalCartPrice,
        taxes,
      })

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cartItems: formattedCartItems,
          addressId: selectedAddress.id_address,
          paymentId: selectedPayment.id_payment_info,
          totalAmount: totalCartPrice,
          taxes,
        }),
      })

      console.log('[Checkout] /api/checkout response:', {
        status: response.status,
        statusText: response.statusText,
      })

      if (!response.ok) {
        let errorMessage = `Erreur serveur: ${response.statusText}`
        try {
          const errorData = await response.json()
          console.error('[Checkout] Détails de l’erreur serveur:', errorData)
          errorMessage = errorData.message || errorData.error || response.statusText
        } catch (jsonError) {
          console.error('[Checkout] Impossible de parser la réponse:', jsonError)
          if (response.status === 405) {
            errorMessage = 'Méthode non autorisée. Veuillez réessayer ou contacter le support.'
          }
        }
        throw new Error(`Échec de l’initialisation du paiement: ${errorMessage}`)
      }

      const data = await response.json()
      console.log('[Checkout] Données reçues de /api/checkout:', data)

      if (!data.orderId || !data.status) {
        console.error('[Checkout] orderId ou status manquant dans la réponse:', data)
        throw new Error('Réponse du serveur invalide')
      }

      console.log('[Checkout] orderId défini:', data.orderId)

      if (data.status === 'succeeded') {
        console.log('[Checkout] Paiement réussi, finalisation:', { orderId: data.orderId })
        await finalizeOrder(data.orderId, addressData)
      } else {
        console.error('[Checkout] Statut de paiement inattendu:', data.status)
        throw new Error(`Statut de paiement inattendu: ${data.status}`)
      }
    } catch (err) {
      console.error('[Checkout] Erreur dans handleProceedToPayment:', {
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        stack: err instanceof Error ? err.stack : undefined,
      })
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      console.log('[Checkout] Fin de handleProceedToPayment, mise à jour processingPayment à false')
      setProcessingPayment(false)
    }
  }

  const finalizeOrder = async (orderId: string, address: Address) => {
    console.log('[Checkout] Début de finalizeOrder:', { orderId })
    try {
      console.log('[Checkout] Adresse utilisée pour la facture:', address)

      console.log('[Checkout] Génération du PDF de la facture pour la commande:', orderId)
      await generateInvoicePDF({ id_order: orderId, total_amount: finalTotal }, address)

      setCart([])
      if (isGuest) {
        console.log('[Checkout] Suppression des données invité de localStorage')
        localStorage.removeItem('guestCheckout')
        localStorage.removeItem('guestUserId')
        localStorage.removeItem('guestEmail')
        localStorage.removeItem('guestAddresses')
        localStorage.removeItem('guestPaymentInfos')
      }

      const targetUrl = `/checkout/success?orderId=${orderId}`
      console.log('[Checkout] Redirection vers:', { targetUrl, orderId })
      router.push(targetUrl)
    } catch (err) {
      console.error('[Checkout] Erreur dans finalizeOrder:', {
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        stack: err instanceof Error ? err.stack : undefined,
      })
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la finalisation')
    }
  }

  const generateInvoicePDF = async (order: any, address: Address) => {
    console.log('[Checkout] Début de generateInvoicePDF', { orderId: order.id_order })
    if (!address) {
      console.error('[Checkout] Adresse manquante pour générer le PDF')
      setError('Adresse manquante pour la génération de la facture')
      return
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    const { height } = page.getSize()
    const fontSize = 12

    page.drawText('Facture', {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Numéro de commande: ${order.id_order}`, {
      x: 50,
      y: height - 80,
      size: fontSize,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 100,
      size: fontSize,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Client: ${isGuest ? guestEmail : address.email || 'Inconnu'}`, {
      x: 50,
      y: height - 120,
      size: fontSize,
      color: rgb(0, 0, 0),
    })

    page.drawText('Articles:', {
      x: 50,
      y: height - 160,
      size: fontSize,
      color: rgb(0, 0, 0),
    })

    let y = height - 180
    cart.forEach((item) => {
      const itemTotal = item.price * (item.subscription === 'YEARLY' ? 12 : 1) * item.quantity
      page.drawText(
        `${item.name} (x${item.quantity}, ${item.subscription || 'MONTHLY'}): ${itemTotal.toFixed(2)} €`,
        {
          x: 50,
          y,
          size: fontSize,
          color: rgb(0, 0, 0),
        }
      )
      y -= 20
    })

    page.drawText(`Sous-total: ${totalCartPrice.toFixed(2)} €`, {
      x: 50,
      y: y - 20,
      size: fontSize,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Taxes (20%): ${taxes.toFixed(2)} €`, {
      x: 50,
      y: y - 40,
      size: fontSize,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Total: ${finalTotal.toFixed(2)} €`, {
      x: 50,
      y: y - 60,
      size: fontSize,
      color: rgb(0, 0, 0),
    })

    page.drawText('Adresse de facturation:', {
      x: 50,
      y: y - 100,
      size: fontSize,
      color: rgb(0, 0, 0),
    })
    page.drawText(`${address.first_name} ${address.last_name}`, {
      x: 50,
      y: y - 120,
      size: fontSize,
      color: rgb(0, 0, 0),
    })
    page.drawText(address.address1, {
      x: 50,
      y: y - 140,
      size: fontSize,
      color: rgb(0, 0, 0),
    })

    let addressY = y - 160
    if (address.address2) {
      page.drawText(address.address2, {
        x: 50,
        y: addressY,
        size: fontSize,
        color: rgb(0, 0, 0),
      })
      addressY -= 20
    }

    page.drawText(`${address.postal_code} ${address.city}, ${address.country}`, {
      x: 50,
      y: addressY,
      size: fontSize,
      color: rgb(0, 0, 0),
    })

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    setInvoiceUrl(url)
    console.log('[Checkout] PDF généré:', { invoiceUrl: url })
    return url
  }

  // Si la clé Stripe est manquante, afficher un message d'erreur
  if (stripeError) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erreur de configuration</p>
            <p>{stripeError}</p>
          </div>
        </div>
        <Button asChild className="bg-[#302082] hover:bg-[#302082]/90">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    )
  }

  // Si le panier est vide, rediriger vers la page du panier
  if (cart.length === 0 && !loading) {
    return <EmptyCart />
  }

  // État de chargement
  if (loading) {
    return <LoadingState message="Chargement de votre commande..." />
  }

  // Composant principal de checkout
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#302082] relative pb-2">
          Finaliser votre commande
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto border-[#302082] text-[#302082] hover:bg-[#302082]/5"
        >
          <Link href="/panier">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au panier
          </Link>
        </Button>
      </div>

      {/* Message d'erreur si présent */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal de checkout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section invité ou composants d'authentification */}
          {isGuest && (
            <GuestEmailForm
              guestEmail={guestEmail}
              setGuestEmail={setGuestEmail}
            />
          )}

          {/* Étapes du checkout */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 h-14 rounded-lg mb-4 bg-gray-100 p-1">
              <TabsTrigger
                value="address"
                className="rounded-md data-[state=active]:bg-[#302082] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex flex-col py-1 h-full"
                disabled={processingPayment}
              >
                <span className="text-xs mb-0.5">Étape 1</span>
                <span className="font-medium">Adresse</span>
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="rounded-md data-[state=active]:bg-[#302082] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex flex-col py-1 h-full"
                disabled={!selectedAddress || processingPayment}
              >
                <span className="text-xs mb-0.5">Étape 2</span>
                <span className="font-medium">Paiement</span>
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="rounded-md data-[state=active]:bg-[#302082] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex flex-col py-1 h-full"
                disabled={
                  !selectedAddress || !selectedPayment || processingPayment
                }
              >
                <span className="text-xs mb-0.5">Étape 3</span>
                <span className="font-medium">Validation</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Adresse */}
            <TabsContent value="address" className="mt-2 space-y-6">
              <CheckoutAddress
                addresses={addresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                newAddress={newAddress}
                setNewAddress={setNewAddress}
                handleSaveNewAddress={handleSaveNewAddress}
                onBack={() => router.push("/panier")}
                onNext={() => setActiveTab("payment")}
                loading={processingPayment}
                error={error}
              />
            </TabsContent>

            {/* Onglet Paiement */}
            <TabsContent value="payment" className="mt-2 space-y-6">
              <CheckoutPayment
                paymentInfos={paymentInfos}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                newPayment={newPayment}
                setNewPayment={setNewPayment}
                handleSaveNewPayment={handleSaveNewPayment}
                onBack={() => setActiveTab("address")}
                onNext={() => setActiveTab("review")}
                loading={processingPayment}
                error={error}
              />
            </TabsContent>

            {/* Onglet Validation */}
            <TabsContent value="review" className="mt-2 space-y-6">
              <CheckoutReview
                addresses={addresses}
                selectedAddress={selectedAddress}
                paymentInfos={paymentInfos}
                selectedPayment={selectedPayment}
                cart={cart}
                totalCartPrice={totalCartPrice}
                taxes={taxes}
                finalTotal={finalTotal}
                onBack={() => setActiveTab("payment")}
                handleProceedToPayment={handleProceedToPayment}
                processingPayment={processingPayment}
                error={error}
              />
              {invoiceUrl && (
                <Button asChild className="mt-4">
                  <a href={invoiceUrl} download={`facture-${Date.now()}.pdf`}>
                    Télécharger la facture
                  </a>
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Résumé du panier */}
        <div className="lg:col-span-1 space-y-6">
          <CartSummary
            cart={cart}
            totalCartPrice={totalCartPrice}
            taxes={taxes}
            finalTotal={finalTotal}
          />
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  // Afficher un message si Stripe n'est pas initialisé
  if (!stripePromise) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Configuration incomplète</p>
            <p>
              Le système de paiement n'est pas correctement configuré.
              Veuillez vérifier la configuration Stripe.
            </p>
          </div>
        </div>
        <Button asChild className="mt-4 bg-[#302082] hover:bg-[#302082]/90">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  )
}