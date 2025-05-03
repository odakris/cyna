"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/context/CartContext"
import Link from "next/link"
import { ShoppingCart, ArrowRight, Clock } from "lucide-react"
import { useClientFetch } from "@/hooks/use-client-fetch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface CartSummaryProps {
  items: CartItem[]
}

const getUnitPrice = (item: CartItem): number => {
  switch (item.subscription || "MONTHLY") {
    case "YEARLY":
      return item.price * 12
    default:
      return item.price
  }
}

const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
  const { isMounted } = useClientFetch()
  const [isOpen, setIsOpen] = React.useState(false)

  const totalPrice = items.reduce((total, item) => {
    const unitPrice = getUnitPrice(item)
    return total + unitPrice * item.quantity
  }, 0)

  const totalItems = items.reduce((count, item) => count + item.quantity, 0)

  // Rendu avant l'hydratation côté client
  if (!isMounted) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <ShoppingCart className="h-5 w-5" />
      </Button>
    )
  }

  // Badge du nombre d'articles
  const itemCountBadge =
    totalItems > 0 ? (
      <Badge className="absolute -top-2 -right-2 bg-[#FF6B00] text-white h-5 min-w-[20px] flex items-center justify-center p-0 text-xs">
        {totalItems}
      </Badge>
    ) : null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCountBadge}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-[#302082] flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Votre Panier
          </SheetTitle>
          <SheetDescription>
            {totalItems > 0
              ? `${items.length} article${items.length > 1 ? "s" : ""} • ${totalItems} unité${totalItems > 1 ? "s" : ""}`
              : "Votre panier est vide"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">
                Aucun article dans votre panier
              </p>
              <Button
                asChild
                size="sm"
                className="bg-[#302082] hover:bg-[#302082]/90"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/categories">Découvrir nos produits</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {items.map(item => (
                  <div
                    key={item.uniqueId}
                    className="flex items-start gap-3 py-3 border-b border-gray-100"
                  >
                    {item.imageUrl ? (
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-400">Image</span>
                      </div>
                    )}

                    <div className="flex-grow">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.subscription || "Mensuel"}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          Qté: {item.quantity}
                        </span>
                        <span className="font-medium text-sm">
                          {(getUnitPrice(item) * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold text-[#302082]">
                  {totalPrice.toFixed(2)}€
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#302082] text-[#302082]"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/panier">Voir le panier</Link>
                </Button>

                <Button
                  asChild
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/checkout">
                    Commander <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center w-full">
            Paiement sécurisé • Livraison rapide • Support inclus
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default CartSummary
