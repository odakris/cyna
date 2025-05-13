"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  ShoppingCart,
  Trash2,
  MinusCircle,
  PlusCircle,
  ShoppingBag,
  AlertCircle,
} from "lucide-react"
import { useCart } from "@/context/CartContext"
// import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatEuro } from "@/lib/utils/format"

export function SideBasket() {
  const { cart, removeFromCart, updateCartItem, decreaseQuantity } = useCart()

  // Fonction pour calculer le prix total
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const totalPrice = calculateTotalPrice()
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-2 rounded-md text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-1 focus:ring-offset-[#302082]"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-xs px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#302082]">
              {itemCount}
            </Badge>
          )}
          <span className="sr-only">Panier</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md border-l border-gray-200 p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-4 border-b bg-gradient-to-r from-[#302082]/5 to-[#302082]/10">
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 text-[#302082] mr-2" />
            <SheetTitle className="text-xl font-bold text-[#302082]">
              Votre Panier ({itemCount})
            </SheetTitle>
          </div>
          <SheetDescription className="text-sm text-gray-600">
            {cart.length > 0
              ? "Consultez et modifiez les articles de votre panier"
              : "Votre panier est actuellement vide"}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow p-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 font-medium mb-2">
              Votre panier est vide
            </p>
            <p className="text-sm text-gray-400 text-center mb-6">
              Ajoutez des produits à votre panier pour les retrouver ici
            </p>
            <SheetClose asChild>
              <Button
                variant="cyna"
                // className="bg-[#302082] text-white hover:bg-[#302082]/90"
                size="sm"
              >
                <Link href="/produit">Découvrir nos produits</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow">
              <div className="px-4 py-2">
                {cart.map(item => (
                  <div
                    key={item.uniqueId}
                    className="flex items-center py-3 border-b border-gray-100 group hover:bg-gray-50 transition-colors rounded-md px-2"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium text-[#302082] truncate group-hover:text-[#FF6B00] transition-colors">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatEuro(item.price)} par unité
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-gray-200 rounded-full">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => decreaseQuantity(item.uniqueId)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 p-0 rounded-full text-gray-500 hover:text-[#302082] hover:bg-gray-100"
                        >
                          <MinusCircle className="h-4 w-4" />
                          <span className="sr-only">Réduire</span>
                        </Button>

                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateCartItem(item.uniqueId, {
                              quantity: item.quantity + 1,
                            })
                          }
                          className="h-7 w-7 p-0 rounded-full text-gray-500 hover:text-[#302082] hover:bg-gray-100"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span className="sr-only">Augmenter</span>
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.uniqueId)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-auto border-t border-gray-200">
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">
                    {formatEuro(totalPrice)}
                  </span>
                </div>

                <div className="bg-[#302082]/5 p-3 rounded-md flex items-start gap-2 text-xs text-gray-600">
                  <AlertCircle className="h-4 w-4 text-[#302082] mt-0.5 flex-shrink-0" />
                  <p>
                    Les frais de livraison seront calculés à l&apos;étape
                    suivante
                  </p>
                </div>

                <SheetFooter className="flex flex-col gap-2 sm:gap-0">
                  <SheetClose asChild>
                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300"
                    >
                      <Link href="/panier">Accéder au panier</Link>
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      <Link href="/produit">Continuer les achats</Link>
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
