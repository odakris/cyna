import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductWithImages } from "@/types/Types"
import { ListChecks, ShieldAlert, Edit } from "lucide-react"

interface ProductSpecsProps {
  product: ProductWithImages
  handleEdit: () => void
}

export default function ProductSpecs({
  product,
  handleEdit,
}: ProductSpecsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Spécifications techniques
        </CardTitle>
        <CardDescription>
          Détails techniques et caractéristiques du produit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {product.technical_specs ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground whitespace-pre-line">
              {product.technical_specs}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShieldAlert className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground">
              Aucune spécification technique disponible pour ce produit.
            </p>
            <Button variant="outline" onClick={handleEdit} className="mt-3">
              <Edit className="mr-2 h-4 w-4" />
              Ajouter des spécifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
