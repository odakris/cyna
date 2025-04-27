'use client';

import { Button } from '@/components/ui/button';
import CartItem from '@/components/Cart/CartItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => {
      let unitPrice = item.price;
      switch (item.subscription || 'MONTHLY') {
        case 'MONTHLY':
          unitPrice = item.price;
          break;
        case 'YEARLY':
          unitPrice = item.price * 12;
          break;
        case 'PER_USER':
          unitPrice = item.price;
          break;
        case 'PER_MACHINE':
          unitPrice = item.price;
          break;
        default:
          unitPrice = item.price;
      }
      return total + unitPrice * item.quantity;
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  const handleCheckout = async () => {
    console.log('[CartPage] Clic sur Passer à la caisse', { cartLength: cart.length });
    setError(null);
    setIsLoading(true);

    try {
      if (cart.length === 0) {
        console.error('[CartPage] Panier vide');
        throw new Error('Votre panier est vide.');
      }

      console.log('[CartPage] Redirection vers /checkout');
      router.push('/checkout');
    } catch (error: any) {
      console.error('[CartPage] Erreur dans handleCheckout:', error);
      setError(error.message || 'Une erreur s’est produite. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      console.log('[CartPage] Fin de handleCheckout');
    }
  };

  useEffect(() => {
    console.log('[CartPage] Contenu de cart:', cart);
    console.log('[CartPage] Contenu de localStorage.cart:', localStorage.getItem('cart'));
  }, [cart]);

  return (
    <div className="py-8 px-6 container mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Votre panier</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">{error}</div>
      )}

      {cart.length === 0 ? (
        <p className="text-center mt-10">Votre panier est vide.</p>
      ) : (
        <div className="space-y-4">
          {cart
            .filter((item) => item && typeof item.uniqueId === 'string')
            .map((item) => (
              <CartItem key={item.uniqueId} item={item} />
            ))}
        </div>
      )}
      {cart.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              <strong>Total : {totalPrice.toFixed(2)} €</strong>
            </p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="default"
                size="lg"
                onClick={() => {
                  console.log('[CartPage] Clic détecté sur Passer à la caisse');
                  handleCheckout();
                }}
                disabled={isLoading || cart.length === 0}
              >
                {isLoading ? 'Chargement...' : 'Passer à la caisse'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
