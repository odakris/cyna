import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductWithImages } from "@/types/Types"
import { Package, CheckCircle2, XCircle } from "lucide-react"

interface ProductInfoProps {
  product: ProductWithImages
  formatPrice: (price: number) => string
}

export default function ProductInfo({
  product,
  formatPrice,
}: ProductInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informations du produit
        </CardTitle>
        <CardDescription>Données générales sur le produit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 aspect-square rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
            <Image
              width={300}
              height={300}
              src={product.main_image || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description ||
                  "Aucune description disponible pour ce produit."}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Prix unitaire
                </h4>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(product.unit_price)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Statut
                </h4>
                <div>
                  {product.available ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Disponible
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-red-200 text-red-600 bg-red-50"
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Indisponible
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
