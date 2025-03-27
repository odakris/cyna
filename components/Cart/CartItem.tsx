import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useState } from "react";

interface CartItemProps {
  id: string;
  name: string;
  price: number; // Prix de base (unit_price)
  quantity: number;
  subscription: string;
  imageUrl: string;
  onUpdate: (id: string, quantity: number, subscription: string) => void;
  onRemove: (id: string) => void;
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
  const [selectedSubscription, setSelectedSubscription] = useState(subscription);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity);

  const handleSubscriptionChange = (value: string) => {
    setSelectedSubscription(value);
    onUpdate(id, selectedQuantity, value);
  };

  const handleQuantityIncrement = () => {
    const newQuantity = selectedQuantity + 1;
    setSelectedQuantity(newQuantity);
    onUpdate(id, newQuantity, selectedSubscription);
  };

  const handleQuantityDecrement = () => {
    const newQuantity = selectedQuantity - 1;
    if (newQuantity <= 0) {
      onRemove(id);
    } else {
      setSelectedQuantity(newQuantity);
      onUpdate(id, newQuantity, selectedSubscription);
    }
  };

  // Calcul du prix ajusté en fonction du type d'abonnement
  const getAdjustedPrice = () => {
    let adjustedPrice = price;

    switch (selectedSubscription) {
      case "MONTHLY":
        adjustedPrice = price; // Prix mensuel de base
        break;
      case "YEARLY":
        adjustedPrice = price * 10; // Exemple : 10 mois payés pour 12 (réduction annuelle)
        break;
      case "PER_USER":
        adjustedPrice = price * selectedQuantity; // Prix par utilisateur
        break;
      case "PER_MACHINE":
        adjustedPrice = price * selectedQuantity; // Prix par machine
        break;
      default:
        adjustedPrice = price; // Par défaut, prix mensuel
    }

    return adjustedPrice;
  };

  const adjustedPrice = getAdjustedPrice();

  return (
    <div className="flex justify-center mb-12">
      <div className="flex w-[771px] h-[257px] border border-gray-300 rounded-lg shadow-md p-6">
        <div className="flex flex-col flex-grow space-y-4 pr-6">
          <h3 className="text-lg font-bold">{name}</h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600 w-[200px]">
              Durée d'abonnement :
            </label>
            <Select
              value={selectedSubscription}
              onValueChange={handleSubscriptionChange}
            >
              <SelectTrigger className="w-[273px]">
                <SelectValue placeholder="Sélectionner" />
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
                disabled={selectedQuantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{selectedQuantity}</span>
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
              Prix unitaire : <span className="font-semibold">{price}€</span>
            </p>
            <p className="text-sm">
              Prix total :{" "}
              <span className="font-semibold">{adjustedPrice.toFixed(2)}€</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between ml-6">
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
              <div className="w-[180px] h-[180px] bg-gray-200 flex items-center justify-center">
                Image non disponible
              </div>
            )}
          </div>
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
  );
};

export default CartItem;