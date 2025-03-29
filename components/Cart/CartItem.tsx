import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { useState } from "react"

interface CartItemProps {
  id: string
  name: string
  price: number
  quantity: number
  subscription: string
  imageUrl: string
  onUpdate: (id: string, quantity: number, subscription: string) => void
  onRemove: (id: string) => void
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  subscription,
  imageUrl,
  onUpdate,
  onRemove,
}) => {
  const [selectedSubscription, setSelectedSubscription] = useState(subscription)
  const [selectedQuantity, setSelectedQuantity] = useState(quantity)

  const handleSubscriptionChange = (value: string) => {
    setSelectedSubscription(value)
    onUpdate(id, selectedQuantity, value)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10)
    if (newQuantity > 0) {
      setSelectedQuantity(newQuantity)
      onUpdate(id, newQuantity, selectedSubscription)
    }
  }

  return (
    <div className="flex justify-center mb-12">
      <div className="flex w-[771px] h-[257px] border border-gray-300 rounded-lg shadow-md p-6">
        {/* Section des labels et champs */}
        <div className="flex flex-col flex-grow space-y-4 pr-6">
          <h3 className="text-lg font-bold">{name}</h3>

          {/* Durée d'abonnement */}
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600 w-[200px]">
              Type d&apos;abonnement :
            </label>
            <Select
              value={selectedSubscription}
              onValueChange={handleSubscriptionChange}
            >
              <SelectTrigger className="w-[273px]">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensuel">Mensuel</SelectItem>
                <SelectItem value="annuel">Annuel</SelectItem>
                <SelectItem value="unitaire">Utilisateur</SelectItem>
                <SelectItem value="appareil">Appareil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantité */}
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600 w-[200px]">
              Quantité :
            </label>
            <Input
              type="number"
              value={selectedQuantity}
              min={1}
              onChange={handleQuantityChange}
              className="w-[273px]"
            />
          </div>

          {/* Prix */}
          <div className="flex flex-col space-y-2">
            <p className="text-sm">
              Prix unitaire : <span className="font-semibold">{price}€</span>
            </p>
            <p className="text-sm">
              Prix total :{" "}
              <span className="font-semibold">
                {(price * selectedQuantity).toFixed(2)}€
              </span>
            </p>
          </div>
        </div>

        {/* Image & Bouton supprimer */}
        <div className="flex flex-col items-center justify-between ml-6">
          {/* Image */}
          <div className="w-[180px] h-[180px] overflow-hidden rounded-lg border">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                width={180}
                height={180}
                objectFit="cover"
              />
            ) : (
              <div className="w-[180px] h-[180px] bg-gray-200">
                Image non disponible
              </div>
            )}
          </div>

          {/* Bouton supprimer */}
          <Button
            onClick={() => onRemove(id)}
            variant="destructive"
            className="mt-4 w-[120px] h-[40px]"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CartItem
