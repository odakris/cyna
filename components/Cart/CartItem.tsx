import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CartItem, useCart } from "@/context/CartContext"
import Image from "next/image"
import { useState, useMemo } from "react"

type CartProps = {
  item: CartItem
}

const CartItemComponent: React.FC<CartProps> = ({ item }) => {
  const { cart, updateCartItem, decreaseQuantity, removeFromCart } = useCart()
  const [isRemoving, setIsRemoving] = useState(false)

  if (!item || !item.uniqueId) {
    console.error("Item invalide reçu dans CartItemComponent:", item)
    return null
  }

  const currentItem =
    cart.find(cartItem => cartItem.uniqueId === item.uniqueId) || item

  const handleSubscriptionChange = (value: string) => {
    updateCartItem(currentItem.uniqueId, { subscription: value })
  }

  const handleQuantityIncrement = () => {
    updateCartItem(currentItem.uniqueId, { quantity: currentItem.quantity + 1 })
  }

  const handleQuantityDecrement = () => {
    decreaseQuantity(currentItem.uniqueId)
  }

  const handleRemove = () => {
    if (isRemoving) return
    setIsRemoving(true)
    removeFromCart(currentItem.uniqueId)
    setTimeout(() => setIsRemoving(false), 1000)
  }

  // Calculer le prix unitaire en fonction de l'abonnement
  const unitPrice = useMemo(() => {
    switch (currentItem.subscription || "MONTHLY") {
      case "MONTHLY":
        return currentItem.price
      case "YEARLY":
        return currentItem.price * 12 // Prix annuel = mensuel * 12
      case "PER_USER":
        return currentItem.price
      case "PER_MACHINE":
        return currentItem.price
      default:
        return currentItem.price
    }
  }, [currentItem.price, currentItem.subscription])

  // Calculer le prix total (prix unitaire * quantité)
  const adjustedPrice = useMemo(() => {
    return unitPrice * currentItem.quantity
  }, [unitPrice, currentItem.quantity])

  return (
    <div className="flex justify-center mb-12">
      <div className="flex w-[771px] h-[257px] border border-gray-300 rounded-lg shadow-md p-6">
        <div className="flex flex-col flex-grow space-y-4 pr-6">
          <h3 className="text-lg font-bold">{currentItem.name}</h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600 w-[200px]">
              Durée d'abonnement :
            </label>
            <Select
              value={currentItem.subscription || "MONTHLY"}
              onValueChange={handleSubscriptionChange}
            >
              <SelectTrigger className="w-[273px]">
                <SelectValue placeholder="Sélectionner un abonnement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensuel</SelectItem>
                <SelectItem value="YEARLY">Annuel</SelectItem>
                <SelectItem value="PER_USER">Par utilisateur</SelectItem>
                <SelectItem value="PER_MACHINE">Par appareil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600 w-[200px]">
              Quantité :
            </label>
            <div className="flex items-center space-x-2 w-[273px]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuantityDecrement}
                disabled={currentItem.quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{currentItem.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuantityIncrement}
              >
                +
              </Button>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-sm">
              Prix unitaire :{" "}
              <span className="font-semibold">{unitPrice.toFixed(2)}€</span>
            </p>
            <p className="text-sm">
              Prix total :{" "}
              <span className="font-semibold">{adjustedPrice.toFixed(2)}€</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between ml-6">
          <div className="w-[180px] h-[180px] overflow-hidden rounded-lg border">
            {currentItem.imageUrl ? (
              <Image
                src={currentItem.imageUrl}
                alt={currentItem.name}
                width={180}
                height={180}
                objectFit="cover"
              />
            ) : (
              <div className="w-[180px] h-[180px] bg-gray-200 flex items-center justify-center">
                Image non disponible
              </div>
            )}
          </div>
          <Button
            onClick={handleRemove}
            variant="destructive"
            className="mt-4 w-[120px] h-[40px]"
            disabled={isRemoving}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CartItemComponent
