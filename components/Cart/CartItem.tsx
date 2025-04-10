import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CartItem } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState, useMemo } from "react";

type CartProps = {
  item: CartItem;
};

const CartItemComponent: React.FC<CartProps> = ({ item }) => {
  const { cart, updateCartItem, decreaseQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const currentItem = cart.find((cartItem) => cartItem.uniqueId === item.uniqueId) || item;
  console.log("currentItem dans CartItemComponent:", currentItem);
  console.log("Quantité actuelle:", currentItem.quantity);

  if (!currentItem.uniqueId) {
    console.error("uniqueId manquant pour l'élément:", currentItem);
    return null;
  }

  if (!currentItem.subscription) {
    console.warn("subscription manquant pour l'élément:", currentItem);
  }

  const handleSubscriptionChange = (value: string) => {
    console.log(`Mise à jour de l'abonnement pour uniqueId ${currentItem.uniqueId}:`, value);
    updateCartItem(currentItem.uniqueId, { subscription: value });
  };

  const handleQuantityIncrement = () => {
    console.log(`Augmentation de la quantité pour uniqueId ${currentItem.uniqueId}`);
    updateCartItem(currentItem.uniqueId, { quantity: currentItem.quantity + 1 });
  };

  const handleQuantityDecrement = () => {
    console.log(`Diminution de la quantité pour uniqueId ${currentItem.uniqueId}`);
    decreaseQuantity(currentItem.uniqueId);
  };

  const handleRemove = () => {
    if (isRemoving) return;
    setIsRemoving(true);
    console.log(`Appel de removeFromCart pour uniqueId ${currentItem.uniqueId}`);
    removeFromCart(currentItem.uniqueId);
    setTimeout(() => setIsRemoving(false), 1000);
  };

  const adjustedPrice = useMemo(() => {
    let price = currentItem.price;
    switch (currentItem.subscription) {
      case "MONTHLY":
        price = currentItem.price * currentItem.quantity;
        break;
      case "YEARLY":
        price = currentItem.price * 12 * currentItem.quantity; // Ou *12 si annualisé sur 12 mois
        break;
      case "PER_USER":
        price = currentItem.price * currentItem.quantity;
        break;
      case "PER_MACHINE":
        price = currentItem.price * currentItem.quantity;
        break;
      default:
        price = currentItem.price * currentItem.quantity;
    }
    return price;
  }, [currentItem.price, currentItem.quantity, currentItem.subscription]);

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
              value={currentItem.subscription}
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
              Prix unitaire : <span className="font-semibold">{currentItem.price}€</span>
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
  );
};

export default CartItemComponent;