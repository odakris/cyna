"use client"

import React, { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/hooks/product/use-product"
import { useCart, CartItem } from "@/context/CartContext"
import { TopProducts } from "@/components/Products/TopProducts"
import { formatEuro } from "@/lib/utils/format"
import { ProductCarousel } from "@/components/Products/ProductCarousel"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  AlertTriangle,
  Shield,
  Award,
  Clock,
  Zap,
  Info,
  Star,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductPage() {
  const { id } = useParams()
  const { product, loading, error } = useProduct(id)
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [quantity, setQuantity] = useState<number>(1)
  const [selectedSubscription, setSelectedSubscription] =
    useState<string>("MONTHLY")
  const [animate, setAnimate] = useState(false)
  const pricingTableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Trigger animation after initial render
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Si le hash de l'URL contient pricing, on scrolle vers la section de tarification
  useEffect(() => {
    if (window.location.hash === "#pricing" && pricingTableRef.current) {
      pricingTableRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [product])

  if (error) {
    return (
      <div className="w-full p-6 sm:p-8 mx-auto max-w-4xl">
        <div className="rounded-lg bg-red-50 p-6 text-red-600 border border-red-200 shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Erreur lors du chargement
            </h3>
            <p className="text-sm font-medium">
              {error ??
                "Erreur lors du chargement du produit. Veuillez réessayer ultérieurement."}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8 animate-pulse">
        {/* Navigation */}
        <Skeleton className="w-48 h-5 mb-6" />

        {/* En-tête */}
        <div className="space-y-4 mb-8">
          <Skeleton className="w-3/4 sm:w-2/3 h-8 sm:h-12 mx-auto" />
          <Skeleton className="w-32 h-6 mx-auto" />
        </div>

        {/* Image et détails */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="w-full h-[300px] sm:h-[400px] rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-3/4 h-10" />
          </div>
        </div>

        {/* Détails techniques */}
        <div className="mt-12">
          <Skeleton className="w-48 h-7 mb-4" />
          <Skeleton className="w-full h-40 rounded-lg" />
        </div>
      </div>
    )
  }

  // Vérification que le produit existe et est actif
  if (!product || !product.active) {
    return (
      <div className="w-full p-6 sm:p-8 mx-auto max-w-4xl">
        <div className="rounded-lg bg-amber-50 p-6 text-amber-700 border border-amber-200 shadow-sm flex items-start gap-3">
          <Info className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Produit non disponible
            </h3>
            <p className="text-sm font-medium">
              Le produit que vous recherchez n&apos;existe pas ou n&apos;est
              plus disponible.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Link href="/produit">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voir nos produits disponibles
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Prix selon le type d'abonnement
  const prixMensuel = 49.99
  const prixAnnuel = 499.9
  const prixUnitaire = product.unit_price
  const prixParAppareil = 19.99

  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = (subscriptionType: string = selectedSubscription) => {
    if (!product || !product.available) return

    const normalizedSubscription = subscriptionType.toUpperCase()
    const price =
      normalizedSubscription === "MONTHLY"
        ? prixMensuel
        : normalizedSubscription === "YEARLY"
          ? prixAnnuel
          : normalizedSubscription === "PER_MACHINE"
            ? prixParAppareil
            : prixUnitaire

    const cartItem: CartItem = {
      id: product.id_product.toString(),
      name: product.name,
      price: price,
      quantity: quantity,
      subscription: normalizedSubscription,
      uniqueId: `${product.id_product}-${normalizedSubscription}-${Date.now()}`,
      imageUrl: product.product_caroussel_images?.[0]?.url || undefined,
    }

    addToCart(cartItem)

    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} × ${product.name} (${subscriptionType.toLowerCase().replace("_", " ")})`,
      variant: "success",
      action: (
        <Button
          asChild
          variant="outline"
          className="border-[#302082] text-[#302082]"
        >
          <Link href="/panier">Voir le panier</Link>
        </Button>
      ),
    })

    setQuantity(1)
  }

  const handleScrollToPricingTable = () => {
    pricingTableRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      className={`container mx-auto transition-all duration-700 ${animate ? "opacity-100" : "opacity-0"}`}
    >
      {/* Navigation breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#302082] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link
          href="/produit"
          className="hover:text-[#302082] transition-colors"
        >
          Produits
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      {/* En-tête du produit */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#302082] mb-3 relative pb-2 inline-block mx-auto">
          {product.name}
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>

        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="inline-block bg-[#302082]/10 text-[#302082] px-3 py-1 rounded-full text-sm font-medium">
            Solution SaaS • Cybersécurité
          </div>

          {product.available ? (
            <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1 font-medium">
              <Check className="mr-1 h-3.5 w-3.5" /> Disponible immédiatement
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1 font-medium">
              <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Service
              indisponible
            </Badge>
          )}
        </div>
      </div>

      {/* Grid de contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        {/* Images du produit - occupe 3/5 de l'espace */}
        <div className="lg:col-span-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-hidden h-full flex items-center">
          <ProductCarousel
            images={product.product_caroussel_images}
            mainImage={product.main_image}
          />
        </div>

        {/* Partie prix et CTA - occupe 2/5 de l'espace et s'aligne verticalement avec le carousel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#302082] to-[#231968] rounded-xl p-6 shadow-lg text-white h-full flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row lg:flex-col gap-6 justify-between mb-6">
            <div>
              <div className="text-white/80 text-sm">Prix à partir de</div>
              <div className="text-3xl font-bold">
                {formatEuro(prixUnitaire)}
              </div>
              <div className="text-white/80 text-sm">
                + abonnement mensuel ou annuel
              </div>
            </div>
            {product.available && (
              <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
                <div className="flex items-center gap-1 text-white/90">
                  <Star className="h-4 w-4 text-[#FF6B00]" />
                  <Star className="h-4 w-4 text-[#FF6B00]" />
                  <Star className="h-4 w-4 text-[#FF6B00]" />
                  <Star className="h-4 w-4 text-[#FF6B00]" />
                  <Star className="h-4 w-4 text-white/30" />
                </div>
                <div className="text-xs text-white/70 mt-1">
                  96 avis clients
                </div>
              </div>
            )}
          </div>
          {product.available ? (
            <Button
              className="w-ful border-2 border-transparent hover:border-[#FF6B00] transition-colors duration-300 h-12 text-lg font-semibold"
              onClick={handleScrollToPricingTable}
              variant={"cyna"}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Choisir une formule
            </Button>
          ) : (
            <Button
              className="w-full bg-white/20 text-white cursor-not-allowed h-12 text-lg font-semibold"
              disabled
            >
              SERVICE INDISPONIBLE
            </Button>
          )}
          <div className="mt-4 text-center text-white/80 text-sm">
            Déploiement rapide • Support réactif • Satisfaction garantie
          </div>
        </div>

        {/* Description - occupe toute la largeur */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#302082] mb-4 relative pb-2 inline-block">
            Description
            <span className="absolute bottom-0 left-0 w-24 h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Points forts - disposés en ligne pour optimiser l'espace */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#302082] mb-4 relative pb-2 inline-block">
            Points forts
            <span className="absolute bottom-0 left-0 w-24 h-1 bg-[#302082] rounded"></span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-[#302082]/10 rounded-full mb-3">
                <Shield className="h-6 w-6 text-[#302082]" />
              </div>
              <span className="font-medium text-gray-800">
                Protection complète
              </span>
            </div>
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-[#302082]/10 rounded-full mb-3">
                <Award className="h-6 w-6 text-[#302082]" />
              </div>
              <span className="font-medium text-gray-800">
                Certifié ISO 27001
              </span>
            </div>
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-[#302082]/10 rounded-full mb-3">
                <Clock className="h-6 w-6 text-[#302082]" />
              </div>
              <span className="font-medium text-gray-800">Support 24/7</span>
            </div>
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-[#302082]/10 rounded-full mb-3">
                <Zap className="h-6 w-6 text-[#302082]" />
              </div>
              <span className="font-medium text-gray-800">
                Mises à jour régulières
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets d'information détaillée */}
      <div className="mb-16">
        <Tabs defaultValue="specifications">
          <TabsList className="w-full border-b border-gray-200 bg-transparent h-auto p-0 mb-6">
            <div className="flex overflow-x-auto hide-scrollbar">
              <TabsTrigger
                value="specifications"
                className="py-3 px-5 border-b-2 border-transparent data-[state=active]:border-[#302082] data-[state=active]:text-[#302082] font-medium rounded-none"
              >
                Caractéristiques techniques
              </TabsTrigger>
              <TabsTrigger
                value="requirements"
                className="py-3 px-5 border-b-2 border-transparent data-[state=active]:border-[#302082] data-[state=active]:text-[#302082] font-medium rounded-none"
              >
                Prérequis système
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className="py-3 px-5 border-b-2 border-transparent data-[state=active]:border-[#302082] data-[state=active]:text-[#302082] font-medium rounded-none"
              >
                FAQ
              </TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="specifications" className="p-0 mt-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#302082] mb-4">
                Caractéristiques détaillées
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.technical_specs || (
                  <p>
                    Aucune caractéristique technique disponible pour ce produit.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="p-0 mt-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#302082] mb-4">
                Prérequis système
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  Système d&apos;exploitation: Windows 10/11, macOS 10.15+,
                  Linux
                </li>
                <li>Navigateur web récent: Chrome, Firefox, Edge, Safari</li>
                <li>Connexion Internet: Min. 10 Mbps</li>
                <li>Espace disque: 500 Mo minimum</li>
                <li>RAM: 4 Go minimum (8 Go recommandé)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="p-0 mt-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#302082] mb-4">
                Questions fréquentes
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#302082]">
                    Combien de temps dure l&apos;installation ?
                  </h4>
                  <p className="text-gray-700 mt-1">
                    L&apos;installation est rapide et prend généralement moins
                    de 15 minutes selon votre environnement.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#302082]">
                    Est-ce que je peux changer de formule ?
                  </h4>
                  <p className="text-gray-700 mt-1">
                    Oui, vous pouvez changer de formule à tout moment. Le
                    changement sera effectif à la prochaine période de
                    facturation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#302082]">
                    Comment fonctionne le support ?
                  </h4>
                  <p className="text-gray-700 mt-1">
                    Notre support est disponible 24/7 par chat, email et
                    téléphone pour tous les clients avec un abonnement actif.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Table de tarification */}
      {product.available && (
        <div
          id="pricing"
          ref={pricingTableRef}
          className="bg-white rounded-xl p-8 shadow-md border border-gray-100 mb-16 scroll-mt-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-3 relative pb-2 inline-block">
              Choisir votre formule d&apos;abonnement
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sélectionnez l&apos;offre qui correspond le mieux à vos besoins et
              bénéficiez d&apos;une sécurité optimale
            </p>
          </div>

          {/* Pricing Cards - Desktop */}
          <div className="hidden lg:grid grid-cols-4 gap-4 mb-8">
            {/* Card 1 - Mensuel */}
            <div
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                selectedSubscription === "MONTHLY"
                  ? "border-[#302082] shadow-lg scale-[1.02] bg-[#302082]/5"
                  : "border-gray-200 hover:border-[#302082]/50 hover:shadow-md"
              }`}
            >
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#302082]">
                  Abonnement Mensuel
                </h3>
                <div className="text-sm text-gray-500">
                  Flexibilité maximale
                </div>
                <div className="flex items-end gap-1 my-4">
                  <span className="text-3xl font-bold text-[#302082]">
                    {formatEuro(prixMensuel)}
                  </span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Installation incluse
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Support standard
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Mises à jour incluses
                    </span>
                  </div>
                </div>
                <Button
                  className={`w-full ${
                    selectedSubscription === "MONTHLY"
                      ? "bg-[#302082] hover:bg-[#302082]/90 text-white"
                      : "bg-white text-[#302082] border border-[#302082] hover:bg-[#302082] hover:text-white"
                  }`}
                  onClick={() => setSelectedSubscription("MONTHLY")}
                >
                  {selectedSubscription === "MONTHLY"
                    ? "Sélectionné"
                    : "Sélectionner"}
                </Button>
              </div>
            </div>

            {/* Card 2 - Annuel */}
            <div
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                selectedSubscription === "YEARLY"
                  ? "border-[#302082] shadow-lg scale-[1.02] bg-[#302082]/5"
                  : "border-gray-200 hover:border-[#302082]/50 hover:shadow-md"
              }`}
            >
              <div className="absolute right-0 top-0 bg-[#FF6B00] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                RECOMMANDÉ
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#302082]">
                  Abonnement Annuel
                </h3>
                <div className="text-sm text-gray-500">Économisez 17%</div>
                <div className="flex items-end gap-1 my-4">
                  <span className="text-3xl font-bold text-[#302082]">
                    {formatEuro(prixAnnuel / 12)}
                  </span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Installation incluse
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Support prioritaire
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Mises à jour incluses
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      2 mois offerts
                    </span>
                  </div>
                </div>
                <Button
                  className={`w-full ${
                    selectedSubscription === "YEARLY"
                      ? "bg-[#302082] hover:bg-[#302082]/90 text-white"
                      : "bg-white text-[#302082] border border-[#302082] hover:bg-[#302082] hover:text-white"
                  }`}
                  onClick={() => setSelectedSubscription("YEARLY")}
                >
                  {selectedSubscription === "YEARLY"
                    ? "Sélectionné"
                    : "Sélectionner"}
                </Button>
              </div>
            </div>

            {/* Card 3 - Par utilisateur */}
            <div
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                selectedSubscription === "PER_USER"
                  ? "border-[#302082] shadow-lg scale-[1.02] bg-[#302082]/5"
                  : "border-gray-200 hover:border-[#302082]/50 hover:shadow-md"
              }`}
            >
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#302082]">
                  Par utilisateur
                </h3>
                <div className="text-sm text-gray-500">
                  Pour équipes variables
                </div>
                <div className="flex items-end gap-1 my-4">
                  <span className="text-3xl font-bold text-[#302082]">
                    {formatEuro(prixParAppareil)}
                  </span>
                  <span className="text-gray-500">/utilisateur</span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Facturation flexible
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Support standard
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Mises à jour incluses
                    </span>
                  </div>
                </div>
                <Button
                  className={`w-full ${
                    selectedSubscription === "PER_USER"
                      ? "bg-[#302082] hover:bg-[#302082]/90 text-white"
                      : "bg-white text-[#302082] border border-[#302082] hover:bg-[#302082] hover:text-white"
                  }`}
                  onClick={() => setSelectedSubscription("PER_USER")}
                >
                  {selectedSubscription === "PER_USER"
                    ? "Sélectionné"
                    : "Sélectionner"}
                </Button>
              </div>
            </div>

            {/* Card 4 - Par appareil */}
            <div
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                selectedSubscription === "PER_MACHINE"
                  ? "border-[#302082] shadow-lg scale-[1.02] bg-[#302082]/5"
                  : "border-gray-200 hover:border-[#302082]/50 hover:shadow-md"
              }`}
            >
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#302082]">
                  Par appareil
                </h3>
                <div className="text-sm text-gray-500">
                  Pour multi-équipements
                </div>
                <div className="flex items-end gap-1 my-4">
                  <span className="text-3xl font-bold text-[#302082]">
                    {formatEuro(prixParAppareil)}
                  </span>
                  <span className="text-gray-500">/appareil</span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Installation simplifiée
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Support standard
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Mises à jour incluses
                    </span>
                  </div>
                </div>
                <Button
                  className={`w-full ${
                    selectedSubscription === "PER_MACHINE"
                      ? "bg-[#302082] hover:bg-[#302082]/90 text-white"
                      : "bg-white text-[#302082] border border-[#302082] hover:bg-[#302082] hover:text-white"
                  }`}
                  onClick={() => setSelectedSubscription("PER_MACHINE")}
                >
                  {selectedSubscription === "PER_MACHINE"
                    ? "Sélectionné"
                    : "Sélectionner"}
                </Button>
              </div>
            </div>
          </div>

          {/* Pricing Table - Mobile */}
          <div className="lg:hidden space-y-4">
            {/* Mobile dropdown or selector could go here */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="font-semibold text-[#302082]">
                  Sélectionnez votre formule
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="font-medium">Abonnement Mensuel</div>
                    <div className="text-sm text-gray-500">
                      {formatEuro(prixMensuel)} / mois
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="subscription"
                    checked={selectedSubscription === "MONTHLY"}
                    onChange={() => setSelectedSubscription("MONTHLY")}
                    className="h-4 w-4 text-[#302082] focus:ring-[#302082]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="font-medium">Abonnement Annuel</div>
                    <div className="text-sm text-gray-500">
                      {formatEuro(prixAnnuel / 12)} / mois
                      <span className="ml-1 text-xs text-green-600 font-medium">
                        (-17%)
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="subscription"
                    checked={selectedSubscription === "YEARLY"}
                    onChange={() => setSelectedSubscription("YEARLY")}
                    className="h-4 w-4 text-[#302082] focus:ring-[#302082]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="font-medium">Par utilisateur</div>
                    <div className="text-sm text-gray-500">
                      {formatEuro(prixParAppareil)} / utilisateur
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="subscription"
                    checked={selectedSubscription === "PER_USER"}
                    onChange={() => setSelectedSubscription("PER_USER")}
                    className="h-4 w-4 text-[#302082] focus:ring-[#302082]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="font-medium">Par appareil</div>
                    <div className="text-sm text-gray-500">
                      {formatEuro(prixParAppareil)} / appareil
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="subscription"
                    checked={selectedSubscription === "PER_MACHINE"}
                    onChange={() => setSelectedSubscription("PER_MACHINE")}
                    className="h-4 w-4 text-[#302082] focus:ring-[#302082]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Sélecteur de quantité */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-medium">Quantité :</label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-[#302082] text-[#302082]"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center font-medium">{quantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-[#302082] text-[#302082]"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="shadow-md sm:min-w-[200px]"
              onClick={() => handleAddToCart()}
              variant={"cyna"}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ajouter au panier
            </Button>
          </div>

          {/* Information de service */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 mr-3" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Information importante</p>
              <p>
                Un coût initial d&apos;installation de{" "}
                {formatEuro(prixUnitaire)} sera appliqué avec votre premier
                paiement. Ce coût comprend la configuration initiale et la
                personnalisation de la solution selon vos besoins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Produits similaires */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#302082] relative pb-2 inline-block">
            Les Top Produits du moment
            <span className="absolute bottom-0 left-0 w-32 h-1 bg-[#302082] rounded"></span>
          </h2>
          <Button
            asChild
            variant="outline"
            className="hidden sm:flex border-[#302082] text-[#302082] hover:bg-[#302082] hover:text-white"
          >
            <Link href="/produit">
              Voir tous les produits <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <TopProducts />
      </div>

      {/* Bannière CTA */}
      <div className="bg-gradient-to-r from-[#302082] to-[#231968] rounded-xl p-8 text-white text-center mb-8 shadow-lg">
        <h3 className="text-2xl font-bold mb-4">
          Besoin d&apos;une solution personnalisée ?
        </h3>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Notre équipe d&apos;experts est prête à vous aider à trouver la
          solution qui répond parfaitement à vos besoins spécifiques.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-md"
          >
            <Link href="/contact">Demander un devis personnalisé</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white hover:bg-white text-[#302082] transition-colors"
          >
            <Link href="/contact">Contacter un conseiller</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
