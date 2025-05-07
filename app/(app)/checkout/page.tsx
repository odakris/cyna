// app/checkout/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCheckout } from "@/hooks/order/use-checkout"
import { AlertTriangle, ArrowLeft } from "lucide-react"

// Components
import { GuestEmailForm } from "@/components/Checkout/GuestEmailForm"
import { CheckoutAddress } from "@/components/Checkout/CheckoutAddress"
import { CheckoutPayment } from "@/components/Checkout/CheckoutPayment"
import { CheckoutReview } from "@/components/Checkout/CheckoutReview"
import { CartSummary } from "@/components/Checkout/CartSummary"
import { EmptyCart } from "@/components/Checkout/EmptyCart"
import { LoadingState } from "@/components/Checkout/LoadingState"

// Stripe configuration - Version corrigée
// La clé doit commencer par pk_test_ ou pk_live_ selon l'environnement
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

function CheckoutContent() {
  const router = useRouter()
  const [stripeError, setStripeError] = useState<string | null>(null)

  // Vérifier si Stripe est correctement initialisé
  useEffect(() => {
    if (!stripePromise) {
      setStripeError(
        "La configuration Stripe est manquante ou incorrecte. Veuillez contacter l'administrateur."
      )
    }
  }, [])

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
    error,
    newAddress,
    setNewAddress,
    newPayment,
    setNewPayment,
    cart,
    totalCartPrice,
    taxes,
    finalTotal,
    handleSaveNewAddress,
    handleSaveNewPayment,
    handleProceedToPayment,
  } = useCheckout()

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
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    )
  }

  // If cart is empty, redirect to cart page
  if (cart.length === 0 && !loading) {
    return <EmptyCart />
  }

  // Loading state
  if (loading) {
    return <LoadingState message="Chargement de votre commande..." />
  }

  // Main checkout component
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] relative pb-2 inline-block">
          Finaliser votre commande
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <Button
          asChild
          variant="outline"
          className="border-[#302082] text-[#302082] hover:bg-[#302082]/5"
        >
          <Link href="/panier">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au panier
          </Link>
        </Button>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main checkout form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest section or auth components */}
          {isGuest && (
            <GuestEmailForm
              guestEmail={guestEmail}
              setGuestEmail={setGuestEmail}
            />
          )}

          {/* Checkout steps */}
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

            {/* Address tab */}
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

            {/* Payment tab */}
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

            {/* Review tab */}
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart summary */}
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
              Le système de paiement n&apos;est pas correctement configuré.
              Veuillez vérifier la configuration Stripe.
            </p>
          </div>
        </div>
        <Button asChild className="mt-4 bg-[#302082] hover:bg-[#302082]/90">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
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
