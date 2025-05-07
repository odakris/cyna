import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export function EmptyCart() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <Card className="border-2 border-gray-100 shadow-md">
        <CardHeader className="text-center pb-4 border-b">
          <CardTitle className="text-xl font-bold text-[#302082]">
            Votre panier est vide
          </CardTitle>
          <CardDescription>
            Veuillez ajouter des produits avant de passer à la caisse
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-center text-gray-500 mb-6">
            Il semble que votre panier soit vide. Parcourez nos produits pour
            trouver ce dont vous avez besoin.
          </p>
          <Button asChild className="mt-2 bg-[#302082] hover:bg-[#302082]/90">
            <Link href="/produit">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Parcourir nos produits
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="bg-gray-50 p-4 border-t flex justify-center">
          <Button
            asChild
            variant="outline"
            className="border-[#302082] text-[#302082]"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
