"use client"

import React from "react"
import { CartItem } from "@/context/CartContext"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  CreditCard,
  Clock,
  Shield,
  ShoppingCart,
} from "lucide-react"

interface CartTotalsProps {
  items: CartItem[]
  onCheckout: () => Promise<void>
  isLoading: boolean
}

const getUnitPrice = (item: CartItem): number => {
  switch (item.subscription || "MONTHLY") {
    case "YEARLY":
      return item.price * 12
    default:
      return item.price
  }
}

const getSubscriptionLabel = (type: string): string => {
  switch (type) {
    case "MONTHLY":
      return "Mensuel"
    case "YEARLY":
      return "Annuel"
    case "PER_USER":
      return "Par utilisateur"
    case "PER_MACHINE":
      return "Par appareil"
    default:
      return "Mensuel"
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({
  items,
  onCheckout,
  isLoading,
}) => {
  const totalItems = items.reduce((count, item) => count + item.quantity, 0)

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const unitPrice = getUnitPrice(item)
      return total + unitPrice * item.quantity
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const taxAmount = subtotal * 0.2 // 20% TVA
  const total = subtotal + taxAmount

  return (
    <Card className="border-[#302082]/10 shadow-md sticky top-24">
      <CardHeader className="bg-[#302082]/5 border-b border-[#302082]/10">
        <CardTitle className="text-[#302082] flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Récapitulatif de commande
        </CardTitle>
        <CardDescription>
          {items.length} article{items.length > 1 ? "s" : ""} • {totalItems}{" "}
          unité{totalItems > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 pb-0">
        {/* Liste des produits du panier */}
        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
          {items.map(item => (
            <div
              key={item.uniqueId}
              className="flex justify-between items-start pb-3 border-b border-gray-100"
            >
              <div className="flex-grow">
                <div className="font-medium text-sm text-gray-800 line-clamp-1">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {getSubscriptionLabel(item.subscription || "MONTHLY")}
                  <span className="mx-1.5">•</span>
                  Qté: {item.quantity}
                </div>
              </div>
              <div className="flex-shrink-0 font-medium text-sm text-gray-800 ml-2">
                {(getUnitPrice(item) * item.quantity).toFixed(2)}€
              </div>
            </div>
          ))}
        </div>

        {/* Résumé des prix */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium">{subtotal.toFixed(2)}€</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA (20%)</span>
            <span className="font-medium">{taxAmount.toFixed(2)}€</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-[#302082]">Total TTC</span>
          <span className="text-xl font-bold text-[#302082]">
            {total.toFixed(2)}€
          </span>
        </div>

        <Button
          className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white h-12 font-medium shadow-sm"
          onClick={onCheckout}
          disabled={isLoading || items.length === 0}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isLoading ? "Chargement..." : "Passer à la caisse"}
        </Button>

        {/* Informations de sécurité */}
        <div className="mt-4 bg-[#302082]/5 rounded-lg p-3 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-[#302082] flex-shrink-0 mt-0.5" />
            <p>
              Paiement sécurisé • Options de paiement multiples • Facture
              détaillée
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 px-6 py-4 flex items-center justify-center text-sm text-gray-500 border-t border-gray-100 mt-6">
        <div className="flex gap-2 flex-wrap justify-center">
          <div className="flex items-center">
            <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
            <span>Support inclus</span>
          </div>
          <span className="text-gray-300 mx-1">•</span>
          <div className="flex items-center">
            <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
            <span>Mises à jour gratuites</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default CartTotals
