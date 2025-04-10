import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ShoppingCart, Trash2 } from 'lucide-react' // Ajout de Trash2
import { useCart } from '@/context/CartContext'
import Image from 'next/image'

export function SideBasket() {
  const { cart, removeFromCart, updateCartItem, decreaseQuantity } = useCart()

  // Fonction pour calculer le prix total
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const totalPrice = calculateTotalPrice()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="p-2">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent className="bg-gray-50 w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold text-gray-900">Panier</SheetTitle>
          <SheetDescription className="text-gray-600">
            Articles actuellement dans votre panier
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">Votre panier est vide.</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.uniqueId}
                className="flex items-center border border-gray-200 rounded-lg shadow-sm bg-white p-4"
              >
                

                {/* Détails */}
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-gray-900">{item.name}</Label>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <p>Quantité:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => decreaseQuantity(item.uniqueId)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => updateCartItem(item.uniqueId, { quantity: item.quantity + 1 })}
                      >
                        +
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-gray-600">
                        Prix: {(item.price * item.quantity).toFixed(2)}€
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0" // Réduit la taille pour l'icône
                        onClick={() => removeFromCart(item.uniqueId)}
                      >
                        <Trash2 className="h-4 w-4" /> {/* Icône poubelle */}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-lg font-bold text-gray-900">
              Total: <span className="text-red-600">{totalPrice.toFixed(2)}€</span>
            </p>
          </div>
        )}

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button
              type="submit"
              variant="destructive"
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={cart.length === 0}
            >
              Paiement
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}