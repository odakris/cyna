import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductWithImages } from "@/types/Types"
import { ProductImageGallery } from "@/components/Carousel/ProductImageGallery"
import { ImageIcon, Edit } from "lucide-react"

interface ProductGalleryProps {
  product: ProductWithImages
  handleEdit: () => void
}

export default function ProductGallery({
  product,
  handleEdit,
}: ProductGalleryProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galerie d&apos;images
        </CardTitle>
        <CardDescription>Images du produit dans le carrousel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {product.product_caroussel_images &&
        product.product_caroussel_images.length > 0 ? (
          <div className="bg-muted/10 rounded-xl p-6">
            <ProductImageGallery
              images={product.product_caroussel_images}
              productName={product.name}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground">
              Aucune image supplémentaire disponible.
            </p>
            <Button variant="outline" onClick={handleEdit} className="mt-3">
              <Edit className="mr-2 h-4 w-4" />
              Ajouter des images
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
