"use client"

import React from "react"
import { CartItem, useCart } from "@/context/CartContext"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Minus, Plus, Clock, Tag } from "lucide-react"

interface CartItemCardProps {
  item: CartItem
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

const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
  const { updateCartItem, decreaseQuantity, removeFromCart } = useCart()
  const [isRemoving, setIsRemoving] = React.useState(false)

  const unitPrice = getUnitPrice(item)
  const totalPrice = unitPrice * item.quantity

  // Style du badge selon le type d'abonnement
  const badgeStyles: Record<string, string> = {
    MONTHLY: "bg-blue-100 text-blue-700 border-blue-200",
    YEARLY: "bg-green-100 text-green-700 border-green-200",
    PER_USER: "bg-purple-100 text-purple-700 border-purple-200",
    PER_MACHINE: "bg-amber-100 text-amber-700 border-amber-200",
  }

  const handleSubscriptionChange = (value: string) => {
    updateCartItem(item.uniqueId, { subscription: value })
  }

  const handleQuantityIncrement = () => {
    updateCartItem(item.uniqueId, { quantity: item.quantity + 1 })
  }

  const handleQuantityDecrement = () => {
    decreaseQuantity(item.uniqueId)
  }

  const handleRemove = () => {
    if (isRemoving) return
    setIsRemoving(true)
    removeFromCart(item.uniqueId)
    setTimeout(() => setIsRemoving(false), 1000)
  }

  return (
    <Card className="group border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-[200px] h-[180px] bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200">
            {item.imageUrl ? (
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400 text-sm">
                Image non disponible
              </div>
            )}
            <Badge
              className={`absolute top-2 left-2 rounded-full font-normal text-xs py-0.5 px-2 border ${badgeStyles[item.subscription || "MONTHLY"]}`}
            >
              <Clock className="mr-1 h-3 w-3" />
              {getSubscriptionLabel(item.subscription || "MONTHLY")}
            </Badge>
          </div>

          {/* Contenu */}
          <div className="flex-grow flex flex-col p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-[#302082] group-hover:text-[#FF6B00] transition-colors">
                {item.name}
              </h3>
              <Button
                onClick={handleRemove}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 -mt-1 -mr-1 h-8 w-8 rounded-full p-0"
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type d'abonnement */}
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-medium flex items-center">
                  <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                  Type d&apos;abonnement
                </label>
                <Select
                  value={item.subscription || "MONTHLY"}
                  onValueChange={handleSubscriptionChange}
                >
                  <SelectTrigger className="w-full border-gray-200 bg-gray-50 focus:ring-[#302082] focus:border-[#302082]">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensuel</SelectItem>
                    <SelectItem value="YEARLY">
                      Annuel (économie de 17%)
                    </SelectItem>
                    <SelectItem value="PER_USER">Par utilisateur</SelectItem>
                    <SelectItem value="PER_MACHINE">Par appareil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantité */}
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-medium flex items-center">
                  <Tag className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                  Quantité
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleQuantityDecrement}
                    disabled={item.quantity <= 1}
                    className="h-10 w-10 rounded-r-none border-gray-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-shrink-0 h-10 min-w-[40px] px-3 flex items-center justify-center border-y border-gray-200 bg-gray-50">
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleQuantityIncrement}
                    className="h-10 w-10 rounded-l-none border-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-end">
              <div className="text-sm text-gray-500">
                Prix unitaire:{" "}
                <span className="font-medium">{unitPrice.toFixed(2)}€</span>
              </div>
              <div className="mt-2 sm:mt-0 text-lg font-bold text-[#302082]">
                Total: {totalPrice.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CartItemCard
